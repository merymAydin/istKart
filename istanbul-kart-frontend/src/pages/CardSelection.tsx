import React from 'react';
import { useNavigate } from 'react-router-dom';
import './CardSelection.css';

import yellowCard from '../assets/yellow.webp';
import redCard from '../assets/redcard.webp';
import greenCard from '../assets/greencard.webp';

const CardSelection = () => {
  const navigate = useNavigate();

  const handleCardCreation = async (cardType: string) => {
    // 1. Select the correct backend endpoint based on the card type
    let endpoint = 'normal';
    if (cardType === 'STUDENT') endpoint = 'student';
    if (cardType === 'ELDERLY') endpoint = 'elderly';

    // 2. Retrieve the Bearer Token from local storage
    const token = localStorage.getItem('token'); 

    if (!token) {
      alert("Please log in first! (Token not found)");
      return;
    }

    try {
      const response = await fetch(`http://localhost:8080/api/cards/create/${endpoint}`, {
        method: 'POST',
        headers: { 
            'Content-Type': 'application/json',
            'Authorization': `Bearer ${token}` 
        }
      });

      if (response.ok) {
        const resultText = await response.text();
        console.log("Card successfully created:", resultText);
        navigate('/dashboard');
      } else {
        const errorText = await response.text();
        alert("Backend error: " + errorText);
      }
    } catch (error) {
      console.error("API connection error:", error);
      alert("Error: Cannot reach the backend. Please make sure the server is running.");
    }
  };

  return (
    <div className="card-selection-container">
      <h1 className="selection-title">You are...</h1>
      
      <div className="cards-grid">
        <div className="card-wrapper" onClick={() => handleCardCreation('ELDERLY')} style={{ cursor: 'pointer' }}>
          <div className="selection-card"><img src={yellowCard} alt="Elderly" /></div>
          <p className="card-label">Elderly</p>
        </div>

        <div className="card-wrapper" onClick={() => handleCardCreation('REGULAR')} style={{ cursor: 'pointer' }}>
          <div className="selection-card"><img src={redCard} alt="Regular" /></div>
          <p className="card-label">Regular</p>
        </div>

        <div className="card-wrapper" onClick={() => handleCardCreation('STUDENT')} style={{ cursor: 'pointer' }}>
          <div className="selection-card"><img src={greenCard} alt="Student" /></div>
          <p className="card-label">Student</p>
        </div>
      </div>
    </div>
  );
};

export default CardSelection;