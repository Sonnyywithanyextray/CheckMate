// src/Dashboard.js

import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import { auth, firestore } from './firebase'; // Ensure Firestore is imported
import { signOut } from "firebase/auth";
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { 
  collection, 
  addDoc, 
  query, 
  where, 
  onSnapshot, 
  doc, 
  updateDoc, 
  serverTimestamp 
} from 'firebase/firestore';
import './Dashboard.css';

function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const wordLimit = 50;
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Failed to logout:', err.message);
      setError('Failed to logout. Please try again.');
    }
  };

  // Animation variants for Framer Motion
  const variants = {
    initial: { opacity: 0, scale: 0.8 },
    animate: { opacity: 1, scale: 1 },
    exit: { opacity: 0, scale: 0.8 },
  };

  // Handle Description Change with Word Limit
  const handleDescriptionChange = (event) => {
    const inputWords = event.target.value.split(/\s+/);
    if (inputWords.length <= wordLimit) {
      setDescription(event.target.value);
    } else {
      setDescription(inputWords.slice(0, wordLimit).join(' '));
    }
  };

  const remainingWords = wordLimit - description.split(/\s+/).filter(Boolean).length;

  // Fetch Queued Reports in Real-Time
  useEffect(() => {
    if (!currentUser) return; // Ensure user is authenticated

    const reportsCollection = collection(firestore, 'reports');
    const q = query(reportsCollection, where('status', '==', 'queued'));

    const unsubscribe = onSnapshot(q, (snapshot) => {
      const fetchedReports = [];
      snapshot.forEach((docSnap) => {
        fetchedReports.push({ id: docSnap.id, ...docSnap.data() });
      });
      setReports(fetchedReports);
    }, (error) => {
      console.error('Error fetching reports:', error);
      setError('Failed to fetch reports.');
    });

    return () => unsubscribe();
  }, [firestore, currentUser]);

  // Handle Report Submission
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
      console.log('Report submitted successfully.');
      setLink('');
      setDescription('');
      setError(null);
      alert('Report submitted successfully!');
    } catch (err) {
      console.error('Error submitting report:', err);
      setError('Failed to submit report. Please try again.');
    }
  };

  // Assign a Report to the Current User and Navigate to Reviewer
  const assignReport = async (reportId) => {
    console.log(`Assigning report with ID: ${reportId}`);
    const reportRef = doc(firestore, 'reports', reportId);
    try {
      await updateDoc(reportRef, {
        status: 'in_review',
        assignedTo: currentUser.uid,
        updatedAt: serverTimestamp(),
      });
      console.log('Report status updated to "in_review". Navigating to Reviewer component.');
      navigate(`/reviewer/${reportId}`);
      console.log('Navigation successful.');
    } catch (err) {
      console.error('Error assigning report:', err);
      setError('Failed to assign report. Please try again.');
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
        <form onSubmit={handleReportSubmit}>
          {error && <p className="error">{error}</p>}
          <label htmlFor="link">Link</label>
          <input 
            type="url" 
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
