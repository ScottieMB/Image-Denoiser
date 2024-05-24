import React from 'react';
import './home.css';
import { Link } from 'react-router-dom';
import { useInView } from 'react-intersection-observer';

function AnimatedSection({ children }) {
  const { ref, inView } = useInView({
    triggerOnce: true, // Trigger animation only once
    threshold: 0.5, // Trigger when 50% of the element is in view
  });

  return (
    <section ref={ref} className={`section ${inView ? 'fade-in' : ''}`}>
      {children}
    </section>
  );
}

function Home() {
  return (
    <div>
      <AnimatedSection>
        <div className="hero-section">
          <h1>Crystal Clear Images, Every Time</h1>
          <p>Experience the best in image denoising technology.</p>
          <Link to="/denoiser">
            <button className="button">Try It Now</button>
          </Link>
        </div>
      </AnimatedSection>
      <AnimatedSection>
        <div className="features-section">
          <div>
            <h2>Fast Processing</h2>
            <p>Quickly remove noise from your images without sacrificing quality.</p>
          </div>
          <div>
            <h2>High Accuracy</h2>
            <p>Advanced algorithms ensure the highest quality denoising.</p>
          </div>
          <div>
            <h2>Easy to Use</h2>
            <p>Simple and intuitive interface makes denoising a breeze.</p>
          </div>
        </div>
      </AnimatedSection>
      <AnimatedSection>
        <div className="demo-section">
          <h2>About Our Project</h2>
          <p>Our project harnesses the power of advanced machine learning models to tackle the challenging problem of image denoising.
            In the digital age, where clarity and detail are paramount in images, noise can degrade quality significantly, affecting both
            professional and personal media. By implementing neural network architectures, our system learns to effectively
            remove noise while preserving important details, enhancing the visual quality of images without manual intervention. This
            technology not only paves the way for more sophisticated image processing techniques but also offers practical applications in
            fields such as medical imaging, astronomy, and everyday photography. Our goal is to make high-quality imagery accessible and
            efficient, leveraging the capabilities of artificial intelligence to improve how we capture and perceive the world around us.</p>
        </div>
      </AnimatedSection>
      <AnimatedSection>
        <div className="contact-section">
            <h2>Contact Us!</h2>
            <p>cs499denoiser@gmail.com</p>
        </div>
      </AnimatedSection>
      <AnimatedSection>
        <div className="call-to-action">
          <h2>Get Started With Our Denoiser Today</h2>
          <Link to="/signup">
            <button className="button">Sign Up</button>
          </Link>
        </div>
      </AnimatedSection>
    </div>
  );
}

export default Home;
