"""
Populate Audio Drift content with real podcast episodes from Listen Notes API
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime
from listennotes import podcast_api

load_dotenv()

# Initialize Listen Notes client
LISTEN_NOTES_API_KEY = os.environ.get('LISTEN_NOTES_API_KEY')
client = podcast_api.Client(api_key=LISTEN_NOTES_API_KEY)

# Target podcasts for Audio Drift
AUDIO_DRIFT_PODCASTS = {
    "weird_surprising_facts": {
        "id": "NV_rC-179wI",
        "name": "Weird and Surprising Facts",
        "description": "Daily stories about surprising facts from science, history, and culture",
        "target_duration": 300  # ~5 minutes
    },
    "micro_stories": {
        "search_term": "one minute story micro fiction",
        "description": "Micro stories - tiny tales in about 1 minute",
        "target_duration": 60  # ~1 minute
    }
}

async def fetch_podcast_episodes(podcast_id, max_episodes=10):
    """Fetch episodes from a specific podcast"""
    try:
        response = client.fetch_podcast_by_id(
            id=podcast_id,
            sort='recent_first'
        )
        
        episodes = []
        for episode in response.json().get('episodes', [])[:max_episodes]:
            # Only include short episodes suitable for Audio Drift
            duration = episode.get('audio_length_sec', 0)
            if 30 <= duration <= 600:  # Between 30 seconds and 10 minutes
                episodes.append({
                    "listen_notes_id": episode['id'],
                    "title": episode['title'],
                    "description": episode['description'][:200] if episode.get('description') else '',
                    "audio_url": episode['audio'],
                    "audio_length_sec": duration,
                    "podcast_title": episode['podcast']['title'],
                    "podcast_id": podcast_id,
                    "image_url": episode.get('image') or episode['podcast'].get('image'),
                    "publish_date": datetime.fromtimestamp(episode['pub_date_ms'] / 1000)
                })
        
        return episodes
    except Exception as e:
        print(f"Error fetching podcast {podcast_id}: {e}")
        return []

async def search_micro_stories(max_results=10):
    """Search for micro/short story podcasts"""
    try:
        response = client.search(
            q='one minute story micro',
            type='episode',
            sort_by_date=1,
            len_min=30,  # Minimum 30 seconds
            len_max=180,  # Maximum 3 minutes
            language='English'
        )
        
        episodes = []
        for episode in response.json().get('results', [])[:max_results]:
            duration = episode.get('audio_length_sec', 0)
            if 30 <= duration <= 180:
                episodes.append({
                    "listen_notes_id": episode['id'],
                    "title": episode['title'],
                    "description": episode['description'][:200] if episode.get('description') else '',
                    "audio_url": episode['audio'],
                    "audio_length_sec": duration,
                    "podcast_title": episode['podcast']['title'],
                    "podcast_id": episode['podcast']['id'],
                    "image_url": episode.get('image') or episode['podcast'].get('image'),
                    "publish_date": datetime.fromtimestamp(episode['pub_date_ms'] / 1000)
                })
        
        return episodes
    except Exception as e:
        print(f"Error searching micro stories: {e}")
        return []

async def populate_audio_drift():
    """Populate MongoDB with real podcast episodes"""
    try:
        # Connect to MongoDB
        mongo_url = os.environ['MONGO_URL']
        mongo_client = AsyncIOMotorClient(mongo_url)
        db = mongo_client[os.environ['DB_NAME']]
        
        # Clear existing audio drift content
        await db.audio_drift_content.delete_many({})
        print("Cleared existing audio drift content")
        
        all_episodes = []
        
        # Fetch from "Weird and Surprising Facts" podcast
        print("\nFetching from 'Weird and Surprising Facts' podcast...")
        weird_facts_episodes = await fetch_podcast_episodes(
            AUDIO_DRIFT_PODCASTS["weird_surprising_facts"]["id"],
            max_episodes=15
        )
        print(f"✓ Found {len(weird_facts_episodes)} episodes from Weird and Surprising Facts")
        all_episodes.extend(weird_facts_episodes)
        
        # Search for micro/short stories
        print("\nSearching for micro stories...")
        micro_episodes = await search_micro_stories(max_results=10)
        print(f"✓ Found {len(micro_episodes)} micro story episodes")
        all_episodes.extend(micro_episodes)
        
        # Insert into MongoDB
        for episode_data in all_episodes:
            audio_drift_doc = {
                "id": str(uuid.uuid4()),
                "type": "audio_drift",
                "title": episode_data["title"],
                "narration_script": episode_data["description"],
                "audio_url": episode_data["audio_url"],
                "duration": episode_data["audio_length_sec"],
                "podcast_title": episode_data["podcast_title"],
                "podcast_id": episode_data["podcast_id"],
                "listen_notes_id": episode_data["listen_notes_id"],
                "image_url": episode_data.get("image_url"),
                "publish_date": episode_data["publish_date"],
                "rarity": "common",
                "tags": ["podcast", "audio", "story"],
                "created_at": datetime.utcnow()
            }
            
            await db.audio_drift_content.insert_one(audio_drift_doc)
            duration_min = episode_data["audio_length_sec"] // 60
            duration_sec = episode_data["audio_length_sec"] % 60
            print(f"✓ Added: {episode_data['title'][:50]}... ({duration_min}:{duration_sec:02d})")
        
        print(f"\n✅ Successfully added {len(all_episodes)} audio drift episodes!")
        
        # Close connection
        mongo_client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(populate_audio_drift())
