"""
Populate the video card from the YouTube Data API v3.

Replaces populate_videos.py, which was a hand-typed list of 12 watch URLs
with invented metadata. By the time it was audited, 6 of the 12 had been
deleted from YouTube (users saw "Video unavailable"), every duration was
wrong by 2.4x-8x (a 6:25 video was labelled "48s"), and no card credited
the creator - TED-Ed's video was relabelled "How Batteries Store Energy".

This script asks YouTube for the truth instead: real title, real duration,
real channel, and whether the video may be embedded at all. Videos that
have been deleted or made private simply stop appearing on the next run,
so the list heals itself rather than rotting.

Requires a free YouTube Data API key in backend/.env as YOUTUBE_API_KEY:
  https://console.cloud.google.com/  ->  new project
  ->  APIs & Services  ->  enable "YouTube Data API v3"
  ->  Credentials  ->  Create credentials  ->  API key
Quota is 10,000 units/day; a full run of this script costs well under 100.

Why the Data API and not scraping the watch page: duration is not present
in YouTube's public channel RSS feed or in oEmbed, so the API is the only
sanctioned source for it. Regexing it out of the page HTML would violate
YouTube's terms - the same reason the podcast card no longer uses Listen
Notes. See populate_podcast_rss.py.
"""
import asyncio
import os
import re
import sys
import uuid
from datetime import datetime

import httpx
from dotenv import load_dotenv
from motor.motor_asyncio import AsyncIOMotorClient

load_dotenv(os.path.join(os.path.dirname(os.path.abspath(__file__)), ".env"))

API = "https://www.googleapis.com/youtube/v3"

# Hard ceiling. Nothing longer than this ever enters the collection.
MAX_DURATION_SEC = 300
# The feed weights videos at or under this to surface roughly twice as
# often as the 3-5 minute ones. See sample_videos() in server.py.
PREFERRED_MAX_SEC = 180
# How far back through each channel's uploads to look.
UPLOADS_TO_SCAN = 100

# Channel IDs, not @handles: an ID is permanent, a handle can be changed by
# its owner. These are the creators already represented in the feed, plus
# Kurzgesagt.
CHANNELS = [
    {"name": "Kurzgesagt – In a Nutshell", "id": "UCsXVk37bltHxD1rDPwtNM8Q",
     "tags": ["science", "space", "explainer"]},
    {"name": "TED-Ed", "id": "UCsooa4yRKGN_zEE8iknghZA",
     "tags": ["education", "science", "explainer"]},
    {"name": "minutephysics", "id": "UCUHW94eEFW7hkUMVaZz4eDg",
     "tags": ["physics", "science", "explainer"]},
    {"name": "Physics Girl", "id": "UC7DdEm33SyaTDtWYGO2CwdA",
     "tags": ["physics", "science", "experiments"]},
    {"name": "Mashable", "id": "UCL8Nxsa1LB9DrMTHtt3IKiw",
     "tags": ["technology", "explainer"]},
    {"name": "sciBRIGHT", "id": "UCpYJfjTZosH1-W0ZDnNclUg",
     "tags": ["science", "technology", "explainer"]},
]

ISO_DURATION = re.compile(
    r"^P(?:(?P<d>\d+)D)?T(?:(?P<h>\d+)H)?(?:(?P<m>\d+)M)?(?:(?P<s>\d+)S)?$")


def parse_iso_duration(raw):
    """contentDetails.duration is ISO 8601, e.g. PT1M11S or PT4H2M3S."""
    if not raw:
        return None
    m = ISO_DURATION.match(raw.strip())
    if not m:
        return None
    p = {k: int(v or 0) for k, v in m.groupdict().items()}
    return p["d"] * 86400 + p["h"] * 3600 + p["m"] * 60 + p["s"]


def clean_description(raw):
    """
    YouTube descriptions run to hundreds of lines of links, credits and
    hashtags. The card wants a sentence or two, so keep the opening prose
    and drop anything that is plainly boilerplate.
    """
    if not raw:
        return ""
    lines = []
    for line in raw.splitlines():
        line = line.strip()
        if not line:
            if lines:
                break  # first blank line after real text ends the intro
            continue
        if "http://" in line or "https://" in line:
            break
        if line.startswith("#") or set(line) <= set("▀─—-=_ "):
            break
        lines.append(line)
    text = " ".join(lines).strip()
    return text[:300].rsplit(" ", 1)[0] + "…" if len(text) > 300 else text


async def api_get(client, path, **params):
    params["key"] = os.environ["YOUTUBE_API_KEY"]
    r = await client.get(f"{API}/{path}", params=params)
    if r.status_code == 403:
        raise RuntimeError(
            f"YouTube API refused the request (403). Usually a disabled API "
            f"or an exhausted quota. Body: {r.text[:300]}")
    r.raise_for_status()
    return r.json()


async def uploads_playlist(client, channel_id):
    data = await api_get(client, "channels", part="contentDetails", id=channel_id)
    items = data.get("items") or []
    if not items:
        raise RuntimeError(f"no such channel: {channel_id}")
    return items[0]["contentDetails"]["relatedPlaylists"]["uploads"]


async def recent_video_ids(client, playlist_id, limit):
    ids, page = [], None
    while len(ids) < limit:
        data = await api_get(client, "playlistItems", part="contentDetails",
                             playlistId=playlist_id, maxResults=50,
                             **({"pageToken": page} if page else {}))
        ids += [i["contentDetails"]["videoId"] for i in data.get("items", [])]
        page = data.get("nextPageToken")
        if not page:
            break
    return ids[:limit]


async def video_details(client, video_ids):
    """
    Batched at 50 ids per call - the documented ceiling for the id filter.
    Each call costs 1 quota unit. maxResults is deliberately not passed:
    "This parameter is supported for use in conjunction with the myRating
    parameter, but it is not supported for use in conjunction with the id
    parameter."
    """
    out = []
    for i in range(0, len(video_ids), 50):
        data = await api_get(client, "videos", part="snippet,contentDetails,status",
                             id=",".join(video_ids[i:i + 50]))
        out += data.get("items", [])
    return out


def build_doc(video, channel, tags):
    snippet, status = video["snippet"], video["status"]
    duration = parse_iso_duration(video["contentDetails"].get("duration"))
    thumbs = snippet.get("thumbnails", {})
    best = thumbs.get("maxres") or thumbs.get("high") or thumbs.get("medium") or {}

    return {
        "id": str(uuid.uuid4()),
        "type": "video",
        "source": "youtube",
        # The creator's real title, not a rewrite of it.
        "title": snippet["title"],
        "description": clean_description(snippet.get("description")),
        "video_url": f"https://www.youtube.com/watch?v={video['id']}",
        "video_id": video["id"],
        "duration": duration,
        # Attribution. The embedded player shows the channel, but the card
        # should say whose work it is before you press play.
        "channel_title": snippet.get("channelTitle") or channel["name"],
        "channel_id": snippet.get("channelId") or channel["id"],
        "channel_url": f"https://www.youtube.com/channel/{snippet.get('channelId') or channel['id']}",
        "thumbnail_url": best.get("url"),
        "published_at": snippet.get("publishedAt"),
        "rarity": "common",
        "tags": tags,
        "created_at": datetime.utcnow(),
    }


def keep(video):
    """Reasons a video never enters the collection."""
    status, snippet = video["status"], video["snippet"]
    if not status.get("embeddable"):
        return "not embeddable"
    if status.get("privacyStatus") != "public":
        return "not public"
    if snippet.get("liveBroadcastContent", "none") != "none":
        return "live stream"
    duration = parse_iso_duration(video["contentDetails"].get("duration"))
    if duration is None:
        return "no duration"
    if duration == 0:
        return "zero length"
    if duration > MAX_DURATION_SEC:
        return "too long"
    return None


async def collect(client, channel):
    playlist = await uploads_playlist(client, channel["id"])
    ids = await recent_video_ids(client, playlist, UPLOADS_TO_SCAN)
    videos = await video_details(client, ids)

    kept, rejected = [], {}
    for v in videos:
        reason = keep(v)
        if reason:
            rejected[reason] = rejected.get(reason, 0) + 1
            continue
        kept.append(build_doc(v, channel, channel["tags"]))
    return kept, len(ids), rejected


async def populate():
    if not os.environ.get("YOUTUBE_API_KEY"):
        print("✗ YOUTUBE_API_KEY is not set in backend/.env.\n"
              "  Create a free key: console.cloud.google.com -> enable\n"
              "  'YouTube Data API v3' -> Credentials -> API key.\n"
              "  Leaving the video collection untouched.")
        return 1

    mongo_client = AsyncIOMotorClient(os.environ["MONGO_URL"])
    db = mongo_client[os.environ["DB_NAME"]]

    everything = []
    async with httpx.AsyncClient(timeout=30) as client:
        for channel in CHANNELS:
            try:
                kept, scanned, rejected = await collect(client, channel)
            except Exception as exc:
                # Per channel, never aggregate-only: one channel silently
                # returning nothing is invisible in a combined total.
                print(f"✗ {channel['name']}: {type(exc).__name__}: {exc}")
                continue

            short = len([v for v in kept if v["duration"] <= PREFERRED_MAX_SEC])
            detail = ", ".join(f"{n} {why}" for why, n in sorted(rejected.items()))
            print(f"✓ {channel['name']}: {len(kept)} kept of {scanned} scanned "
                  f"({short} under {PREFERRED_MAX_SEC}s)")
            if detail:
                print(f"    rejected: {detail}")
            everything.extend(kept)

    if not everything:
        print("\n✗ No videos passed the filters — leaving the collection untouched.")
        mongo_client.close()
        return 1

    removed = (await db.video_content.delete_many({})).deleted_count
    print(f"\nCleared {removed} previous video items "
          f"(the old hand-typed list and any AI placeholders).")

    seen, fresh = set(), []
    for doc in everything:
        if doc["video_id"] in seen:
            continue
        seen.add(doc["video_id"])
        fresh.append(doc)

    await db.video_content.insert_many(fresh)
    short = len([v for v in fresh if v["duration"] <= PREFERRED_MAX_SEC])
    fmt = lambda s: f"{s // 60}:{s % 60:02d}"
    lengths = sorted(v["duration"] for v in fresh)
    print(f"Inserted {len(fresh)} videos — {short} at or under "
          f"{fmt(PREFERRED_MAX_SEC)}, {len(fresh) - short} between "
          f"{fmt(PREFERRED_MAX_SEC)} and {fmt(MAX_DURATION_SEC)}.")
    print(f"Length range: {fmt(lengths[0])} – {fmt(lengths[-1])}")

    mongo_client.close()
    return 0


if __name__ == "__main__":
    sys.exit(asyncio.run(populate()))
