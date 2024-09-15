// src/Reviewer.js

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
import './Reviewer.css';

function Reviewer() {
  const { reportId } = useParams(); // Get reportId from URL
  const { currentUser } = useContext(AuthContext); // Access current user from context
  const navigate = useNavigate(); // For navigation

  const [report, setReport] = useState(null); // State to hold report data
  const [evidence, setEvidence] = useState(''); // State for evidence input
  const [conclusions, setConclusions] = useState(''); // State for conclusions input
  const [error, setError] = useState(null); // State for error messages

  // Fetch report data when component mounts
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

  // Handle review submission
  const handleSubmit = async (event) => {
    event.preventDefault();
    if (!evidence || !conclusions) {
      setError('Please provide both evidence and conclusions.');
      return;
    }

    try {
      // Add review to 'reviews' collection
      const reviewDocRef = await addDoc(collection(firestore, 'reviews'), {
        reportId: report.id,
        reviewedBy: currentUser.uid,
        evidence,
        conclusions,
        createdAt: serverTimestamp(),
      });
      console.log('Review added with ID:', reviewDocRef.id);

      // Update report status and result
      await updateDoc(doc(firestore, 'reports', report.id), {
        status: 'reviewed', // Changed to 'reviewed'
        result: classifyConclusion(conclusions), // Should be 'confirmed', 'debunked', or 'inconclusive'
        updatedAt: serverTimestamp(), // Update updatedAt
      });
      console.log('Report updated to reviewed.');

      alert('Review submitted successfully!');
      navigate('/dashboard'); // Redirect back to Dashboard after successful review
      console.log('Navigated back to Dashboard.');
    } catch (err) {
      console.error('Error submitting review:', err);
      setError('Failed to submit review.');
    }
  };

  // Helper function to classify conclusions
  const classifyConclusion = (text) => {
    const lowerText = text.toLowerCase();
    if (lowerText.includes('misinformation')) return 'confirmed'; // confirmed
    if (lowerText.includes('not misinformation')) return 'debunked'; // debunked
    return 'inconclusive'; // inconclusive
  };

  // Handle Logout
  const handleLogout = async () => {
    try {
      await signOut(auth); // Sign out the user
      console.log('User signed out successfully.');
      navigate('/'); // Redirect to Login page after logout
      console.log('Navigated to Login page.');
    } catch (err) {
      console.error('Failed to logout:', err.message);
      setError('Failed to logout. Please try again.');
    }
  };

  // Conditional rendering based on error and report data
  if (error) {
    return (
      <div className="reviewer-container">
        <h1>Reviewer Dashboard</h1>
        <p className="error">{error}</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  if (!report) {
    return (
      <div className="reviewer-container">
        <h1>Reviewer Dashboard</h1>
        <p>Loading report...</p>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  // Check if the current user is assigned to this report
  if (report.assignedTo !== currentUser.uid) {
    return (
      <div className="reviewer-container">
        <h1>Reviewer Dashboard</h1>
        <p>You are not assigned to review this report.</p>
        <button onClick={() => navigate('/dashboard')}>Back to Dashboard</button>
        <button className="logout-btn" onClick={handleLogout}>Logout</button>
      </div>
    );
  }

  return (
    <div className="reviewer-container">
      <h1>Transparency Logs</h1>
      <h2>Review Report</h2>
      <p><strong>Link:</strong> <a href={report.link} target="_blank" rel="noopener noreferrer">{report.link}</a></p>
      <p><strong>Description:</strong> {report.description}</p>
      <form onSubmit={handleSubmit}>
        {error && <p className="error">{error}</p>}
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
      <button className="logout-btn" onClick={handleLogout}>Logout</button>
    </div>
  );
}

export default Reviewer;

// Helper function to format stage text
const formatStage = (status) => {
  switch(status) {
    case 'under_review':
      return 'Under Review';
    case 'information_gathering':
      return 'Information Gathering';
    case 'reviewed':
      return 'Reviewed';
    default:
      return status;
  }
};

// Helper function to format result text
const formatResult = (result) => {
  switch(result) {
    case 'confirmed':
      return 'Confirmed';
    case 'debunked':
      return 'Debunked';
    case 'inconclusive':
      return 'Inconclusive';
    default:
      return result;
  }
};
