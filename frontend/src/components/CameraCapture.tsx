import React, { useRef, useState, useEffect } from "react";

interface CameraCaptureProps {
  onCapture: (base64: string) => void;
  preview?: string | null;
}

const CameraCapture: React.FC<CameraCaptureProps> = ({ onCapture, preview }) => {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [captured, setCaptured] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start the camera and assign the stream to the video element
  const startCamera = async () => {
    try {
      const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
      setStream(userStream);
    } catch (err) {
      alert("Could not access camera. Please allow camera permission.");
    }
  };

  // Assign stream to video element whenever stream changes
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
      videoRef.current.play();
    }
    // Clean up: stop camera when component unmounts or stream changes
    return () => {
      if (stream) {
        stream.getTracks().forEach((track) => track.stop());
      }
    };
  }, [stream]);

  const capturePhoto = () => {
    if (videoRef.current && canvasRef.current) {
      const ctx = canvasRef.current.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current, 0, 0, 320, 240);
        const base64 = canvasRef.current.toDataURL("image/jpeg");
        onCapture(base64);
        setCaptured(true);
        // Stop camera after capture
        if (stream) {
          stream.getTracks().forEach((track) => track.stop());
          setStream(null);
        }
      }
    }
  };

  const retakePhoto = () => {
    setCaptured(false);
    onCapture("");
    startCamera();
  };

  return (
    <div>
      {!stream && !captured && (
        <button
          type="button"
          onClick={startCamera}
          className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
        >
          Start Camera
        </button>
      )}
      {stream && !captured && (
        <div>
          <video
            ref={videoRef}
            width={320}
            height={240}
            autoPlay
            style={{ borderRadius: "8px", marginBottom: "8px" }}
          />
          <div>
            <button
              type="button"
              onClick={capturePhoto}
              className="inline-flex items-center px-4 py-2 border border-indigo-600 rounded-md text-indigo-700 bg-white hover:bg-indigo-50"
            >
              Capture Photo
            </button>
          </div>
        </div>
      )}
      <canvas ref={canvasRef} width={320} height={240} style={{ display: "none" }} />
      {captured && preview && (
        <div>
          <img src={preview} alt="Captured" className="w-32 h-32 object-cover rounded-lg mb-2" />
          <button
            type="button"
            onClick={retakePhoto}
            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50"
          >
            Retake Photo
          </button>
        </div>
      )}
    </div>
  );
};

export default CameraCapture;