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

# Search terms for diverse audio sources
SEARCH_QUERIES = [
    {
        "query": "Stephen Carter weird facts",
        "description": "Surprising facts and stories",
        "max_duration": 600
    },
    {
        "query": "one minute story micro fiction",
        "description": "Micro stories - tiny tales",
        "max_duration": 180
    },
    {
        "query": "quick science facts daily",
        "description": "Daily science curiosities",
        "max_duration": 420
    },
    {
        "query": "daily curiosity surprising",
        "description": "Daily surprising facts",
        "max_duration": 480
    },
    {
        "query": "micro podcast short stories",
        "description": "Short story podcasts",
        "max_duration": 300
    }
]

async def search_podcast_episodes(query, max_results=8, max_duration=600):
    """Search for podcast episodes matching query"""
    try:
        response = client.search(
            q=query,
            type='episode',
            sort_by_date=1,
            len_min=30,  # Minimum 30 seconds
            len_max=max_duration,  # Maximum duration from config
            language='English'
        )
        
        episodes = []
        for episode in response.json().get('results', [])[:max_results]:
            duration = episode.get('audio_length_sec', 0)
            if 30 <= duration <= max_duration:
                # Extract podcast info from the nested structure
                podcast_info = episode.get('podcast', {})
                
                episodes.append({
                    "listen_notes_id": episode['id'],
                    "title": episode.get('title_original') or episode.get('title_highlighted', '').replace('<span class="ln-search-highlight">', '').replace('</span>', ''),
                    "description": (episode.get('description_original') or episode.get('description_highlighted', ''))[:250],
                    "audio_url": episode['audio'],
                    "audio_length_sec": duration,
                    "podcast_title": podcast_info.get('title_original') or podcast_info.get('title_highlighted', '').replace('<span class="ln-search-highlight">', '').replace('</span>', ''),
                    "podcast_id": podcast_info.get('id', 'unknown'),
                    "image_url": episode.get('image') or episode.get('thumbnail'),
                    "publish_date": datetime.fromtimestamp(episode['pub_date_ms'] / 1000) if episode.get('pub_date_ms') else datetime.utcnow(),
                    "search_query": query
                })
        
        return episodes
    except Exception as e:
        print(f"Error searching '{query}': {e}")
        import traceback
        traceback.print_exc()
        return []

async def populate_audio_drift():
    """Populate MongoDB with real podcast episodes from multiple sources"""
    try:
        # Connect to MongoDB
        mongo_url = os.environ['MONGO_URL']
        mongo_client = AsyncIOMotorClient(mongo_url)
        db = mongo_client[os.environ['DB_NAME']]
        
        # Clear existing audio drift content
        await db.audio_drift_content.delete_many({})
        print("Cleared existing audio drift content\n")
        
        all_episodes = []
        
        # Search across multiple queries for diverse content
        for search_config in SEARCH_QUERIES:
            print(f"Searching: {search_config['description']}")
            print(f"  Query: '{search_config['query']}'")
            
            episodes = await search_podcast_episodes(
                search_config['query'],
                max_results=8,
                max_duration=search_config['max_duration']
            )
            
            print(f"  ✓ Found {len(episodes)} episodes\n")
            all_episodes.extend(episodes)
        
        # Remove duplicates based on audio URL
        seen_urls = set()
        unique_episodes = []
        for ep in all_episodes:
            if ep['audio_url'] not in seen_urls:
                seen_urls.add(ep['audio_url'])
                unique_episodes.append(ep)
        
        print(f"Total unique episodes: {len(unique_episodes)}\n")
        
        # Insert into MongoDB
        for episode_data in unique_episodes:
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
                "search_source": episode_data["search_query"],
                "rarity": "common",
                "tags": ["podcast", "audio", "story"],
                "created_at": datetime.utcnow()
            }
            
            await db.audio_drift_content.insert_one(audio_drift_doc)
            duration_min = episode_data["audio_length_sec"] // 60
            duration_sec = episode_data["audio_length_sec"] % 60
            print(f"✓ Added: {episode_data['title'][:60]}... ({duration_min}:{duration_sec:02d})")
        
        print(f"\n✅ Successfully added {len(unique_episodes)} audio drift episodes from multiple sources!")
        
        # Show breakdown by source
        print("\n📊 Content Breakdown:")
        source_counts = {}
        for ep in unique_episodes:
            source = ep['search_query']
            source_counts[source] = source_counts.get(source, 0) + 1
        
        for source, count in source_counts.items():
            print(f"  {source}: {count} episodes")
        
        # Close connection
        mongo_client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(populate_audio_drift())
