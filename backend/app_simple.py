from flask import Flask, request, jsonify
from flask_cors import CORS
import os
from dotenv import load_dotenv
import logging

# Load environment variables
load_dotenv()

app = Flask(__name__)
CORS(app)

# Configure logging
logging.basicConfig(level=logging.INFO)
logger = logging.getLogger(__name__)

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
    """Mock face detection endpoint"""
    try:
        data = request.get_json()
        
        if 'image' not in data:
            return jsonify({'error': 'No image provided'}), 400
        
        # Mock response for demo
        response = {
            'faces_detected': 1,
            'faces': [{
                'bbox': [100, 100, 200, 200],
                'confidence': 0.95
            }]
        }
        
        return jsonify(response)
        
    except Exception as e:
        logger.error(f"Error in face detection: {str(e)}")
        return jsonify({'error': 'Face detection failed'}), 500

@app.route('/api/register-face', methods=['POST'])
def register_face():
    """Mock face registration endpoint"""
    try:
        data = request.get_json()
        
        if 'image' not in data or 'student_id' not in data:
            return jsonify({'error': 'Image and student_id required'}), 400
        
        # Mock embedding (normally would be 128-d vector from ArcFace)
        mock_embedding = [0.1] * 128
        
        return jsonify({
            'success': True,
            'student_id': data['student_id'],
            'embedding': mock_embedding,
            'face_detected': True,
            'liveness_passed': True
        })
        
    except Exception as e:
        logger.error(f"Error in face registration: {str(e)}")
        return jsonify({'error': 'Face registration failed'}), 500

@app.route('/api/recognize-face', methods=['POST'])
def recognize_face():
    """Mock face recognition endpoint"""
    try:
        data = request.get_json()
        
        if 'image' not in data or 'embeddings' not in data:
            return jsonify({'error': 'Image and embeddings required'}), 400
        
        embeddings = data['embeddings']
        
        if embeddings:
            # Mock recognition - return first student for demo
            return jsonify({
                'recognized': True,
                'student_id': embeddings[0]['student_id'],
                'confidence': 0.85,
                'liveness_passed': True
            })
        else:
            return jsonify({
                'recognized': False,
                'confidence': 0.0,
                'liveness_passed': True
            })
        
    except Exception as e:
        logger.error(f"Error in face recognition: {str(e)}")
        return jsonify({'error': 'Face recognition failed'}), 500

if __name__ == '__main__':
    app.run(debug=True, host='0.0.0.0', port=5000)