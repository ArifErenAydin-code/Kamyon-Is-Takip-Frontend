import React from 'react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import {
  AppBar,
  Toolbar,
  Typography,
  Container,
  Button,
  Box,
  ThemeProvider,
  createTheme,
  CssBaseline,
  Paper,
  IconButton,
  Drawer,
  List,
  ListItem,
  ListItemIcon,
  ListItemText,
  useMediaQuery,
  Divider
} from '@mui/material';
import {
  LocalShipping,
  Store,
  Build,
  DateRange,
  Assessment,
  Menu as MenuIcon,
  Dashboard,
  Receipt
} from '@mui/icons-material';
import TruckList from './components/TruckList';
import TruckForm from './components/TruckForm';
import WorkshopList from './components/WorkshopList';
import WorkshopForm from './components/WorkshopForm';
import OperationList from './components/OperationList';
import OperationForm from './components/OperationForm';
import MonthlyRecordForm from './components/MonthlyRecordForm';
import MonthlyRecordList from './components/MonthlyRecordList';
import Reports from './components/Reports';
import InvoiceList from './components/InvoiceList';
import InvoiceForm from './components/InvoiceForm';

// Custom theme
const theme = createTheme({
  palette: {
    primary: {
      main: '#3b82f6',
      light: '#60a5fa',
      dark: '#2563eb',
    },
    secondary: {
      main: '#8b5cf6',
      light: '#a78bfa',
      dark: '#6d28d9',
    },
    background: {
      default: '#f0f9ff',
      paper: 'rgba(255, 255, 255, 0.9)',
    },
  },
  typography: {
    fontFamily: '"Roboto", "Helvetica", "Arial", sans-serif',
    h4: {
      fontWeight: 600,
    },
    h6: {
      fontWeight: 500,
    },
  },
  components: {
    MuiCssBaseline: {
      styleOverrides: {
        body: {
          background: '#f0f9ff',
          minHeight: '100vh',
        },
      },
    },
    MuiAppBar: {
      styleOverrides: {
        root: {
          background: 'rgba(255, 255, 255, 0.95)',
          borderBottom: '1px solid rgba(59, 130, 246, 0.1)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
          color: '#1e40af',
        },
      },
    },
    MuiDrawer: {
      styleOverrides: {
        paper: {
          background: '#fff',
          borderRight: '1px solid rgba(59, 130, 246, 0.1)',
        },
      },
    },
    MuiButton: {
      styleOverrides: {
        root: {
          textTransform: 'none',
          borderRadius: 8,
          background: '#3b82f6',
          color: 'white',
          transition: 'background-color 0.2s',
          '&:hover': {
            background: '#2563eb',
          },
        },
      },
    },
    MuiPaper: {
      styleOverrides: {
        root: {
          background: '#fff',
          borderRadius: 12,
          border: '1px solid rgba(59, 130, 246, 0.1)',
          boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
        },
      },
    },
    MuiTableContainer: {
      styleOverrides: {
        root: {
          background: '#fff',
          borderRadius: 12,
          border: '1px solid rgba(59, 130, 246, 0.1)',
        },
      },
    },
    MuiTableHead: {
      styleOverrides: {
        root: {
          background: 'linear-gradient(135deg, #3b82f6 0%, #2563eb 100%)',
          '& .MuiTableCell-root': {
            color: 'white',
            fontWeight: 600,
            borderBottom: 'none',
          },
        },
      },
    },
    MuiTableRow: {
      styleOverrides: {
        root: {
          '&:nth-of-type(odd)': {
            backgroundColor: 'rgba(59, 130, 246, 0.02)',
          },
          '&:hover': {
            backgroundColor: 'rgba(59, 130, 246, 0.05)',
          },
        },
      },
    },
    MuiListItem: {
      styleOverrides: {
        root: {
          borderRadius: 8,
          margin: '4px',
          transition: 'background-color 0.2s',
          color: '#1e40af',
          '&:hover': {
            background: 'rgba(59, 130, 246, 0.1)',
          },
        },
      },
    },
    MuiListItemIcon: {
      styleOverrides: {
        root: {
          color: '#3b82f6',
          minWidth: 40,
        },
      },
    },
    MuiTypography: {
      styleOverrides: {
        root: {
          color: '#1e40af',
        },
      },
    },
    MuiTextField: {
      styleOverrides: {
        root: {
          '& .MuiOutlinedInput-root': {
            background: 'rgba(255, 255, 255, 0.9)',
            backdropFilter: 'blur(20px)',
            borderRadius: 12,
            border: '1px solid rgba(59, 130, 246, 0.1)',
            transition: 'all 0.3s ease',
            '&:hover': {
              borderColor: '#3b82f6',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            },
            '&.Mui-focused': {
              borderColor: '#3b82f6',
              boxShadow: '0 0 0 2px rgba(59, 130, 246, 0.2)',
              backgroundColor: 'rgba(255, 255, 255, 0.95)',
            },
          },
          '& .MuiInputLabel-root': {
            color: '#1e40af',
          },
        },
      },
    },
  },
});

const App: React.FC = () => {
  const [mobileOpen, setMobileOpen] = React.useState(false);
  const isMobile = useMediaQuery(theme.breakpoints.down('sm'));
  const drawerWidth = isMobile ? 220 : 250; // Smaller width on mobile

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const menuItems = [
    { text: 'Kamyonlar', icon: <LocalShipping />, path: '/' },
    { text: 'Dükkanlar', icon: <Store />, path: '/workshops' },
    { text: 'İşlemler', icon: <Build />, path: '/operations' },
    { text: 'Aylık Kayıtlar', icon: <DateRange />, path: '/monthly-records' },
    { text: 'Faturalar', icon: <Receipt />, path: '/invoices' },
    { text: 'Raporlar', icon: <Assessment />, path: '/reports' },
  ];

  const drawer = (
    <Box sx={{ width: drawerWidth }}>
      <Box 
        sx={{ 
          p: isMobile ? 1.5 : 2, 
          display: 'flex', 
          alignItems: 'center', 
          gap: 1,
          background: 'linear-gradient(135deg, rgba(59, 130, 246, 0.08) 0%, rgba(37, 99, 235, 0.08) 100%)',
          borderRadius: '0 0 16px 16px',
          mb: 1,
          boxShadow: '0 4px 20px rgba(59, 130, 246, 0.05)',
        }}
      >
        <Dashboard sx={{ fontSize: isMobile ? 20 : 24, color: 'primary.main' }} />
        <Typography 
          variant="h6" 
          noWrap 
          sx={{ 
            fontWeight: 600,
            fontSize: isMobile ? '0.9rem' : '1.1rem',
            background: 'linear-gradient(135deg, #1e40af 0%, #3b82f6 100%)',
            WebkitBackgroundClip: 'text',
            WebkitTextFillColor: 'transparent',
          }}
        >
          Kamyon İş Takip
        </Typography>
      </Box>
      <Divider sx={{ mx: 2, mb: 1 }} />
      <List>
        {menuItems.map((item) => (
          <ListItem
            button
            key={item.text}
            component={Link}
            to={item.path}
            onClick={() => isMobile && handleDrawerToggle()}
            sx={{
              '&:hover': {
                backgroundColor: 'rgba(59, 130, 246, 0.08)',
                transform: 'translateX(4px)',
              },
              borderRadius: 2,
              m: 0.5,
              py: isMobile ? 0.5 : 1,
              transition: 'all 0.3s ease',
            }}
          >
            <ListItemIcon sx={{ color: 'primary.main', minWidth: isMobile ? 32 : 40 }}>
              {React.cloneElement(item.icon, { fontSize: isMobile ? 'small' : 'medium' })}
            </ListItemIcon>
            <ListItemText 
              primary={item.text} 
              sx={{ 
                '& .MuiTypography-root': { 
                  fontWeight: 500,
                  color: '#334155',
                  fontSize: isMobile ? '0.85rem' : '1rem',
                }
              }}
            />
          </ListItem>
        ))}
      </List>
    </Box>
  );

  return (
    <ThemeProvider theme={theme}>
      <CssBaseline />
      <Router>
        <Box sx={{ display: 'flex', minHeight: '100vh' }}>
          {/* Mobile AppBar */}
          <AppBar
            position="fixed"
            sx={{
              display: { sm: 'none' },
              width: '100%',
              bgcolor: 'background.paper',
              boxShadow: '0 2px 10px rgba(0, 0, 0, 0.05)',
            }}
          >
            <Toolbar sx={{ minHeight: { xs: 56 } }}>
              <IconButton
                color="primary"
                aria-label="open drawer"
                edge="start"
                onClick={handleDrawerToggle}
                sx={{ mr: 2 }}
              >
                <MenuIcon />
              </IconButton>
              <Typography variant="h6" noWrap component="div" color="primary.main" sx={{ fontSize: '1rem' }}>
                Kamyon İş Takip
              </Typography>
            </Toolbar>
          </AppBar>

          <Box
            component="nav"
            sx={{ width: { sm: drawerWidth }, flexShrink: { sm: 0 } }}
          >
            {/* Mobile drawer */}
            <Drawer
              variant="temporary"
              open={mobileOpen}
              onClose={handleDrawerToggle}
              ModalProps={{
                keepMounted: true,
              }}
              sx={{
                display: { xs: 'block', sm: 'none' },
                '& .MuiDrawer-paper': { 
                  width: drawerWidth, 
                  boxSizing: 'border-box',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                },
              }}
            >
              {drawer}
            </Drawer>
            
            {/* Desktop drawer */}
            <Drawer
              variant="permanent"
              sx={{
                display: { xs: 'none', sm: 'block' },
                '& .MuiDrawer-paper': { 
                  width: drawerWidth,
                  boxSizing: 'border-box',
                  borderRight: '1px solid rgba(59, 130, 246, 0.1)',
                  background: 'rgba(255, 255, 255, 0.9)',
                  backdropFilter: 'blur(12px)',
                  boxShadow: '4px 0 30px rgba(0, 0, 0, 0.03)',
                },
              }}
              open
            >
              {drawer}
            </Drawer>
          </Box>

          <Box
            component="main"
            sx={{
              flexGrow: 1,
              p: { xs: 2, sm: 3 },
              width: { sm: `calc(100% - ${drawerWidth}px)` },
              backgroundColor: 'background.default',
              minHeight: '100vh',
              mt: { xs: '56px', sm: 0 }, // Reduced top margin for mobile
            }}
          >
            <Routes>
              <Route path="/" element={<TruckList />} />
              <Route path="/truck/new" element={<TruckForm />} />
              <Route path="/truck/edit/:plaka" element={<TruckForm />} />
              
              <Route path="/workshops" element={<WorkshopList />} />
              <Route path="/workshop/new" element={<WorkshopForm />} />
              <Route path="/workshop/edit/:id" element={<WorkshopForm />} />
              
              <Route path="/operations" element={<OperationList />} />
              <Route path="/operation/new" element={<OperationForm />} />
              <Route path="/operation/edit/:id" element={<OperationForm />} />

              <Route path="/monthly-records" element={<MonthlyRecordList />} />
              <Route path="/monthly-record/new" element={<MonthlyRecordForm />} />
              <Route path="/monthly-record/edit/:plaka/:ay" element={<MonthlyRecordForm />} />

              <Route path="/invoices" element={<InvoiceList />} />
              <Route path="/invoice/new" element={<InvoiceForm />} />

              <Route path="/reports" element={<Reports />} />
            </Routes>
          </Box>
        </Box>
      </Router>
    </ThemeProvider>
  );
};

export default App;
