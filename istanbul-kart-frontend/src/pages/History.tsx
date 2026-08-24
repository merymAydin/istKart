import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import "./History.css";

interface Transaction {
  id: number;
  amount: number;
  transactionType: string;
  transactionDate: string;
}

const History: React.FC = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const [transactions, setTransactions] = useState<Transaction[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  // Wallet sayfasından gönderdiğimiz kart numarasını alıyoruz
  const cardNumber = location.state?.cardNumber;

useEffect(() => {
    if (!cardNumber) {
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setIsLoading(false);
      return;
    }

    const fetchHistory = async () => {
      try {
        const token = localStorage.getItem("token");
        // Backend'deki endpoint'ine göre burayı düzenleyebilirsin
        const response = await fetch(`http://localhost:8080/api/transactions/card/${cardNumber}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        if (response.ok) {
          const data = await response.json();
          // İşlemleri en yeniden eskiye sıralayalım
          const sortedData = data.sort((a: Transaction, b: Transaction) => 
            new Date(b.transactionDate).getTime() - new Date(a.transactionDate).getTime()
          );
          setTransactions(sortedData);
        }
      } catch (error) {
        console.error("History could not loaded:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, [cardNumber]);

  return (
    <div className="history-container">
      <header className="history-header">
        <button className="back-btn" onClick={() => navigate("/wallet")}>
          <svg width={20} height={20} fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" d="M15 19l-7-7 7-7" />
          </svg>
          Back to Wallet
        </button>
        <h1>Transaction History</h1>
        <p>Card: {cardNumber ? cardNumber.match(/.{1,4}/g)?.join(' ') : "Unknown"}</p>
      </header>

      <div className="history-content">
        {isLoading ? (
          <div className="loading-state">Loading your transactions...</div>
        ) : !cardNumber ? (
          <div className="empty-state">No card selected. Please go back to your wallet.</div>
        ) : transactions.length === 0 ? (
          <div className="empty-state">No transactions found for this card yet.</div>
        ) : (
          <ul className="timeline">
            {transactions.map((tx) => {
              // 'description' yerine backend'den gelen 'transactionType' alanını okuyoruz
              const desc = tx.transactionType || "İşlem";
              
              // Veritabanından - (eksi) gelmişse VEYA içinde 'geçiş', 'ride', 'pass' geçiyorsa bu bir harcamadır
              const isSpend = tx.amount < 0 || 
                              desc.toLowerCase().includes("geçiş") || 
                              desc.toLowerCase().includes("ride") || 
                              desc.toLowerCase().includes("pass");
                              
              // 0 TL'lik harcamalar abonmandır
              const isAbonmanRide = isSpend && (tx.amount === 0 || tx.amount === 0.0);
              
              return (
                <li key={tx.id} className="timeline-item">
                  <div className={`timeline-icon ${isSpend ? "spend" : "topup"}`}>
                    {isSpend ? (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M20 12H4M10 18l-6-6 6-6" />
                      </svg>
                    ) : (
                      <svg width="20" height="20" fill="none" stroke="currentColor" strokeWidth="2" viewBox="0 0 24 24">
                        <path strokeLinecap="round" strokeLinejoin="round" d="M12 4v16m8-8H4" />
                      </svg>
                    )}
                  </div>
                  <div className="timeline-content">
                    <div className="timeline-header">
                      <h4>{desc}</h4> 
                      <span className={`tx-amount ${isSpend ? "negative" : "positive"}`}>
                        {isAbonmanRide 
                          ? "-1 Ride" 
                          : `${tx.amount < 0 ? "-" : "+"}₺${Math.abs(tx.amount).toFixed(2)}`
                        }
                      </span>
                    </div>
                    <span className="tx-date">
                      {new Date(tx.transactionDate).toLocaleString()}
                    </span>
                  </div>
                </li>
              );
            })}
          </ul>
        )}
      </div>
    </div>
  );
};

export default History;