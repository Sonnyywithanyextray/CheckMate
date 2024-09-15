import React, { useState, useEffect, useContext } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { firestore, auth } from './firebase';
import { 
  doc, 
  getDoc, 
  addDoc, 
  collection, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import { signOut } from "firebase/auth";
import { AuthContext } from './context/AuthContext';
import { FaArrowLeft } from 'react-icons/fa';
import { motion } from 'framer-motion';
import './Reviewer.css';
import './LogoutButton.css';

function Reviewer() {
  const { reportId } = useParams();
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();

  const [report, setReport] = useState(null);
  const [evidence, setEvidence] = useState('');
  const [conclusions, setConclusions] = useState('');
  const [error, setError] = useState(null);
  const [successMessage, setSuccessMessage] = useState(null);

  useEffect(() => {
    const fetchReport = async () => {
      if (!reportId) {
        setError('No report ID provided.');
        console.error('No report ID provided.');
        return;
      }

      try {
        const reportRef = doc(firestore, 'reports', reportId);
        const reportSnap = await getDoc(reportRef);
        if (reportSnap.exists()) {
          const reportData = { id: reportSnap.id, ...reportSnap.data() };
          setReport(reportData);
          console.log('Report fetched:', reportData);
        } else {
          setError('Report not found.');
          console.error('Report not found:', reportId);
        }
      } catch (err) {
        console.error('Error fetching report:', err);
        setError('Failed to fetch report.');
      }
    };

    fetchReport();
  }, [reportId, firestore]);

  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!currentUser) {
      setError('User is not authenticated. Please log in again.');
      setSuccessMessage(null);
      return;
    }
    if (!evidence || !conclusions) {
      setError('Please provide both evidence and conclusions.');
      setSuccessMessage(null);
      return;
    }
    try {
      const reviewDocRef = await addDoc(collection(firestore, 'reviews'), {
        reportId: report.id,
        reviewedBy: currentUser.uid,
        evidence,
        conclusions,
        createdAt: serverTimestamp(),
      });
      console.log('Review added with ID:', reviewDocRef.id);

      const reportRef = doc(firestore, 'reports', report.id);
      const updatePayload = {
        status: 'reviewed',
        result: classifyConclusion(conclusions),
        updatedAt: serverTimestamp(),
      };

      await updateDoc(reportRef, updatePayload);
      console.log('Report updated successfully with payload:', updatePayload);

      setError(null);
      setSuccessMessage('Review submitted successfully!');

      setTimeout(() => {
        navigate('/Dashboard');
      }, 2000);
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review: ' + err.message);
      setSuccessMessage(null);
    }
  };

  const classifyConclusion = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('misinformation')) return 'misinformation';
    if (lowerText.includes('not misinformation')) return 'not_misinformation';
    return 'more_context_needed';
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      console.log('User signed out successfully.');
      navigate('/');
      console.log('Navigated to Login page.');
    } catch (err) {
      console.error('Failed to logout:', err.message);
      setError('Failed to logout. Please try again.');
    }
  };

  const handleBack = () => {
    navigate('/dashboard');
  };

  const pageVariants = {
    initial: { opacity: 0, x: '100vw' },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: '-100vw' },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  return (
    <>
      <button 
        onClick={handleBack} 
        className="back-btn" 
        aria-label="Back to Dashboard"
      >
        <FaArrowLeft />
      </button>
      <div className="logout-container">
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      <motion.div
        className="reviewer-wrapper"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <div className="reviewer-page">
          <div className="reviewer-container">
            <h1>Transparency Logs</h1>
            <h2>Review Report</h2>
            {error && <p className="error">{error}</p>}
            {successMessage && <p className="success">{successMessage}</p>}
            {report ? (
              <>
                <div className="report-field">
                  <p className="report-label"><strong>Link:</strong></p>
                  <p className="report-link">
                    <a href={report.link} target="_blank" rel="noopener noreferrer">{report.link}</a>
                  </p>
                </div>
                <div className="report-field">
                  <p className="report-label"><strong>Description:</strong></p>
                  <p className="report-description">{report.description}</p>
                </div>
                <form onSubmit={handleSubmit}>
                  <label htmlFor="evidence">Evidence and Sources</label>
                  <textarea
                    id="evidence"
                    value={evidence}
                    onChange={(e) => setEvidence(e.target.value)}
                    placeholder="Provide any URLs or references to the data or articles used to support or refute the claim."
                    required
                  />
                  <label htmlFor="conclusions">Conclusions</label>
                  <textarea
                    id="conclusions"
                    value={conclusions}
                    onChange={(e) => setConclusions(e.target.value)}
                    placeholder="Brief explanation of the review outcomes. What do you conclude?"
                    required
                  />
                  <button type="submit">Submit</button>
                </form>
              </>
            ) : (
              <p>Loading report...</p>
            )}
          </div>
        </div>
      </motion.div>
    </>
  );
}

export default Reviewer;