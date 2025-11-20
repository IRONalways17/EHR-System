import json
import os
import requests

GROQ_API_KEY = os.environ.get('GROQ_API_KEY')
GROQ_API_URL = "https://api.groq.com/openai/v1/chat/completions"

def lambda_handler(event, context):
    """Dashboard stats endpoint"""
    
    # Return mock stats for now (in production, connect to DynamoDB)
    stats = {
        "patients": {
            "active_patients": 6,
            "total_patients": 6,
            "total_images": 136,
            "total_notes": 66
        },
        "images": {
            "total": 136,
            "by_type": {
                "CT Scan": 35,
                "MRI": 33,
                "Ultrasound": 31,
                "X-Ray": 37
            }
        },
        "notes": {
            "total": 67,
            "by_type": {
                "Discharge Summary": 22,
                "Radiology Report": 20,
                "SOAP": 25
            }
        },
        "icd10": {
            "total": 40
        }
    }
    
    return {
        'statusCode': 200,
        'headers': {
            'Content-Type': 'application/json',
            'Access-Control-Allow-Origin': '*'
        },
        'body': json.dumps({
            'success': True,
            'data': stats
        })
    }
