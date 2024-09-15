import React, { useContext, useState, useEffect } from 'react';
import { AuthContext } from './context/AuthContext';
import { firestore, auth } from './firebase';
import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { collection, addDoc, query, where, onSnapshot, serverTimestamp } from 'firebase/firestore';
import { signOut } from "firebase/auth";
import './Dashboard.css';
import './LogoutButton.css';

function Dashboard() {
  const { currentUser } = useContext(AuthContext);
  const navigate = useNavigate();
  const [link, setLink] = useState('');
  const [description, setDescription] = useState('');
  const wordLimit = 50;
  const [reports, setReports] = useState([]);
  const [error, setError] = useState(null);

  useEffect(() => {
    if (!currentUser) return;
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
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp(),
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

  const assignReport = (reportId) => {
    navigate(`/reviewer/${reportId}`);
  };

  const handleLogout = async () => {
    try {
      await signOut(auth);
      navigate('/');
    } catch (err) {
      console.error('Failed to logout:', err.message);
      setError('Failed to logout. Please try again.');
    }
  };

  const pageVariants = {
    initial: { opacity: 0, x: '-100vw' },
    in: { opacity: 1, x: 0 },
    out: { opacity: 0, x: '100vw' },
  };

  const pageTransition = {
    type: 'tween',
    ease: 'anticipate',
    duration: 0.5
  };

  return (
    <>
      <div className="logout-container">
        <button onClick={handleLogout} className="logout-btn">Logout</button>
      </div>
      <motion.div
        className="dashboard-container"
        initial="initial"
        animate="in"
        exit="out"
        variants={pageVariants}
        transition={pageTransition}
      >
        <div className="content">
          <h1>CheckMate Dashboard</h1>
          <p>Report and find out misinformation</p>
          <form onSubmit={handleReportSubmit}>
            {error && <p className="error">{error}</p>}
            <label htmlFor="link">Link</label>
            <input type="url" id="link" placeholder="Link the source!" value={link} onChange={(e) => setLink(e.target.value)} required />
            <label htmlFor="description">Description</label>
            <textarea id="description" placeholder="Provide context to why you're reporting" value={description} onChange={(e) => setDescription(e.target.value)} required />
            <div className="word-count">Words left: {description.split(/\s+/).filter(Boolean).length}/{wordLimit}</div>
            <button type="submit">Report</button>
          </form>
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
      </motion.div>
    </>
  );
}

export default Dashboard;