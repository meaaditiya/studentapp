import React, { useState, useEffect } from 'react';
import axios from 'axios';
  // Import a CSS file for styles
import '../ComponentCSS/YouTubeEmbed.css';
const YouTubeEmbed = () => {
  const [videoLinks, setVideoLinks] = useState([]);
  const [newLink, setNewLink] = useState('');
  const [newTitle, setNewTitle] = useState('');
  const [formVisible, setFormVisible] = useState(false); // Toggle form visibility

  useEffect(() => {
    const fetchVideos = async () => {
      const response = await axios.get('https://personalstudentdiary.onrender.com/api/videos');
      setVideoLinks(response.data);
    };
    fetchVideos();
  }, []);

  const extractVideoId = (url) => {
    const regex = /(?:youtube\.com\/(?:[^\/]+\/.+\/|(?:v|e(?:mbed)?)\/|.*[?&]v=)|youtu\.be\/)([^"&?\/\s]{11})/;
    const match = url.match(regex);
    return match ? match[1] : null;
  };

  const addVideoLink = async () => {
    const videoId = extractVideoId(newLink);
    if (videoId && newTitle) {
      await axios.post('https://personalstudentdiary.onrender.com/api/videos', { videoId, title: newTitle });
      setVideoLinks([...videoLinks, { videoId, title: newTitle }]);
      setNewLink('');
      setNewTitle('');
      setFormVisible(false); // Hide the form after submission
    } else {
      alert('Please enter a valid YouTube link and a title.');
    }
  };

  const deleteVideo = async (videoId) => {
    await axios.delete(`https://personalstudentdiary.onrender.com/api/videos/${videoId}`);
    setVideoLinks(videoLinks.filter((video) => video.videoId !== videoId));
  };

  return (
    <div className="youtube-embed-container">
      <h2>Saved YouTube Videos</h2>
      
      {/* Circular Button to toggle the form */}
      <button
        className="add-video-button" 
        onClick={() => setFormVisible(!formVisible)} // Toggle visibility
      >
        +
      </button>
      
      {/* Conditionally render the form */}
      {formVisible && (
        <div className="add-video-form">
          <input
            type="text"
            placeholder="Paste YouTube link here"
            value={newLink}
            onChange={(e) => setNewLink(e.target.value)}
          />
          <input
            type="text"
            placeholder="Enter video title"
            value={newTitle}
            onChange={(e) => setNewTitle(e.target.value)}
          />
          <button onClick={addVideoLink}>Add Video</button>
        </div>
      )}
      
      {/* Video grid */}
      <div className="video-grid">
        {videoLinks.map((video, index) => (
          <div key={index} className="video-item">
            <button
              className="delete-video-button"
              onClick={() => deleteVideo(video.videoId)}
            >
              &times;
            </button>
            <iframe
              width="100%"
              height="180"
              src={`https://www.youtube.com/embed/${video.videoId}`}
              frameBorder="0"
              allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              title={video.title}
            ></iframe>
            <p className="video-title">{video.title}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default YouTubeEmbed;
