"""
Copy the seeded feed content from the local MongoDB into a hosted cluster
(MongoDB Atlas) ahead of a deploy.

This copies rather than re-seeds on purpose. Re-running populate_youtube.py /
populate_podcast_rss.py against Atlas would hit the APIs again and produce a
*different* set of videos and episodes — the curated collection that has
already been filtered for dead links and promos would be lost. The hand-written
text content would survive, but there is no reason to risk the rest.

Usage:
    export TARGET_MONGO_URL='mongodb+srv://user:pass@cluster.xxxxx.mongodb.net/?retryWrites=true&w=majority'
    ./venv/bin/python3 migrate_to_atlas.py            # dry run: reports what it would copy
    ./venv/bin/python3 migrate_to_atlas.py --write    # actually copies

Source defaults to the local dev database. Existing target collections are
replaced, not merged, so re-running is safe and idempotent.
"""
import os
import sys

from dotenv import load_dotenv
from pymongo import MongoClient

load_dotenv()

SOURCE_URL = os.environ.get("SOURCE_MONGO_URL", "mongodb://localhost:27017")
SOURCE_DB = os.environ.get("SOURCE_DB_NAME", os.environ.get("DB_NAME", "antisocial_db"))
TARGET_URL = os.environ.get("TARGET_MONGO_URL")
TARGET_DB = os.environ.get("TARGET_DB_NAME", SOURCE_DB)

BATCH = 500


def main() -> int:
    write = "--write" in sys.argv

    if not TARGET_URL:
        print("TARGET_MONGO_URL is not set — export your Atlas connection string first.")
        return 1

    source = MongoClient(SOURCE_URL, serverSelectionTimeoutMS=5000)
    target = MongoClient(TARGET_URL, serverSelectionTimeoutMS=20000)
    try:
        source.admin.command("ping")
    except Exception as exc:
        print(f"Cannot reach the local MongoDB at {SOURCE_URL}: {exc}")
        return 1
    try:
        target.admin.command("ping")
    except Exception as exc:
        print(f"Cannot reach the target cluster: {exc}")
        return 1

    src_db = source[SOURCE_DB]
    dst_db = target[TARGET_DB]

    names = sorted(n for n in src_db.list_collection_names() if not n.startswith("system."))
    if not names:
        print(f"No collections found in {SOURCE_DB}. Nothing to copy.")
        return 1

    print(f"{SOURCE_URL}/{SOURCE_DB}  ->  {TARGET_DB}   ({'WRITING' if write else 'dry run'})\n")

    total = 0
    # Per-collection counts, not just a total: an aggregate 'copied 387 docs'
    # would hide one collection silently arriving empty.
    for name in names:
        docs = list(src_db[name].find({}))
        n = len(docs)
        total += n
        if write:
            dst_db[name].drop()
            for i in range(0, n, BATCH):
                dst_db[name].insert_many(docs[i:i + BATCH])
            copied = dst_db[name].count_documents({})
            flag = "" if copied == n else f"   MISMATCH: target has {copied}"
            print(f"  {name:32s} {n:5d}{flag}")
        else:
            print(f"  {name:32s} {n:5d}")

    print(f"\n  {'TOTAL':32s} {total:5d}")
    if not write:
        print("\nDry run only. Re-run with --write to copy.")
    else:
        print(f"\nDone. Point the deployed backend at this cluster with DB_NAME={TARGET_DB}.")
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
