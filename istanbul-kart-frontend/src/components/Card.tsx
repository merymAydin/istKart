import React from 'react';
import styled from 'styled-components';

interface CardProps {
  balance: number;
  subscription: number;
  cardType: string;
  cardNumber: string;
  userName: string;
}

const Card: React.FC<CardProps> = ({ balance, subscription, cardType, cardNumber, userName }) => {

  const formatCardNumber = (numberStr: string) => {
    if (!numberStr) return '**** **** **** ****';
    const num = numberStr.padEnd(16, '*');
    return `${num.slice(0, 4)} ${num.slice(4, 8)} ${num.slice(8, 12)} ${num.slice(12, 16)}`;
  };

  const isSubscriptionActive = subscription > 0;
  const displayTitle = isSubscriptionActive ? 'KALAN ABONMAN' : 'GÜNCEL BAKIYE';
  const displayValue = isSubscriptionActive ? `${subscription} GEÇİŞ` : `₺${balance.toFixed(2)}`;

  return (
    <StyledWrapper $cardType={cardType}>
      <div className="flip-card">
        <div className="flip-card-inner">
          
          <div className="flip-card-front">
            <p className="heading_8264">ISTANBULKART</p>
            
            <svg version="1.1" className="contactless" id="Layer_1" xmlns="http://www.w3.org/2000/svg" x="0px" y="0px" width="24px" height="24px" viewBox="0 0 50 50" xmlSpace="preserve">  
              <image id="image0" width={50} height={50} x={0} y={0} href="data:image/png;base64,iVBORw0KGgoAAAANSUhEUgAAADIAAAAyCAQAAAC0NkA6AAAABGdBTUEAALGPC/xhBQAAACBjSFJN
              AAB6JgAAgIQAAPoAAACA6AAAdTAAAOpgAAA6mAAAF3CculE8AAAAAmJLR0QA/4ePzL8AAAAJcEhZ
              cwAACxMAAAsTAQCanBgAAAAHdElNRQfnAg0IEzgIwaKTAAADDklEQVRYw+1XS0iUURQ+f5qPyjQf
              lGRFEEFK76koKGxRbWyVVLSOgsCgwjZBJJYuKogSIoOonUK4q3U0WVBWFPZYiIE6kuArG3VGzK/F
              fPeMM/MLt99/NuHdfPd888/57jn3nvsQWWj/VcMlvMMd5KRTogqx9iCdIjUUmcGR9ImUYowyP3xN
              GQJoRLVaZ2DaZf8kyjEJALhI28ELioyiwC+Rc3QZwRYyO/DH51hQgWm6DMIh10KmD4u9O16K49it
              VoPOAmcGAWWOepXIRScAoJZ2Frro8oN+EyTT6lWkkg6msZfMSR35QTJmjU0g15tIGSJ08ZZMJkJk
              HpNZgSkyXosS13TkJpZ62mPIJvOSzC1bp8vRhhCakEk7G9/o4gmZdbpsTcKu0m63FbnBP9Qrc15z
              bkbemfgNDtEOI8NO5L5O9VYyRYgmJayZ9nPaxZrSjW4+F6Uw9yQqIiIZwhp2huQTf6OIvCZyGM6g
              DJBZbyXifJXr7FZjGXsdxADxI7HUJFB6iWvsIhFpkoiIiGTJfjJfiCuJg2ZEspq9EHGVpYgzKqwJ
              qSAOEwuJQ/pxPvE3cYltJCLdxBLiSKKIE5HxJKcTRNeadxfhDiuYw44zVs1dxKwRk/uCxIiQkxKB
              sSctRVAge9g1E15EHE6yRUaJecRxcWlukdRIbGFOSZCMWQA/iWauIP3slREHXPyliqBcrrD71Amz
              Z+rD1Mt2Yr8TZc/UR4/YtFnbijnHi3UrN9vKQ9rPaJf867ZiaqDB+czeKYmd3pNa6fuI75MiC0uX
              XSR5aEMf7s7a6r/PudVXkjFb/SsrCRfROk0Fx6+H1i9kkTGn/E1vEmt1m089fh+RKdQ5O+xNJPUi
              cUIjO0Dm7HwvErEr0YxeibL1StSh37STafE4I7zcBdRq1DiOkdmlTJVnkQTBTS7X1FYyvfO4piaI
              nKbDCDaT2anLudYXCRFsQBgAcIF2/Okwgvz5+Z4tsw118dzruvIvjhTB+HOuWy8UvovEH6beitBK
              xDyxm9MmISKCWrzB7bSlaqGlsf0FC0gMjzTg6GgAAAAldEVYdGRhdGU6Y3JlYXRlADIwMjMtMDIt
              MTNUMDg6MTk6NTYrMDA6MDCjlq7LAAAAJXRFWHRkYXRlOm1vZGlmeQAyMDIzLTAyLTEzVDA4OjE5
              OjU2KzAwOjAw0ssWdwAAACh0RVh0ZGF0ZTp0aW1lc3RhbXAAMjAyMy0wMi0xM1QwODoxOTo1Nisw
              MDowMIXeN6gAAAAASUVORK5CYII=" />
            </svg>

            <div className="balance-info">
              <p className="balance-title">{displayTitle}</p>
              <p className="balance-value">{displayValue}</p>
            </div>

            <p className="number">{formatCardNumber(cardNumber)}</p>
            <p className="name">{userName}</p>
          </div>

          <div className="flip-card-back"></div>

        </div>
      </div>
    </StyledWrapper>
  );
}

const getColors = (type: string) => {
  switch (type) {
    case 'STUDENT': 
      return { bg: 'linear-gradient(135deg, #2563eb, #1e3a8a)' };
    case 'ELDERLY': 
      return { bg: 'linear-gradient(135deg, #7c3aed, #4c1d95)' };
    case 'NORMAL': 
    default:
      return { bg: 'linear-gradient(135deg, #dc2626, #7f1d1d)' };
  }
};

const StyledWrapper = styled.div<{ $cardType: string }>`
  .flip-card {
    background-color: transparent;
    width: 320px;
    height: 200px; 
    perspective: 1000px;
    color: white;
    font-family: 'Arial', sans-serif;
  }

  .heading_8264 {
    position: absolute;
    letter-spacing: .15em;
    font-size: 0.7em;
    font-weight: bold;
    top: 1.5em;
    right: 1.5em;
    opacity: 0.8;
  }

  .contactless {
    position: absolute;
    top: 4.5em;
    right: 1.8em;
    opacity: 0.85;
  }

  .balance-info {
    position: absolute;
    top: 2em;
    left: 1.5em;
  }

  .balance-title {
    font-size: 0.6em;
    letter-spacing: 0.1em;
    opacity: 0.8;
    margin: 0 0 5px 0;
  }

  .balance-value {
    font-size: 1.5em;
    font-weight: bold;
    margin: 0;
    text-shadow: 0px 2px 4px rgba(0,0,0,0.3);
  }

  .number {
    position: absolute;
    font-family: 'Courier New', Courier, monospace;
    font-weight: bold;
    font-size: 1.2em;
    letter-spacing: 2px;
    bottom: 3.5em;
    left: 1.2em;
    text-shadow: 1px 1px 2px rgba(0,0,0,0.5);
  }

  .name {
    position: absolute;
    font-weight: bold;
    font-size: 0.8em;
    letter-spacing: 0.1em;
    bottom: 1.5em;
    left: 1.8em;
    text-transform: uppercase;
  }

  .flip-card-inner {
    position: relative;
    width: 100%;
    height: 100%;
    transition: transform 0.8s cubic-bezier(0.175, 0.885, 0.32, 1.275);
    transform-style: preserve-3d;
  }

  .flip-card:hover .flip-card-inner {
    transform: rotateY(180deg);
  }

  .flip-card-front, .flip-card-back {
    box-shadow: 0 15px 35px rgba(0,0,0,0.3);
    position: absolute;
    display: flex;
    flex-direction: column;
    width: 100%;
    height: 100%;
    -webkit-backface-visibility: hidden;
    backface-visibility: hidden;
    border-radius: 16px; 
  }

  .flip-card-front {
    background: ${({ $cardType }) => getColors($cardType).bg};
  }

  .flip-card-back {
    background: ${({ $cardType }) => getColors($cardType).bg};
    transform: rotateY(180deg);
  }
`;

export default Card;