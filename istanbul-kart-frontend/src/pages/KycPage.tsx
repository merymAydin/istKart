import { useLocation } from 'react-router-dom';
import KycForm from '../components/KycForm'; // Yolunu kendi projene göre ayarla

export default function KycPage() {
  const location = useLocation();
  
  // Yönlendirmeden gelen kart tipini al (Yoksa NORMAL yap)
  const selectedCardType = location.state?.cardType || "NORMAL"; 


  const currentUsername = localStorage.getItem("username") || localStorage.getItem("user") || "";
  const currentFirstName = localStorage.getItem("firstName") || "";
  const currentLastName = localStorage.getItem("lastName") || "";

  return (
    <KycForm 
      username={currentUsername} 
      firstName={currentFirstName} 
      lastName={currentLastName} 
      cardType={selectedCardType} 
    />
  );
}