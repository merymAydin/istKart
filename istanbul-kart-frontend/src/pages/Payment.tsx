import React, { useState, useEffect } from "react";
import { useNavigate, useLocation } from "react-router-dom";
import styled from "styled-components";
import successVideo from "../assets/success-animation.mp4";

const Payment: React.FC = () => {
  const navigate = useNavigate();
  const location = useLocation(); // location tanımlandı

  const [isProcessing, setIsProcessing] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);

  // Yükleme Tipi State'i: Eğer Dashboard'dan openAbonman geldiyse direkt true başlar!
  const [isSubscribed, setIsSubcribed] = useState(
    location.state?.openAbonman || false,
  );
  const [cardType, setCardType] = useState("REGULAR");

  // Form verileri için state'ler
  const [amount, setAmount] = useState("");
  const [cardHolderName, setCardHolderName] = useState("");
  const [creditCardNumber, setCreditCardNumber] = useState("");
  const [expiryDate, setExpiryDate] = useState("");
  const [cvc, setCvc] = useState("");
  const [istanbulCardNumber, setIstanbulCardNumber] = useState("");

  // Sayfa açıldığında kullanıcının mevcut İstanbulkart numarasını ve tipini çek
  useEffect(() => {
    const fetchUserCard = async () => {
      const token = localStorage.getItem("token");
      if (!token) return;

      try {
        const response = await fetch(
          "http://localhost:8080/api/cards/my-card",
          {
            headers: { Authorization: `Bearer ${token}` },
          },
        );

        if (response.ok) {
          const data = await response.json();
          if (data.exists && data.cardNumber) {
            setIstanbulCardNumber(data.cardNumber);
            if (data.cardType) setCardType(data.cardType);
          }
        }
      } catch (error) {
        console.error("İstanbulkart bilgileri alınamadı:", error);
      }
    };

    fetchUserCard();
  }, []);

  // Abonman fiyatını dinamik hesapla
  const abonmanPrice =
    cardType === "STUDENT" || cardType === "ÖĞRENCİ" ? 150 : 300;

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!istanbulCardNumber) {
      alert("Yükleme yapılacak aktif bir İstanbulkart bulunamadı!");
      return;
    }

    // Backend'e gidecek kesin tutarı belirle
    const finalAmount = isSubscribed ? abonmanPrice : parseFloat(amount);

    if (!isSubscribed && (isNaN(finalAmount) || finalAmount <= 0)) {
      alert("Lütfen geçerli bir tutar giriniz.");
      return;
    }

    setIsProcessing(true);
    const [expireMonth, expireYear] = expiryDate.split("/");

    const paymentData = {
      cardNumber: istanbulCardNumber,
      amount: finalAmount,
      subscription: isSubscribed,
      cardHolderName: cardHolderName,
      creditCardNumber: creditCardNumber,
      expireMonth: expireMonth,
      expireYear: expireYear,
      cvc: cvc,
    };

    try {
      const token = localStorage.getItem("token");
      const response = await fetch("http://localhost:8080/api/payment/topup", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(paymentData),
      });

      if (response.ok) {
        setIsProcessing(false);
        setIsSuccess(true);

        setTimeout(() => {
          navigate("/dashboard");
          window.location.reload();
        }, 3000);
      } else {
        const errorData = await response.text();
        console.error("Backend hata detayı:", errorData);
        alert(`Ödeme başarısız: ${errorData || "Bilinmeyen hata"}`);
        setIsProcessing(false);
      }
    } catch (error) {
      console.error("Ödeme hatası:", error);
      setIsProcessing(false);
    }
  };

  return (
    <StyledWrapper>
      <div className="payment-page">
        {isSuccess ? (
          <SuccessContainer>
            <video width="256" height="256" autoPlay loop muted playsInline>
              <source src={successVideo} type="video/mp4" />
            </video>
            <h2>Payment Successful! Redirecting...</h2>
          </SuccessContainer>
        ) : (
          <section className="add-card page">
            <form className="form" onSubmit={handlePayment}>
              <div className="secure-header">
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="28"
                  height="28"
                  viewBox="0 0 24 24"
                  fill="#10b981"
                  stroke="white"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{ marginRight: "8px" }}
                >
                  <path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z" />
                </svg>
                <h2>Secure Payment</h2>
              </div>

              {/* YÜKLEME TİPİ SEÇİCİSİ EKLENDİ */}
              <div className="payment-type-toggle">
                <label
                  className={`toggle-option ${!isSubscribed ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    checked={!isSubscribed}
                    onChange={() => setIsSubcribed(false)}
                  />
                  Transfer
                </label>
                <label
                  className={`toggle-option ${isSubscribed ? "active" : ""}`}
                >
                  <input
                    type="radio"
                    checked={isSubscribed}
                    onChange={() => setIsSubcribed(true)}
                  />
                  Subscription
                </label>
              </div>

              <label className="label">
                <span className="title">
                  {isSubscribed ? "Abonman Tutarı (TL)" : "Amount to Load (TL)"}
                </span>
                <input
                  className="input-field amount-input"
                  type={isSubscribed ? "text" : "number"}
                  placeholder="E.g: 100"
                  value={isSubscribed ? abonmanPrice : amount}
                  onChange={(e) => !isSubscribed && setAmount(e.target.value)}
                  disabled={isSubscribed} // Abonman ise elle girmeyi engelle
                  style={{
                    cursor: isSubscribed ? "not-allowed" : "text",
                    opacity: isSubscribed ? 0.8 : 1,
                  }}
                  required
                />
              </label>

              <label className="label">
                <span className="title">Name</span>
                <input
                  className="input-field"
                  type="text"
                  placeholder="Ad Soyad"
                  value={cardHolderName}
                  onChange={(e) => setCardHolderName(e.target.value)}
                  required
                />
              </label>

              <label className="label">
                <span className="title">Credit Card Number</span>
                <input
                  className="input-field"
                  type="text"
                  placeholder="0000 0000 0000 0000"
                  value={creditCardNumber}
                  onChange={(e) => setCreditCardNumber(e.target.value)}
                  required
                />
              </label>

              <div className="split">
                <label className="label">
                  <span className="title">Expiry Date (MM/YY)</span>
                  <input
                    className="input-field"
                    type="text"
                    placeholder="MM/YY (Örn: 06/28)"
                    value={expiryDate}
                    onChange={(e) => setExpiryDate(e.target.value)}
                    required
                  />
                </label>

                <label className="label">
                  <span className="title">CVV</span>
                  <input
                    className="input-field"
                    type="number"
                    placeholder="123"
                    value={cvc}
                    onChange={(e) => setCvc(e.target.value)}
                    required
                  />
                </label>
              </div>

              <div className="btn-container-wrapper">
                <button
                  type="submit"
                  className="container"
                  disabled={isProcessing}
                  style={{
                    border: "none",
                    background: "none",
                    padding: 0,
                    width: "100%",
                  }}
                >
                  <div className="left-side">
                    <div className="card">
                      <div className="card-line" />
                      <div className="buttons" />
                    </div>
                    <div className="post">
                      <div className="post-line" />
                      <div className="screen">
                        <div className="dollar">₺</div>
                      </div>
                      <div className="numbers" />
                      <div className="numbers-line2" />
                    </div>
                  </div>
                  <div className="right-side">
                    <div className="new">
                      {isProcessing ? "Processing..." : "Checkout"}
                    </div>
                    <svg
                      className="arrow"
                      xmlns="http://www.w3.org/2000/svg"
                      width={512}
                      height={512}
                      viewBox="0 0 451.846 451.847"
                    >
                      <path
                        d="M345.441 248.292L151.154 442.573c-12.359 12.365-32.397 12.365-44.75 0-12.354-12.354-12.354-32.391 0-44.744L278.318 225.92 106.409 54.017c-12.354-12.359-12.354-32.394 0-44.748 12.354-12.359 32.391-12.359 44.75 0l194.287 194.284c6.177 6.18 9.262 14.271 9.262 22.366 0 8.099-3.091 16.196-9.267 22.373z"
                        fill="#a1a1ff"
                      />
                    </svg>
                  </div>
                </button>
              </div>
            </form>
          </section>
        )}
      </div>
    </StyledWrapper>
  );
};

const SuccessContainer = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  gap: 20px;
  background: #0c0f14;
  padding: 50px;
  border-radius: 25px;
  border: 1px solid rgba(255, 255, 255, 0.05);
  box-shadow: 0 15px 35px rgba(0, 0, 0, 0.5);

  h2 {
    color: #10b981;
    font-family: "Arial", sans-serif;
    font-size: 1.5rem;
    margin: 0;
  }
`;

const StyledWrapper = styled.div`
  .payment-page {
    min-height: 100vh;
    background-color: #0f172a;
    display: flex;
    justify-content: center;
    align-items: center;
    padding: 20px;
    font-family: "Arial", sans-serif;
  }

  .form {
    background: #0c0f14;
    box-shadow:
      0px 187px 75px rgba(0, 0, 0, 0.01),
      0px 105px 63px rgba(0, 0, 0, 0.05),
      0px 47px 47px rgba(0, 0, 0, 0.09),
      0px 12px 26px rgba(0, 0, 0, 0.1),
      0px 0px 0px rgba(0, 0, 0, 0.1);
    width: 480px;
    display: flex;
    flex-direction: column;
    gap: 15px;
    padding: 30px;
    position: relative;
    border-radius: 25px;
    border: 1px solid rgba(255, 255, 255, 0.05);
  }

  .secure-header {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
    margin-bottom: 10px;
    color: #10b981;

    h2 {
      font-size: 1.2rem;
      margin: 0;
      color: #e2e8f0;
    }
  }

  /* YENİ EKLENEN TOGGLE CSS'İ */
  .payment-type-toggle {
    display: flex;
    gap: 10px;
    margin-bottom: 5px;
    background: #1e1e2f;
    padding: 6px;
    border-radius: 12px;
  }

  .toggle-option {
    flex: 1;
    text-align: center;
    padding: 10px;
    border-radius: 8px;
    cursor: pointer;
    color: #8b8e98;
    font-size: 14px;
    font-weight: 600;
    transition: all 0.3s ease;

    input {
      display: none;
    }
  }

  .toggle-option.active {
    background: #3b82f6;
    color: #ffffff;
    box-shadow: 0 4px 10px rgba(59, 130, 246, 0.3);
  }

  .form .label {
    display: flex;
    flex-direction: column;
    gap: 5px;
  }

  .form .label:has(input:focus) .title {
    top: 0;
    left: 0;
    color: #3b82f6;
  }

  .form .label .title {
    padding: 0 10px;
    transition: all 300ms;
    font-size: 12px;
    color: #8b8e98;
    font-weight: 600;
    width: fit-content;
    top: 14px;
    position: relative;
    left: 15px;
    background: #0c0f14;
  }

  .form .input-field {
    width: 100%;
    height: 50px;
    text-indent: 15px;
    border-radius: 15px;
    outline: none;
    background-color: transparent;
    border: 1px solid #21262e;
    transition: all 0.3s;
    caret-color: #3b82f6;
    color: #aeaeae;
    font-size: 14px;
    box-sizing: border-box;
  }

  .form .input-field.amount-input {
    border-color: #3b82f6;
    color: #fff;
    font-size: 18px;
    font-weight: bold;
  }

  .form .input-field:hover:not(:disabled) {
    border-color: rgba(59, 130, 246, 0.5);
  }

  .form .input-field:focus:not(:disabled) {
    border-color: #3b82f6;
  }

  .form .split {
    display: flex;
    flex-direction: row;
    justify-content: space-between;
    width: 100%;
    gap: 15px;
  }

  .form .split label {
    width: 100%;
  }

  .btn-container-wrapper {
    display: flex;
    justify-content: center;
    margin-top: 20px;
  }

  .container {
    background-color: #1e1e2f;
    display: flex;
    width: 100%;
    height: 70px;
    position: relative;
    border-radius: 15px;
    transition: 0.3s ease-in-out;
    overflow: hidden;
    cursor: pointer;
  }

  .container:disabled {
    cursor: not-allowed;
    opacity: 0.7;
  }

  .container:hover:not(:disabled) {
    transform: scale(1.02);
    width: 180px;
  }

  .container:hover:not(:disabled) .left-side {
    width: 100%;
  }

  .left-side {
    background-color: #3b82f6;
    width: 90px;
    height: 100%;
    border-radius: 15px 4px 4px 15px;
    position: relative;
    display: flex;
    justify-content: center;
    align-items: center;
    transition: 0.3s;
    flex-shrink: 0;
    overflow: hidden;
  }

  .right-side {
    width: calc(100% - 90px);
    display: flex;
    align-items: center;
    overflow: hidden;
    justify-content: space-between;
    white-space: nowrap;
    transition: 0.3s;
    border-radius: 0 15px 15px 0;
  }

  .right-side:hover {
    background-color: #2a2a3d;
  }

  .arrow {
    width: 20px;
    height: 20px;
    margin-right: 20px;
  }

  .new {
    font-size: 18px;
    font-family: "Lexend Deca", sans-serif;
    margin-left: 20px;
    color: #d1d5db;
    font-weight: bold;
  }

  .card {
    width: 45px;
    height: 30px;
    background-color: #93c5fd;
    border-radius: 4px;
    position: absolute;
    display: flex;
    z-index: 10;
    flex-direction: column;
    align-items: center;
    box-shadow: 9px 9px 9px -2px rgba(59, 130, 246, 0.5);
  }

  .card-line {
    width: 40px;
    height: 8px;
    background-color: #60a5fa;
    border-radius: 2px;
    margin-top: 5px;
  }

  .buttons {
    width: 6px;
    height: 6px;
    background-color: #1e40af;
    box-shadow:
      0 -6px 0 0 #1e3a8a,
      0 6px 0 0 #3b82f6;
    border-radius: 50%;
    transform: rotate(90deg);
    margin: 6px 0 0 -20px;
  }

  .container:hover:not(:disabled) .card {
    animation: slide-top 1.2s cubic-bezier(0.645, 0.045, 0.355, 1) both;
  }

  .container:hover:not(:disabled) .post {
    animation: slide-post 1s cubic-bezier(0.165, 0.84, 0.44, 1) both;
  }

  @keyframes slide-top {
    0% {
      transform: translateY(0);
    }
    50% {
      transform: translateY(-50px) rotate(90deg);
    }
    60% {
      transform: translateY(-50px) rotate(90deg);
    }
    100% {
      transform: translateY(-6px) rotate(90deg);
    }
  }

  .post {
    width: 45px;
    height: 50px;
    background-color: #4b5563;
    position: absolute;
    z-index: 11;
    bottom: 5px;
    top: 70px;
    border-radius: 4px;
    overflow: hidden;
  }

  .post-line {
    width: 35px;
    height: 6px;
    background-color: #1f2937;
    position: absolute;
    border-radius: 0px 0px 2px 2px;
    right: 5px;
    top: 5px;
  }

  .post-line:before {
    content: "";
    position: absolute;
    width: 35px;
    height: 6px;
    background-color: #374151;
    top: -6px;
  }

  .screen {
    width: 35px;
    height: 16px;
    background-color: #e5e7eb;
    position: absolute;
    top: 15px;
    right: 5px;
    border-radius: 2px;
  }

  .numbers {
    width: 8px;
    height: 8px;
    background-color: #6b7280;
    box-shadow:
      0 -12px 0 0 #6b7280,
      0 12px 0 0 #6b7280;
    border-radius: 2px;
    position: absolute;
    transform: rotate(90deg);
    left: 18px;
    top: 38px;
  }

  .numbers-line2 {
    width: 8px;
    height: 8px;
    background-color: #9ca3af;
    box-shadow:
      0 -12px 0 0 #9ca3af,
      0 12px 0 0 #9ca3af;
    border-radius: 2px;
    position: absolute;
    transform: rotate(90deg);
    left: 18px;
    top: 48px;
  }

  @keyframes slide-post {
    50% {
      transform: translateY(0);
    }
    100% {
      transform: translateY(-50px);
    }
  }

  .dollar {
    position: absolute;
    font-size: 12px;
    font-family: "Lexend Deca", sans-serif;
    width: 100%;
    left: 0;
    top: 0;
    color: #3b82f6;
    text-align: center;
    font-weight: bold;
  }

  .container:hover:not(:disabled) .dollar {
    animation: fade-in-fwd 0.3s 1s backwards;
  }

  @keyframes fade-in-fwd {
    0% {
      opacity: 0;
      transform: translateY(-5px);
    }
    100% {
      opacity: 1;
      transform: translateY(0);
    }
  }

  @media only screen and (max-width: 520px) {
    .form {
      width: 100%;
      padding: 20px;
    }
  }
`;

export default Payment;
