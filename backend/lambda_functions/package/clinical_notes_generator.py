"""
AWS Lambda Function: Clinical Notes Generation
Uses Amazon Bedrock Claude 3 for medical documentation
"""
import json
import boto3
import os
from datetime import datetime

# Initialize Bedrock client
bedrock_runtime = boto3.client('bedrock-runtime', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
dynamodb = boto3.resource('dynamodb')

def generate_soap_note(patient_info, findings, bedrock_client):
    """
    Generate SOAP note using Claude 3
    """
    model_id = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')
    
    prompt = f"""You are an experienced medical documentation assistant. Generate a professional SOAP note based on the following information:

Patient Information:
{json.dumps(patient_info, indent=2)}

Clinical Findings:
{json.dumps(findings, indent=2)}

Generate a comprehensive SOAP note with the following sections:
- Subjective: Patient's complaints and history
- Objective: Physical examination findings and vital signs
- Assessment: Clinical diagnosis and evaluation
- Plan: Treatment plan and follow-up

Format the note professionally and include all relevant medical details."""

    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 2000,
        "temperature": 0.3,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }
    
    response = bedrock_client.invoke_model(
        modelId=model_id,
        body=json.dumps(request_body)
    )
    
    response_body = json.loads(response['body'].read())
    soap_note = response_body['content'][0]['text']
    
    return soap_note

def generate_discharge_summary(patient_info, admission_data, bedrock_client):
    """
    Generate discharge summary using Claude 3
    """
    model_id = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')
    
    prompt = f"""Generate a comprehensive discharge summary for:

Patient: {patient_info.get('name')}
Admission Date: {admission_data.get('admission_date')}
Discharge Date: {admission_data.get('discharge_date')}

Hospital Course:
{admission_data.get('hospital_course', '')}

Procedures Performed:
{admission_data.get('procedures', '')}

Medications:
{admission_data.get('medications', '')}

Generate a professional discharge summary including:
1. Chief Complaint
2. Hospital Course
3. Discharge Diagnosis
4. Procedures
5. Medications at Discharge
6. Follow-up Instructions
7. Diet and Activity Restrictions"""

    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 3000,
        "temperature": 0.3,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }
    
    response = bedrock_client.invoke_model(
        modelId=model_id,
        body=json.dumps(request_body)
    )
    
    response_body = json.loads(response['body'].read())
    discharge_summary = response_body['content'][0]['text']
    
    return discharge_summary

def generate_radiology_report(image_findings, modality, bedrock_client):
    """
    Generate radiology report using Claude 3
    """
    model_id = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')
    
    prompt = f"""Generate a professional radiology report for a {modality} study.

Imaging Findings:
{json.dumps(image_findings, indent=2)}

Generate a structured radiology report with:
1. CLINICAL INDICATION
2. TECHNIQUE
3. FINDINGS (detailed description)
4. IMPRESSION (summary and conclusion)

Use professional medical terminology and be precise."""

    request_body = {
        "anthropic_version": "bedrock-2023-05-31",
        "max_tokens": 1500,
        "temperature": 0.3,
        "messages": [
            {
                "role": "user",
                "content": prompt
            }
        ]
    }
    
    response = bedrock_client.invoke_model(
        modelId=model_id,
        body=json.dumps(request_body)
    )
    
    response_body = json.loads(response['body'].read())
    report = response_body['content'][0]['text']
    
    return report

def save_to_dynamodb(note_data, table_name):
    """
    Save generated note to DynamoDB
    """
    try:
        table = dynamodb.Table(table_name)
        
        item = {
            'note_id': note_data.get('note_id'),
            'patient_id': note_data.get('patient_id'),
            'note_type': note_data.get('note_type'),
            'content': note_data.get('content'),
            'created_at': datetime.utcnow().isoformat(),
            'metadata': note_data.get('metadata', {})
        }
        
        table.put_item(Item=item)
        return True
    except Exception as e:
        print(f"DynamoDB error: {str(e)}")
        return False

def lambda_handler(event, context):
    """
    AWS Lambda handler for clinical note generation
    """
    try:
        # Parse request
        body = json.loads(event.get('body', '{}'))
        note_type = body.get('note_type', 'soap')
        patient_info = body.get('patient_info', {})
        
        # Generate note based on type
        if note_type == 'soap':
            findings = body.get('findings', [])
            note_content = generate_soap_note(patient_info, findings, bedrock_runtime)
        
        elif note_type == 'discharge':
            admission_data = body.get('admission_data', {})
            note_content = generate_discharge_summary(patient_info, admission_data, bedrock_runtime)
        
        elif note_type == 'radiology':
            image_findings = body.get('image_findings', {})
            modality = body.get('modality', 'xray')
            note_content = generate_radiology_report(image_findings, modality, bedrock_runtime)
        
        else:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': f'Invalid note_type: {note_type}'})
            }
        
        # Save to DynamoDB
        note_id = f"{patient_info.get('patient_id', 'unknown')}_{note_type}_{datetime.utcnow().strftime('%Y%m%d%H%M%S')}"
        
        note_data = {
            'note_id': note_id,
            'patient_id': patient_info.get('patient_id'),
            'note_type': note_type,
            'content': note_content,
            'metadata': {
                'generated_by': 'bedrock-claude-3',
                'timestamp': datetime.utcnow().isoformat()
            }
        }
        
        table_name = os.environ.get('DYNAMODB_TABLE_NAME', 'ehr-patient-records')
        save_to_dynamodb(note_data, table_name)
        
        # Return response
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'note_id': note_id,
                'note_type': note_type,
                'content': note_content,
                'patient_id': patient_info.get('patient_id'),
                'success': True
            })
        }
        
    except Exception as e:
        print(f"Error: {str(e)}")
        return {
            'statusCode': 500,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps({
                'error': str(e),
                'success': False
            })
        }
