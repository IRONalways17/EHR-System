"""
Startup script for AI-Powered EHR System API
"""
import sys
import os
from pathlib import Path

# Add src directory to path
current_dir = Path(__file__).parent
src_dir = current_dir / 'src'
sys.path.insert(0, str(src_dir))
sys.path.insert(0, str(current_dir))

# Now import and run the app
from module4_integration.deploy import app
import uvicorn

if __name__ == "__main__":
    print("=" * 60)
    print("AI-Powered EHR System - Starting API Server")
    print("=" * 60)
    print(f"Server will be available at: http://localhost:8000")
    print(f"API Documentation: http://localhost:8000/docs")
    print(f"Health Check: http://localhost:8000/health")
    print("=" * 60)
    print()
    
    uvicorn.run(
        app,
        host="0.0.0.0",
        port=8000,
        log_level="info"
    )
