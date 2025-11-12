"""
Script to help identify the correct Azure OpenAI deployment name
"""
import os
from dotenv import load_dotenv

load_dotenv()

print("=" * 60)
print("Azure OpenAI Deployment Name Finder")
print("=" * 60)

api_key = os.getenv('AZURE_OPENAI_API_KEY')
endpoint = os.getenv('AZURE_OPENAI_ENDPOINT')

print(f"\nEndpoint: {endpoint}")
print(f"API Key: {api_key[:20]}...{api_key[-10:]}")

print("\n" + "=" * 60)
print("Common deployment names to try:")
print("=" * 60)

common_names = [
    'gpt-4',
    'gpt-4o',
    'gpt-4-turbo',
    'gpt-35-turbo',
    'gpt-4-32k',
    'gpt-4o-mini',
    'text-davinci-003'
]

from openai import AzureOpenAI

for deployment_name in common_names:
    try:
        client = AzureOpenAI(
            api_key=api_key,
            api_version=os.getenv('AZURE_OPENAI_API_VERSION', '2024-02-15-preview'),
            azure_endpoint=endpoint
        )
        
        print(f"\nTrying: {deployment_name}...", end=" ")
        
        response = client.chat.completions.create(
            model=deployment_name,
            messages=[{"role": "user", "content": "Hi"}],
            max_tokens=5
        )
        
        print("✅ FOUND! This deployment exists!")
        print(f"\n" + "=" * 60)
        print(f"✅ SUCCESS! Use this deployment name: {deployment_name}")
        print("=" * 60)
        print(f"\nUpdate your .env file:")
        print(f"AZURE_OPENAI_DEPLOYMENT_NAME={deployment_name}")
        
        # Test a medical question
        print(f"\n" + "=" * 60)
        print("Testing with medical question...")
        print("=" * 60)
        
        response = client.chat.completions.create(
            model=deployment_name,
            messages=[
                {"role": "system", "content": "You are a helpful medical AI assistant."},
                {"role": "user", "content": "What is hypertension in simple terms?"}
            ],
            max_tokens=150
        )
        
        print(f"\n📝 Response:")
        print(response.choices[0].message.content)
        print(f"\n✅ GenAI is working perfectly!")
        
        break
        
    except Exception as e:
        error_msg = str(e)
        if 'DeploymentNotFound' in error_msg:
            print("❌ Not found")
        else:
            print(f"❌ Error: {type(e).__name__}")

print("\n" + "=" * 60)
print("💡 If none worked, please:")
print("   1. Go to Azure Portal")
print("   2. Navigate to your Azure OpenAI resource")
print("   3. Click 'Model deployments' or 'Deployments'")
print("   4. Copy the exact deployment name")
print("=" * 60)
