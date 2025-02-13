import React, { useRef, useState, useEffect } from 'react';

const VideoPlayer = () => {
  const videoRef = useRef(null);
  const [videoFiles, setVideoFiles] = useState([]); // will hold filenames from videos.json
  const [currentVideoIndex, setCurrentVideoIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [progress, setProgress] = useState(0);

  // Fetch the list of video files from public/videos/videos.json when the component mounts.
  useEffect(() => {
    fetch(`${process.env.PUBLIC_URL}/videos/videos.json`)
      .then(response => response.json())
      .then(data => {
        setVideoFiles(data);
      })
      .catch(error => {
        console.error("Error fetching video list:", error);
      });
  }, []);

  // When the current video index changes, load the new video.
  useEffect(() => {
    if (videoRef.current) {
      videoRef.current.load();
      setProgress(0);
      if (isPlaying) {
        videoRef.current.play().catch(error => console.error("Error auto-playing video:", error));
      }
    }
  }, [currentVideoIndex]);

  // Update the progress bar as the video plays.
  const handleTimeUpdate = () => {
    if (videoRef.current) {
      const current = videoRef.current.currentTime;
      const duration = videoRef.current.duration || 1;
      setProgress((current / duration) * 100);
    }
  };

  // When the current video ends, advance to the next video (if available).
  const handleEnded = () => {
    if (currentVideoIndex < videoFiles.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    } else {
      setIsPlaying(false);
    }
  };

  // Toggle play and pause.
  const togglePlayPause = () => {
    if (!videoRef.current) return;
    if (videoRef.current.paused) {
      videoRef.current
        .play()
        .then(() => {
          setIsPlaying(true);
        })
        .catch(error => {
          console.error("Error playing video:", error);
        });
    } else {
      videoRef.current.pause();
      setIsPlaying(false);
    }
  };

  // Update current time when the user changes the progress bar.
  const handleProgressChange = (e) => {
    const value = e.target.value;
    if (videoRef.current) {
      const duration = videoRef.current.duration || 1;
      videoRef.current.currentTime = (value / 100) * duration;
      setProgress(value);
    }
  };

  // Save button using the File System Access API.
  const handleSave = async () => {
    // Check for API support.
    if (!window.showDirectoryPicker) {
      alert("The File System Access API is not supported in this browser.");
      return;
    }
    try {
      // Prompt the user to choose a directory.
      const directoryHandle = await window.showDirectoryPicker();
      // Save each video from the list.
      for (const videoName of videoFiles) {
        const response = await fetch(`${process.env.PUBLIC_URL}/videos/${videoName}`);
        if (!response.ok) {
          console.error(`Failed to fetch ${videoName}`);
          continue;
        }
        const blob = await response.blob();
        // Create or overwrite the file in the chosen directory.
        const fileHandle = await directoryHandle.getFileHandle(videoName, { create: true });
        const writableStream = await fileHandle.createWritable();
        await writableStream.write(blob);
        await writableStream.close();
      }
      alert("Videos have been saved successfully.");
    } catch (error) {
      console.error("Error saving videos:", error);
      alert("Failed to save videos: " + error.message);
    }
  };

  // Start Over: restart from the first video.
  const handleStartOver = () => {
    setCurrentVideoIndex(0);
    setIsPlaying(false);
    if (videoRef.current) {
      videoRef.current.pause();
      videoRef.current.currentTime = 0;
    }
  };

  // Backwards button: (not implemented yet; placeholder)
  const handleBackwards = () => {
    alert("Backwards functionality not implemented yet.");
  };

  // Next button: play the next video if available.
  const handleNext = () => {
    if (currentVideoIndex < videoFiles.length - 1) {
      setCurrentVideoIndex(currentVideoIndex + 1);
    }
  };

  return (
    <div style={{ maxWidth: "800px", margin: "0 auto", padding: "20px" }}>
      {/* Header with backwards button on left and Start Over button on right */}
      <div style={{
        display: "flex",
        justifyContent: "space-between",
        alignItems: "center",
        marginBottom: "10px"
      }}>
        <button
          onClick={handleBackwards}
          style={{
            fontSize: "24px",
            background: "none",
            border: "none",
            cursor: "pointer"
          }}
          title="Backwards"
        >
          &#x25C0;
        </button>
        <h2 style={{ margin: "0 auto" }}>Video Player</h2>
        <button
          onClick={handleStartOver}
          style={{
            fontSize: "16px",
            background: "none",
            border: "1px solid #ccc",
            padding: "5px 10px",
            cursor: "pointer"
          }}
        >
          Start Over
        </button>
      </div>

      {/* Video player container */}
      <div style={{ position: "relative" }}>
        {videoFiles.length > 0 ? (
          <video
            ref={videoRef}
            width="100%"
            height="auto"
            onTimeUpdate={handleTimeUpdate}
            onEnded={handleEnded}
            controls={false} // using custom controls below
          >
            <source src={`${process.env.PUBLIC_URL}/videos/${videoFiles[currentVideoIndex]}`} type="video/mp4" />
            Your browser does not support the video tag.
          </video>
        ) : (
          <p>Loading videos...</p>
        )}

        {/* Custom controls overlay */}
        <div style={{
          position: "absolute",
          bottom: "10px",
          left: "10px",
          right: "10px",
          background: "rgba(0, 0, 0, 0.5)",
          padding: "10px",
          borderRadius: "5px",
          display: "flex",
          alignItems: "center",
          justifyContent: "space-between"
        }}>
          <button
            onClick={togglePlayPause}
            style={{
              fontSize: "16px",
              color: "#fff",
              background: "none",
              border: "none",
              cursor: "pointer"
            }}
          >
            {isPlaying ? "Pause" : "Play"}
          </button>
          <input
            type="range"
            min="0"
            max="100"
            value={progress}
            onChange={handleProgressChange}
            style={{ flexGrow: 1, margin: "0 10px" }}
          />
          <button
            onClick={handleNext}
            style={{
              fontSize: "16px",
              color: "#fff",
              background: "none",
              border: "none",
              cursor: "pointer"
            }}
          >
            Next
          </button>
        </div>
      </div>

      {/* Save button at bottom */}
      <div style={{
        marginTop: "20px",
        display: "flex",
        justifyContent: "center"
      }}>
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

export default VideoPlayer;
