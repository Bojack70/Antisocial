"""
Populate Audio Drift from podcasts' own public RSS feeds.

Replaces the Listen Notes path (populate_audio_embeds.py / populate_audio_drift.py).
Two reasons for the swap:

1. Listen Notes' API Terms of Use forbid what those scripts did:
   "Applications using the Listen API must not pre-fetch, cache, index, or
   store any content on the server side" (only id and pub_date are exempt),
   and they require a "Powered by Listen Notes" logo wherever the data is
   shown. Reading a show's own RSS feed carries no such contract - it is
   the ordinary interface every podcast client uses.

2. The old path stored an `embed_url` (a Listen Notes iframe PAGE) and no
   `audio_url`, so the card handed an HTML document to an <audio> element
   and nothing ever played.

We behave like a podcast client: stream the publisher's own file from the
publisher's own server, unmodified and unclipped, and credit the show with
a link back. We never copy the audio onto our own storage.
"""
import asyncio
import os
import re
import sys
import uuid
from datetime import datetime
from email.utils import parsedate_to_datetime
from xml.etree import ElementTree as ET

import httpx
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

# Episodes longer than this are skipped. Audio Drift is a short-hit card;
# a 20-minute episode is not a drift. NOTE: this show's shortest episode is
# 2:04, so a cap below ~125s empties the card entirely - see the duration
# histogram in the module docstring of the test run before lowering it.
MAX_DURATION_SEC = 300

# A show is listed by its own feed URL, so only that publisher's episodes can
# ever appear. (The old Listen Notes path SEARCHED for "Stephen Carter weird
# facts" and took the top hits, which could be any creator who happened to
# rank for those words.)
FEEDS = [
    {
        "feed_url": "https://www.spreaker.com/show/2790149/episodes/feed",
        "tags": ["facts", "science", "history"],
    },
]

ITUNES = "{http://www.itunes.com/dtds/podcast-1.0.dtd}"


def parse_duration(raw):
    """itunes:duration is either plain seconds, MM:SS, or HH:MM:SS."""
    if not raw:
        return None
    raw = raw.strip()
    if not raw:
        return None
    try:
        if ":" not in raw:
            return int(float(raw))
        parts = [int(float(p)) for p in raw.split(":")]
    except ValueError:
        return None
    while len(parts) < 3:
        parts.insert(0, 0)
    return parts[0] * 3600 + parts[1] * 60 + parts[2]


def strip_html(raw):
    """Feed descriptions are HTML. The card renders plain text."""
    if not raw:
        return ""
    text = re.sub(r"<br\s*/?>|</p>", "\n", raw, flags=re.I)
    text = re.sub(r"<[^>]+>", "", text)
    for entity, char in (("&amp;", "&"), ("&lt;", "<"), ("&gt;", ">"),
                         ("&quot;", '"'), ("&#39;", "'"), ("&nbsp;", " ")):
        text = text.replace(entity, char)
    return re.sub(r"\n{3,}", "\n\n", text).strip()


def first_audio_enclosure(item):
    """
    The only URL we will ever hand to an audio player. An <enclosure> that
    isn't audio/* is not playable, and neither is an iframe embed page -
    returning None here is what stops the old bug recurring.
    """
    for enc in item.findall("enclosure"):
        url = (enc.get("url") or "").strip()
        mime = (enc.get("type") or "").strip().lower()
        if url and mime.startswith("audio/"):
            return url, mime
    return None, None


def parse_feed(xml_bytes, tags):
    """Return (channel_summary, [episode dicts]) for one podcast feed."""
    channel = ET.fromstring(xml_bytes).find("channel")
    if channel is None:
        raise ValueError("feed has no <channel>")

    show_title = (channel.findtext("title") or "").strip()
    show_link = (channel.findtext("link") or "").strip()
    show_author = (channel.findtext(ITUNES + "author") or "").strip()
    show_image_el = channel.find(ITUNES + "image")
    show_image = show_image_el.get("href") if show_image_el is not None else None
    copyright_line = (channel.findtext("copyright") or "").strip()

    episodes = []
    skipped = {"no_audio": 0, "no_duration": 0, "too_long": 0}

    for item in channel.findall("item"):
        audio_url, mime = first_audio_enclosure(item)
        if not audio_url:
            skipped["no_audio"] += 1
            continue

        duration = parse_duration(item.findtext(ITUNES + "duration"))
        if duration is None:
            # Without a verified length we cannot honour the cap, so the
            # episode does not get in. Silently including it would quietly
            # break the one rule this script exists to enforce.
            skipped["no_duration"] += 1
            continue
        if duration > MAX_DURATION_SEC:
            skipped["too_long"] += 1
            continue

        image_el = item.find(ITUNES + "image")
        published = None
        if item.findtext("pubDate"):
            try:
                published = parsedate_to_datetime(item.findtext("pubDate"))
            except (TypeError, ValueError):
                published = None

        episodes.append({
            "id": str(uuid.uuid4()),
            "type": "audio_drift",
            "source": "rss",
            "title": (item.findtext("title") or "").strip(),
            "narration_script": strip_html(item.findtext("description"))[:400],
            "audio_url": audio_url,
            "audio_mime": mime,
            "duration": duration,
            # Attribution. The card credits the show and links back - that is
            # the half of "behave like a podcast client" that isn't automatic.
            "show_title": show_title,
            "author": (item.findtext(ITUNES + "author")
                       or item.findtext("author") or show_author).strip(),
            "episode_link": (item.findtext("link") or show_link).strip(),
            "show_link": show_link,
            "copyright": copyright_line,
            "image_url": (image_el.get("href") if image_el is not None else show_image),
            "guid": (item.findtext("guid") or audio_url).strip(),
            "publish_date": published or datetime.utcnow(),
            "rarity": "common",
            "tags": tags,
            "created_at": datetime.utcnow(),
        })

    summary = {
        "show_title": show_title,
        "author": show_author,
        "copyright": copyright_line,
        "total_items": len(channel.findall("item")),
        "skipped": skipped,
    }
    return summary, episodes


async def fetch_feed(client, feed):
    resp = await client.get(feed["feed_url"], follow_redirects=True,
                            headers={"User-Agent": "Antisocial/1.0 (podcast client)"})
    resp.raise_for_status()
    return parse_feed(resp.content, feed["tags"])


async def populate():
    mongo_client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = mongo_client[os.environ["DB_NAME"]]

    all_episodes = []
    async with httpx.AsyncClient(timeout=30) as client:
        for feed in FEEDS:
            try:
                summary, episodes = await fetch_feed(client, feed)
            except Exception as exc:
                # Per-feed, never aggregate-only: one silent zero in a
                # multi-source fetch is invisible in a combined total.
                print(f"✗ {feed['feed_url']}: {type(exc).__name__}: {exc}")
                continue

            s = summary["skipped"]
            print(f"✓ {summary['show_title']} — {summary['author'] or 'unknown author'}")
            print(f"    {len(episodes)} kept of {summary['total_items']} "
                  f"(skipped: {s['too_long']} over {MAX_DURATION_SEC}s, "
                  f"{s['no_duration']} no duration, {s['no_audio']} no audio enclosure)")
            print(f"    {summary['copyright'] or 'no copyright line'}")
            all_episodes.extend(episodes)

    if not all_episodes:
        print("\n✗ No episodes passed the filters — leaving the collection untouched.")
        mongo_client.close()
        return 1

    # Replace ONLY the RSS-sourced docs. The hand-written read-along drifts in
    # populate_text_content.py live in this same collection and must survive.
    removed = (await db.audio_drift_content.delete_many({"source": "rss"})).deleted_count
    legacy = (await db.audio_drift_content.delete_many(
        {"embed_url": {"$regex": "listennotes.com"}})).deleted_count
    print(f"\nCleared {removed} previous RSS items and {legacy} legacy Listen Notes items.")

    seen, fresh = set(), []
    for ep in all_episodes:
        if ep["guid"] in seen:
            continue
        seen.add(ep["guid"])
        fresh.append(ep)

    await db.audio_drift_content.insert_many(fresh)
    total = await db.audio_drift_content.count_documents({})
    print(f"Inserted {len(fresh)} episodes. Collection now holds {total} audio drift items.")

    shortest = min(fresh, key=lambda e: e["duration"])
    longest = max(fresh, key=lambda e: e["duration"])
    fmt = lambda s: f"{s // 60}:{s % 60:02d}"
    print(f"Length range: {fmt(shortest['duration'])} – {fmt(longest['duration'])} "
          f"(cap {fmt(MAX_DURATION_SEC)})")

    mongo_client.close()
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(populate()))
