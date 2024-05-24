import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './denoiser.css';

const apiClient = axios.create({
  timeout: 100000, // Set a timeout of 10 seconds for API requests
});

function Denoiser({ isAuthenticated, username}) {
  const [originalImage, setOriginalImage] = useState('');
  const [denoisedImage, setDenoisedImage] = useState('');
  const [loading, setLoading] = useState(false);
  const [file, setFile] = useState(null);
  const [imagePrid, setImagePrid] = useState(null);
  const [imageRid, setImageRid] = useState(null);
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [currentUsername, setCurrentUsername] = useState('');
  const [denoisedImageDataUrl, setDenoisedImageDataUrl] = useState(null);
  const [pridFile, setPridFile] = useState(null);
  const [isImageSaved, setIsImageSaved] = useState(false);
  const [ridFile, setRidFile] = useState(null);

  useEffect(() => {
    setIsLoggedIn(isAuthenticated);
    setCurrentUsername(username);
  }, [isAuthenticated, username]);

  const handleImageUpload = (event) => {
    setLoading(true);
    const file = event.target.files[0];
    setFile(file);
    const reader = new FileReader();

    reader.onload = (e) => {
      const imageUrl = e.target.result;
      setOriginalImage(imageUrl);
      setLoading(false);
    };

    if (file) {
      reader.readAsDataURL(file);
    }
  };

  const handleStartDenoising = async () => {
    setLoading(true);
    setDenoisedImage(originalImage); // Use the original image as the denoised image for now

    const formData = new FormData();
    formData.append('file', file);

    try {
      await apiClient.post('https://butlerblock.pythonanywhere.com/api/upload', formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
      });

      fetchProcessedImages();
    } catch (error) {
      console.error('Error uploading image:', error);
      setLoading(false);
    }
  };

  const fetchProcessedImages = async () => {
    try {
      const [pridResponse, ridResponse] = await Promise.all([
        apiClient.get('https://butlerblock.pythonanywhere.com/api/send_dncnn', { responseType: 'blob' }),
        apiClient.get('https://butlerblock.pythonanywhere.com/api/send_rid', { responseType: 'blob' }),
      ]);

      const pridImageUrl = URL.createObjectURL(pridResponse.data);
      const ridImageUrl = URL.createObjectURL(ridResponse.data);
      setPridFile(pridResponse.data);
      setRidFile(ridResponse.data)
      setImagePrid(pridImageUrl);
      setImageRid(ridImageUrl);
      setDenoisedImageDataUrl(imageRid);
      setLoading(false);
    } catch (error) {
      if (error.code === 'ECONNABORTED') {
        console.error('Timeout error occurred while fetching processed images');
      } else {
        console.error('Error fetching processed images:', error);
      }
      setLoading(false);
    }
  };

const handleDownload = () => {
    if (!denoisedImageDataUrl) {
        console.error("No image available for download");
        return;
    }
    const link = document.createElement('a');
    link.href = denoisedImageDataUrl; // Use the URL stored in state
    link.setAttribute('download', `Processed_Image_${Date.now()}.png`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
};


// Save DCNN Image
const saveImagePrid = async () => {
  try {
    const fileName = `${currentUsername}_${Date.now()}`;
    const imagePath = `${fileName}.jpg`;

    const base64String = await toBase64(pridFile);

    const backendResponse = await axios.post('/save_image_prid', {
      imageData: base64String,
      username: currentUsername,
      imagePath,
    });

    console.log('Image saved successfully:', backendResponse.data);
    setIsImageSaved(true); 
  } catch (error) {
    console.error('Error saving image:', error);
  }
};

//Save RIDNet Image
const saveImageRid = async () => {
  try {
    const fileName = `${currentUsername}_${Date.now()}`;
    const imagePath = `${fileName}.jpg`;

    const base64String = await toBase64(ridFile);

    const backendResponse = await axios.post('/save_image_prid', {
      imageData: base64String,
      username: currentUsername,
      imagePath,
    });

    console.log('Image saved successfully:', backendResponse.data);
    setIsImageSaved(true);
  } catch (error) {
    console.error('Error saving image:', error);
  }
};

// Helper function to convert a Blob to a Base64 string
const toBase64 = (blob) =>
  new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.readAsDataURL(blob);
    reader.onload = () => resolve(reader.result.split(',')[1]);
    reader.onerror = (error) => reject(error);
});
  
return (
    <div className="denoiser-container">
      <header className="header">
        <h1 className="title">Image Denoiser</h1>
        <div className="center-input">
          <input type="file" accept="image/*" onChange={handleImageUpload} />
        </div>
      </header>
      <main className="main">
        <div className="image-container">
          {loading && <p className="loading">Loading...</p>}
          {originalImage && (
            <>
              <div>
                <h2 className="image-header">Original Image</h2>
                <img className="image" src={originalImage} alt="Original" />
              </div>
              <button className="generate-btn" onClick={handleStartDenoising} disabled={!originalImage}>Generate</button>
            </>
          )}
          {denoisedImage && (
            <div className="denoised-image-container">
            <div className="Model-1-Container">
            <h2>DCNN Model</h2>
            <img className="Model-1-Image" src={imagePrid} alt="Denoising Image..." />
            <div>
            {isLoggedIn ? (
                isImageSaved ? (
                <p>Image saved!</p>
                 ) : (
                <button className="save-image" onClick={saveImagePrid}>Save Image</button>
                )
             ) : (
                <button className="download-image" onClick={() => handleDownload(imagePrid)}>Download Image</button>
            )}
            </div>
        </div>
        <div className="Model-2-Container">
        <h2>RIDNET Model</h2>
        <img className="Model-2-Image" src={imageRid} alt="Denoising Image..." />
        <div>
          {isLoggedIn ? (
            isImageSaved ? (
              <p>Image saved!</p>
                    ) : (
                    <button className="save-image2" onClick={saveImageRid}>Save Image</button>
                    )
                    ) : (
                    <button className="download-image" onClick={() => handleDownload(imageRid)}>Download Image</button>
                    )}
                    </div>
                </div>
            </div>
            )}
        </div>
      </main>
    </div>
  );
}

export default Denoiser;