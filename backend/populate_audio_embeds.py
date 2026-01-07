"""
Populate Audio Drift with Listen Notes podcast embeds and Best Bets
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

# Curated podcasts with embed URLs
CURATED_PODCASTS = [
    {
        "title": "Weird and Surprising Facts by Stephen Carter",
        "podcast_id": "NV_rC-179wI",
        "embed_url": "https://www.listennotes.com/podcasts/weird-and-surprising-facts-stephen-carter-NV_rC-179wI/embed/",
        "description": "Daily surprising facts from science, history, and culture",
        "tags": ["facts", "science", "history"]
    },
]

async def fetch_best_episodes():
    """Fetch curated best episodes from Listen Notes"""
    try:
        # Fetch best podcasts in various categories
        categories_to_fetch = [
            ("Science", 107),  # Science
            ("Education", 111),  # Education
            ("Stories", 122),  # Personal Journals (stories)
        ]
        
        all_episodes = []
        
        for category_name, category_id in categories_to_fetch:
            try:
                print(f"\nFetching best podcasts in {category_name}...")
                response = client.fetch_best_podcasts(
                    genre_id=category_id,
                    page=1,
                    region='us'
                )
                
                podcasts = response.json().get('podcasts', [])[:5]  # Top 5 from each category
                
                for podcast in podcasts:
                    podcast_id = podcast['id']
                    podcast_title = podcast.get('title_original') or podcast.get('title', '')
                    
                    # Get latest episodes from this podcast
                    try:
                        pod_response = client.fetch_podcast_by_id(id=podcast_id)
                        pod_data = pod_response.json()
                        
                        episodes = pod_data.get('episodes', [])[:3]  # Get 3 latest episodes
                        
                        for episode in episodes:
                            duration = episode.get('audio_length_sec', 0)
                            # Only include episodes between 1-10 minutes
                            if 60 <= duration <= 600:
                                all_episodes.append({
                                    "title": episode.get('title_original') or episode.get('title', ''),
                                    "description": (episode.get('description_original') or episode.get('description', ''))[:250],
                                    "podcast_title": podcast_title,
                                    "podcast_id": podcast_id,
                                    "episode_id": episode['id'],
                                    "embed_url": f"https://www.listennotes.com/episodes/{episode['id']}/embed/",
                                    "audio_url": episode.get('audio', ''),
                                    "duration": duration,
                                    "category": category_name,
                                    "image_url": episode.get('image') or podcast.get('image'),
                                    "publish_date": datetime.fromtimestamp(episode['pub_date_ms'] / 1000) if episode.get('pub_date_ms') else datetime.utcnow()
                                })
                        
                        print(f"  ✓ Added {len([e for e in all_episodes if e.get('podcast_id') == podcast_id])} episodes from {podcast_title[:40]}...")
                        
                    except Exception as e:
                        print(f"  ✗ Error fetching episodes from {podcast_title[:40]}: {e}")
                        continue
                    
            except Exception as e:
                print(f"  ✗ Error in category {category_name}: {e}")
                continue
        
        return all_episodes
    except Exception as e:
        print(f"Error in fetch_best_episodes: {e}")
        import traceback
        traceback.print_exc()
        return []

async def populate_audio_drift():
    """Populate MongoDB with podcast embeds and best episodes"""
    try:
        # Connect to MongoDB
        mongo_url = os.environ['MONGO_URL']
        mongo_client = AsyncIOMotorClient(mongo_url)
        db = mongo_client[os.environ['DB_NAME']]
        
        # Clear existing audio drift content
        await db.audio_drift_content.delete_many({})
        print("Cleared existing audio drift content\n")
        
        all_audio = []
        
        # Add curated podcast embeds
        print("Adding curated podcast embeds...")
        for podcast in CURATED_PODCASTS:
            audio_item = {
                "id": str(uuid.uuid4()),
                "type": "audio_drift",
                "title": podcast["title"],
                "narration_script": podcast["description"],
                "embed_url": podcast["embed_url"],
                "podcast_id": podcast["podcast_id"],
                "rarity": "common",
                "tags": podcast["tags"],
                "created_at": datetime.utcnow()
            }
            all_audio.append(audio_item)
            print(f"✓ Added: {podcast['title']}")
        
        # Fetch best episodes
        print("\nFetching best episodes from Listen Notes...")
        best_episodes = await fetch_best_episodes()
        print(f"\n✓ Found {len(best_episodes)} best episodes")
        
        # Add best episodes
        for episode_data in best_episodes:
            audio_item = {
                "id": str(uuid.uuid4()),
                "type": "audio_drift",
                "title": episode_data["title"],
                "narration_script": episode_data["description"],
                "embed_url": episode_data["embed_url"],
                "audio_url": episode_data["audio_url"],
                "duration": episode_data["duration"],
                "podcast_title": episode_data["podcast_title"],
                "podcast_id": episode_data["podcast_id"],
                "episode_id": episode_data["episode_id"],
                "category": episode_data["category"],
                "image_url": episode_data.get("image_url"),
                "publish_date": episode_data["publish_date"],
                "rarity": "common",
                "tags": ["podcast", episode_data["category"].lower()],
                "created_at": datetime.utcnow()
            }
            all_audio.append(audio_item)
        
        # Insert all into MongoDB
        print(f"\nInserting {len(all_audio)} audio drift items...")
        for audio in all_audio:
            await db.audio_drift_content.insert_one(audio)
            duration = audio.get('duration', 0)
            if duration:
                duration_min = duration // 60
                duration_sec = duration % 60
                print(f"✓ {audio['title'][:60]}... ({duration_min}:{duration_sec:02d})")
            else:
                print(f"✓ {audio['title'][:60]}...")
        
        print(f"\n✅ Successfully added {len(all_audio)} audio drift items!")
        
        # Show breakdown
        print("\n📊 Content Breakdown:")
        category_counts = {}
        for audio in all_audio:
            cat = audio.get('category', 'Curated')
            category_counts[cat] = category_counts.get(cat, 0) + 1
        
        for category, count in category_counts.items():
            print(f"  {category}: {count} items")
        
        # Close connection
        mongo_client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")
        import traceback
        traceback.print_exc()

if __name__ == "__main__":
    asyncio.run(populate_audio_drift())
