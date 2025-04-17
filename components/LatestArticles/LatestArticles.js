import React from 'react';
import Slider from 'react-slick';
import 'slick-carousel/slick/slick.css';
import 'slick-carousel/slick/slick-theme.css';
import './LatestArticles.css';
import { motion } from 'framer-motion';

// Static data for articles
const articles = [
  {
    id: 1,
    image: 'https://picsum.photos/400/200?random=1',
    category: 'TOP INTERVIEW TIPS',
    title: 'Learn how to ace your next technical interview...',
    readTime: '5 min read',
  },
  {
    id: 2,
    image: 'https://picsum.photos/400/200?random=2',
    category: 'TOP INTERVIEW TIPS',
    title: 'Learn how to ace your next technical interview...',
    readTime: '5 min read',
  },
  {
    id: 3,
    image: 'https://picsum.photos/400/200?random=3',
    category: 'TOP INTERVIEW TIPS',
    title: 'Learn how to ace your next technical interview...',
    readTime: '5 min read',
  },
  {
    id: 4,
    image: 'https://picsum.photos/400/200?random=4',
    category: 'TOP INTERVIEW TIPS',
    title: 'Learn how to ace your next technical interview...',
    readTime: '5 min read',
  },
  {
    id: 5,
    image: 'https://picsum.photos/400/200?random=5',
    category: 'TOP INTERVIEW TIPS',
    title: 'Learn how to ace your next technical interview...',
    readTime: '5 min read',
  },
  {
    id: 6,
    image: 'https://picsum.photos/400/200?random=6',
    category: 'TOP INTERVIEW TIPS',
    title: 'Learn how to ace your next technical interview...',
    readTime: '5 min read',
  },
];

const LatestArticles = () => {
  const settings = {
    dots: true,
    infinite: true,
    speed: 500,
    slidesToShow: 3,
    slidesToScroll: 1,
    autoplay: true,
    autoplaySpeed: 3000,
    responsive: [
      {
        breakpoint: 1024,
        settings: {
          slidesToShow: 2,
          slidesToScroll: 1,
        },
      },
      {
        breakpoint: 600,
        settings: {
          slidesToShow: 1,
          slidesToScroll: 1,
        },
      },
    ],
  };

  return (
    <section className="articles-section">
      <h2>Latest Articles</h2>
      <Slider {...settings}>
        {articles.map((article) => (
          <motion.div
            key={article.id}
            className="article-card"
            whileHover={{ scale: 1.05 }}
            transition={{ type: 'spring', stiffness: 300 }}
          >
            <img src={article.image} alt={article.category} />
            <div className="article-card-content">
              <h3>{article.category}</h3>
              <p>{article.title}</p>
              <div className="article-footer">
                <span>{article.readTime}</span>
                <button
                  className="read-more"
                  aria-label={`Read more about ${article.title}`}
                  onClick={() => console.log(`Clicked Read More for ${article.title}`)}
                >
                  Read More →
                </button>
              </div>
            </div>
          </motion.div>
        ))}
      </Slider>
    </section>
  );
};

export default LatestArticles;