import React, { useEffect, useState } from 'react';
import Footer from '../components/Footer';
import Navbar from '../components/Navbar';
import './Home.css';

// A small rotator component to cycle through images dynamically
const ImageRotator = ({ images = [], interval = 3000, alt = 'soil image' }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!images || images.length === 0) return;
    const t = setInterval(() => setIdx(i => (i + 1) % images.length), interval);
    return () => clearInterval(t);
  }, [images, interval]);

  if (!images || images.length === 0) return null;

  return (
    <div className="image-box">
      <img src={images[idx]} alt={`${alt} ${idx + 1}`} />
    </div>
  );
};

// Text rotator: cycle through strings and render one at a time
const TextRotator = ({ texts = [], interval = 3000 }) => {
  const [idx, setIdx] = useState(0);

  useEffect(() => {
    if (!texts || texts.length === 0) return;
    const t = setInterval(() => setIdx(i => (i + 1) % texts.length), interval);
    return () => clearInterval(t);
  }, [texts, interval]);

  if (!texts || texts.length === 0) return null;

  return (
    <div className="marquee">
      <div className="marquee-item" key={idx} aria-hidden={false}>
        {texts[idx]}
      </div>
    </div>
  );
};

const Home = () => {
  // Use all suitable public images from the public folder for the rotator.
  const rotatingImages = [
    process.env.PUBLIC_URL + '/background.jpg',
    process.env.PUBLIC_URL + '/background1.jpg',
    process.env.PUBLIC_URL + '/background2.jpg',
    process.env.PUBLIC_URL + '/background3.jpg',
    process.env.PUBLIC_URL + '/background4.png',
    process.env.PUBLIC_URL + '/background5.png',
    process.env.PUBLIC_URL + '/background6.jpg',
    process.env.PUBLIC_URL + '/background7.png',
    process.env.PUBLIC_URL + '/background8.png',
    process.env.PUBLIC_URL + '/background9.png',
    process.env.PUBLIC_URL + '/background10.jpg',
    process.env.PUBLIC_URL + '/background11.jpg',
    process.env.PUBLIC_URL + '/background12.png',
    process.env.PUBLIC_URL + '/background13.jpg',
    process.env.PUBLIC_URL + '/background14.jpg',
  ];

  return (
    <div className="home-wrapper">
      <Navbar />

      {/* hero background isolated so footer isn't on top of it */}
      <div
        className="hero-bg"
        style={{
          backgroundImage: `url(${process.env.PUBLIC_URL + '/background8.png'})`,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        <div className="hero-grid">
          <div className="left-column">
            <ImageRotator images={rotatingImages} interval={4500} alt="seedling" />
          </div>

          <div className="center-column">
            <h1 className="hero-title">AI-Powered Soil Quality Analysis</h1>
            <p className="hero-sub">Analyze your soil, get crop recommendations, and optimize fertilizer use with our intelligent system.</p>
            <div className="hero-actions">
              <a className="btn-getstarted" href="/upload">Get Started</a>
            </div>
            {/* moved marquee inline: appears directly below Get Started button and centered */}
            <div className="marquee-inline" aria-hidden="false">
              <TextRotator
                texts={[
                  'AI-Powered Soil Quality Analysis',
                  'Analyze your soil, get crop recommendations, and optimize fertilizer use with our intelligent system.',
                  
                ]}
                interval={3800}
              />
            </div>
          </div>
        </div>
        {/* original marquee overlay removed so inline marquee is used */}
      </div>
      <section className="footer-section">
        <Footer />
      </section>
    </div>
  );
};

export default Home;
