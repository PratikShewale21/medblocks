import React, { useState, useEffect } from 'react';
import { ethers } from 'ethers';
import axios from 'axios';
import {
  Box,
  Typography,
  Paper,
  Button,
  CircularProgress,
  Chip,
  Avatar,
  Divider,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  Fade,
  IconButton
} from '@mui/material';
import {
  ArrowBack as ArrowBackIcon,
  PictureAsPdf as PdfIcon,
  Visibility as VisibilityIcon,
  Close as CloseIcon,
  InsertDriveFile as GenericFileIcon,
  Image as ImageIcon, // FIXED: Corrected import name for MUI
  Lock as LockIcon
} from '@mui/icons-material';

const connectWallet = async () => {
  if (!window.ethereum) return null;
  try {
    const provider = new ethers.BrowserProvider(window.ethereum);
    return await provider.getSigner();
  } catch (err) {
    console.error("MetaMask connection failed:", err);
    return null;
  }
};

const PatientDetails = () => {
  const [patientWallet, setPatientWallet] = useState('');
  const [loading, setLoading] = useState(true);
  const [accessDenied, setAccessDenied] = useState(false);
  const [records, setRecords] = useState([]);
  const [doctorAddress, setDoctorAddress] = useState('');
  const [viewingFileUrl, setViewingFileUrl] = useState(null);
  const [isModalOpen, setIsModalOpen] = useState(false);

  useEffect(() => {
    const fetchPatientData = async () => {
      try {
        const urlParams = new URLSearchParams(window.location.search);
        const targetWallet = urlParams.get('wallet');
        
        if (!targetWallet) {
          setAccessDenied(true);
          setLoading(false);
          return;
        }
        setPatientWallet(targetWallet);

        const signer = await connectWallet();
        if (!signer) {
          setLoading(false);
          return;
        }
        
        const docAddr = await signer.getAddress();
        setDoctorAddress(docAddr);

        // Fetch records from backend with blockchain permission check
        const recordsRes = await axios.get(`http://localhost:8000/records/${targetWallet}`, {
          params: { requester_address: docAddr }
        });

        setRecords(recordsRes.data.records || []);
      } catch (err) {
        console.error("Verification error:", err);
        if (err.response && err.response.status === 403) {
          setAccessDenied(true);
        }
      } finally {
        setLoading(false);
      }
    };
    fetchPatientData();
  }, []);

  const handleOpenSecureViewer = (cid) => {
    // Standard stream URL - Backend handles mime_type for PDF or Images
    const secureStreamUrl = `http://localhost:8000/records/view/${cid}?patient_address=${patientWallet}&requester_address=${doctorAddress}#toolbar=0`;
    setViewingFileUrl(secureStreamUrl);
    setIsModalOpen(true);
  };

  const handleCloseViewer = () => {
    setIsModalOpen(false);
    setViewingFileUrl(null);
  };

  const getFileIcon = (filename) => {
    const ext = filename?.toLowerCase().split('.').pop();
    if (ext === 'pdf') return <PdfIcon sx={{ color: '#ef4444', fontSize: 32 }} />;
    if (['jpg', 'jpeg', 'png', 'gif', 'webp'].includes(ext)) return <ImageIcon sx={{ color: '#3b82f6', fontSize: 32 }} />;
    return <GenericFileIcon sx={{ fontSize: 32, color: '#64748b' }} />;
  };

  if (loading) {
    return (
      <Box sx={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', minHeight: '80vh' }}>
        <CircularProgress size={50} thickness={4} sx={{ color: '#1e293b', mb: 2 }} />
        <Typography variant="body2" sx={{ color: '#64748b', fontWeight: 500 }}>Decrypting Blockchain Vault...</Typography>
      </Box>
    );
  }

  if (accessDenied) {
    return (
      <Box sx={{ maxWidth: '600px', margin: '100px auto', p: 4, textAlign: 'center' }}>
        <LockIcon sx={{ fontSize: 70, color: '#ef4444', mb: 2 }} />
        <Typography variant="h5" sx={{ fontWeight: 800, mb: 2 }}>Unauthorized Access</Typography>
        <Typography variant="body1" sx={{ color: '#64748b', mb: 4 }}>
          This session is restricted. The patient has not authorized this wallet to view decrypted records.
        </Typography>
        <Button variant="contained" onClick={() => window.location.href = '/doctor/patients'} sx={{ bgcolor: '#1e293b', borderRadius: 2 }}>
          Back to Dashboard
        </Button>
      </Box>
    );
  }

  return (
    <Fade in={true} timeout={600}>
      <Box sx={{ p: 2 }}>
        <Button 
          startIcon={<ArrowBackIcon />} 
          onClick={() => window.location.href = '/doctor/patients'} 
          sx={{ mb: 4, color: '#64748b', textTransform: 'none', fontWeight: 600 }}
        >
          Back to Records
        </Button>

        {/* Patient Profile Section */}
        <Paper elevation={0} sx={{ p: 3, borderRadius: 4, mb: 4, border: '1px solid #e2e8f0', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#fff' }}>
          <Box sx={{ display: 'flex', alignItems: 'center' }}>
            <Avatar sx={{ width: 56, height: 56, mr: 2.5, bgcolor: '#1e293b', fontWeight: 700 }}>P</Avatar>
            <Box>
              <Typography variant="h5" sx={{ fontWeight: 800, color: '#0f172a' }}>Patient Records Vault</Typography>
              <Typography variant="caption" sx={{ fontFamily: 'monospace', color: '#64748b', fontSize: '0.85rem' }}>
                {patientWallet}
              </Typography>
            </Box>
          </Box>
          <Chip label="Access Verified" color="success" size="small" variant="outlined" sx={{ fontWeight: 700 }} />
        </Paper>

        {/* Records List Section */}
        <Paper elevation={0} sx={{ borderRadius: 4, border: '1px solid #e2e8f0', overflow: 'hidden' }}>
          <List sx={{ p: 0 }}>
            {records.length > 0 ? records.map((record, index) => (
              <React.Fragment key={index}>
                <ListItem sx={{ py: 2.5, px: 3, '&:hover': { bgcolor: '#f8fafc' } }}>
                  <ListItemIcon>{getFileIcon(record.filename)}</ListItemIcon>
                  <ListItemText 
                    primary={<Typography sx={{ fontWeight: 600, color: '#1e293b' }}>{record.filename || "Medical_File"}</Typography>}
                    secondary={`IPFS CID: ${record.cid.slice(0, 24)}...`}
                  />
                  <Button 
                    variant="contained" 
                    startIcon={<VisibilityIcon />} 
                    onClick={() => handleOpenSecureViewer(record.cid)}
                    sx={{ bgcolor: '#0f172a', borderRadius: '8px', boxShadow: 'none', textTransform: 'none', '&:hover': { bgcolor: '#334155' } }}
                  >
                    View File
                  </Button>
                </ListItem>
                {index < records.length - 1 && <Divider />}
              </React.Fragment>
            )) : (
              <Box sx={{ p: 10, textAlign: 'center' }}>
                <Typography sx={{ color: '#94a3b8' }}>No clinical records found in this vault.</Typography>
              </Box>
            )}
          </List>
        </Paper>

        {/* ========================================== */}
        {/* SECURE OVERLAY VIEWER (PDF & IMAGES)       */}
        {/* ========================================== */}
        {isModalOpen && (
          <Box 
            onContextMenu={(e) => e.preventDefault()} // 🔒 Anti-Right-Click
            sx={{
              position: 'fixed', top: 0, left: 0, width: '100vw', height: '100vh',
              bgcolor: 'rgba(15, 23, 42, 0.98)', zIndex: 9999, display: 'flex', flexDirection: 'column'
            }}
          >
            {/* Header / Toolbar */}
            <Box sx={{ p: 2, display: 'flex', justifyContent: 'flex-end', bgcolor: '#0f172a' }}>
              <IconButton onClick={handleCloseViewer} sx={{ color: '#fff' }}>
                <CloseIcon />
              </IconButton>
            </Box>

            {/* Main Viewer Display */}
            <Box sx={{ flexGrow: 1, display: 'flex', justifyContent: 'center', alignItems: 'center', pb: 4, p: 2 }}>
              <iframe
                src={viewingFileUrl}
                width="85%"
                height="95%"
                style={{ 
                  border: 'none', 
                  borderRadius: '12px', 
                  background: '#fff', 
                  boxShadow: '0 25px 50px -12px rgba(0,0,0,0.5)',
                  objectFit: 'contain'
                }}
                title="Secure Medical Stream"
              />
            </Box>
          </Box>
        )}
      </Box>
    </Fade>
  );
};

export default PatientDetails;