"use client";
import React, { useRef, useState, useEffect } from "react";
import DashboardLayout from "@/components/layout/DashboardLayout";

export default function StudentDemoSessionPage() {
  const [stream, setStream] = useState<MediaStream | null>(null);
  const [recognitionStatus, setRecognitionStatus] = useState<"pending" | "success" | "fail" | null>(null);
  const [statusMessage, setStatusMessage] = useState<string>("");
  const [processing, setProcessing] = useState(false);

  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);

  // Start the camera on mount
  useEffect(() => {
    let currentStream: MediaStream | null = null;

    (async () => {
      try {
        const userStream = await navigator.mediaDevices.getUserMedia({ video: true });
        setStream(userStream);
        currentStream = userStream;
        setRecognitionStatus("pending");
        setStatusMessage("Looking for your face...");
      } catch (err) {
        setRecognitionStatus(null);
        setStatusMessage("Could not access camera. Please allow camera permission.");
      }
    })();

    return () => {
      if (currentStream) currentStream.getTracks().forEach((track) => track.stop());
    };
  }, []);

  // Attach stream to video element
  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;

      // Wait for metadata before calling play()
      const playPromise = () => {
        videoRef.current?.play().catch(() => {});
      };
      videoRef.current.addEventListener("loadedmetadata", playPromise);

      return () => {
        videoRef.current?.removeEventListener("loadedmetadata", playPromise);
      };
    }
  }, [stream]);

  // Recognition interval
  useEffect(() => {
    if (!stream || !videoRef.current || !canvasRef.current || recognitionStatus === "success") return;

    const interval = setInterval(async () => {
      if (processing || recognitionStatus === "success") return;
      setProcessing(true);

      // Draw frame to canvas
      const ctx = canvasRef.current!.getContext("2d");
      if (ctx) {
        ctx.drawImage(videoRef.current!, 0, 0, 320, 240);
        const image = canvasRef.current!.toDataURL("image/jpeg");

        try {
          const resp = await fetch("/api/face/demo-session", {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify({ image }),
          });
          const result = await resp.json();
          if (result.faceRecognized) {
            setRecognitionStatus("success");
            setStatusMessage("Face recognised! Demo session completed successfully.");
            // Optionally stop stream here:
            if (stream) stream.getTracks().forEach((track) => track.stop());
          } else {
            setRecognitionStatus("pending");
            setStatusMessage("Face not recognized. Please keep your face visible to the camera.");
          }
        } catch (err) {
          setRecognitionStatus("fail");
          setStatusMessage("Recognition failed. Please try again.");
        } finally {
          setProcessing(false);
        }
      }
    }, 1500);

    return () => clearInterval(interval);
  }, [recognitionStatus, stream, processing]);

  return (
    <DashboardLayout userRole="student">
      <div className="max-w-lg mx-auto">
        <div className="bg-white rounded-lg shadow p-6 mt-8">
          <h2 className="text-lg font-semibold text-gray-900 mb-4">Demo Session: Face Recognition</h2>
          <p className="mb-4 text-gray-600 text-sm">
            Please look into the camera. Face recognition will start automatically.
          </p>
          <div className="mb-6 flex flex-col items-center">
            <video
              ref={videoRef}
              width={320}
              height={240}
              autoPlay
              style={{ borderRadius: "8px", background: "#eee" }}
            />
            <canvas ref={canvasRef} width={320} height={240} style={{ display: "none" }} />
          </div>
          <div className={`px-4 py-2 rounded-md text-sm ${
            recognitionStatus === "success"
              ? "bg-green-100 text-green-800"
              : recognitionStatus === "fail"
                ? "bg-red-100 text-red-800"
                : "bg-yellow-100 text-yellow-800"
            }`}>
            {statusMessage}
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
}