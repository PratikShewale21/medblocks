import React, { useState } from 'react';
import {
  Box,
  Typography,
  Button,
  Paper,
  Grid,
  Card,
  CardContent,
  CardHeader,
  Avatar,
  Divider,
  Tabs,
  Tab,
  Table,
  TableBody,
  TableCell,
  TableContainer,
  TableHead,
  TableRow,
  Chip,
  IconButton,
  Menu,
  MenuItem,
  useTheme
} from '@mui/material';
import {
  ShowChart as ShowChartIcon,
  Warning as WarningIcon,
  TrendingUp as TrendingUpIcon,
  TrendingDown as TrendingDownIcon,
  MoreVert as MoreVertIcon,
  FilterList as FilterListIcon,
  Download as DownloadIcon,
  Notifications as NotificationsIcon
} from '@mui/icons-material';
import { Bar, Line, Pie } from 'react-chartjs-2';
import { Chart as ChartJS, registerables } from 'chart.js';
ChartJS.register(...registerables);

const RiskAnalytics = () => {
  const theme = useTheme();
  const [tabValue, setTabValue] = useState(0);
  const [anchorEl, setAnchorEl] = useState(null);
  const [timeRange, setTimeRange] = useState('month');

  // Mock data for charts
  const riskTrendData = {
    labels: ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun'],
    datasets: [
      {
        label: 'High Risk',
        data: [12, 15, 18, 22, 25, 28],
        borderColor: theme.palette.error.main,
        backgroundColor: `${theme.palette.error.main}40`,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Medium Risk',
        data: [25, 28, 30, 32, 35, 38],
        borderColor: theme.palette.warning.main,
        backgroundColor: `${theme.palette.warning.main}40`,
        tension: 0.3,
        fill: true
      },
      {
        label: 'Low Risk',
        data: [63, 60, 58, 55, 52, 50],
        borderColor: theme.palette.success.main,
        backgroundColor: `${theme.palette.success.main}40`,
        tension: 0.3,
        fill: true
      }
    ]
  };

  const riskByConditionData = {
    labels: ['Diabetes', 'Hypertension', 'Heart Disease', 'Asthma', 'Other'],
    datasets: [
      {
        data: [35, 25, 20, 12, 8],
        backgroundColor: [
          theme.palette.error.main,
          theme.palette.warning.main,
          theme.palette.info.main,
          theme.palette.primary.main,
          theme.palette.grey[500]
        ],
        borderWidth: 1,
      },
    ],
  };

  const highRiskPatients = [
    { id: 'PT-1001', name: 'Sarah Johnson', condition: 'Diabetes', riskScore: 87, trend: 'up' },
    { id: 'PT-1002', name: 'Michael Brown', condition: 'Hypertension', riskScore: 78, trend: 'up' },
    { id: 'PT-1003', name: 'Robert Wilson', condition: 'Heart Disease', riskScore: 92, trend: 'up' },
    { id: 'PT-1004', name: 'Emily Davis', condition: 'Diabetes', riskScore: 85, trend: 'down' },
    { id: 'PT-1005', name: 'David Kim', condition: 'Hypertension', riskScore: 81, trend: 'up' },
  ];

  const handleTabChange = (event, newValue) => {
    setTabValue(newValue);
  };

  const handleMenuOpen = (event) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
  };

  const handleTimeRangeChange = (range) => {
    setTimeRange(range);
    handleMenuClose();
    // In a real app, you would fetch data for the selected time range
    console.log('Time range changed to:', range);
  };

  const chartOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'top',
      },
      tooltip: {
        mode: 'index',
        intersect: false,
      },
    },
    scales: {
      y: {
        beginAtZero: true,
        max: 100,
        ticks: {
          callback: (value) => `${value}%`,
        },
      },
    },
  };

  const pieOptions = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'right',
      },
    },
  };

  return (
    <Box>
      <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 3 }}>
        <Typography variant="h5" sx={{ fontWeight: 600 }}>Risk Analytics</Typography>
        <Box>
          <Button
            variant="outlined"
            startIcon={<DownloadIcon />}
            onClick={() => console.log('Export data')}
            sx={{ mr: 1 }}
          >
            Export
          </Button>
          <Button
            variant="outlined"
            startIcon={<FilterListIcon />}
            onClick={handleMenuOpen}
          >
            {timeRange === 'week' ? 'This Week' : timeRange === 'month' ? 'This Month' : 'This Year'}
          </Button>
          <Menu
            anchorEl={anchorEl}
            open={Boolean(anchorEl)}
            onClose={handleMenuClose}
          >
            <MenuItem onClick={() => handleTimeRangeChange('week')}>This Week</MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('month')}>This Month</MenuItem>
            <MenuItem onClick={() => handleTimeRangeChange('year')}>This Year</MenuItem>
          </Menu>
        </Box>
      </Box>

      <Grid container spacing={3} sx={{ mb: 3 }}>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography color="textSecondary" variant="body2">High Risk Patients</Typography>
                <WarningIcon color="error" fontSize="large" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.error.main }}>18</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon color="error" fontSize="small" />
                <Typography variant="body2" color="error.main" sx={{ ml: 0.5, fontWeight: 500 }}>
                  +12.5%
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                  vs last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography color="textSecondary" variant="body2">Medium Risk</Typography>
                <WarningIcon color="warning" fontSize="large" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.warning.main }}>42</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingUpIcon color="warning" fontSize="small" />
                <Typography variant="body2" color="warning.main" sx={{ ml: 0.5, fontWeight: 500 }}>
                  +5.2%
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                  vs last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
        <Grid item xs={12} md={4}>
          <Card>
            <CardContent>
              <Box sx={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', mb: 2 }}>
                <Typography color="textSecondary" variant="body2">Low Risk</Typography>
                <WarningIcon color="success" fontSize="large" />
              </Box>
              <Typography variant="h4" sx={{ fontWeight: 700, color: theme.palette.success.main }}>156</Typography>
              <Box sx={{ display: 'flex', alignItems: 'center', mt: 1 }}>
                <TrendingDownIcon color="success" fontSize="small" />
                <Typography variant="body2" color="success.main" sx={{ ml: 0.5, fontWeight: 500 }}>
                  -2.3%
                </Typography>
                <Typography variant="caption" color="textSecondary" sx={{ ml: 1 }}>
                  vs last month
                </Typography>
              </Box>
            </CardContent>
          </Card>
        </Grid>
      </Grid>

      <Paper sx={{ p: 3, mb: 3 }}>
        <Tabs
          value={tabValue}
          onChange={handleTabChange}
          indicatorColor="primary"
          textColor="primary"
          variant="scrollable"
          scrollButtons="auto"
          sx={{ mb: 3 }}
        >
          <Tab label="Risk Trends" />
          <Tab label="Risk by Condition" />
          <Tab label="High Risk Patients" />
        </Tabs>

        {tabValue === 0 && (
          <Box sx={{ height: 400 }}>
            <Typography variant="h6" gutterBottom>Patient Risk Trend</Typography>
            <Line data={riskTrendData} options={chartOptions} />
          </Box>
        )}

        {tabValue === 1 && (
          <Box sx={{ display: 'flex', flexDirection: { xs: 'column', md: 'row' }, gap: 3 }}>
            <Box sx={{ flex: 1, height: 400 }}>
              <Typography variant="h6" gutterBottom>Risk Distribution by Condition</Typography>
              <Pie data={riskByConditionData} options={pieOptions} />
            </Box>
            <Box sx={{ flex: 1, height: 400 }}>
              <Typography variant="h6" gutterBottom>Risk by Age Group</Typography>
              <Bar 
                data={{
                  labels: ['18-30', '31-45', '46-60', '61+'],
                  datasets: [
                    {
                      label: 'High Risk',
                      data: [5, 15, 35, 45],
                      backgroundColor: theme.palette.error.main,
                    },
                    {
                      label: 'Medium Risk',
                      data: [25, 35, 30, 20],
                      backgroundColor: theme.palette.warning.main,
                    },
                    {
                      label: 'Low Risk',
                      data: [70, 50, 35, 35],
                      backgroundColor: theme.palette.success.main,
                    },
                  ],
                }}
                options={{
                  ...chartOptions,
                  scales: {
                    x: {
                      stacked: true,
                    },
                    y: {
                      stacked: true,
                      max: 100,
                      ticks: {
                        callback: (value) => `${value}%`,
                      },
                    },
                  },
                }}
              />
            </Box>
          </Box>
        )}

        {tabValue === 2 && (
          <TableContainer>
            <Table>
              <TableHead>
                <TableRow>
                  <TableCell>Patient</TableCell>
                  <TableCell>Condition</TableCell>
                  <TableCell>Risk Score</TableCell>
                  <TableCell>Trend</TableCell>
                  <TableCell align="right">Actions</TableCell>
                </TableRow>
              </TableHead>
              <TableBody>
                {highRiskPatients.map((patient) => (
                  <TableRow key={patient.id} hover>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Avatar sx={{ width: 36, height: 36, mr: 2, bgcolor: theme.palette.error.light }}>
                          {patient.name.charAt(0)}
                        </Avatar>
                        <Box>
                          <Typography variant="body2" fontWeight={500}>
                            {patient.name}
                          </Typography>
                          <Typography variant="caption" color="textSecondary">
                            {patient.id}
                          </Typography>
                        </Box>
                      </Box>
                    </TableCell>
                    <TableCell>
                      <Chip 
                        label={patient.condition} 
                        size="small" 
                        color="error"
                        variant="outlined"
                      />
                    </TableCell>
                    <TableCell>
                      <Box sx={{ display: 'flex', alignItems: 'center' }}>
                        <Box 
                          sx={{
                            width: 8,
                            height: 8,
                            borderRadius: '50%',
                            bgcolor: 'error.main',
                            mr: 1
                          }}
                        />
                        <Typography variant="body2" fontWeight={500}>
                          {patient.riskScore}/100
                        </Typography>
                      </Box>
                    </TableCell>
                    <TableCell>
                      {patient.trend === 'up' ? (
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'error.main' }}>
                          <TrendingUpIcon fontSize="small" />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>Increasing</Typography>
                        </Box>
                      ) : (
                        <Box sx={{ display: 'flex', alignItems: 'center', color: 'success.main' }}>
                          <TrendingDownIcon fontSize="small" />
                          <Typography variant="body2" sx={{ ml: 0.5 }}>Decreasing</Typography>
                        </Box>
                      )}
                    </TableCell>
                    <TableCell align="right">
                      <IconButton size="small" onClick={() => console.log('Notify', patient.id)}>
                        <NotificationsIcon fontSize="small" />
                      </IconButton>
                      <IconButton size="small" onClick={() => console.log('View', patient.id)}>
                        <ShowChartIcon fontSize="small" />
                      </IconButton>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </TableContainer>
        )}
      </Paper>

      <Grid container spacing={3}>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Risk Factors</Typography>
            <Box sx={{ height: 300 }}>
              <Bar 
                data={{
                  labels: ['Lifestyle', 'Genetics', 'Environment', 'Medical History', 'Other'],
                  datasets: [
                    {
                      label: 'Contribution to Risk',
                      data: [35, 25, 20, 15, 5],
                      backgroundColor: [
                        theme.palette.primary.main,
                        theme.palette.secondary.main,
                        theme.palette.info.main,
                        theme.palette.warning.main,
                        theme.palette.grey[500]
                      ],
                    },
                  ],
                }}
                options={{
                  ...chartOptions,
                  indexAxis: 'y',
                  scales: {
                    x: {
                      beginAtZero: true,
                      max: 100,
                      ticks: {
                        callback: (value) => `${value}%`,
                      },
                    },
                  },
                }}
              />
            </Box>
          </Paper>
        </Grid>
        <Grid item xs={12} md={6}>
          <Paper sx={{ p: 3, height: '100%' }}>
            <Typography variant="h6" gutterBottom>Intervention Effectiveness</Typography>
            <Box sx={{ height: 300 }}>
              <Line 
                data={{
                  labels: ['Week 1', 'Week 2', 'Week 3', 'Week 4', 'Week 5', 'Week 6'],
                  datasets: [
                    {
                      label: 'Average Risk Score',
                      data: [75, 72, 68, 65, 63, 60],
                      borderColor: theme.palette.primary.main,
                      backgroundColor: 'transparent',
                      tension: 0.3,
                    },
                  ],
                }}
                options={{
                  ...chartOptions,
                  scales: {
                    y: {
                      min: 0,
                      max: 100,
                      ticks: {
                        callback: (value) => `${value}%`,
                      },
                    },
                  },
                }}
              />
            </Box>
            <Typography variant="body2" color="textSecondary" sx={{ mt: 2, textAlign: 'center' }}>
              Showing risk reduction after implementing intervention plan
            </Typography>
          </Paper>
        </Grid>
      </Grid>
    </Box>
  );
};

export default RiskAnalytics;
