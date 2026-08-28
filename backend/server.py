from fastapi import FastAPI, APIRouter, HTTPException
from dotenv import load_dotenv
from starlette.middleware.cors import CORSMiddleware
from motor.motor_asyncio import AsyncIOMotorClient
import os
import logging
from pathlib import Path
from pydantic import BaseModel, Field
from typing import List, Optional, Literal
import uuid
from datetime import datetime
from openai import AsyncOpenAI
import json
import random

ROOT_DIR = Path(__file__).parent
load_dotenv(ROOT_DIR / '.env')

# MongoDB connection
mongo_url = os.environ['MONGO_URL']
client = AsyncIOMotorClient(mongo_url)
db = client[os.environ['DB_NAME']]

# Create the main app without a prefix
app = FastAPI()

# Create a router with the /api prefix
api_router = APIRouter(prefix="/api")

# Content Type Models
class NumberGuess(BaseModel):
    # Guess-before-reveal for fast_weird cards (session-depth spec, item 1).
    # The prompt asks for a number the facts contain but the headline does
    # not give away; committing to a range before reading is what makes the
    # fact stick. The card without this field renders exactly as before.
    prompt: str
    options: List[str]  # 3-4 tappable ranges; answer must be one of them
    answer: str
    reveal: Optional[str] = None  # one extra line after the reveal, optional

class FastWeirdContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["fast_weird"] = "fast_weird"
    headline: str
    facts: List[str]
    guess: Optional[NumberGuess] = None
    rarity: Literal["common", "uncommon", "rare"] = "common"
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class ExplainerContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["explainer"] = "explainer"
    question: str
    steps: List[str]
    video_url: Optional[str] = None
    interaction: Optional[str] = None
    rarity: Literal["common", "uncommon", "rare"] = "common"
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class PonderContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["ponder"] = "ponder"
    question: str
    options: List[str]
    rarity: Literal["common", "uncommon", "rare"] = "common"
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class IncidentContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["incident"] = "incident"
    hook: str
    story: List[str]
    rarity: Literal["common", "uncommon", "rare"] = "common"
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class MiniGameContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["mini_game"] = "mini_game"
    game_type: Literal["fact_vs_fiction", "predict_outcome", "arrange_steps", "guess_scale"]
    prompt: str
    options: List[str]
    correct_answer: str
    # One line explaining WHY, shown after answering. For a Fact-or-Myth card
    # this is the whole point: "wrong" is worthless without knowing where the
    # belief came from. Optional so the older game types stay valid.
    reveal: Optional[str] = None
    rarity: Literal["common", "uncommon", "rare"] = "common"
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AudioDriftContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["audio_drift"] = "audio_drift"
    title: str
    narration_script: str
    audio_url: Optional[str] = None
    duration: Optional[int] = None  # in seconds
    # Attribution for episodes sourced from a podcast's own RSS feed. The
    # card credits the show and links back; the audio always streams from
    # the publisher's server, never ours. See populate_podcast_rss.py.
    show_title: Optional[str] = None
    author: Optional[str] = None
    episode_link: Optional[str] = None
    source: Optional[str] = None  # "rss" for feed-sourced episodes
    rarity: Literal["common", "uncommon", "rare"] = "common"
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class VideoContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["video"] = "video"
    title: str
    description: str
    video_url: str
    duration: int  # in seconds; hard ceiling of 300 enforced at populate time
    thumbnail_url: Optional[str] = None
    # Attribution for videos sourced from the YouTube Data API. The card
    # credits the channel and links to it; the video always plays in
    # YouTube's own embedded player. See populate_youtube.py.
    video_id: Optional[str] = None
    channel_title: Optional[str] = None
    channel_id: Optional[str] = None
    channel_url: Optional[str] = None
    published_at: Optional[str] = None
    source: Optional[str] = None  # "youtube" for API-sourced videos
    rarity: Literal["common", "uncommon", "rare"] = "common"
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class AlmostNothingContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["almost_nothing"] = "almost_nothing"
    text: str # Can be a single line or whitespace
    rarity: Literal["common", "uncommon", "rare"] = "uncommon"
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class QuietContradictionContent(BaseModel):
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["quiet_contradiction"] = "quiet_contradiction"
    statement1: str
    statement2: str
    rarity: Literal["common", "uncommon", "rare"] = "uncommon"
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class TryThisContent(BaseModel):
    # Wave 2, item 2: a real skill learnable in two or three minutes, taught
    # step-per-tap. Rules the batch follows: solo (no second person), only
    # common objects, verifiably doable from the written steps alone, and
    # never a comeback hook — the card ends when the hands have done it.
    id: str = Field(default_factory=lambda: str(uuid.uuid4()))
    type: Literal["try_this"] = "try_this"
    title: str
    hook: str  # one line on why this is worth two minutes
    needs: Optional[str] = None  # "A coin." — omitted means bare hands
    steps: List[str]
    why: Optional[str] = None  # the mechanism, revealed at the end
    duration: Optional[int] = None  # honest estimate, seconds
    rarity: Literal["common", "uncommon", "rare"] = "common"
    tags: List[str] = []
    created_at: datetime = Field(default_factory=datetime.utcnow)

class UserPreference(BaseModel):
    user_id: str
    preference_type: str
    value: str
    timestamp: datetime = Field(default_factory=datetime.utcnow)

class ContentGenerationRequest(BaseModel):
    content_type: Literal["fast_weird", "explainer", "ponder", "incident", "mini_game", "audio_drift", "video", "almost_nothing", "quiet_contradiction"]
    count: int = 1

# Initialize AI Chat
emergent_key = os.environ.get('EMERGENT_LLM_KEY', '')

def serialize_mongodb_doc(doc):
    """Convert MongoDB document to JSON-serializable dict"""
    if '_id' in doc:
        doc.pop('_id')
    return doc

async def generate_content_with_ai(content_type: str, count: int = 1) -> List[dict]:
    """Generate content using AI based on type"""
    # If no key is set or the dummy key is used locally without an endpoint,
    # skip actual API generation to not break the startup flow in development/testing.
    if not emergent_key or emergent_key == "dummy_key":
        logging.warning("No valid OPENAI_API_KEY found, returning simple mock fallback.")
        return []
        
    client = AsyncOpenAI(api_key=emergent_key)
    system_message="""You are a content generator for a curiosity app called 'modern weirdness'.

GENERAL TONE RULES:
- Calm, intelligent, curious
- No shouting, emojis, hype language
- No moralizing, outrage, or politics
- Everything must feel timeless and quietly surprising

CONTENT QUALITY BAR (every item must pass ALL of these):
- THE RETELL TEST: would a reader repeat this to a friend at dinner tonight?
  If not, don't generate it.
- SPECIFIC over generic: real names, real dates, real numbers. "In 1925,
  Victor Lustig sold the Eiffel Tower for $70,000" beats "a con artist once
  sold a famous landmark."
- BANNED: top-100 trivia everyone has seen (honey never spoils, octopuses
  have three hearts, goldfish memory, we use 10% of our brains, bananas are
  radioactive, a group of crows is a murder). If it appears in every listicle,
  skip it.
- TRUE ONLY: every factual item must be a real, documented event or fact.
  Never invent people, dates, or numbers. If unsure, choose something you
  are sure of.
- END WITH AN AFTERTASTE: the last line should land — an irony, a haunting
  detail, or a quiet twist ("The dealer was too embarrassed to report it.
  So Lustig sold the tower again.").

Respond ONLY with valid JSON. No markdown, no explanation."""
    
    prompts = {
        "fast_weird": f"""Generate {count} FAST_WEIRD content items. These are absurd, surprising real-world facts.

Format as JSON array:
{{
  "items": [
    {{
      "headline": "One punchy line",
      "facts": ["fact 1", "fact 2", "fact 3"],
      "rarity": "common",
      "tags": ["tag1", "tag2"]
    }}
  ]
}}

The best fast_weird items collide two things the reader keeps in separate
mental boxes — usually time or scale:
- "Woolly mammoths were still alive when the Great Pyramid was built"
- "The inventor of the Pringles can is buried in one"
- "Oxford University is older than the Aztec Empire"
- "There are more trees on Earth than stars in the Milky Way"

Each item: a punchy headline, then 2-3 facts with real dates/numbers, ending
on the most striking detail. Keep facts ≤6 lines total. Must be real and
verifiable — never invented.""",
        
        "explainer": f"""Generate {count} EXPLAINER content items. These explain how things work in 3 steps.

Format as JSON array:
{{
  "items": [
    {{
      "question": "How does X work?",
      "steps": ["Step 1", "Step 2", "Step 3"],
      "video_url": null,
      "interaction": "Which step surprised you?",
      "rarity": "common",
      "tags": ["tag1", "tag2"]
    }}
  ]
}}

Pick questions people have quietly wondered about since childhood, where the
real mechanism is more clever than they'd guess:
- "How do they get ships into bottles?" (hinged masts, threads through the cork)
- "Why do we get brain freeze?" (referred pain from the soft palate)
- "Why does your voice sound different in recordings?" (bone conduction)

3-5 steps, each one concrete. The last step or the interaction line should
carry a small payoff ("So which one is your real voice?"). ≤120 words total.""",
        
        "ponder": f"""Generate {count} PONDER content items. Reflective questions, text only.

Format as JSON array:
{{
  "items": [
    {{
      "question": "Open-ended question?",
      "options": ["Option 1", "Option 2", "Option 3"],
      "rarity": "common",
      "tags": ["tag1", "tag2"]
    }}
  ]
}}

The best ponders are personal hypotheticals the reader answers about their
own life — not abstract philosophy:
- "If you could erase one memory, would you?"
- "Would you press a button that shows you the exact date of your death?"
- "If you could hear what people honestly think of you, would you listen?"

Options should be real positions someone might hold, each with a distinct
emotional flavor ("No — even pain shaped who I am"). No correct answer.""",
        
        "incident": f"""Generate {count} INCIDENT content items. Quietly fascinating real-world moments.

Format as JSON array:
{{
  "items": [
    {{
      "hook": "One-sentence hook",
      "story": ["Line 1", "Line 2", "Line 3", "Line 4"],
      "rarity": "common",
      "tags": ["tag1", "tag2"]
    }}
  ]
}}

These are true stories about specific people, told with names, dates and
numbers:
- Victor Lustig selling the Eiffel Tower to scrap dealers in 1925 — twice,
  because the first victim was too embarrassed to report it
- Joshua Bell playing a $3.5M Stradivarius in a D.C. subway: 1,097 passed,
  seven stopped, $32 in tips
- The programmer who automated his whole job, left in 2012, and whose
  scripts kept 'working' for two years

3-6 short factual lines. The final line must land — an irony or a haunting
detail, not a summary. No mythologizing, no invented people or numbers.""",
        
        "mini_game": f"""Generate {count} MINI_GAME content items. 10-20 second games.

Format as JSON array:
{{
  "items": [
    {{
      "game_type": "fact_vs_fiction",
      "prompt": "Game prompt or question",
      "options": ["Option 1", "Option 2"],
      "correct_answer": "Option 1",
      "rarity": "common",
      "tags": ["tag1", "tag2"]
    }}
  ]
}}

Game types: fact_vs_fiction, predict_outcome, arrange_steps, guess_scale

No tutorials, no scoring emphasis.""",
        
        "audio_drift": f"""Generate {count} AUDIO_DRIFT content items. Calm podcast-like narrations.

Format as JSON array:
{{
  "items": [
    {{
      "title": "Short title",
      "narration_script": "120-250 word calm narration script",
      "audio_url": null,
      "duration": 60,
      "rarity": "common",
      "tags": ["tag1", "tag2"]
    }}
  ]
}}

Themes — atmospheric true stories about real places and events:
- The Great Molasses Flood of 1919 (a 50-foot wave of syrup at 35 mph;
  on hot days locals say you can still smell it)
- Kolmanskop, the Namibian diamond town the desert swallowed room by room
- The Radium Girls, who glowed in the dark and whose graves still tick

Calm, neutral voice, real dates and numbers, sensory detail. Ends with the
image that lingers, not a moral.""",
        
        "almost_nothing": f"""Generate {count} ALMOST_NOTHING content items. These are extremely minimal screens.

Format as JSON array:
{{
  "items": [
    {{
      "text": "A single line of text",
      "rarity": "uncommon",
      "tags": ["tag1", "tag2"]
    }}
  ]
}}

These render as "Gentle Reminder" cards: a small, kind nudge back into the
body or the present moment.

Rules:
- 1-3 short lines. First line is the nudge, the rest make it land.
- Examples: "When did you last laugh?\\nNot a polite chuckle. A real,
  unguarded laugh. Your body misses it." / "Unclench your jaw.\\nDrop your
  shoulders. You were holding them again."
- Occasionally, pure stillness is fine: "There is nothing to solve here."
- Never preachy, never wellness-jargon. Brief and calm.""",

        "quiet_contradiction": f"""Generate {count} QUIET_CONTRADICTION content items. These are two true ideas that don't resolve.

Format as JSON array:
{{
  "items": [
    {{
      "statement1": "First true statement",
      "statement2": "Second true statement that contradicts the first, without a conclusion",
      "rarity": "uncommon",
      "tags": ["tag1", "tag2"]
    }}
  ]
}}

Examples:
- "Nothing you do will matter in a trillion years. The universe will expand into cold darkness, and no trace of humanity will remain." vs "The fact that you cared about anything today—at all—is the only meaning that ever existed."
- "Every choice you make is shaped by genetics, environment, and physics. Free will might be an illusion." vs "You are reading this sentence, and you can choose to stop. That choice feels undeniably real."
- The second statement should ideally implicate the reader in the act of reading it, or use their own body/mind as the counter-evidence.
- No conclusion offered."""
    }
    
    prompt = prompts.get(content_type, "")
    
    try:
        response = await client.chat.completions.create(
            model="gpt-4",
            messages=[
                {"role": "system", "content": system_message},
                {"role": "user", "content": prompt}
            ],
            response_format={"type": "json_object"}
        )
        
        # Parse JSON response
        response_text = response.choices[0].message.content or "{}"
        if response_text.startswith('```json'):
            response_text = response_text[7:]
        if response_text.endswith('```'):
            response_text = response_text[:-3]
        
        data = json.loads(response_text.strip())
        return data.get('items', [])
    except Exception as e:
        logging.error(f"AI generation error: {e}")
        return []

# Routes
@api_router.get("/")
async def root():
    return {"message": "Modern Weirdness API", "version": "1.0"}

@api_router.post("/content/generate")
async def generate_content(request: ContentGenerationRequest):
    """Generate content using AI"""
    try:
        items = await generate_content_with_ai(request.content_type, request.count)
        
        if not items:
            raise HTTPException(status_code=500, detail="Failed to generate content")
        
        # Store in MongoDB and clean results
        collection_name = f"{request.content_type}_content"
        clean_items = []
        
        for item in items:
            item['id'] = str(uuid.uuid4())
            item['type'] = request.content_type
            item['created_at'] = datetime.utcnow()
            await db[collection_name].insert_one(item.copy())
            # Remove _id for response
            item.pop('_id', None)
            clean_items.append(item)
        
        return {"success": True, "count": len(clean_items), "items": clean_items}
    except Exception as e:
        logging.error(f"Content generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Videos at or under this surface about twice as often as the 3-5 minute
# ones. Kept in step with PREFERRED_MAX_SEC in populate_youtube.py.
VIDEO_PREFERRED_MAX_SEC = 180

# Content types whose items are real third-party media. There is nothing to
# invent here: a generated video is a YouTube URL that doesn't exist, which
# is how the old feed accumulated permanent "Video coming soon" cards.
NO_AI_FALLBACK = {"video", "try_this"}


async def sample_videos(db, count, seen=None):
    """
    Pick `count` videos, favouring short ones. Roughly two thirds come from
    the under-3-minute pool and the rest from 3-5 minutes; if either pool is
    thin, the other backfills so the feed still gets a full slate.

    `seen` holds ids this visitor has already been shown; they are excluded
    from both pools. The final backfill deliberately ignores `seen` — once a
    visitor has worked through everything, repeating a video beats serving a
    short session.
    """
    unseen = {"id": {"$nin": seen}} if seen else {}

    short_target = (count * 2 + 2) // 3
    picked = await db.video_content.aggregate([
        {"$match": {"duration": {"$lte": VIDEO_PREFERRED_MAX_SEC}, **unseen}},
        {"$sample": {"size": short_target}},
    ]).to_list(short_target)

    remaining = count - len(picked)
    if remaining > 0:
        picked += await db.video_content.aggregate([
            {"$match": {"duration": {"$gt": VIDEO_PREFERRED_MAX_SEC}, **unseen}},
            {"$sample": {"size": remaining}},
        ]).to_list(remaining)

    remaining = count - len(picked)
    if remaining > 0:  # pools empty or exhausted - backfill from whatever exists
        picked += await db.video_content.aggregate([
            {"$match": {"_id": {"$nin": [p["_id"] for p in picked]}}},
            {"$sample": {"size": remaining}},
        ]).to_list(remaining)

    random.shuffle(picked)
    return picked


async def sample_unseen(db, collection_name, count, seen=None):
    """
    Sample `count` items the visitor has not been shown before.

    $sample alone draws independently every request, so the same card can
    reappear the same day no matter how large the collection is. Excluding
    `seen` first is what actually makes the feed non-repeating; volume only
    decides how many days it lasts.

    If the unseen pool is short, top up with already-seen items rather than
    returning a thin session — running dry should feel like the museum
    repeating itself, not like the museum being broken.
    """
    pipeline = []
    if seen:
        pipeline.append({"$match": {"id": {"$nin": seen}}})
    pipeline.append({"$sample": {"size": count}})
    items = await db[collection_name].aggregate(pipeline).to_list(count)

    shortfall = count - len(items)
    if shortfall > 0 and seen:
        items += await db[collection_name].aggregate([
            {"$match": {"_id": {"$nin": [i["_id"] for i in items]}}},
            {"$sample": {"size": shortfall}},
        ]).to_list(shortfall)

    return items


# Ratios for a 35-item slate. The client shows only the first 9-12 and marks
# just those as seen, so the rest of the slate stays available for next time.
FEED_RATIOS = {
    "fast_weird": 8,
    "explainer": 6,
    "ponder": 5,
    "incident": 3,
    "mini_game": 3,
    "audio_drift": 3,
    "video": 3,
    "almost_nothing": 2,
    "quiet_contradiction": 2,
    "try_this": 2,
}


class FeedRequest(BaseModel):
    limit: int = 35
    seen: List[str] = Field(default_factory=list)


def compose_session(feed, limit):
    """
    Arrange the slate so the first `limit` cards — the ones the client will
    actually show — carry the session's anchors (spec item 4):

    - open weird: a fast_weird hook leads when one exists
    - one interactive-guess anchor (Fact-or-Myth, or a fast_weird carrying
      a guess) lands somewhere in the first half
    - one listenable/watchable anchor (audio or video) lands in the back
      third, near the end but before the Field Trip the client appends

    The playable anchor is the game card the client splices in itself, so
    a full session carries three anchors. Placement inside each window is
    random and any missing pool is skipped, not faked — the rule bends
    before it lies. Everything past `limit` keeps its shuffled order.
    """
    limit = max(1, min(limit, len(feed)))
    pool = list(feed)

    def take(pred):
        for i, item in enumerate(pool):
            if pred(item):
                return pool.pop(i)
        return None

    def is_listenable(item):
        return item.get("type") in ("audio_drift", "video")

    def is_guess(item):
        return item.get("type") == "mini_game" or (
            item.get("type") == "fast_weird" and item.get("guess")
        )

    hook = take(lambda item: item.get("type") == "fast_weird" and not item.get("guess"))
    guess_anchor = take(is_guess)
    listen_anchor = take(is_listenable)

    anchors = [a for a in (hook, guess_anchor, listen_anchor) if a]
    session = pool[: limit - len(anchors)]
    del pool[: limit - len(anchors)]

    if hook:
        session.insert(0, hook)
    if guess_anchor:
        lo = 1 if hook else 0
        hi = max(lo + 1, len(session) // 2)
        session.insert(random.randint(lo, hi), guess_anchor)
    if listen_anchor:
        lo = min(len(session), max(1, (2 * len(session)) // 3))
        session.insert(random.randint(lo, len(session)), listen_anchor)

    return session + pool


async def build_feed(seen=None, limit=12):
    """Assemble one mixed slate, preferring content this visitor hasn't seen."""
    seen = seen or []
    feed = []

    for content_type, count in FEED_RATIOS.items():
        collection_name = f"{content_type}_content"
        if content_type == "video":
            items = await sample_videos(db, count, seen)
        else:
            items = await sample_unseen(db, collection_name, count, seen)

        # If not enough items, generate more
        if len(items) < count and content_type not in NO_AI_FALLBACK:
            needed = count - len(items)
            new_items = await generate_content_with_ai(content_type, needed)
            for item in new_items:
                item['id'] = str(uuid.uuid4())
                item['type'] = content_type
                item['created_at'] = datetime.utcnow()
                await db[collection_name].insert_one(item)
                items.append(item)

        feed.extend(items)

    # Shuffle feed to mix content types, then compose the visible prefix
    # so the session opens weird and carries its anchors (spec item 4).
    random.shuffle(feed)
    feed = compose_session(feed, limit)

    # Clean MongoDB _id field
    for item in feed:
        item.pop('_id', None)

    # `fresh` is how much of this slate the visitor has never been shown. The
    # client can use it to tell "the museum is repeating itself" apart from a
    # failed fetch, which otherwise look identical.
    seen_set = set(seen)
    fresh = sum(1 for item in feed if item.get("id") not in seen_set)

    return {"success": True, "count": len(feed), "fresh": fresh, "feed": feed}


@api_router.get("/feed")
async def get_feed(limit: int = 35):
    """Mixed feed with no exclusions — kept so older clients keep working."""
    try:
        return await build_feed(limit=limit)
    except Exception as e:
        logging.error(f"Feed generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))


@api_router.post("/feed")
async def post_feed(request: FeedRequest):
    """
    Mixed feed that skips what this visitor has already been shown.

    The seen list travels in the body rather than the query string on
    purpose: a week of ids is several kilobytes, well past what is safe in
    a URL.
    """
    try:
        return await build_feed(request.seen, request.limit)
    except Exception as e:
        logging.error(f"Feed generation error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.post("/preferences/track")
async def track_preference(preference: UserPreference):
    """Track user preferences (silent, no public identity)"""
    try:
        pref_dict = preference.dict()
        await db.user_preferences.insert_one(pref_dict)
        return {"success": True}
    except Exception as e:
        logging.error(f"Preference tracking error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

@api_router.get("/content/{content_type}")
async def get_content_by_type(content_type: str, limit: int = 10):
    """Get specific content type"""
    try:
        collection_name = f"{content_type}_content"
        items = await db[collection_name].find().limit(limit).to_list(limit)
        
        # Clean MongoDB _id field
        for item in items:
            item.pop('_id', None)
        
        return {"success": True, "count": len(items), "items": items}
    except Exception as e:
        logging.error(f"Content fetch error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# Include the router in the main app
app.include_router(api_router)

app.add_middleware(
    CORSMiddleware,
    allow_credentials=True,
    allow_origins=["*"],
    allow_methods=["*"],
    allow_headers=["*"],
)

# Configure logging
logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(name)s - %(levelname)s - %(message)s'
)
logger = logging.getLogger(__name__)

@app.on_event("shutdown")
async def shutdown_db_client():
    client.close()
