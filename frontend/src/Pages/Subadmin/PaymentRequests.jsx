import React, { useEffect, useState } from 'react';
import axios from 'axios';
import { FaCheck, FaTimes, FaArrowLeft, FaClock } from 'react-icons/fa';
import { useNavigate } from 'react-router-dom';
import Base_url from '../config';

const PaymentRequests = () => {
    const [requests, setRequests] = useState([]);
    const [loading, setLoading] = useState(true);
    const [processingId, setProcessingId] = useState(null);
    const navigate = useNavigate();
    const token = sessionStorage.getItem('accessToken');

    useEffect(() => {
        fetchPaymentRequests();
    }, []);

    const fetchPaymentRequests = async () => {
        try {
            setLoading(true);
            const res = await axios.get(`${Base_url}/payment/requests`, {
                headers: { Authorization: `Bearer ${token}` }
            });
            setRequests(res.data.requests || []);
        } catch (error) {
            console.error("Error fetching requests:", error);
            alert("Failed to load payment requests");
        } finally {
            setLoading(false);
        }
    };

    const handleApprove = async (requestId) => {
        try {
            setProcessingId(requestId);
            await axios.post(
                `${Base_url}/payment/approve-payment`,
                { requestId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Access granted successfully!");
            fetchPaymentRequests();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to approve access");
        } finally {
            setProcessingId(null);
        }
    };

    const handleReject = async (requestId) => {
        if (!window.confirm("Are you sure you want to reject this request?")) return;
        try {
            setProcessingId(requestId);
            await axios.post(
                `${Base_url}/payment/reject-payment`,
                { requestId },
                { headers: { Authorization: `Bearer ${token}` } }
            );

            alert("Request rejected.");
            fetchPaymentRequests();
        } catch (error) {
            alert(error.response?.data?.message || "Failed to reject request");
        } finally {
            setProcessingId(null);
        }
    };

    return (
        <div style={{ padding: '20px', maxWidth: '1000px', margin: '0 auto' }}>
            <button 
                onClick={() => navigate('/admin-dashboard')}
                style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '20px', padding: '8px 16px', cursor: 'pointer' }}
            >
                <FaArrowLeft /> Back to Dashboard
            </button>

            <h2>Payment Verification Requests</h2>

            {loading ? (
                <p>Loading requests...</p>
            ) : requests.length === 0 ? (
                <p>No payment verification requests found.</p>
            ) : (
                <div style={{ display: 'flex', flexDirection: 'column', gap: '15px', marginTop: '15px' }}>
                    {requests.map((req) => (
                        <div 
                            key={req._id} 
                            style={{ 
                                border: '1px solid #e2e8f0', 
                                padding: '16px', 
                                borderRadius: '8px', 
                                display: 'flex', 
                                justifyContent: 'space-between', 
                                alignItems: 'center',
                                background: req.status === 'approved' ? '#f0fff4' : req.status === 'rejected' ? '#fff5f5' : '#fff'
                            }}
                        >
                            <div>
                                <h4 style={{ margin: '0 0 6px 0' }}>
                                    User: {req.userId?.name || 'Unknown'} ({req.userId?.email || 'N/A'})
                                </h4>
                                <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Paid Email:</strong> {req.email}</p>
                                <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>Paid Phone:</strong> {req.phone}</p>
                                {req.transactionId && (
                                    <p style={{ margin: '4px 0', fontSize: '14px' }}><strong>UTR / Ref ID:</strong> {req.transactionId}</p>
                                )}
                                <span style={{ 
                                    fontSize: '12px', 
                                    padding: '2px 8px', 
                                    borderRadius: '12px', 
                                    background: req.status === 'approved' ? '#c6f6d5' : req.status === 'rejected' ? '#fed7d7' : '#feebc8',
                                    fontWeight: 'bold' 
                                }}>
                                    Status: {req.status.toUpperCase()}
                                </span>
                            </div>

                            <div style={{ display: 'flex', gap: '10px' }}>
                                {req.status === 'pending' ? (
                                    <>
                                        <button
                                            onClick={() => handleApprove(req._id)}
                                            disabled={processingId === req._id}
                                            style={{ background: '#38a169', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <FaCheck /> Grant Access
                                        </button>
                                        <button
                                            onClick={() => handleReject(req._id)}
                                            disabled={processingId === req._id}
                                            style={{ background: '#e53e3e', color: '#fff', border: 'none', padding: '10px 16px', borderRadius: '6px', cursor: 'pointer', display: 'flex', alignItems: 'center', gap: '6px' }}
                                        >
                                            <FaTimes /> Reject
                                        </button>
                                    </>
                                ) : (
                                    <span style={{ fontWeight: 'bold', color: req.status === 'approved' ? 'green' : 'red' }}>
                                        {req.status === 'approved' ? 'Access Granted' : 'Access Denied'}
                                    </span>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default PaymentRequests;