import React from 'react';
import './about.css';

function About() {
  return (
    <div className="about-container">
      <h1>About Our Technology</h1>
      
      <div className="model-section">
        <h2>DCNN (Deep Convolutional Neural Networks)</h2>
        <p>Our Deep Convolutional Neural Networks are tailored to automatically learn the best filters for noise reduction from large datasets of images. This approach allows the network to adaptively improve over time, continually enhancing its ability to distinguish between noise and important details in images.</p>
      </div>

      <div className="model-section">
        <h2>RIDNet (Robust Image Denoising Network)</h2>
        <p>RIDNet employs a robust approach to image denoising by using a specialized architecture that integrates multiple layers of neural networks to progressively refine the denoising process.</p>
      </div>

    </div>
  );
}

export default About;
