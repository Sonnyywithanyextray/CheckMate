import React, { useState } from 'react';
import './Footer.css';
import TypewriterPopup from './TypewriterPopup';

function Footer() {
  const [isPopupOpen, setIsPopupOpen] = useState(false);

  const popupText = `In light of the recent and blatant misinformation on social media regarding Haitians and Haitian culture as of 09/15/2024, I felt compelled to rethink the product I'd be developing at HackMIT this year. CheckMate is a minimal viable product of a larger project I am interested in working on. An online misinformation report and review system for users, by users. Any and all claims should meet community scrutinization and fact checking. CheckMate.`;

  return (
    <>
      <footer className="footer">
        <p onClick={() => setIsPopupOpen(true)}>
          <span className="footer-text">Please click here </span>
          <span className="footer-highlight">for more insight</span>
          <span className="footer-text"> on this project.</span>
        </p>
      </footer>
      <TypewriterPopup 
        isOpen={isPopupOpen} 
        onClose={() => setIsPopupOpen(false)} 
        text={popupText}
      />
    </>
  );
}

export default Footer;