"""
Quick test script to verify Azure OpenAI connection and GenAI functionality
"""
import os
from dotenv import load_dotenv

# Load environment variables
load_dotenv()

print("=" * 60)
print("Azure OpenAI Connection Test")
print("=" * 60)

# Check environment variables
api_key = os.getenv('AZURE_OPENAI_API_KEY')
endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')
deployment = os.getenv('AZURE_OPENAI_DEPLOYMENT_NAME')

print(f"\n✓ API Key loaded: {api_key[:20]}...{api_key[-10:]}")
print(f"✓ Endpoint: {endpoint}")
print(f"✓ Deployment: {deployment}")

# Test Azure OpenAI connection
print("\n" + "=" * 60)
print("Testing Azure OpenAI API Connection...")
print("=" * 60)

try:
    from openai import AzureOpenAI
    
    client = AzureOpenAI(
        api_key=api_key,
        api_version=os.getenv('AZURE_OPENAI_API_VERSION', '2024-02-15-preview'),
        azure_endpoint=endpoint
    )
    
    print("\n✓ Azure OpenAI client initialized successfully")
    
    # Test with a simple completion
    print("\n📝 Testing GenAI completion...")
    
    response = client.chat.completions.create(
        model=deployment,
        messages=[
            {"role": "system", "content": "You are a helpful medical AI assistant."},
            {"role": "user", "content": "What is the ICD-10 code for hypertension?"}
        ],
        max_tokens=100,
        temperature=0.7
    )
    
    print("\n✅ SUCCESS! GenAI is working perfectly!")
    print("\n" + "-" * 60)
    print("Response from Azure OpenAI:")
    print("-" * 60)
    print(response.choices[0].message.content)
    print("-" * 60)
    
    # Show usage stats
    print(f"\n📊 Token Usage:")
    print(f"   Prompt tokens: {response.usage.prompt_tokens}")
    print(f"   Completion tokens: {response.usage.completion_tokens}")
    print(f"   Total tokens: {response.usage.total_tokens}")
    
    print("\n" + "=" * 60)
    print("✅ Azure OpenAI Key is WORKING!")
    print("✅ GenAI functionality is OPERATIONAL!")
    print("=" * 60)
    
except ImportError as e:
    print(f"\n❌ ERROR: Missing required package")
    print(f"   Please install: pip install openai")
    print(f"   Error: {e}")
    
except Exception as e:
    print(f"\n❌ ERROR: Azure OpenAI connection failed")
    print(f"   Error type: {type(e).__name__}")
    print(f"   Error message: {str(e)}")
    print("\n💡 Possible issues:")
    print("   - Check if API key is valid")
    print("   - Verify endpoint URL is correct")
    print("   - Ensure deployment name matches Azure portal")
    print("   - Check if Azure subscription is active")

print("\n" + "=" * 60)
