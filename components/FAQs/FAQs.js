import React, { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import './FAQs.css';

const faqData = [
  {
    id: 1,
    question: 'How does the interview practice work?',
    answer: 'Our platform provides real interview questions from top companies...',
  },
  {
    id: 2,
    question: 'What kind of feedback will I receive?',
    answer: 'You’ll get detailed feedback from industry experts on your answers...',
  },
  {
    id: 3,
    question: 'How do I get started?',
    answer: 'Simply sign up for a free account and start practicing...',
  },
];

const FAQs = () => {
  const [expanded, setExpanded] = useState(null);

  const toggleFAQ = (id) => {
    setExpanded(expanded === id ? null : id);
  };

  return (
    <section className="faqs-section">
      <h2>Frequently Asked Questions</h2>
      
      <div className="faq-list">
        {faqData.map((faq) => (
          <div key={faq.id} className="faq-item">
            <div
              className="faq-question"
              onClick={() => toggleFAQ(faq.id)}
              onKeyDown={(e) => e.key === 'Enter' && toggleFAQ(faq.id)}
              role="button"
              tabIndex={0}
              aria-expanded={expanded === faq.id}
              aria-controls={`faq-answer-${faq.id}`}
            >
              <h3>{faq.question}</h3>
              <motion.span
                className="arrow"
                animate={{ rotate: expanded === faq.id ? 180 : 0 }}
                transition={{ duration: 0.3 }}
              >
                ▼
              </motion.span>
            </div>
            <AnimatePresence>
              {expanded === faq.id && (
                <motion.div
                  id={`faq-answer-${faq.id}`}
                  className="faq-answer"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.3 }}
                >
                  <p>{faq.answer}</p>
                </motion.div>
              )}
            </AnimatePresence>
          </div>
        ))}
      </div>
    </section>
  );
};

export default FAQs;