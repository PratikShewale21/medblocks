import React, { useState } from 'react';
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
  TablePagination
} from '@mui/material';
import {
  Search as SearchIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  PersonAdd as PersonAddIcon,
  Edit as EditIcon,
  Delete as DeleteIcon,
  Visibility as VisibilityIcon
} from '@mui/icons-material';

const Patients = () => {
  const [searchTerm, setSearchTerm] = useState('');
  const [page, setPage] = useState(0);
  const [rowsPerPage, setRowsPerPage] = useState(5);
  const [anchorEl, setAnchorEl] = useState(null);
  const [selectedPatient, setSelectedPatient] = useState(null);

  // Mock data for patients
  const patients = [
    { id: 'PT-1001', name: 'Sarah Johnson', age: 45, gender: 'Female', condition: 'Diabetes', lastVisit: '2023-05-20', status: 'Active' },
    { id: 'PT-1002', name: 'Michael Brown', age: 52, gender: 'Male', condition: 'Hypertension', lastVisit: '2023-05-18', status: 'Active' },
    { id: 'PT-1003', name: 'Emily Davis', age: 34, gender: 'Female', condition: 'Asthma', lastVisit: '2023-05-15', status: 'Inactive' },
    { id: 'PT-1004', name: 'Robert Wilson', age: 61, gender: 'Male', condition: 'Arthritis', lastVisit: '2023-05-10', status: 'Active' },
    { id: 'PT-1005', name: 'Jennifer Lee', age: 29, gender: 'Female', condition: 'Migraine', lastVisit: '2023-05-08', status: 'Active' },
    { id: 'PT-1006', name: 'David Kim', age: 42, gender: 'Male', condition: 'High Cholesterol', lastVisit: '2023-05-05', status: 'Inactive' },
    { id: 'PT-1007', name: 'Amanda Garcia', age: 38, gender: 'Female', condition: 'Anxiety', lastVisit: '2023-05-01', status: 'Active' },
  ];

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

  const filteredPatients = patients.filter((patient) =>
    Object.values(patient).some(
      (value) =>
        value &&
        value.toString().toLowerCase().includes(searchTerm.toLowerCase())
    )
  );

  const emptyRows =
    page > 0 ? Math.max(0, (1 + page) * rowsPerPage - filteredPatients.length) : 0;

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Patient Records</Typography>
        <Button
          variant="contained"
          startIcon={<PersonAddIcon />}
          onClick={() => console.log('Add new patient')}
        >
          Add Patient
        </Button>
      </Box>

      <Paper sx={{ p: 2, mb: 3 }}>
        <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
          <TextField
            variant="outlined"
            size="small"
            placeholder="Search patients..."
            value={searchTerm}
            onChange={handleSearch}
            InputProps={{
              startAdornment: (
                <InputAdornment position="start">
                  <SearchIcon color="action" />
                </InputAdornment>
              ),
            }}
            sx={{ width: 300 }}
          />
          <div>
            <IconButton aria-label="filter list">
              <FilterListIcon />
            </IconButton>
          </div>
        </Box>

        <TableContainer>
          <Table>
            <TableHead>
              <TableRow>
                <TableCell>Patient</TableCell>
                <TableCell>ID</TableCell>
                <TableCell>Age</TableCell>
                <TableCell>Gender</TableCell>
                <TableCell>Condition</TableCell>
                <TableCell>Last Visit</TableCell>
                <TableCell>Status</TableCell>
                <TableCell align="right">Actions</TableCell>
              </TableRow>
            </TableHead>
            <TableBody>
              {(rowsPerPage > 0
                ? filteredPatients.slice(page * rowsPerPage, page * rowsPerPage + rowsPerPage)
                : filteredPatients
              ).map((patient) => (
                <TableRow key={patient.id} hover>
                  <TableCell>
                    <Box sx={{ display: 'flex', alignItems: 'center' }}>
                      <Avatar sx={{ width: 36, height: 36, mr: 2 }}>
                        {patient.name.charAt(0)}
                      </Avatar>
                      <Box>
                        <Typography variant="body2" fontWeight={500}>
                          {patient.name}
                        </Typography>
                        <Typography variant="caption" color="textSecondary">
                          {patient.email || 'No email'}
                        </Typography>
                      </Box>
                    </Box>
                  </TableCell>
                  <TableCell>{patient.id}</TableCell>
                  <TableCell>{patient.age}</TableCell>
                  <TableCell>{patient.gender}</TableCell>
                  <TableCell>
                    <Chip 
                      label={patient.condition} 
                      size="small" 
                      color={patient.condition === 'Diabetes' || patient.condition === 'Hypertension' ? 'error' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell>{patient.lastVisit}</TableCell>
                  <TableCell>
                    <Chip 
                      label={patient.status} 
                      size="small" 
                      color={patient.status === 'Active' ? 'success' : 'default'}
                      variant="outlined"
                    />
                  </TableCell>
                  <TableCell align="right">
                    <IconButton 
                      size="small" 
                      onClick={(e) => handleMenuOpen(e, patient)}
                      aria-label="more"
                    >
                      <MoreVertIcon />
                    </IconButton>
                  </TableCell>
                </TableRow>
              ))}
              {emptyRows > 0 && (
                <TableRow style={{ height: 53 * emptyRows }}>
                  <TableCell colSpan={8} />
                </TableRow>
              )}
            </TableBody>
          </Table>
        </TableContainer>

        <TablePagination
          rowsPerPageOptions={[5, 10, 25]}
          component="div"
          count={filteredPatients.length}
          rowsPerPage={rowsPerPage}
          page={page}
          onPageChange={handleChangePage}
          onRowsPerPageChange={handleChangeRowsPerPage}
        />
      </Paper>

      {/* Actions Menu */}
      <Menu
        anchorEl={anchorEl}
        open={Boolean(anchorEl)}
        onClose={handleMenuClose}
        onClick={handleMenuClose}
      >
        <MenuItem onClick={() => console.log('View', selectedPatient)}>
          <VisibilityIcon sx={{ mr: 1 }} fontSize="small" /> View Details
        </MenuItem>
        <MenuItem onClick={() => console.log('Edit', selectedPatient)}>
          <EditIcon sx={{ mr: 1 }} fontSize="small" /> Edit
        </MenuItem>
        <MenuItem onClick={() => console.log('Delete', selectedPatient)}>
          <DeleteIcon sx={{ mr: 1 }} fontSize="small" /> Delete
        </MenuItem>
      </Menu>
    </Box>
  );
};

export default Patients;
