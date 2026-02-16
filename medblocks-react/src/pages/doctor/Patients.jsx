import React, { useState, useEffect } from "react";
import { ethers } from "ethers";
import axios from "axios";
import {
  Box,
  Typography,
  Paper,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  TextField,
  InputAdornment,
  IconButton,
  Chip,
  Avatar,
  Button,
  Menu,
  MenuItem,
  TablePagination,
  CircularProgress,
  Tooltip,
  Fade,
} from "@mui/material";
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  PersonAdd as PersonAddIcon,
  Visibility as VisibilityIcon,
  ContentCopy as ContentCopyIcon,
  FolderOff as FolderOffIcon,
} from "@mui/icons-material";

const connectWallet = async () => {
  if (!window.ethereum) {
    alert("Please install MetaMask!");
    return null;
  }
  await window.ethereum.request({ method: "eth_requestAccounts" });
  const provider = new ethers.BrowserProvider(window.ethereum);
  return await provider.getSigner();
};

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState("");
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Real Data States
  const [patients, setPatients] = useState([]);
  const [loading, setLoading] = useState(true);

  // Fetch real active patients from the blockchain/backend
  useEffect(() => {
    const loadPatients = async () => {
      try {
        const signer = await connectWallet();
        if (!signer) {
          setLoading(false);
          return;
        }

        const docAddress = await signer.getAddress();
        const storedPatients = JSON.parse(
          localStorage.getItem(`doctorPatients_${docAddress}`) || "[]",
        );

        const activePatients = [];

        for (let p of storedPatients) {
          try {
            const res = await axios.get("http://localhost:8000/access/check", {
              params: {
                patient: p.wallet,
                doctor: docAddress,
              },
            });

            if (res.data.hasAccess) {
              activePatients.push({
                ...p,
                status: "Active",
              });
            }
          } catch (err) {
            console.error("Failed to check access for", p.wallet, err);
          }
        }

        setPatients(activePatients);
      } catch (err) {
        console.error("Error loading patient data:", err);
      } finally {
        setLoading(false);
      }
    };

    loadPatients();
  }, []);

  const handleSearch = (event) => {
    setSearchTerm(event.target.value);
    setPage(0);
  };

  const handleChangePage = (event, newPage) => {
    setPage(newPage);
  };

  const handleChangeRowsPerPage = (event) => {
    setRowsPerPage(parseInt(event.target.value, 10));
    setPage(0);
  };

  const handleMenuOpen = (event, patient) => {
    setAnchorEl(event.currentTarget);
    setSelectedPatient(patient);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    setSelectedPatient(null);
  };

  const handleCopyWallet = (wallet) => {
    navigator.clipboard.writeText(wallet);
  };

  const filteredPatients = patients.filter((patient) =>
    Object.values(patient).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase()),
    ),
  );

  const emptyRows =
    page > 0
      ? Math.max(0, (1 + page) * rowsPerPage - filteredPatients.length)
      : 0;

  // Generate a soft gradient color based on the patient's name
  const stringToColor = (string) => {
    if (!string) return "linear-gradient(135deg, #6366f1 0%, #a855f7 100%)";
    let hash = 0;
    for (let i = 0; i < string.length; i += 1) {
      hash = string.charCodeAt(i) + ((hash << 5) - hash);
    }
    const color1 = `hsl(${hash % 360}, 70%, 60%)`;
    const color2 = `hsl(${(hash + 40) % 360}, 70%, 50%)`;
    return `linear-gradient(135deg, ${color1} 0%, ${color2} 100%)`;
  };

  return (
    <Box sx={{ maxWidth: "1200px", margin: "0 auto", p: 2 }}>
      {/* Header Section */}
      <Box
        sx={{
          display: "flex",
          justifyContent: "space-between",
          alignItems: "center",
          mb: 4,
          mt: 2,
        }}
      >
        <Box>
          <Typography
            variant="h4"
            sx={{ fontWeight: 700, color: "#1e293b", letterSpacing: "-0.5px" }}
          >
            My Patients
          </Typography>
          <Typography variant="body2" sx={{ color: "#64748b", mt: 0.5 }}>
            Securely manage and view decrypted patient records
          </Typography>
        </Box>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => (window.location.href = "/doctor/access")}
          sx={{
            borderRadius: "10px",
            textTransform: "none",
            fontWeight: 600,
            px: 3,
            py: 1,
            boxShadow: "0 4px 14px 0 rgba(0,118,255,0.39)",
            bgcolor: "#0070f3",
            "&:hover": {
              bgcolor: "#0051b3",
            },
          }}
        >
          Request Access
        </Button>
      </Box>

      {/* Main Table Paper */}
      <Paper
        elevation={0}
        sx={{
          p: 3,
          borderRadius: 4,
          boxShadow: "0px 10px 40px rgba(0, 0, 0, 0.04)",
          border: "1px solid #e2e8f0",
        }}
      >
        <Box
          sx={{
            display: "flex",
            justifyContent: "space-between",
            alignItems: "center",
            mb: 3,
          }}
        >
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search by name or wallet..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon sx={{ color: "#94a3b8" }} />
                </InputAdornment>
              ),
            }}
            sx={{
              width: 320,
              "& .MuiOutlinedInput-root": {
                borderRadius: "10px",
                bgcolor: "#f8fafc",
                "& fieldset": { borderColor: "transparent" },
                "&:hover fieldset": { borderColor: "#cbd5e1" },
                "&.Mui-focused fieldset": { borderColor: "#3b82f6" },
              },
            }}
          />
          <Tooltip title="Filter List" arrow>
            <IconButton
              sx={{
                bgcolor: "#f1f5f9",
                borderRadius: 2,
                "&:hover": { bgcolor: "#e2e8f0" },
              }}
            >
              <FilterListIcon sx={{ color: "#475569" }} />
            </IconButton>
          </Tooltip>
        </Box>

        {loading ? (
          <Box
            sx={{
              display: "flex",
              flexDirection: "column",
              alignItems: "center",
              p: 8,
            }}
          >
            <CircularProgress
              size={48}
              thickness={4}
              sx={{ color: "#3b82f6" }}
            />
            <Typography sx={{ mt: 3, color: "#64748b", fontWeight: 500 }}>
              Syncing active connections with Blockchain...
            </Typography>
          </Box>
        ) : (
          <TableContainer>
            <Table sx={{ minWidth: 650 }}>
              <TableHead>
                <TableRow
                  sx={{ "& th": { borderBottom: "2px solid #f1f5f9" } }}
                >
                  <TableCell sx={{ color: "#64748b", fontWeight: 600, py: 2 }}>
                    Patient Profile
                  </TableCell>
                  <TableCell sx={{ color: "#64748b", fontWeight: 600, py: 2 }}>
                    Wallet Address
                  </TableCell>
                  <TableCell sx={{ color: "#64748b", fontWeight: 600, py: 2 }}>
                    Last Accessed
                  </TableCell>
                  <TableCell sx={{ color: "#64748b", fontWeight: 600, py: 2 }}>
                    Status
                  </TableCell>
                  <TableCell
                    align="right"
                    sx={{ color: "#64748b", fontWeight: 600, py: 2 }}
                  >
                    Actions
                  </TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {filteredPatients.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={5}
                      align="center"
                      sx={{ py: 10, borderBottom: "none" }}
                    >
                      <Fade in={true}>
                        <Box
                          sx={{
                            display: "flex",
                            flexDirection: "column",
                            alignItems: "center",
                          }}
                        >
                          <Box
                            sx={{
                              p: 3,
                              bgcolor: "#f8fafc",
                              borderRadius: "50%",
                              mb: 2,
                            }}
                          >
                            <FolderOffIcon
                              sx={{ fontSize: 60, color: "#cbd5e1" }}
                            />
                          </Box>
                          <Typography
                            variant="h6"
                            sx={{ color: "#334155", fontWeight: 600, mb: 1 }}
                          >
                            No Active Patients
                          </Typography>
                          <Typography
                            variant="body2"
                            sx={{
                              color: "#94a3b8",
                              maxWidth: 400,
                              textAlign: "center",
                            }}
                          >
                            You don't have any active patients matching this
                            criteria. Send an access request to view their
                            encrypted records here.
                          </Typography>
                        </Box>
                      </Fade>
                    </TableCell>
                  </TableRow>
                ) : (
                  (rowsPerPage > 0
                    ? filteredPatients.slice(
                        page * rowsPerPage,
                        page * rowsPerPage + rowsPerPage,
                      )
                    : filteredPatients
                  ).map((patient) => (
                    <TableRow
                      key={patient.id}
                      hover
                      sx={{
                        "&:hover": { bgcolor: "#f8fafc" },
                        transition: "background-color 0.2s",
                        "& td": { borderBottom: "1px solid #f1f5f9", py: 2.5 },
                      }}
                    >
                      <TableCell>
                        <Box sx={{ display: "flex", alignItems: "center" }}>
                          <Avatar
                            sx={{
                              width: 44,
                              height: 44,
                              mr: 2,
                              background: stringToColor(patient.name),
                              boxShadow: "0 4px 10px rgba(0,0,0,0.1)",
                            }}
                          >
                            {patient.name
                              ? patient.name.charAt(0).toUpperCase()
                              : "P"}
                          </Avatar>
                          <Box>
                            <Typography
                              variant="body1"
                              sx={{ fontWeight: 600, color: "#1e293b" }}
                            >
                              {patient.name || "Unknown Patient"}
                            </Typography>
                            <Typography
                              variant="caption"
                              sx={{ color: "#94a3b8", fontWeight: 500 }}
                            >
                              Patient ID: #{patient.id.slice(-6)}
                            </Typography>
                          </Box>
                        </Box>
                      </TableCell>
                      <TableCell>
                        <Box
                          sx={{
                            display: "inline-flex",
                            alignItems: "center",
                            bgcolor: "#f1f5f9",
                            px: 1.5,
                            py: 0.5,
                            borderRadius: 2,
                          }}
                        >
                          <Typography
                            variant="body2"
                            sx={{
                              fontFamily: "monospace",
                              color: "#475569",
                              mr: 1,
                            }}
                          >
                            {patient.wallet.slice(0, 6)}...
                            {patient.wallet.slice(-4)}
                          </Typography>
                          <Tooltip title="Copy Wallet" arrow>
                            <IconButton
                              size="small"
                              onClick={() => handleCopyWallet(patient.wallet)}
                              sx={{ p: 0.5 }}
                            >
                              <ContentCopyIcon
                                sx={{ fontSize: 14, color: "#94a3b8" }}
                              />
                            </IconButton>
                          </Tooltip>
                        </Box>
                      </TableCell>
                      <TableCell sx={{ color: "#64748b" }}>
                        {patient.lastAccessed || "Never"}
                      </TableCell>
                      <TableCell>
                        <Chip
                          label="Verified Access"
                          size="small"
                          sx={{
                            bgcolor: "#dcfce7",
                            color: "#166534",
                            fontWeight: 700,
                            borderRadius: "8px",
                            px: 1,
                          }}
                        />
                      </TableCell>
                      <TableCell align="right">
                        <IconButton
                          size="small"
                          onClick={(e) => handleMenuOpen(e, patient)}
                          sx={{ "&:hover": { bgcolor: "#f1f5f9" } }}
                        >
                          <MoreVertIcon sx={{ color: "#64748b" }} />
                        </IconButton>
                      </TableCell>
                    </TableRow>
                  ))
                )}
                {emptyRows > 0 && (
                  <TableRow style={{ height: 85 * emptyRows }}>
                    <TableCell colSpan={5} />
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </TableContainer>
        )}

        <Box sx={{ borderTop: "1px solid #f1f5f9", mt: 2, pt: 2 }}>
          <TablePagination
            rowsPerPageOptions={[5, 10, 25]}
            component="div"
            count={filteredPatients.length}
            rowsPerPage={rowsPerPage}
            page={page}
            onPageChange={handleChangePage}
            onRowsPerPageChange={handleChangeRowsPerPage}
            sx={{
              ".MuiTablePagination-selectLabel, .MuiTablePagination-displayedRows":
                {
                  color: "#64748b",
                  fontWeight: 500,
                  marginTop: "15px",
                },
            }}
          />
        </Box>
      </Paper>

      {/* Floating Action Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
        PaperProps={{
          elevation: 0,
          sx: {
            overflow: "visible",
            filter: "drop-shadow(0px 10px 20px rgba(0,0,0,0.1))",
            mt: 1.5,
            borderRadius: 3,
            minWidth: 200,
            "& .MuiMenuItem-root": {
              px: 2,
              py: 1.5,
              fontWeight: 500,
              color: "#334155",
            },
          },
        }}
        transformOrigin={{ horizontal: "right", vertical: "top" }}
        anchorOrigin={{ horizontal: "right", vertical: "bottom" }}
      >
        <MenuItem
          onClick={() => {
            handleMenuClose();
            // Route the doctor to the patient's specific records page using their wallet address!
            window.location.href = `/doctor/patient-details?wallet=${selectedPatient?.wallet}`;
          }}
        >
          <VisibilityIcon sx={{ mr: 2, color: "#3b82f6" }} fontSize="small" />
          View Health Data
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Patients;
