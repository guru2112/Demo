import { NextRequest, NextResponse } from 'next/server';

export async function POST(req: NextRequest) {
  const { image } = await req.json();

  // Here you would call your face recognition logic.
  // For demonstration, let's say face is recognized if image is not empty.
  const faceRecognized = !!image && Math.random() > 0.5; // Replace with real logic!

  if (faceRecognized) {
    return NextResponse.json({ 
      faceRecognized: true, 
      message: "Face recognized! Demo session completed successfully." 
    });
  } else {
    return NextResponse.json({ 
      faceRecognized: false, 
      message: "Face not recognized. Please try again." 
    });
  }
}