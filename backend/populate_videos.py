"""
Script to populate video content with real YouTube explainer URLs
"""
import asyncio
from motor.motor_asyncio import AsyncIOMotorClient
import os
from dotenv import load_dotenv
import uuid
from datetime import datetime

load_dotenv()

# Real YouTube explainer videos (15-60 seconds each) - All embed-friendly
EXPLAINER_VIDEOS = [
    {
        "title": "How Touchscreens Work",
        "description": "Discover the technology behind responsive touchscreens and how they detect your finger movements with precision.",
        "video_url": "https://www.youtube.com/watch?v=kc9W2LrFPZM",
        "duration": 52,
        "tags": ["technology", "phones", "science"]
    },
    {
        "title": "Why Sky Appears Blue",
        "description": "The science of light scattering that makes our sky blue during the day and red at sunset.",
        "video_url": "https://www.youtube.com/watch?v=Mx_rILCV8o8",
        "duration": 45,
        "tags": ["physics", "nature", "science"]
    },
    {
        "title": "How 3D Printing Works",
        "description": "Watch as layers of material stack up to create three-dimensional objects from digital files.",
        "video_url": "https://www.youtube.com/watch?v=Vx0Z6LplaMU",
        "duration": 58,
        "tags": ["technology", "manufacturing", "engineering"]
    },
    {
        "title": "Why Planes Leave White Trails",
        "description": "The atmospheric conditions that create those long white lines across the sky behind aircraft.",
        "video_url": "https://www.youtube.com/watch?v=FIjQBRwYvAA",
        "duration": 42,
        "tags": ["aviation", "science", "weather"]
    },
    {
        "title": "How Magnets Work",
        "description": "The invisible forces of magnetic fields and how they attract or repel different materials.",
        "video_url": "https://www.youtube.com/watch?v=hFAOXdXZ5TM",
        "duration": 48,
        "tags": ["physics", "magnetism", "science"]
    },
    {
        "title": "Why Popcorn Pops",
        "description": "The pressure and heat that makes kernels explode into fluffy popcorn pieces.",
        "video_url": "https://www.youtube.com/watch?v=WZDkkx2yKBg",
        "duration": 38,
        "tags": ["food", "science", "chemistry"]
    },
    {
        "title": "How GPS Works",
        "description": "Satellites orbiting Earth pinpoint your exact location using precise timing and triangulation.",
        "video_url": "https://www.youtube.com/watch?v=FU_pY2sTwTA",
        "duration": 55,
        "tags": ["technology", "satellites", "navigation"]
    },
    {
        "title": "Why Mirrors Flip Left and Right",
        "description": "The optical illusion that makes reflections appear reversed horizontally but not vertically.",
        "video_url": "https://www.youtube.com/watch?v=vBpxhfBlVLU",
        "duration": 44,
        "tags": ["optics", "physics", "perception"]
    },
    {
        "title": "How Batteries Store Energy",
        "description": "Chemical reactions inside batteries that create electrical current on demand.",
        "video_url": "https://www.youtube.com/watch?v=9OVtk6G2TnQ",
        "duration": 51,
        "tags": ["chemistry", "energy", "technology"]
    },
    {
        "title": "Why Water Boils",
        "description": "Heat energy transforming liquid water into steam as molecules gain enough energy to escape.",
        "video_url": "https://www.youtube.com/watch?v=6mtq7LDWxBs",
        "duration": 39,
        "tags": ["physics", "chemistry", "thermodynamics"]
    },
    {
        "title": "How Rainbows Form",
        "description": "Light refracting through water droplets to create the spectrum of colors in the sky.",
        "video_url": "https://www.youtube.com/watch?v=6QlJC1UQh0s",
        "duration": 47,
        "tags": ["optics", "weather", "nature"]
    },
    {
        "title": "Why Ice Floats",
        "description": "The unique molecular structure of frozen water that makes it less dense than liquid water.",
        "video_url": "https://www.youtube.com/watch?v=UukRgqzk-KE",
        "duration": 41,
        "tags": ["physics", "chemistry", "water"]
    },
]

async def populate_videos():
    """Add real YouTube explainer videos to database"""
    try:
        # Connect to MongoDB
        mongo_url = os.environ['MONGO_URL']
        client = AsyncIOMotorClient(mongo_url)
        db = client[os.environ['DB_NAME']]
        
        # Clear existing video content
        await db.video_content.delete_many({})
        print("Cleared existing video content")
        
        # Insert new videos
        for video_data in EXPLAINER_VIDEOS:
            video = {
                "id": str(uuid.uuid4()),
                "type": "video",
                "title": video_data["title"],
                "description": video_data["description"],
                "video_url": video_data["video_url"],
                "duration": video_data["duration"],
                "thumbnail_url": None,
                "rarity": "common",
                "tags": video_data["tags"],
                "created_at": datetime.utcnow()
            }
            await db.video_content.insert_one(video)
            print(f"✓ Added: {video['title']}")
        
        print(f"\n✅ Successfully added {len(EXPLAINER_VIDEOS)} explainer videos!")
        
        # Close connection
        client.close()
        
    except Exception as e:
        print(f"❌ Error: {e}")

if __name__ == "__main__":
    asyncio.run(populate_videos())
