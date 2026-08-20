import React from 'react';
import type { CardData } from './CardDetailModal';
import { cardsData } from '../data/cardsData';

interface CardsGridProps {
  onCardClick: (card: CardData) => void;
  slotRefs?: React.MutableRefObject<(HTMLDivElement | null)[]>;
}

const CardsGrid = React.forwardRef<HTMLDivElement, CardsGridProps>(({ onCardClick, slotRefs }, ref) => {
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
          >
            <div className="gc-header" style={{ backgroundColor: card.lightBg }}>
              <h3 style={{ color: card.themeColor }}>{card.title}</h3>
              <div 
                className="card-slot-target" 
                ref={slotRefs ? el => { slotRefs.current[index] = el; } : undefined}
              />
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