// src/pages/AdminPanel.js - Para que veas y apruebes suscriptores
import React, { useState, useEffect } from 'react';
import emailService from '../services/emailService';

const AdminPanel = () => {
  const [subscribers, setSubscribers] = useState([]);

  useEffect(() => {
    loadSubscribers();
  }, []);

  const loadSubscribers = () => {
    const pending = emailService.getPendingSubscribers();
    setSubscribers(pending);
  };

  const handleApprove = (id) => {
    emailService.approveSubscriber(id);
    loadSubscribers();
    alert('Subscriber approved and welcome email sent!');
  };

  return (
    <div style={{ padding: '20px', maxWidth: '800px', margin: '0 auto' }}>
      <h1>MyBabyHabits Admin - Newsletter Subscribers</h1>
      
      <h2>Pending Approvals ({subscribers.length})</h2>
      
      {subscribers.length === 0 ? (
        <p>No pending subscribers.</p>
      ) : (
        <div>
          {subscribers.map(sub => (
            <div key={sub.id} style={{ 
              border: '1px solid #ddd', 
              padding: '15px', 
              margin: '10px 0',
              borderRadius: '8px'
            }}>
              <h3>{sub.email}</h3>
              <p>Registered: {new Date(sub.timestamp).toLocaleString()}</p>
              <p>Source: {sub.source}</p>
              
              <button 
                onClick={() => handleApprove(sub.id)}
                style={{
                  background: '#4CAF50',
                  color: 'white',
                  border: 'none',
                  padding: '10px 20px',
                  borderRadius: '4px',
                  cursor: 'pointer'
                }}
              >
                ✅ Approve & Send Welcome Email
              </button>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default AdminPanel;