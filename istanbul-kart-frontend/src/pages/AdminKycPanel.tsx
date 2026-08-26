import React, { useEffect, useState } from 'react';
import axios from 'axios';
import './AdminKycPanel.css'; // Stil dosyamızı bağlıyoruz

interface KycApplication {
  id: number;
  user: {
    username: string;
  };
  occupation: string;
  monthlyIncome: number;
  city: string;
  district: string;
  status: string;
}

export default function AdminKycPanel() {
  const [applications, setApplications] = useState<KycApplication[]>([]);
  const [isLoading, setIsLoading] = useState<boolean>(true);

  useEffect(() => {
    const fetchPendingApps = async () => {
      try {
        const token = localStorage.getItem("token");
        const res = await axios.get<KycApplication[]>('http://localhost:8080/api/admin/kyc/pending', {
          headers: { Authorization: `Bearer ${token}` }
        });
        setApplications(res.data);
      } catch (err: unknown) {
        if (axios.isAxiosError(err)) {
          console.error("An error occurred while loading applications", err.message);
        } else {
          console.error("An error occurred while loading applications", err);
        }
      } finally {
        setIsLoading(false);
      }
    };

    fetchPendingApps();
  }, []);

  const handleApprove = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:8080/api/admin/kyc/${id}/approve`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Application approved and Istanbul Card created successfully!");
      setApplications((prevApps) => prevApps.filter((app) => app.id !== id));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert("Error occurred while approving application: " + (err.response?.data || err.message));
      } else if (err instanceof Error) {
        alert("Error occurred while approving application: " + err.message);
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };

  const handleReject = async (id: number) => {
    try {
      const token = localStorage.getItem("token");
      await axios.post(`http://localhost:8080/api/admin/kyc/${id}/reject`, {}, {
        headers: { Authorization: `Bearer ${token}` }
      });
      alert("Application rejected.");
      setApplications((prevApps) => prevApps.filter((app) => app.id !== id));
    } catch (err: unknown) {
      if (axios.isAxiosError(err)) {
        alert("Error occurred while rejecting application: " + (err.response?.data || err.message));
      } else if (err instanceof Error) {
        alert("Error occurred while rejecting application: " + err.message);
      } else {
        alert("An unexpected error occurred.");
      }
    }
  };

  if (isLoading) {
    return <div className="admin-loading">Loading pending applications...</div>;
  }

  return (
    <div className="admin-container">
      <header className="admin-header">
        <h2>Admin Panel - Pending KYC Applications</h2>
        <p>Review user applications and approve them to automatically issue their Istanbul Cards.</p>
      </header>

      {applications.length === 0 ? (
        <div className="admin-empty">
          <p>No pending applications found.</p>
        </div>
      ) : (
        <div className="admin-table-wrapper">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Username</th>
                <th>Occupation</th>
                <th>Monthly Income</th>
                <th>Location</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {applications.map((app) => (
                <tr key={app.id}>
                  <td>#{app.id}</td>
                  <td className="fw-bold">{app.user?.username}</td>
                  <td>{app.occupation}</td>
                  <td>₺{app.monthlyIncome}</td>
                  <td>{app.city} / {app.district}</td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleApprove(app.id)} 
                        className="btn-approve"
                      >
                        Approve & Create
                      </button>
                      <button 
                        onClick={() => handleReject(app.id)} 
                        className="btn-reject"
                      >
                        Reject
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}