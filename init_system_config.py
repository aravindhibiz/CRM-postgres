"""
Initialize system configuration with default values.
This script populates the database with default system configurations.
"""

import asyncio
import sys
import os

# Add the backend directory to the Python path
backend_path = os.path.join(os.path.dirname(os.path.abspath(__file__)), 'backend')
sys.path.append(backend_path)

from app.core.database import engine, get_db
from app.models.system_config import Base, SystemConfiguration
from app.services.system_config_service import SystemConfigManager
from sqlalchemy.orm import sessionmaker

async def init_system_config():
    """Initialize system configuration with default values."""
    
    # Create tables if they don't exist
    Base.metadata.create_all(bind=engine)
    
    # Create session
    SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)
    db = SessionLocal()
    
    try:
        # Initialize default configurations
        print("🚀 Initializing system configuration with default values...")
        
        # Check if any configurations already exist
        existing_configs = db.query(SystemConfiguration).count()
        
        if existing_configs > 0:
            print(f"⚠️  Found {existing_configs} existing configurations.")
            response = input("Do you want to reinitialize with defaults? This will update existing values. (y/N): ")
            
            if response.lower() != 'y':
                print("❌ Initialization cancelled.")
                return
        
        # Use the static method to initialize default configurations
        success = SystemConfigManager.initialize_default_configurations(db)
        
        if success:
            print("✅ System configuration initialized successfully!")
            
            # Show configuration summary by category
            print("\n📋 Configuration Summary by Category:")
            print("-" * 50)
            
            categories = {}
            configs = db.query(SystemConfiguration).all()
            
            for config in configs:
                category = config.category
                if category not in categories:
                    categories[category] = 0
                categories[category] += 1
            
            for category, count in categories.items():
                print(f"   {category.title()}: {count} settings")
            
            print(f"\n📈 Total configurations: {len(configs)}")
            print("\n🎉 System is ready for configuration management!")
        else:
            print("❌ Failed to initialize system configuration")
        
    except Exception as e:
        print(f"❌ Error initializing system configuration: {str(e)}")
        db.rollback()
        raise
    finally:
        db.close()

if __name__ == "__main__":
    asyncio.run(init_system_config())