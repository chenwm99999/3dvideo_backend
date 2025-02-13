// src/UploadPage.js
import React, { useState, useRef } from 'react';
import { DragDropContext, Droppable, Draggable } from 'react-beautiful-dnd';

const UploadPage = () => {
  const [videos, setVideos] = useState([]);
  const [showModal, setShowModal] = useState(false);
  const fileInputRef = useRef(null);

  // When files are selected from the file input, add them to our list.
  const handleFileSelect = (e) => {
    try {
      const selectedFiles = Array.from(e.target.files);
      // Create a new array of video objects.
      const newVideos = selectedFiles.map((file, index) => ({
        id: `${Date.now()}-${index}`,
        file,
        name: file.name,
        tag: 0 // default tag is 0 ("do not generate 3D view")
      }));
      setVideos((prevVideos) => [...prevVideos, ...newVideos]);
      // Reset file input so that the same file can be selected again if needed.
      e.target.value = "";
    } catch (error) {
      console.error("Error processing file selection:", error);
    }
  };

  // Toggle the tag value (0 or 1) for a given video.
  const handleCheckboxChange = (index) => {
    const newVideos = Array.from(videos);
    newVideos[index].tag = newVideos[index].tag === 0 ? 1 : 0;
    setVideos(newVideos);
  };

  // onDragEnd function for react-beautiful-dnd.
  const handleOnDragEnd = (result) => {
    if (!result.destination) return;
    const newVideos = Array.from(videos);
    const [reorderedItem] = newVideos.splice(result.source.index, 1);
    newVideos.splice(result.destination.index, 0, reorderedItem);
    setVideos(newVideos);
  };

  // The Start button is enabled if at least one video has tag 1.
  const isStartEnabled = videos.some((video) => video.tag === 1);

  // When Start is clicked, show a modal with video details.
  const handleStart = () => {
    try {
      if (videos.length === 0) {
        alert("Please upload at least one video.");
        return;
      }
      // Instead of saving locally, display the modal with video details.
      setShowModal(true);
    } catch (error) {
      console.error("Error during start process:", error);
      alert("There was an error processing your videos. Please try again.");
    }
  };

  // Close modal.
  const handleCloseModal = () => {
    setShowModal(false);
  };

  return (
    <div style={{ maxWidth: "600px", margin: "0 auto", padding: "20px" }}>
      <h1>Upload Videos</h1>
      <div style={{ marginBottom: "20px" }}>
        <button
          onClick={() => fileInputRef.current.click()}
          style={{
            fontSize: "24px",
            padding: "10px",
            cursor: "pointer",
            borderRadius: "4px",
            border: "1px solid #ccc"
          }}
        >
          +
        </button>
        <input
          type="file"
          ref={fileInputRef}
          multiple
          accept="video/*"
          style={{ display: "none" }}
          onChange={handleFileSelect}
        />
      </div>
      <DragDropContext onDragEnd={handleOnDragEnd}>
        <Droppable droppableId="videos">
          {(provided) => (
            <ul
              {...provided.droppableProps}
              ref={provided.innerRef}
              style={{ listStyle: "none", padding: 0 }}
            >
              {videos.map((video, index) => (
                <Draggable key={video.id} draggableId={video.id} index={index}>
                  {(provided) => (
                    <li
                      ref={provided.innerRef}
                      {...provided.draggableProps}
                      {...provided.dragHandleProps}
                      style={{
                        ...provided.draggableProps.style,
                        border: "1px solid #ccc",
                        padding: "10px",
                        marginBottom: "10px",
                        display: "flex",
                        alignItems: "center",
                        justifyContent: "space-between",
                        background: "#fff"
                      }}
                    >
                      <span>{video.name}</span>
                      <label style={{ marginLeft: "10px" }}>
                        <input
                          type="checkbox"
                          checked={video.tag === 1}
                          onChange={() => handleCheckboxChange(index)}
                        />
                        Generate 3D View
                      </label>
                    </li>
                  )}
                </Draggable>
              ))}
              {provided.placeholder}
            </ul>
          )}
        </Droppable>
      </DragDropContext>
      <div style={{ textAlign: "center", marginTop: "20px" }}>
        <button
          onClick={handleStart}
          disabled={!isStartEnabled}
          style={{
            padding: "10px 20px",
            fontSize: "16px",
            backgroundColor: isStartEnabled ? "#007BFF" : "#ccc",
            color: "#fff",
            border: "none",
            borderRadius: "4px",
            cursor: isStartEnabled ? "pointer" : "not-allowed"
          }}
        >
          Start
        </button>
      </div>

      {/* Modal for showing uploaded video details */}
      {showModal && (
        <div style={{
          position: "fixed",
          top: 0,
          left: 0,
          width: "100%",
          height: "100%",
          backgroundColor: "rgba(0,0,0,0.5)",
          display: "flex",
          alignItems: "center",
          justifyContent: "center"
        }}>
          <div style={{
            background: "#fff",
            padding: "20px",
            borderRadius: "8px",
            width: "80%",
            maxWidth: "500px"
          }}>
            <h2>Uploaded Videos</h2>
            <p>{videos.length} videos successfully uploaded.</p>
            <table style={{ width: "100%", borderCollapse: "collapse" }}>
              <thead>
                <tr>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>Video Name</th>
                  <th style={{ border: "1px solid #ddd", padding: "8px" }}>Generate 3D View</th>
                </tr>
              </thead>
              <tbody>
                {videos.map((video) => (
                  <tr key={video.id}>
                    <td style={{ border: "1px solid #ddd", padding: "8px" }}>{video.name}</td>
                    <td style={{ border: "1px solid #ddd", padding: "8px", textAlign: "center" }}>
                      {video.tag === 1 ? "Yes" : "No"}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
            <div style={{ textAlign: "right", marginTop: "20px" }}>
              <button
                onClick={handleCloseModal}
                style={{
                  padding: "10px 20px",
                  fontSize: "16px",
                  backgroundColor: "#007BFF",
                  color: "#fff",
                  border: "none",
                  borderRadius: "4px",
                  cursor: "pointer"
                }}
              >
                Close
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default UploadPage;
