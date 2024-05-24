import React, { useState, useEffect } from 'react';
import axios from 'axios';
import './myimages.css';

function MyImages({ username }) {
  const [images, setImages] = useState([]);

  useEffect(() => {
    const fetchImages = async () => {
      try {
        const response = await axios.get(`/api/images/${username}`);
        setImages(response.data);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, [username]);

  const handleDelete = async (image) => {
    try {
        await axios.post('/api/images/delete', { id: image.imageId });
        setImages(images.filter((img) => img.imageId !== image.imageId));
        console.log(`Image with ID ${image.imageId} deleted.`);
    } catch (error) {
        console.error('Error deleting image:', error);
    }
  };

  const handleDownload = (imageData) => {
    const url = `data:image/jpeg;base64,${imageData}`;
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', `Image_${Date.now()}.png`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div>
      <div className="gallery-header">
        <h1>My Images</h1>
      </div>
      <div className="gallery">
        {Array.isArray(images) && images.length > 0 ? (
          images.map((image, index) => (
            <div key={image.imageId} className="gallery-item">
              <img
                src={`data:image/jpeg;base64,${image.imageData}`}
                alt={`Image ${image.imageId}`}
              />
              <div className="button-container">
                <button onClick={() => handleDelete(image)}>Delete Image</button>
                <button onClick={() => handleDownload(image.imageData)}>Download Image</button>
              </div>
            </div>
          ))
        ) : (
          <p>No images found.</p>
        )}
      </div>
    </div>
  );
}

export default MyImages;
