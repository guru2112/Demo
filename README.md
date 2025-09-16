# Smart Attendance System

A comprehensive face recognition attendance system with advanced AI features, built with Next.js, Python, and MongoDB.

## 🌟 Key Features

### Advanced Face Processing
- **Robust Face Detection**: Utilizes Multi-task Cascaded Convolutional Networks (MTCNN) to accurately detect faces even in challenging conditions
- **Detailed Face Embedding**: Generates high-accuracy 128-d facial embeddings using DeepFace/ArcFace model, ensuring reliable recognition
- **Liveness Detection**: Implements anti-spoofing checks to prevent attendance marking using photos or videos

### Role-Based Access Control

#### Student Portal
- Secure user registration and login
- Profile management: Students can update their own details (e.g., division, contact info)
- Face Data Management: Register and update their facial data
- Demo Session: A test feature to verify if their registered face is being recognized correctly
- View Personal Attendance: Access a detailed history of their own attendance records

#### Teacher/Staff Portal
- Secure staff registration and login
- Student Management: Search for students by ID and update their details
- Comprehensive Attendance Dashboard: View attendance records for all students with powerful filters (by date, department, subject, year, etc.)
- Initiate Attendance Session: Start a real-time attendance session by providing details like Date, Subject, Department, Year, and Division

### Modern Tech Stack
- **Next.js**: For a fast, server-rendered React frontend and a robust backend API
- **Python**: For all computer vision and machine learning tasks (powered by Flask/FastAPI)
- **MongoDB**: A flexible NoSQL database to store user data, facial embeddings, and attendance records

## 🏗️ System Architecture

The project is built on a microservice-based architecture to separate the web application logic from the intensive AI processing.

### Next.js Frontend/Backend
- Serves the user interface for students and teachers
- Handles user authentication, session management, and business logic
- Communicates with the MongoDB database for all data operations except face embeddings
- When a face-related task is required (registration, recognition), it sends the image data to the Python Face API

### Python Face API
- A dedicated API built with Flask or FastAPI
- Exposes endpoints for face detection, embedding generation, and recognition
- It receives an image, processes it using libraries like OpenCV, TensorFlow/PyTorch, and deepface, and returns the result (e.g., student ID, verification status)

### MongoDB Database
- Stores user collections (students, teachers) with their details
- Stores facial embeddings linked to each student's ID
- Stores attendance records with session details and a list of present/absent students

## 🛠️ Tech Stack & Libraries

### Frontend
- **Next.js**: React framework with server-side rendering
- **React**: User interface library
- **Tailwind CSS**: Utility-first CSS framework
- **Lucide React**: Icon library

### Backend (Web)
- **Next.js API Routes**: RESTful API endpoints
- **Mongoose**: MongoDB object modeling
- **bcryptjs**: Password hashing

### Backend (AI/ML)
- **Python**: Core language for AI processing
- **Flask**: Web framework for the face API
- **OpenCV**: Image processing
- **deepface**: High-level implementation of recognition models
- **TensorFlow**: Deep learning framework
- **MTCNN**: Multi-task CNN for face detection
- **NumPy**: Numerical operations

### Database
- **MongoDB**: NoSQL database for scalable data storage

## 🚀 Quick Start

### Prerequisites
- Node.js 18+ and npm
- Python 3.8+
- MongoDB (local or cloud instance)

### Installation

1. **Clone the repository**
   ```bash
   git clone <repository-url>
   cd Demo
   ```

2. **Setup Frontend**
   ```bash
   cd frontend
   npm install
   cp .env.local.example .env.local
   # Edit .env.local with your configuration
   ```

3. **Setup Backend (Python Face API)**
   ```bash
   cd ../backend
   python3 -m venv face_api_env
   source face_api_env/bin/activate  # On Windows: face_api_env\Scripts\activate
   pip install -r requirements.txt
   cp .env.example .env
   # Edit .env with your configuration
   ```

4. **Start the services**
   
   **Terminal 1 - Frontend:**
   ```bash
   cd frontend
   npm run dev
   ```
   
   **Terminal 2 - Python Face API:**
   ```bash
   cd backend
   source face_api_env/bin/activate
   python app.py
   ```

5. **Access the application**
   - Frontend: http://localhost:3000
   - Face API: http://localhost:5000

## 📁 Project Structure

```
Demo/
├── frontend/                 # Next.js frontend application
│   ├── src/
│   │   ├── app/             # App router pages and API routes
│   │   ├── components/      # Reusable React components
│   │   ├── lib/            # Utility functions and configurations
│   │   └── models/         # MongoDB models
│   ├── package.json
│   └── .env.local
├── backend/                 # Python face recognition API
│   ├── app.py              # Main Flask application
│   ├── requirements.txt    # Python dependencies
│   └── .env               # Environment variables
└── README.md
```

## 🔧 Configuration

### Environment Variables

#### Frontend (.env.local)
```env
MONGODB_URI=mongodb://localhost:27017/attendance_system
NEXTAUTH_URL=http://localhost:3000
NEXTAUTH_SECRET=your-secret-key
FACE_API_URL=http://localhost:5000/api
```

#### Backend (.env)
```env
FLASK_ENV=development
MONGODB_URI=mongodb://localhost:27017/attendance_system
FACE_RECOGNITION_THRESHOLD=0.7
```

## 📖 Usage

### For Students
1. Register with student credentials
2. Login to access the student portal
3. Register your face for attendance marking
4. View your attendance history
5. Use demo session to test face recognition

### For Teachers/Staff
1. Register with teacher/staff credentials
2. Login to access the teacher portal
3. Create attendance sessions for classes
4. View comprehensive attendance reports
5. Manage student information

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Add tests if applicable
5. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the LICENSE file for details.

## 🆘 Support

For support, please create an issue in the repository or contact the development team.