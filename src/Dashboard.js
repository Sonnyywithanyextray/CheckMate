// src/Dashboard.js
import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import { auth, firestore } from './firebase'; // Import Firestore
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, addDoc, query, where, onSnapshot, doc, updateDoc, serverTimestamp } from 'firebase/firestore';
import './Dashboard.css';

function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const wordLimit = 50;
  const [reports, setReports] = useState([]);
  const [currentReview, setCurrentReview] = useState(null);
  const [reviewResult, setReviewResult] = useState('');
  const [reviewComment, setReviewComment] = useState('');
  const [error, setError] = useState(null);

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Failed to logout:', err.message);
    }
  };

  // Animation variants
  const variants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  const handleDescriptionChange = (event) => {
    const inputWords = event.target.value.split(/\s+/);
    if (inputWords.length <= wordLimit) {
      setDescription(event.target.value);
    } else {
      setDescription(inputWords.slice(0, wordLimit).join(' '));
    }
  };

  const remainingWords = wordLimit - description.split(/\s+/).filter(Boolean).length;

  // Fetch queued reports in real-time
  useEffect(() => {
    const q = query(collection(firestore, 'reports'), where('status', '==', 'queued'));
    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReports = [];
      snapshot.forEach((doc) => {
        fetchedReports.push({ id: doc.id, ...doc.data() });
      });
      setReports(fetchedReports);
    });

    return () => unsubscribe();
  }, []);

  // Handle report submission
  const handleReportSubmit = async (e) => {
    e.preventDefault();
    if (!link || !description) {
      setError('Please provide both link and description.');
      return;
    }

    try {
      await addDoc(collection(firestore, 'reports'), {
        link,
        description,
        status: 'queued',
        submittedBy: currentUser.uid,
        assignedTo: null,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
        result: null,
      });
      setLink('');
      setDescription('');
      setError(null);
      alert('Report submitted successfully!');
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    }
  };

  // Assign a report to the current user
  const assignReport = async (reportId) => {
    const reportRef = doc(firestore, 'reports', reportId);
    try {
      await updateDoc(reportRef, {
        status: 'in_review',
        assignedTo: currentUser.uid,
        updatedAt: serverTimestamp(),
      });
      // Set the current review state
      const report = reports.find((r) => r.id === reportId);
      setCurrentReview(report);
    } catch (err) {
      console.error('Error assigning report:', err);
      setError('Failed to assign report. Please try again.');
    }
  };

  // Handle review submission
  const handleReviewSubmit = async (e) => {
    e.preventDefault();
    if (!reviewResult) {
      setError('Please select a classification result.');
      return;
    }

    try {
      const reportRef = doc(firestore, 'reports', currentReview.id);
      await updateDoc(reportRef, {
        status: 'resolved',
        result: reviewResult,
        updatedAt: serverTimestamp(),
      });

      // Add review to the 'reviews' collection
      await addDoc(collection(firestore, 'reviews'), {
        reportId: currentReview.id,
        reviewedBy: currentUser.uid,
        result: reviewResult,
        comment: reviewComment,
        createdAt: serverTimestamp(),
      });

      // Reset review state
      setCurrentReview(null);
      setReviewResult('');
      setReviewComment('');
      setError(null);
      alert('Review submitted successfully!');
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review. Please try again.');
    }
  };

  return (
    <motion.div 
      className="dashboard-container" 
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      transition={{ duration: 0.5 }}
    >
      <div className="content">
        <h1>CheckMate Dashboard</h1>
        <p>Report and find out misinformation</p>

        {/* Report Submission Form */}
        {!currentReview && (
          <form onSubmit={handleReportSubmit}>
            {error && <p className="error">{error}</p>}
            <label htmlFor="link">Link</label>
            <input 
              type="text" 
              id="link"
              placeholder="Link the source!" 
              value={link} 
              onChange={(e) => setLink(e.target.value)} 
              required
            />
            <label htmlFor="description">Description</label>
            <textarea 
              id="description"
              placeholder="Provide context to why you're reporting" 
              value={description} 
              onChange={handleDescriptionChange} 
              required
            />
            <div className="word-count">Words left: {remainingWords}</div>
            <button type="submit">Report</button>
          </form>
        )}

        {/* Current Review Interface */}
        {currentReview && (
          <div className="current-review">
            <h2>Review Report</h2>
            <p><strong>Link:</strong> <a href={currentReview.link} target="_blank" rel="noopener noreferrer">{currentReview.link}</a></p>
            <p><strong>Description:</strong> {currentReview.description}</p>
            <form onSubmit={handleReviewSubmit}>
              {error && <p className="error">{error}</p>}
              <label htmlFor="result">Classification</label>
              <select 
                id="result"
                value={reviewResult}
                onChange={(e) => setReviewResult(e.target.value)}
                required
              >
                <option value="">--Select--</option>
                <option value="misinformation">Misinformation</option>
                <option value="not_misinformation">Not Misinformation</option>
                <option value="more_context_needed">More Context Needed</option>
              </select>
              <label htmlFor="comment">Comment (Optional)</label>
              <textarea 
                id="comment"
                placeholder="Provide additional comments (optional)" 
                value={reviewComment} 
                onChange={(e) => setReviewComment(e.target.value)} 
              />
              <button type="submit">Submit Review</button>
              <button type="button" onClick={() => setCurrentReview(null)} className="cancel-btn">Cancel</button>
            </form>
          </div>
        )}

        {/* Display Queued Reports */}
        <div className="queued-reports">
          <h2>Queued Reports</h2>
          {reports.length === 0 ? (
            <p>No reports in the queue.</p>
          ) : (
            <ul>
              {reports.map((report) => (
                <li key={report.id}>
                  <p><strong>Link:</strong> <a href={report.link} target="_blank" rel="noopener noreferrer">{report.link}</a></p>
                  <p><strong>Description:</strong> {report.description}</p>
                  <button onClick={() => assignReport(report.id)}>Review</button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </motion.div>
  );
}

export default Dashboard;
