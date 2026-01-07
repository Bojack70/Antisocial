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

# Real YouTube explainer videos (15-60 seconds each)
EXPLAINER_VIDEOS = [
    {
        "title": "How Fiber Optic Cables Transmit Data",
        "description": "Watch how light pulses travel through glass fibers at incredible speeds to carry data across continents.",
        "video_url": "https://www.youtube.com/watch?v=0MwMkBET_5I",
        "duration": 45,
        "tags": ["technology", "infrastructure", "physics"]
    },
    {
        "title": "Why Ballpoint Pens Don't Leak",
        "description": "The clever mechanism inside a ballpoint pen that prevents ink from spilling everywhere.",
        "video_url": "https://www.youtube.com/watch?v=gTzLM0NKUzQ",
        "duration": 38,
        "tags": ["engineering", "everyday objects"]
    },
    {
        "title": "How Touchscreens Sense Your Finger",
        "description": "The invisible grid of sensors that detect exactly where you touch your phone screen.",
        "video_url": "https://www.youtube.com/watch?v=S14C_8TAd9M",
        "duration": 52,
        "tags": ["technology", "phones", "sensors"]
    },
    {
        "title": "Why Traffic Lights Are Red Yellow Green",
        "description": "The surprising reason these three colors became the universal standard for traffic control.",
        "video_url": "https://www.youtube.com/watch?v=2xGWURp4wKU",
        "duration": 41,
        "tags": ["infrastructure", "history", "design"]
    },
    {
        "title": "How Holograms Work",
        "description": "The interference patterns of light that create three-dimensional images in thin air.",
        "video_url": "https://www.youtube.com/watch?v=WblQz9M8gKw",
        "duration": 48,
        "tags": ["physics", "optics", "technology"]
    },
    {
        "title": "Why Bubbles Are Round",
        "description": "Surface tension and air pressure create the perfect sphere every time.",
        "video_url": "https://www.youtube.com/watch?v=OQfUz0mKhtc",
        "duration": 35,
        "tags": ["physics", "nature", "science"]
    },
    {
        "title": "How Barcodes Are Scanned",
        "description": "The pattern of lines that tells checkout machines exactly what you're buying.",
        "video_url": "https://www.youtube.com/watch?v=e6aR1k-ympo",
        "duration": 44,
        "tags": ["technology", "retail", "everyday"]
    },
    {
        "title": "Why Ice Floats on Water",
        "description": "The unique molecular structure that makes frozen water less dense than liquid water.",
        "video_url": "https://www.youtube.com/watch?v=UukRgqzk-KE",
        "duration": 39,
        "tags": ["physics", "chemistry", "nature"]
    },
    {
        "title": "How Microwave Ovens Heat Food",
        "description": "Electromagnetic waves making water molecules vibrate millions of times per second.",
        "video_url": "https://www.youtube.com/watch?v=kp33ZprO0Ck",
        "duration": 47,
        "tags": ["technology", "kitchen", "physics"]
    },
    {
        "title": "Why Airplane Windows Are Round",
        "description": "The engineering reason square windows would be catastrophic at high altitudes.",
        "video_url": "https://www.youtube.com/watch?v=MloemUaTM3I",
        "duration": 42,
        "tags": ["engineering", "aviation", "safety"]
    },
    {
        "title": "How QR Codes Store Information",
        "description": "The geometric patterns that encode websites, payments, and data in tiny squares.",
        "video_url": "https://www.youtube.com/watch?v=w5ebcowAJD8",
        "duration": 51,
        "tags": ["technology", "data", "encoding"]
    },
    {
        "title": "Why Bridges Have Expansion Joints",
        "description": "The hidden gaps that allow bridges to expand and contract with temperature changes.",
        "video_url": "https://www.youtube.com/watch?v=7zZ2n7Qzqz8",
        "duration": 36,
        "tags": ["engineering", "infrastructure", "bridges"]
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
