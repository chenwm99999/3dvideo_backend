// src/MixedPlayer.js
import React, { useEffect, useRef, useState } from 'react';

const MixedPlayer = () => {
  // mode: "video" or "3d"
  const [mode, setMode] = useState("video");
  // Array of video file names (extend as needed)
  const videoFiles = ["video1.mp4", "video2.mp4"];
  const [videoIndex, setVideoIndex] = useState(0);
  const videoRef = useRef(null);
  const canvasRef = useRef(null);
  // Local state to track whether the Exit button is hovered.
  const [exitHover, setExitHover] = useState(false);

  // When in video mode, auto-play the video.
  useEffect(() => {
    if (mode === "video" && videoRef.current) {
      videoRef.current.play().catch(err => console.error("Video play error:", err));
    }
  }, [mode, videoIndex]);

  // When switching to 3D mode, initialize the 3D viewer.
  useEffect(() => {
    if (mode === "3d" && canvasRef.current) {
      if (typeof window.main === "function") {
        window.main(); // This should initialize your 3D viewer on the canvas with id "canvas"
      } else {
        console.error("3D viewer initialization function (main) not found.");
      }
    }
  }, [mode]);

  // When the current video ends, switch to 3D mode.
  const handleVideoEnded = () => {
    setMode("3d");
  };

  // The Exit button returns to video mode and advances to the next video.
  const handleExit3D = () => {
    const nextIndex = (videoIndex + 1) % videoFiles.length;
    setVideoIndex(nextIndex);
    setMode("video");
  };

  // Back button handler (placeholder)
  const handleBack = () => {
    alert("Back button pressed (not implemented yet).");
  };

  // Save button handler: loops through all video files and saves each.
  const handleSave = async () => {
    if (!window.showDirectoryPicker) {
      alert("File System Access API not supported in this browser.");
      return;
    }
    try {
      const directoryHandle = await window.showDirectoryPicker();
      for (const videoName of videoFiles) {
        const response = await fetch(`${process.env.PUBLIC_URL}/videos/${videoName}`);
        if (!response.ok) {
          console.error(`Failed to fetch ${videoName}`);
          continue;
        }
        const blob = await response.blob();
        const fileHandle = await directoryHandle.getFileHandle(videoName, { create: true });
        const writable = await fileHandle.createWritable();
        await writable.write(blob);
        await writable.close();
      }
      alert("All videos saved successfully.");
    } catch (error) {
      console.error("Error saving videos:", error);
      alert("Error saving videos: " + error.message);
    }
  };

  return (
    <div style={{ textAlign: "center", maxWidth: "800px", margin: "0 auto", position: "relative" }}>
      {/* Back button always above the main container */}
      <div style={{ textAlign: "left", marginBottom: "10px" }}>
        <button
          onClick={handleBack}
          style={{
            fontSize: "24px",
            background: "none",
            border: "none",
            cursor: "pointer"
          }}
          title="Back"
        >
          ←
        </button>
      </div>

      {/* Main container for video/3D viewer */}
      <div
        style={{
          position: "relative",
          width: "800px",
          height: "450px",
          margin: "0 auto",
          backgroundColor: "#000"
        }}
      >
        {mode === "video" && (
          <video
            ref={videoRef}
            src={`${process.env.PUBLIC_URL}/videos/${videoFiles[videoIndex]}`}
            onEnded={handleVideoEnded}
            controls
            style={{
              width: "100%",
              height: "100%",
              objectFit: "contain"
            }}
          />
        )}
        {mode === "3d" && (
          <>
            <canvas
              id="canvas"
              ref={canvasRef}
              style={{ width: "100%", height: "100%" }}
            ></canvas>
            {/* Exit button inside the canvas container (top-left corner) */}
            <button
              onClick={handleExit3D}
              onMouseEnter={() => setExitHover(true)}
              onMouseLeave={() => setExitHover(false)}
              style={{
                position: "absolute",
                top: "5px",
                left: "5px",
                padding: "3px 6px",
                fontSize: "12px",
                fontWeight: "bold",
                background: "transparent",
                border: "none",
                color: exitHover ? "rgba(255,255,255,1)" : "rgba(255,255,255,0.5)",
                cursor: "pointer",
                zIndex: 10
              }}
              title="Exit 3D Viewer"
            >
              Exit
            </button>
            {/* Instructions overlay in 3D mode (top-right corner) */}
            <div
              style={{
                position: "absolute",
                top: "5px",
                right: "5px",
                backgroundColor: "rgba(0, 0, 0, 0.5)",
                color: "#fff",
                padding: "5px",
                borderRadius: "5px",
                fontSize: "12px",
                textAlign: "left",
                zIndex: 10
              }}
            >
              <details open>
                <summary>Use mouse or arrow keys to navigate</summary>
                <p>
                  <strong>Movement:</strong> Arrow keys to move, space to jump.
                </p>
                <p>
                  <strong>Camera:</strong> WASD to rotate, Q/E to roll.
                </p>
                <p>
                  <strong>Mouse:</strong> Click and drag to orbit.
                </p>
                <p>
                  <strong>Touch:</strong> One finger to orbit; two fingers to pinch/rotate.
                </p>
              </details>
            </div>
          </>
        )}
      </div>

      {/* Save button below the main container */}
      <div style={{ marginTop: "10px" }}>
        <button
          onClick={handleSave}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            cursor: "pointer"
          }}
        >
          Save
        </button>
      </div>
    </div>
  );
};

export default MixedPlayer;
