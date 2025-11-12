"""
AWS Lambda Function: Medical Image Enhancement
Uses Amazon Bedrock Titan and custom processing
"""
import json
import base64
import boto3
import os
from io import BytesIO
from PIL import Image
import numpy as np

# Initialize AWS clients
bedrock_runtime = boto3.client('bedrock-runtime', region_name=os.environ.get('AWS_REGION', 'us-east-1'))
s3_client = boto3.client('s3')

def enhance_image_traditional(image_array):
    """
    Traditional image enhancement pipeline
    """
    from PIL import ImageEnhance, ImageFilter
    
    # Convert to PIL Image
    img = Image.fromarray(image_array.astype('uint8'))
    
    # Apply enhancements
    # 1. Denoise
    img = img.filter(ImageFilter.MedianFilter(size=3))
    
    # 2. Enhance contrast
    enhancer = ImageEnhance.Contrast(img)
    img = enhancer.enhance(1.5)
    
    # 3. Enhance sharpness
    enhancer = ImageEnhance.Sharpness(img)
    img = enhancer.enhance(2.0)
    
    # 4. Brightness adjustment
    enhancer = ImageEnhance.Brightness(img)
    img = enhancer.enhance(1.1)
    
    return np.array(img)

def enhance_with_bedrock(image_base64, modality='xray'):
    """
    Use Amazon Bedrock Claude 3 for image analysis and enhancement guidance
    """
    try:
        model_id = os.environ.get('BEDROCK_MODEL_ID', 'anthropic.claude-3-sonnet-20240229-v1:0')
        
        # Prepare request for Claude 3 with vision
        prompt = f"""Analyze this medical {modality} image and provide enhancement recommendations.
        
Focus on:
1. Image quality assessment
2. Areas that need clarity improvement
3. Diagnostic features visibility
4. Recommended enhancement parameters

Provide your analysis in JSON format."""

        request_body = {
            "anthropic_version": "bedrock-2023-05-31",
            "max_tokens": 1000,
            "messages": [
                {
                    "role": "user",
                    "content": [
                        {
                            "type": "image",
                            "source": {
                                "type": "base64",
                                "media_type": "image/png",
                                "data": image_base64
                            }
                        },
                        {
                            "type": "text",
                            "text": prompt
                        }
                    ]
                }
            ]
        }
        
        response = bedrock_runtime.invoke_model(
            modelId=model_id,
            body=json.dumps(request_body)
        )
        
        response_body = json.loads(response['body'].read())
        analysis = response_body['content'][0]['text']
        
        return {
            'analysis': analysis,
            'model': 'claude-3-sonnet'
        }
        
    except Exception as e:
        print(f"Bedrock error: {str(e)}")
        return {
            'analysis': 'Analysis unavailable',
            'error': str(e)
        }

def calculate_metrics(original, enhanced):
    """
    Calculate PSNR and SSIM metrics
    """
    from skimage.metrics import peak_signal_noise_ratio, structural_similarity
    
    # Ensure same dimensions
    if original.shape != enhanced.shape:
        enhanced = np.resize(enhanced, original.shape)
    
    # Calculate PSNR
    psnr = peak_signal_noise_ratio(original, enhanced)
    
    # Calculate SSIM
    ssim = structural_similarity(
        original, 
        enhanced, 
        multichannel=len(original.shape) == 3,
        channel_axis=-1 if len(original.shape) == 3 else None
    )
    
    return {
        'psnr': float(psnr),
        'ssim': float(ssim)
    }

def lambda_handler(event, context):
    """
    AWS Lambda handler for image enhancement
    """
    try:
        # Parse request
        body = json.loads(event.get('body', '{}'))
        image_base64 = body.get('image_base64')
        modality = body.get('modality', 'xray')
        use_bedrock = body.get('use_bedrock', True)
        
        if not image_base64:
            return {
                'statusCode': 400,
                'headers': {
                    'Content-Type': 'application/json',
                    'Access-Control-Allow-Origin': '*'
                },
                'body': json.dumps({'error': 'Missing image_base64'})
            }
        
        # Decode image
        image_data = base64.b64decode(image_base64)
        image = Image.open(BytesIO(image_data))
        original_array = np.array(image)
        
        # Traditional enhancement
        enhanced_array = enhance_image_traditional(original_array)
        
        # Calculate metrics
        metrics = calculate_metrics(original_array, enhanced_array)
        
        # Get Bedrock analysis if requested
        bedrock_analysis = None
        if use_bedrock:
            bedrock_analysis = enhance_with_bedrock(image_base64, modality)
        
        # Convert enhanced image back to base64
        enhanced_image = Image.fromarray(enhanced_array.astype('uint8'))
        buffered = BytesIO()
        enhanced_image.save(buffered, format="PNG")
        enhanced_base64 = base64.b64encode(buffered.getvalue()).decode()
        
        # Prepare response
        response_data = {
            'enhanced_image': enhanced_base64,
            'metrics': metrics,
            'modality': modality,
            'bedrock_analysis': bedrock_analysis,
            'success': True
        }
        
        return {
            'statusCode': 200,
            'headers': {
                'Content-Type': 'application/json',
                'Access-Control-Allow-Origin': '*'
            },
            'body': json.dumps(response_data)
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
