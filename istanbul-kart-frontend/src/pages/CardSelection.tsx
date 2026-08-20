import React, { useState } from "react";
import { useNavigate } from "react-router-dom";
import "./CardSelection.css";

// 1. ESKİ (KLASİK) KART GÖRSELLERİ
import regularCardImg from "../assets/redcard.webp";  
import studentCardImg from "../assets/greencard.webp"; 
import yellowCardImg from "../assets/yellow.webp"; // <-- Sarı kartı buraya ekledim

// 2. YENİ EKLENEN KART GÖRSELLERİ (Senin verdiğin doğru uzantılarla)
import plusCardImg from "../assets/plus.png";
import facilityCardImg from "../assets/blue.webp";
import cityCardImg from "../assets/tourist.webp";

const cardOptions = [
  // --- MEVCUT KARTLAR ---
  { 
    id: "NORMAL", 
    title: "Regular Card", 
    img: regularCardImg, 
    glowClass: "red-glow" 
  },
  { 
    id: "STUDENT", 
    title: "Student Card", 
    img: studentCardImg, 
    glowClass: "green-glow" 
  },
  { 
    id: "YELLOW", 
    title: "Yellow Card", 
    img: yellowCardImg, 
    glowClass: "yellow-glow" 
  },
  // --- YENİ EKLENEN KARTLAR ---
  { 
    id: "PLUS", 
    title: "Istanbul Plus", 
    img: plusCardImg, 
    glowClass: "red-glow" // Plus kartın kırmızı/turuncu tonlarına uygun glow
  },
  { 
    id: "FACILITY", 
    title: "Public Facilities (Blue)", 
    img: facilityCardImg, 
    glowClass: "blue-glow" 
  },
  { 
    id: "CITY", 
    title: "Istanbul City Card", 
    img: cityCardImg, 
    glowClass: "green-glow" 
  },
];

const CardSelection: React.FC = () => {
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<boolean>(false);

  const handleCardClick = async (cardId: string) => {
    setIsLoading(true);
    try {
      const token = localStorage.getItem("token");
      const response = await fetch(`http://localhost:8080/api/cards/create?cardType=${cardId}`, {
        method: "POST",
        headers: { Authorization: `Bearer ${token}` },
      });

      if (response.ok) {
        navigate("/"); 
      } else {
        const errorText = await response.text();
        alert("Kart oluşturulamadı: " + errorText);
      }
    } catch (error) {
      console.error("Hata:", error);
      alert("Sunucuya bağlanılamadı.");
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="card-selection-container">
      <h1 className="selection-title">Select Your Istanbulkart</h1>

      <div className="cards-grid">
        {cardOptions.map((card) => (
          <div 
            key={card.id} 
            className={`card-wrapper ${card.glowClass}`}
            onClick={() => !isLoading && handleCardClick(card.id)}
          >
            <div className="selection-card">
              <img src={card.img} alt={card.title} />
            </div>
            <div className="card-label">{card.title}</div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default CardSelection;