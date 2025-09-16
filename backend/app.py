from flask import Flask, request, jsonify
from flask_cors import CORS
import cv2
import numpy as np
import base64
from PIL import Image
import io
import os
from dotenv import load_dotenv
import logging
from deepface import DeepFace
from mtcnn import MTCNN

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

# Initialize MTCNN detector
detector = MTCNN()

def decode_base64_image(base64_string):
    """Decode base64 image string to OpenCV format"""
    try:
        # Remove data URL prefix if present
        if base64_string.startswith('data:image'):
            base64_string = base64_string.split(',')[1]
        
        # Decode base64 string
        image_data = base64.b64decode(base64_string)
        
        # Convert to PIL Image
        pil_image = Image.open(io.BytesIO(image_data))
        
        # Convert to RGB if necessary
        if pil_image.mode != 'RGB':
            pil_image = pil_image.convert('RGB')
        
        # Convert to OpenCV format
        opencv_image = cv2.cvtColor(np.array(pil_image), cv2.COLOR_RGB2BGR)
        
        return opencv_image
    except Exception as e:
        logger.error(f"Error decoding base64 image: {str(e)}")
        return None

def detect_faces(image):
    """Detect faces using MTCNN"""
    try:
        # Convert BGR to RGB for MTCNN
        rgb_image = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)
        
        # Detect faces
        result = detector.detect_faces(rgb_image)
        
        faces = []
        for face in result:
            # Extract bounding box
            x, y, w, h = face['box']
            
            # Extract face region
            face_region = image[y:y+h, x:x+w]
            
            # Add confidence score
            faces.append({
                'bbox': [x, y, w, h],
                'confidence': face['confidence'],
                'face_image': face_region
            })
        
        return faces
    except Exception as e:
        logger.error(f"Error detecting faces: {str(e)}")
        return []

def generate_face_embedding(face_image):
    """Generate face embedding using DeepFace"""
    try:
        # Convert to RGB for DeepFace
        rgb_image = cv2.cvtColor(face_image, cv2.COLOR_BGR2RGB)
        
        # Generate embedding
        embedding = DeepFace.represent(
            img_path=rgb_image, 
            model_name='ArcFace',
            enforce_detection=False
        )
        
        return embedding[0]['embedding']
    except Exception as e:
        logger.error(f"Error generating face embedding: {str(e)}")
        return None

def check_liveness(image):
    """Basic liveness detection - checks for multiple faces or suspicious patterns"""
    try:
        # Detect faces
        faces = detect_faces(image)
        
        # Basic checks
        if len(faces) == 0:
            return False, "No face detected"
        
        if len(faces) > 1:
            return False, "Multiple faces detected"
        
        # Check if face is too small (might indicate photo)
        face = faces[0]
        bbox = face['bbox']
        face_area = bbox[2] * bbox[3]
        image_area = image.shape[0] * image.shape[1]
        
        if face_area / image_area < 0.1:
            return False, "Face too small - possible photo"
        
        # Check confidence
        if face['confidence'] < 0.9:
            return False, "Low face detection confidence"
        
        return True, "Liveness check passed"
    except Exception as e:
        logger.error(f"Error in liveness detection: {str(e)}")
        return False, "Liveness check failed"

@app.route('/api/health', methods=['GET'])
def health_check():
    """Health check endpoint"""
    return jsonify({
        'status': 'healthy',
        'service': 'Face Recognition API',
        'version': '1.0.0'
    })

@app.route('/api/detect-face', methods=['POST'])
def detect_face():
    """Detect faces in uploaded image"""
    try:
        data = request.get_json()
        
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Decode image
        image = decode_base64_image(data['image'])
        if image is None:
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Detect faces
        faces = detect_faces(image)
        
        response = {
            'faces_detected': len(faces),
            'faces': []
        }
        
        for face in faces:
            response['faces'].append({
                'bbox': face['bbox'],
                'confidence': face['confidence']
            })
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in face detection: {str(e)}")
        return jsonify({'error': 'Face detection failed'}), 500

@app.route('/api/register-face', methods=['POST'])
def register_face():
    """Register a face and generate embedding"""
    try:
        data = request.get_json()
        
        if 'image' not in data or 'student_id' not in data:
            return jsonify({'error': 'Image and student_id required'}), 400
        
        # Decode image
        image = decode_base64_image(data['image'])
        if image is None:
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Check liveness
        is_live, liveness_message = check_liveness(image)
        if not is_live:
            return jsonify({
                'error': 'Liveness check failed',
                'message': liveness_message
            }), 400
        
        # Detect faces
        faces = detect_faces(image)
        if len(faces) == 0:
            return jsonify({'error': 'No face detected'}), 400
        
        if len(faces) > 1:
            return jsonify({'error': 'Multiple faces detected'}), 400
        
        # Generate embedding for the detected face
        face_image = faces[0]['face_image']
        embedding = generate_face_embedding(face_image)
        
        if embedding is None:
            return jsonify({'error': 'Failed to generate face embedding'}), 500
        
        return jsonify({
            'success': True,
            'student_id': data['student_id'],
            'embedding': embedding,
            'face_detected': True,
            'liveness_passed': True
        })
        
    except Exception as e:
        logger.error(f"Error in face registration: {str(e)}")
        return jsonify({'error': 'Face registration failed'}), 500

@app.route('/api/recognize-face', methods=['POST'])
def recognize_face():
    """Recognize a face against stored embeddings"""
    try:
        data = request.get_json()
        
        if 'image' not in data or 'embeddings' not in data:
            return jsonify({'error': 'Image and embeddings required'}), 400
        
        # Decode image
        image = decode_base64_image(data['image'])
        if image is None:
            return jsonify({'error': 'Invalid image format'}), 400
        
        # Check liveness
        is_live, liveness_message = check_liveness(image)
        if not is_live:
            return jsonify({
                'error': 'Liveness check failed',
                'message': liveness_message
            }), 400
        
        # Detect faces
        faces = detect_faces(image)
        if len(faces) == 0:
            return jsonify({'error': 'No face detected'}), 400
        
        # Generate embedding for the detected face
        face_image = faces[0]['face_image']
        current_embedding = generate_face_embedding(face_image)
        
        if current_embedding is None:
            return jsonify({'error': 'Failed to generate face embedding'}), 500
        
        # Compare with stored embeddings
        embeddings = data['embeddings']  # List of {student_id, embedding}
        best_match = None
        best_similarity = -1
        
        for stored in embeddings:
            # Calculate cosine similarity
            stored_embedding = np.array(stored['embedding'])
            current_embedding_array = np.array(current_embedding)
            
            # Normalize vectors
            stored_norm = stored_embedding / np.linalg.norm(stored_embedding)
            current_norm = current_embedding_array / np.linalg.norm(current_embedding_array)
            
            # Calculate similarity
            similarity = np.dot(stored_norm, current_norm)
            
            if similarity > best_similarity:
                best_similarity = similarity
                best_match = stored['student_id']
        
        # Threshold for recognition (adjust as needed)
        threshold = 0.7
        
        if best_similarity > threshold:
            return jsonify({
                'recognized': True,
                'student_id': best_match,
                'confidence': float(best_similarity),
                'liveness_passed': True
            })
        else:
            return jsonify({
                'recognized': False,
                'confidence': float(best_similarity) if best_similarity > 0 else 0,
                'liveness_passed': True
            })
        
    except Exception as e:
        logger.error(f"Error in face recognition: {str(e)}")
        return jsonify({'error': 'Face recognition failed'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)