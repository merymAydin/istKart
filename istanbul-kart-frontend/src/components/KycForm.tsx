import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';
import './KycForm.css';
import Loader from './Loader';

interface KycFormProps {
  username: string;
  firstName: string; 
  lastName: string;  
  cardType: string;  
}

export default function KycForm({ username, firstName, lastName, cardType }: KycFormProps) {
  const [step, setStep] = useState<number>(1);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  
  // YENİ EKLENEN STATE: Başarı durumunu kontrol etmek için
  const [isSuccess, setIsSuccess] = useState<boolean>(false);
  
  const navigate = useNavigate();

  const [formData, setFormData] = useState({
    educationStatus: '',
    employmentStatus: '',
    occupation: '',
    company: '',
    monthlyIncome: '',
    city: '',
    district: '',
    fullAddress: '',
  });

  const [identityImage, setIdentityImage] = useState<File | null>(null);
  const [selfieImage, setSelfieImage] = useState<File | null>(null);

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const nextStep = () => setStep(step + 1);
  const prevStep = () => setStep(step - 1);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setIsLoading(true);

    const activeUsername = localStorage.getItem("username") || 
                           localStorage.getItem("userName") || 
                           localStorage.getItem("user") || 
                           username;

    const data = new FormData();
    data.append('username', activeUsername);
    data.append('firstName', firstName);
    data.append('lastName', lastName);
    data.append('educationStatus', formData.educationStatus);
    data.append('employmentStatus', formData.employmentStatus);
    data.append('occupation', formData.occupation);
    data.append('company', formData.company);
    data.append('monthlyIncome', formData.monthlyIncome);
    data.append('city', formData.city);
    data.append('district', formData.district);
    data.append('fullAddress', formData.fullAddress);
    data.append('cardType', cardType); 

    if (identityImage) {
      data.append('identityImage', identityImage);
    }
    if (selfieImage) {
      data.append('selfieImage', selfieImage);
    }

    try {
      const token = localStorage.getItem("token");

      await axios.post('http://localhost:8080/api/kyc/apply', data, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization': `Bearer ${token}`
        },
      });
      
      // ALERT'İ KALDIRDIK. BAŞARILI DURUMA GEÇİYORUZ.
      setIsLoading(false);
      setIsSuccess(true);
      
      // 3 Saniye boyunca başarı ekranını gösterip Cüzdana yönlendiriyoruz
      setTimeout(() => {
        navigate('/wallet'); 
      }, 3000);

    } catch (err: unknown) {
      setIsLoading(false);
      if (axios.isAxiosError(err)) {
        const errorData = err.response?.data;
        const errorMessage = typeof errorData === 'string' 
          ? errorData 
          : (errorData && typeof errorData === 'object' && errorData !== null)
            ? ((errorData as Record<string, unknown>).message as string || JSON.stringify(errorData))
            : err.message;
        alert("Verification Failed: " + errorMessage);
      } else if (err instanceof Error) {
        alert("Error: " + err.message);
      } else {
        alert("An unexpected error occurred.");
      }
    } 
    // finally bloğunu kaldırdık çünkü setIsLoading(false) işlemlerini try-catch içinde spesifik yönettik.
  };

  // 1. EKRAN: BAŞARILI OLDUĞUNDA (Hepsi Yeşil)
  if (isSuccess) {
    return (
      <div className="kyc-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        
        {/* Tüm Adımların Yeşil Olduğu Tracker */}
        <div className="stepper-wrapper" style={{ width: '100%', marginBottom: '50px' }}>
          <div className="stepper-track">
            <div className="stepper-fill" style={{ width: '100%' }}></div>
          </div>
          <div className="stepper-steps">
            {["Employment", "Address", "Identity", "Face Control"].map((label, index) => (
              <div key={index} className="stepper-item">
                <div className="step-icon active">
                  <svg stroke="white" strokeWidth={2} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="m4.5 12.75 6 6 9-13.5" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                </div>
                <div className="step-name active-text">{label}</div>
              </div>
            ))}
          </div>
        </div>

        <div style={{ width: 80, height: 80, borderRadius: '50%', backgroundColor: '#4CAF50', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: 20 }}>
          <svg stroke="white" strokeWidth={4} viewBox="0 0 24 24" fill="none" width="40" height="40">
            <path d="m4.5 12.75 6 6 9-13.5" strokeLinejoin="round" strokeLinecap="round" />
          </svg>
        </div>
        <h3 style={{ color: '#4CAF50', marginBottom: '15px', textAlign: 'center' }}>Application verified by AI and successfully submitted!</h3>
        <p style={{ color: '#666', textAlign: 'center', fontWeight: '500' }}>Redirecting to your wallet...</p>
      </div>
    );
  }

  // 2. EKRAN: YÜKLEME (AI Analiz Ediyor)
  if (isLoading) {
    return (
      <div className="kyc-container" style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '400px' }}>
        <h3 style={{ marginBottom: '30px', color: '#333' }}>AI Verification in Progress...</h3>
        <Loader />
        <p style={{ marginTop: '30px', color: '#666', textAlign: 'center' }}>
          Our AI system is currently analyzing your ID and Face.<br/>Please do not close this page.
        </p>
      </div>
    );
  }

  // 3. EKRAN: STANDART FORM
  return (
    <div className="kyc-container">
      
      <div className="stepper-wrapper">
        <div className="stepper-track">
          <div 
            className="stepper-fill" 
            style={{ 
              width: step === 1 ? '32px' : step === 2 ? 'calc(33.33% + 16px)' : step === 3 ? 'calc(66.66% + 16px)' : '100%' 
            }}
          ></div>
        </div>

        <div className="stepper-steps">
          {["Employment", "Address", "Identity", "Face Control"].map((label, index) => {
            const stepNum = index + 1;
            const isActive = step === stepNum;
            const isCompleted = step > stepNum;

            return (
              <div key={stepNum} className="stepper-item">
                <div className={`step-icon ${isActive || isCompleted ? 'active' : ''}`}>
                  <svg stroke={isActive || isCompleted ? "white" : "#a3a3a3"} strokeWidth={2} viewBox="0 0 24 24" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path d="m4.5 12.75 6 6 9-13.5" strokeLinejoin="round" strokeLinecap="round" />
                  </svg>
                </div>
                <div className={`step-name ${isActive || isCompleted ? 'active-text' : ''}`}>{label}</div>
              </div>
            );
          })}
        </div>
      </div>
      
      <h2 style={{ textAlign: 'center', marginBottom: '20px', fontSize: '20px' }}>
        Step {step}: {step === 1 ? "Employment & Education" : step === 2 ? "Address Verification" : step === 3 ? "Identity Verification" : "Face Control"}
      </h2>
      
      <form onSubmit={step === 4 ? handleSubmit : (e) => { e.preventDefault(); nextStep(); }}>
        
        {step === 1 && (
          <div className="step-content">
            <select name="educationStatus" value={formData.educationStatus} onChange={handleChange} required>
              <option value="">Education Status</option>
              <option value="Bachelor's">Bachelor's Degree</option>
              <option value="Associate">Associate Degree</option>
              <option value="Master's">Master's Degree</option>
              <option value="High School">High School</option>
            </select>
            
            <select name="employmentStatus" value={formData.employmentStatus} onChange={handleChange} required>
              <option value="">Employment Status</option>
              <option value="Employed">Employed</option>
              <option value="Student">Student</option>
              <option value="Unemployed">Unemployed</option>
            </select>
            
            <input 
              type="text" 
              name="occupation" 
              placeholder="Occupation" 
              value={formData.occupation} 
              onChange={handleChange} 
              disabled={formData.employmentStatus === 'Student'} 
              required={formData.employmentStatus !== 'Student'} 
            />
            
            <input 
              type="text" 
              name="company" 
              placeholder="Company / Institution" 
              value={formData.company} 
              onChange={handleChange} 
              disabled={formData.employmentStatus === 'Student'} 
              required={formData.employmentStatus !== 'Student'} 
            />
            
            <input 
              type="number" 
              name="monthlyIncome" 
              placeholder="Average Monthly Income (₺)" 
              value={formData.monthlyIncome} 
              onChange={handleChange} 
              required 
            />
          </div>
        )}

        {step === 2 && (
          <div className="step-content">
            <input type="text" name="city" placeholder="City" value={formData.city} onChange={handleChange} required />
            <input type="text" name="district" placeholder="District" value={formData.district} onChange={handleChange} required />
            <textarea name="fullAddress" placeholder="Full Address" value={formData.fullAddress} onChange={handleChange} required />
          </div>
        )}

        {step === 3 && (
          <div className="step-content">
            <p>Please upload the front side of your ID card (Google Vision OCR verification will be performed).</p>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setIdentityImage(e.target.files?.[0] || null)} 
              required 
            />
          </div>
        )}

        {step === 4 && (
          <div className="step-content">
            <p>Please upload a selfie for face verification (Google Vision Face Detection).</p>
            <input 
              type="file" 
              accept="image/*" 
              onChange={(e) => setSelfieImage(e.target.files?.[0] || null)} 
              required 
            />
          </div>
        )}

        <div className="button-group">
          {step > 1 && <button type="button" onClick={prevStep}>Back</button>}
          <button type="submit">{step === 4 ? "Complete Application" : "Next"}</button>
        </div>
      </form>
    </div>
  );
}