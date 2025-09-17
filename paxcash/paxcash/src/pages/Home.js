import React, { useState, useEffect, useRef } from 'react';
import './Home.css';
import { useNavigate } from 'react-router-dom';
import { Payment, DataUsage, AccountBalance, AccountBalanceWallet, PhoneIphone, Settings } from '@mui/icons-material';
import heroBg from '../assets/hero-bg.jpg';
import heroPng from '../assets/hero.png';
import review2 from '../assets/review2.png';

const heroImages = [heroBg, heroPng, review2];

const services = [
  {
    icon: <Payment sx={{ fontSize: 48, color: '#1a365d', bgcolor: '#fffbf0', p: 1, borderRadius: 2 }} />, 
    title: 'Bill Payments',
    desc: 'Pay electricity bills, TV subs, utility bills and more from the comfort of your home at reduced price.',
    route: '/pay-bills',
    link: 'Download the app',
  },
  {
    icon: <DataUsage sx={{ fontSize: 48, color: '#1a365d', bgcolor: '#fffbf0', p: 1, borderRadius: 2 }} />, 
    title: 'Airtime & Data',
    desc: 'Buy airtime recharge and data top-up for all major network operators at much cheaper rate.',
    route: '/airtime',
    link: 'Get started',
  },
  {
    icon: <AccountBalance sx={{ fontSize: 48, color: '#1a365d', bgcolor: '#fffbf0', p: 1, borderRadius: 2 }} />, 
    title: 'Bank Transfers',
    desc: 'Transfer or send money to any local bank account in Nigeria at a cheaper rate.',
    route: '/transfer',
    link: 'Learn More',
  },
  {
    icon: <PhoneIphone sx={{ fontSize: 48, color: '#1a365d', bgcolor: '#fffbf0', p: 1, borderRadius: 2 }} />,
    title: 'Airtime to Cash',
    desc: 'Accept payments in airtime from your customers or quickly convert your excess Airtime to Real Cash.',
    route: '/airtime',
    link: 'Learn more',
  },
  {
    icon: <AccountBalanceWallet sx={{ fontSize: 48, color: '#1a365d', bgcolor: '#fffbf0', p: 1, borderRadius: 2 }} />, 
    title: 'Virtual Accounts',
    desc: 'Get a Nigeria bank account number to receive payments within seconds. No fees, no hidden charges.',
    route: '/virtual-account',
    link: 'Learn more here',
  },
  {
    icon: <Settings sx={{ fontSize: 48, color: '#1a365d', bgcolor: '#fffbf0', p: 1, borderRadius: 2 }} />,
    title: 'Financial Data',
    desc: "Access balance, statement & other financial data from banks to know your customer's financial status.",
    route: '/wallet',
    link: 'Learn more',
  },
];

function Home() {
  const navigate = useNavigate();
  const [heroIndex, setHeroIndex] = useState(0);
  const cardsPerView = 3;
  const [reviewIndex, setReviewIndex] = useState(cardsPerView); // Start at first real card
  const [isAnimating, setIsAnimating] = useState(true);
  const reviewsCardsRef = useRef();
  // Prepare review cards with clones for seamless loop
  const reviewCards = [
    { img: require('../assets/review1.png'), text: '5 apps that help you control your spending', author: 'John Doe' },
    { img: require('../assets/review3.png'), text: "Freelance? Don't get lost in your finances", author: 'Jane Smith' },
    { img: require('../assets/review2.png'), text: 'Is it worth investing with little money?', author: 'Alex Green' },
    { img: require('../assets/guy.jpg'), text: 'Paxcash makes saving easy and fun!', author: 'Samuel Pax' },
    { img: require('../assets/man.jpg'), text: 'Best app for managing my bills', author: 'Michael Lee' },
    { img: require('../assets/green.jpg'), text: 'I love the rewards on every spend!', author: 'Fatima Hassan' },
  ];
  const reviewsCount = reviewCards.length;
  // Clone last 3 to front and first 3 to end
  const extendedReviewCards = [
    ...reviewCards.slice(-cardsPerView),
    ...reviewCards,
    ...reviewCards.slice(0, cardsPerView)
  ];
  console.log('reviewIndex:', reviewIndex, 'extendedReviewCards.length:', extendedReviewCards.length);
  // Carousel sliding logic
  const handleReviewLeft = () => {
    setIsAnimating(true);
    setReviewIndex((prev) => prev - 1);
  };
  const handleReviewRight = () => {
    setIsAnimating(true);
    setReviewIndex((prev) => prev + 1);
  };

  // Auto-slide the review carousel
  useEffect(() => {
    const interval = setInterval(() => {
      setIsAnimating(true);
      setReviewIndex((prev) => prev + 1);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  // Handle seamless loop on transition end
  useEffect(() => {
    const handleTransitionEnd = () => {
      if (!isAnimating) return;
      if (reviewIndex === 0) {
        setIsAnimating(false);
        setReviewIndex(reviewsCount);
      } else if (reviewIndex === reviewsCount + cardsPerView) {
        setIsAnimating(false);
        setReviewIndex(cardsPerView);
      }
    };
    const node = reviewsCardsRef.current;
    if (node) {
      node.addEventListener('transitionend', handleTransitionEnd);
      return () => node.removeEventListener('transitionend', handleTransitionEnd);
    }
  }, [reviewIndex, reviewsCount, cardsPerView, isAnimating]);

  // Watch for out-of-bounds reviewIndex and reset if needed
  useEffect(() => {
    if (reviewIndex < 0) {
      setIsAnimating(false);
      setReviewIndex(reviewsCount);
    } else if (reviewIndex > reviewsCount + cardsPerView) {
      setIsAnimating(false);
      setReviewIndex(cardsPerView);
    }
  }, [reviewIndex, reviewsCount, cardsPerView]);

  // Calculate the transform for the sliding effect
  const reviewsTransform = {
    transform: `translateX(-${reviewIndex * (100 / cardsPerView)}%)`,
    transition: isAnimating ? 'transform 0.6s cubic-bezier(0.4,0,0.2,1)' : 'none',
  };
  console.log('reviewsTransform:', reviewsTransform);

  // On index change, re-enable animation if needed
  useEffect(() => {
    if (!isAnimating) {
      setTimeout(() => setIsAnimating(true), 20);
    }
  }, [isAnimating]);

  useEffect(() => {
    const interval = setInterval(() => {
      setHeroIndex((prev) => (prev + 1) % heroImages.length);
    }, 4000);
    return () => clearInterval(interval);
  }, []);

  const heroBgStyle = {
    backgroundImage: `linear-gradient(rgba(24, 24, 24, 0.8), rgba(24, 24, 24, 0.8)), url(${heroImages[heroIndex]})`,
    backgroundSize: 'cover',
    backgroundPosition: 'center center',
    backgroundRepeat: 'no-repeat',
    backgroundAttachment: 'scroll',
    color: '#fff',
    padding: '120px 0 80px 0',
    display: 'flex',
    justifyContent: 'center',
    minHeight: '100vh',
    transition: 'background-image 1s ease-in-out',
  };

  return (
    <div className="landing-root">
      {/* Hero Section */}
      <section className="hero-section" style={heroBgStyle}>
        {/* Debug Overlay */}
        <div style={{ position: 'absolute', top: 10, left: 10, zIndex: 100, background: 'rgba(0,0,0,0.5)', color: '#fff', padding: '6px 14px', borderRadius: 8, fontSize: 14 }}>
          <strong>Hero Index:</strong> {heroIndex} <br/>
          <strong>Image:</strong> {heroImages[heroIndex].split('/').pop()}
        </div>
        <div className="hero-content">
          <div className="hero-text">
            <div className="hero-badge">MORE FREEDOM FOR YOUR MONEY</div>
            <h1>
              A fast, modern bank <span className="highlight">made for you.</span>
            </h1>
            <p className="hero-subtext">
              No more bureaucracy! Take full control of your finances with ease and transparency.
            </p>
            <button className="cta-btn">Open my account</button>
          </div>
          <div className="hero-features">
            <div className="feature">Unlimited transfers</div>
            <div className="feature">No annual fee card</div>
            <div className="feature">Global account</div>
          </div>
        </div>
      </section>

      {/* Numbers/Stats Section */}
      <section className="stats-section">
        <div className="stats-content">
          <div className="stats-block stats-block-left">
            <div className="stats-number">+4.5B</div>
            <div className="stats-label">in transactions</div>
          </div>
          <div className="stats-block stats-block-center">
            <img src={require('../assets/ad.jpg')} alt="Paxcash users" />
          </div>
          <div className="stats-block stats-block-right">
            <div className="stats-number">+8M</div>
            <div className="stats-label">active accounts</div>
            <div className="stats-avatars">
              <img src={require('../assets/guy.jpg')} alt="User 1" />
              <img src={require('../assets/man.jpg')} alt="User 2" />
              <img src={require('../assets/green.jpg')} alt="User 3" />
            </div>
          </div>
          <div className="stats-block stats-block-cards">
            <div className="stats-number">+6M</div>
            <div className="stats-label">active cards</div>
            <img src={require('../assets/review1.png')} alt="Card" className="stats-card-img" />
          </div>
        </div>
      </section>

      

      {/* Banking Solutions Section */}
      <section className="solutions-section">
        <div className="solutions-content">
          <h2 className="solutions-title">Our Complete Range of Banking Solutions</h2>
          <div className="solutions-grid">
            {services.map((service, idx) => (
              <div className="solution-card" key={service.title} onClick={() => navigate(service.route)}>
                <div className="solution-icon">{service.icon}</div>
                <div className="solution-title">{service.title}</div>
                <div className="solution-desc">{service.desc}</div>
                <span className="solution-link">{service.link} &#8594;</span>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Virtual Card Section */}
      <section className="virtual-card-section">
        <div className="virtual-card-content">
          <div className="virtual-card-image">
            <img src={require('../assets/start-img.png')} alt="Virtual Card Stack" />
          </div>
          <div className="virtual-card-info">
            <div className="virtual-card-badge">VIRTUAL CARD</div>
            <h2>Your Paxcash Virtual Card: freedom for your online payments.</h2>
            <p>
              Instantly create a secure virtual card for your online and international purchases. Full control in the app, no hidden fees, and perfect for safe shopping and subscriptions.
            </p>
            <button className="virtual-card-cta">Get my virtual card</button>
          </div>
        </div>
        <div className="virtual-card-features">
          <div className="vc-feature vc-feature-highlight">
            <div className="vc-feature-icon">💳</div>
            <div className="vc-feature-title">No annual fee</div>
          </div>
          <div className="vc-feature">
            <div className="vc-feature-icon">🔒</div>
            <div className="vc-feature-title">Lock & unlock in app</div>
          </div>
          <div className="vc-feature">
            <div className="vc-feature-icon">⭐</div>
            <div className="vc-feature-title">Rewards on every spend</div>
          </div>
          <div className="vc-feature">
            <div className="vc-feature-icon">🛒</div>
            <div className="vc-feature-title">Perfect for online shopping</div>
          </div>
        </div>
      </section>

{/* User Reviews Section */}
<section className="reviews-section">
        <div className="reviews-header">
          <div className="reviews-title">Money tips, tech, and financial freedom.</div>
          <div className="reviews-subtitle">Content to help your money grow, stress-free.</div>
        </div>
        <div className="reviews-carousel">
          {/* Carousel arrows */}
          <button className="carousel-arrow left" onClick={handleReviewLeft}>&#8592;</button>
          <div className="reviews-cards-wrapper">
            <div className="reviews-cards" ref={reviewsCardsRef} style={reviewsTransform}>
              {extendedReviewCards.map((review, idx) => (
                <div className="review-card" key={idx}>
                  <img src={review.img} alt={`Review ${idx + 1}`} />
                  <div className="review-text">{review.text}</div>
                  <div className="review-author">{review.author}</div>
                </div>
              ))}
            </div>
          </div>
          <button className="carousel-arrow right" onClick={handleReviewRight}>&#8594;</button>
        </div>
        <button className="reviews-blog-btn">Go to blog &rarr;</button>
      </section>

      {/* Get Started Section */}
      <section className="get-started-section">
        <div className="get-started-content">
          <div className="get-started-info">
            <div className="get-started-title">Financial freedom starts with a click</div>
            <div className="get-started-desc">The digital account that gives you control, convenience, and real benefits. Less bureaucracy, more control for you.</div>
            <button className="get-started-btn">Open my account</button>
            <div className="get-started-apps">
              <img src="https://upload.wikimedia.org/wikipedia/commons/7/78/Google_Play_Store_badge_EN.svg" alt="Get it on Google Play" style={{ height: 40 }} />
              <img src="https://developer.apple.com/assets/elements/badges/download-on-the-app-store.svg" alt="Download on the App Store" style={{ height: 40 }} />
            </div>
          </div>
          <div className="get-started-image">
            <img src={require('../assets/paxcash-app.png')} alt="Paxcash App" />
          </div>
        </div>
      </section>
    </div>
  );
}

export default Home; 