import React, { useState, useEffect, useCallback, useRef } from 'react';
import './TypewriterPopup.css';

function TypewriterPopup({ isOpen, onClose, text }) {
  const [displayText, setDisplayText] = useState('');
  const [index, setIndex] = useState(0);
  const popupContentRef = useRef(null);

  const typeWriter = useCallback(() => {
    if (index < text.length) {
      setDisplayText((prev) => prev + text.charAt(index));
      setIndex((prev) => prev + 1);
    }
  }, [index, text]);

  useEffect(() => {
    if (isOpen) {
      const timer = setTimeout(typeWriter, 50);
      return () => clearTimeout(timer);
    }
  }, [isOpen, typeWriter]);

  useEffect(() => {
    if (!isOpen) {
      setDisplayText('');
      setIndex(0);
    }
  }, [isOpen]);

  useEffect(() => {
    const handleClickOutside = (event) => {
      if (popupContentRef.current && !popupContentRef.current.contains(event.target)) {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div className="popup-overlay">
      <div className="popup-content" ref={popupContentRef}>
        <p>{displayText}</p>
      </div>
    </div>
  );
}

export default TypewriterPopup;