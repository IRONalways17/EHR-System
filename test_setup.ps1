# Quick test script to verify installation

Write-Host "========================================" -ForegroundColor Cyan
Write-Host "AI-Powered EHR System - Quick Test" -ForegroundColor Cyan
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""

# Test 1: Import modules
Write-Host "Test 1: Testing module imports..." -ForegroundColor Yellow
python -c "
import sys
sys.path.append('src')

try:
    from module1_data_preprocessing.data_collection import SyntheticDataGenerator
    print('✓ Module 1 imports successfully')
except Exception as e:
    print(f'✗ Module 1 import failed: {e}')

try:
    from module2_image_enhancement.enhance_images import TraditionalImageEnhancer
    print('✓ Module 2 imports successfully')
except Exception as e:
    print(f'✗ Module 2 import failed: {e}')

try:
    import cv2
    import numpy as np
    print('✓ OpenCV and NumPy available')
except Exception as e:
    print(f'✗ OpenCV/NumPy import failed: {e}')
"

Write-Host ""

# Test 2: Generate synthetic data
Write-Host "Test 2: Generating synthetic test data..." -ForegroundColor Yellow
python -c "
import sys
sys.path.append('src')
from module1_data_preprocessing.data_collection import SyntheticDataGenerator

try:
    gen = SyntheticDataGenerator()
    df = gen.generate_sample_ehr_data(10)
    print(f'✓ Generated {len(df)} synthetic EHR records')
    notes = gen.generate_sample_clinical_notes(5)
    print(f'✓ Generated {len(notes)} synthetic clinical notes')
except Exception as e:
    print(f'✗ Synthetic data generation failed: {e}')
"

Write-Host ""

# Test 3: Image processing
Write-Host "Test 3: Testing image processing..." -ForegroundColor Yellow
python -c "
import sys
sys.path.append('src')
import numpy as np
import cv2
from module2_image_enhancement.enhance_images import TraditionalImageEnhancer

try:
    enhancer = TraditionalImageEnhancer()
    test_image = np.random.randint(0, 255, (256, 256), dtype=np.uint8)
    
    denoised = enhancer.denoise(test_image)
    print('✓ Denoising works')
    
    enhanced = enhancer.enhance_contrast(test_image)
    print('✓ Contrast enhancement works')
    
    sharpened = enhancer.sharpen(test_image)
    print('✓ Sharpening works')
    
except Exception as e:
    print(f'✗ Image processing failed: {e}')
"

Write-Host ""

# Test 4: Check Azure OpenAI configuration
Write-Host "Test 4: Checking Azure OpenAI configuration..." -ForegroundColor Yellow
python -c "
import os
from dotenv import load_dotenv

load_dotenv()

api_key = os.getenv('AZURE_OPENAI_API_KEY')
endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')

if api_key and api_key != 'your_api_key_here':
    print('✓ Azure OpenAI API key configured')
else:
    print('⚠ Azure OpenAI API key not configured (optional for basic testing)')

if endpoint and endpoint != 'https://your-resource-name.openai.azure.com/':
    print('✓ Azure OpenAI endpoint configured')
else:
    print('⚠ Azure OpenAI endpoint not configured (optional for basic testing)')
"

Write-Host ""
Write-Host "========================================" -ForegroundColor Cyan
Write-Host "Test Complete!" -ForegroundColor Green
Write-Host "========================================" -ForegroundColor Cyan
Write-Host ""
Write-Host "Note: Azure OpenAI features require valid credentials in .env" -ForegroundColor Yellow
Write-Host ""
