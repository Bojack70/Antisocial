#!/usr/bin/env python3
"""
Backend API Testing for Modern Weirdness Curiosity App
Tests all critical endpoints and functionality
"""

import requests
import json
import time
from datetime import datetime
import uuid

# Get backend URL from environment
BACKEND_URL = "https://quietwonder.preview.emergentagent.com/api"

def test_health_check():
    """Test GET /api/ - Health check endpoint"""
    print("\n=== Testing Health Check Endpoint ===")
    try:
        response = requests.get(f"{BACKEND_URL}/")
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("message") == "Modern Weirdness API" and data.get("version") == "1.0":
                print("✅ Health check passed")
                return True
            else:
                print("❌ Health check failed - incorrect response format")
                return False
        else:
            print(f"❌ Health check failed - status code {response.status_code}")
            return False
    except Exception as e:
        print(f"❌ Health check failed - error: {e}")
        return False

def test_content_generation():
    """Test POST /api/content/generate for all content types"""
    print("\n=== Testing Content Generation ===")
    content_types = ["fast_weird", "explainer", "ponder", "incident", "mini_game", "audio_drift"]
    results = {}
    
    for content_type in content_types:
        print(f"\nTesting {content_type} generation...")
        try:
            payload = {
                "content_type": content_type,
                "count": 1
            }
            
            response = requests.post(
                f"{BACKEND_URL}/content/generate",
                json=payload,
                headers={"Content-Type": "application/json"}
            )
            
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                print(f"Response keys: {list(data.keys())}")
                
                # Verify response structure
                if data.get("success") and data.get("items"):
                    item = data["items"][0]
                    print(f"Generated item type: {item.get('type')}")
                    print(f"Item has ID: {'id' in item}")
                    print(f"Item has created_at: {'created_at' in item}")
                    print(f"No _id field: {'_id' not in item}")
                    
                    # Verify content type specific fields
                    type_specific_checks = {
                        "fast_weird": ["headline", "facts", "rarity"],
                        "explainer": ["question", "steps", "rarity"],
                        "ponder": ["image_url", "question", "options", "rarity"],
                        "incident": ["hook", "story", "rarity"],
                        "mini_game": ["game_type", "prompt", "options", "correct_answer", "rarity"],
                        "audio_drift": ["title", "narration_script", "rarity"]
                    }
                    
                    required_fields = type_specific_checks.get(content_type, [])
                    missing_fields = [field for field in required_fields if field not in item]
                    
                    if not missing_fields:
                        print(f"✅ {content_type} generation passed")
                        results[content_type] = True
                    else:
                        print(f"❌ {content_type} generation failed - missing fields: {missing_fields}")
                        results[content_type] = False
                else:
                    print(f"❌ {content_type} generation failed - invalid response structure")
                    results[content_type] = False
            else:
                print(f"❌ {content_type} generation failed - status code {response.status_code}")
                if response.text:
                    print(f"Error response: {response.text}")
                results[content_type] = False
                
        except Exception as e:
            print(f"❌ {content_type} generation failed - error: {e}")
            results[content_type] = False
        
        # Small delay between requests
        time.sleep(1)
    
    return results

def test_feed_endpoint():
    """Test GET /api/feed?limit=30 - Mixed feed endpoint"""
    print("\n=== Testing Feed Endpoint ===")
    try:
        response = requests.get(f"{BACKEND_URL}/feed?limit=30")
        print(f"Status Code: {response.status_code}")
        
        if response.status_code == 200:
            data = response.json()
            print(f"Response keys: {list(data.keys())}")
            
            if data.get("success") and data.get("feed"):
                feed = data["feed"]
                print(f"Feed length: {len(feed)}")
                
                # Check content type distribution
                type_counts = {}
                for item in feed:
                    content_type = item.get("type")
                    type_counts[content_type] = type_counts.get(content_type, 0) + 1
                
                print(f"Content type distribution: {type_counts}")
                
                # Verify no _id fields
                has_id_field = any("_id" in item for item in feed)
                print(f"No _id fields: {not has_id_field}")
                
                # Check if we have reasonable distribution (not exact due to randomness)
                expected_types = ["fast_weird", "explainer", "ponder", "incident", "mini_game", "audio_drift"]
                has_all_types = all(t in type_counts for t in expected_types)
                
                if len(feed) == 30 and not has_id_field and has_all_types:
                    print("✅ Feed endpoint passed")
                    return True
                else:
                    print(f"❌ Feed endpoint failed - length: {len(feed)}, has_id: {has_id_field}, all_types: {has_all_types}")
                    return False
            else:
                print("❌ Feed endpoint failed - invalid response structure")
                return False
        else:
            print(f"❌ Feed endpoint failed - status code {response.status_code}")
            if response.text:
                print(f"Error response: {response.text}")
            return False
            
    except Exception as e:
        print(f"❌ Feed endpoint failed - error: {e}")
        return False

def test_content_by_type():
    """Test GET /api/content/{type}?limit=10 for all content types"""
    print("\n=== Testing Content by Type Endpoints ===")
    content_types = ["fast_weird", "explainer", "ponder", "incident", "mini_game", "audio_drift"]
    results = {}
    
    for content_type in content_types:
        print(f"\nTesting {content_type} content retrieval...")
        try:
            response = requests.get(f"{BACKEND_URL}/content/{content_type}?limit=10")
            print(f"Status Code: {response.status_code}")
            
            if response.status_code == 200:
                data = response.json()
                
                if data.get("success") and "items" in data:
                    items = data["items"]
                    print(f"Retrieved {len(items)} items")
                    
                    # Verify all items are of correct type
                    correct_types = all(item.get("type") == content_type for item in items)
                    no_id_fields = all("_id" not in item for item in items)
                    
                    if correct_types and no_id_fields:
                        print(f"✅ {content_type} content retrieval passed")
                        results[content_type] = True
                    else:
                        print(f"❌ {content_type} content retrieval failed - type check: {correct_types}, no _id: {no_id_fields}")
                        results[content_type] = False
                else:
                    print(f"❌ {content_type} content retrieval failed - invalid response structure")
                    results[content_type] = False
            else:
                print(f"❌ {content_type} content retrieval failed - status code {response.status_code}")
                results[content_type] = False
                
        except Exception as e:
            print(f"❌ {content_type} content retrieval failed - error: {e}")
            results[content_type] = False
    
    return results

def test_preferences_tracking():
    """Test POST /api/preferences/track"""
    print("\n=== Testing Preferences Tracking ===")
    try:
        payload = {
            "user_id": f"test_user_{uuid.uuid4()}",
            "preference_type": "linger",
            "value": "fast_weird"
        }
        
        response = requests.post(
            f"{BACKEND_URL}/preferences/track",
            json=payload,
            headers={"Content-Type": "application/json"}
        )
        
        print(f"Status Code: {response.status_code}")
        print(f"Response: {response.json()}")
        
        if response.status_code == 200:
            data = response.json()
            if data.get("success"):
                print("✅ Preferences tracking passed")
                return True
            else:
                print("❌ Preferences tracking failed - success not true")
                return False
        else:
            print(f"❌ Preferences tracking failed - status code {response.status_code}")
            return False
            
    except Exception as e:
        print(f"❌ Preferences tracking failed - error: {e}")
        return False

def run_all_tests():
    """Run all backend tests and provide summary"""
    print("🚀 Starting Modern Weirdness Backend API Tests")
    print(f"Backend URL: {BACKEND_URL}")
    print("=" * 60)
    
    test_results = {}
    
    # Test 1: Health Check
    test_results["health_check"] = test_health_check()
    
    # Test 2: Content Generation
    generation_results = test_content_generation()
    test_results["content_generation"] = generation_results
    
    # Test 3: Feed Endpoint
    test_results["feed"] = test_feed_endpoint()
    
    # Test 4: Content by Type
    content_type_results = test_content_by_type()
    test_results["content_by_type"] = content_type_results
    
    # Test 5: Preferences Tracking
    test_results["preferences"] = test_preferences_tracking()
    
    # Summary
    print("\n" + "=" * 60)
    print("📊 TEST SUMMARY")
    print("=" * 60)
    
    print(f"Health Check: {'✅ PASS' if test_results['health_check'] else '❌ FAIL'}")
    
    print("\nContent Generation:")
    for content_type, passed in generation_results.items():
        print(f"  {content_type}: {'✅ PASS' if passed else '❌ FAIL'}")
    
    print(f"\nFeed Endpoint: {'✅ PASS' if test_results['feed'] else '❌ FAIL'}")
    
    print("\nContent by Type:")
    for content_type, passed in content_type_results.items():
        print(f"  {content_type}: {'✅ PASS' if passed else '❌ FAIL'}")
    
    print(f"\nPreferences Tracking: {'✅ PASS' if test_results['preferences'] else '❌ FAIL'}")
    
    # Overall status
    all_generation_passed = all(generation_results.values())
    all_content_type_passed = all(content_type_results.values())
    overall_passed = (test_results["health_check"] and 
                     all_generation_passed and 
                     test_results["feed"] and 
                     all_content_type_passed and 
                     test_results["preferences"])
    
    print(f"\n🎯 OVERALL STATUS: {'✅ ALL TESTS PASSED' if overall_passed else '❌ SOME TESTS FAILED'}")
    
    return test_results

if __name__ == "__main__":
    run_all_tests()