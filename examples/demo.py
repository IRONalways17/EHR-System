"""
Example usage and demos for the EHR AI System
"""

import sys
from pathlib import Path
import numpy as np
import cv2
import logging

# Add src to path
sys.path.append(str(Path(__file__).parent.parent / 'src'))

from module1_data_preprocessing.data_collection import SyntheticDataGenerator
from module2_image_enhancement.enhance_images import (
    TraditionalImageEnhancer,
    MedicalImageEnhancementPipeline
)
from module3_documentation_automation.generate_notes import (
    ClinicalNoteGenerator,
    ICD10CodingAutomation,
    ClinicalDocumentationWorkflow
)

logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)


def demo_data_generation():
    """Demo: Generate synthetic data for testing"""
    logger.info("=== Demo: Synthetic Data Generation ===")
    
    generator = SyntheticDataGenerator()
    
    # Generate EHR data
    ehr_data = generator.generate_sample_ehr_data(num_samples=10)
    print("\nGenerated EHR Data (first 5 rows):")
    print(ehr_data.head())
    
    # Generate clinical notes
    notes = generator.generate_sample_clinical_notes(num_notes=5)
    print("\nGenerated Clinical Notes (first note):")
    print(notes.iloc[0]['note_text'])


def demo_image_enhancement():
    """Demo: Image enhancement pipeline"""
    logger.info("\n=== Demo: Medical Image Enhancement ===")
    
    # Create a synthetic medical image (simulated X-ray)
    image = np.random.randint(50, 200, (512, 512), dtype=np.uint8)
    
    # Add some noise
    noise = np.random.normal(0, 25, image.shape)
    noisy_image = np.clip(image + noise, 0, 255).astype(np.uint8)
    
    # Enhance image
    enhancer = TraditionalImageEnhancer()
    
    print("\nApplying enhancement steps:")
    print("1. Denoising...")
    denoised = enhancer.denoise(noisy_image)
    
    print("2. Enhancing contrast...")
    contrast_enhanced = enhancer.enhance_contrast(denoised)
    
    print("3. Sharpening...")
    final = enhancer.sharpen(contrast_enhanced)
    
    print(f"\nOriginal shape: {image.shape}")
    print(f"Enhanced shape: {final.shape}")
    print("Enhancement complete!")


def demo_clinical_note_generation():
    """Demo: Clinical note generation"""
    logger.info("\n=== Demo: Clinical Note Generation ===")
    
    # Note: This requires Azure OpenAI credentials
    # Uncomment when credentials are configured
    
    """
    note_generator = ClinicalNoteGenerator()
    
    patient_info = {
        'patient_id': 'DEMO001',
        'age': 55,
        'gender': 'F',
        'visit_date': '2025-10-15'
    }
    
    observations = {
        'subjective': 'Patient reports chest pain and shortness of breath for 3 days',
        'blood_pressure': '145/90',
        'heart_rate': '95',
        'temperature': '37.2°C',
        'respiratory_rate': '22',
        'physical_exam': 'Heart: Regular rhythm, no murmurs. Lungs: Clear bilaterally.'
    }
    
    note = note_generator.generate_progress_note(
        patient_info=patient_info,
        observations=observations,
        assessment='Possible angina, rule out MI'
    )
    
    print("\nGenerated Progress Note:")
    print(note)
    """
    
    print("\nClinical note generation requires Azure OpenAI credentials.")
    print("Configure your .env file with Azure OpenAI keys to use this feature.")


def demo_icd10_coding():
    """Demo: ICD-10 coding automation"""
    logger.info("\n=== Demo: ICD-10 Coding Automation ===")
    
    # Note: This requires Azure OpenAI credentials
    # Uncomment when credentials are configured
    
    """
    icd10_coder = ICD10CodingAutomation()
    
    diagnosis = "Type 2 Diabetes Mellitus with Diabetic Neuropathy"
    
    suggestions = icd10_coder.suggest_icd10_codes(
        diagnosis=diagnosis,
        clinical_context="Patient has poor glycemic control and peripheral neuropathy"
    )
    
    print(f"\nDiagnosis: {diagnosis}")
    print("\nSuggested ICD-10 Codes:")
    for suggestion in suggestions:
        print(f"  {suggestion['code']}: {suggestion['description']}")
        print(f"  Confidence: {suggestion['confidence']:.2%}\n")
    """
    
    print("\nICD-10 coding requires Azure OpenAI credentials.")
    print("Configure your .env file with Azure OpenAI keys to use this feature.")


def demo_complete_workflow():
    """Demo: Complete patient visit workflow"""
    logger.info("\n=== Demo: Complete Patient Visit Workflow ===")
    
    print("""
This demo would process a complete patient visit:

1. Patient Information Collection
   - Demographics
   - Chief Complaint
   - Vital Signs

2. Medical Imaging (if applicable)
   - Load X-ray/CT/MRI
   - Enhance image quality
   - AI-assisted analysis

3. Clinical Documentation
   - Generate progress note
   - Auto-suggest ICD-10 codes
   - Create discharge summary (if needed)

4. Integration
   - Save to EHR system
   - Update patient record
   - Schedule follow-up

To run this demo, configure Azure OpenAI credentials in .env file.
""")


def main():
    """Run all demos"""
    print("=" * 60)
    print("AI-Powered EHR System - Demo Suite")
    print("=" * 60)
    
    # Demo 1: Data Generation
    demo_data_generation()
    
    # Demo 2: Image Enhancement
    demo_image_enhancement()
    
    # Demo 3: Clinical Notes
    demo_clinical_note_generation()
    
    # Demo 4: ICD-10 Coding
    demo_icd10_coding()
    
    # Demo 5: Complete Workflow
    demo_complete_workflow()
    
    print("\n" + "=" * 60)
    print("Demo Complete!")
    print("=" * 60)


if __name__ == "__main__":
    main()
