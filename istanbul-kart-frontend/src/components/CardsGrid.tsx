import React from 'react';
import type { CardData } from './CardDetailModal';
import { cardsData } from '../data/cardsData';

interface CardsGridProps {
  onCardClick: (card: CardData) => void;
  slotRefs: React.MutableRefObject<(HTMLDivElement | null)[]>;
  boxRefs: React.MutableRefObject<(HTMLDivElement | null)[]>; 
}

const CardsGrid = React.forwardRef<HTMLDivElement, CardsGridProps>(({ onCardClick, slotRefs, boxRefs }, ref) => {
  return (
    <section className="cards-grid-section" ref={ref}>
      <div className="grid-header">
        <h2>Find the Right Card for You</h2>
        <p>Select a card below to see application requirements and details.</p>
      </div>

      <div className="cards-grid-container">
        {cardsData.map((card, index) => (
          <div 
            key={card.id} 
            className="grid-card-box" 
            onClick={() => onCardClick(card)}
            ref={el => { boxRefs.current[index] = el; }} 
          >
            {/* DİKKAT: Arka plan rengini ayrı bir dive aldık ki rulo gibi açabilelim */}
            <div className="gc-header">
              <div className="gc-header-bg" style={{ backgroundColor: card.lightBg }}></div>
              <h3 style={{ color: card.themeColor }}>{card.title}</h3>
              
              <div className="card-slot-target" ref={el => { slotRefs.current[index] = el; }}>
                <img src={card.img} className="internal-docked-card" alt="card" />
              </div>
            </div>

            <div className="gc-body">
              <ul>
                {card.features.map((feature, idx) => (
                  <li key={idx}>
                    <span className="dot" style={{ backgroundColor: card.themeColor }}></span>
                    {feature}
                  </li>
                ))}
              </ul>
            </div>
          </div>
        ))}
      </div>
    </section>
  );
});

export default CardsGrid;