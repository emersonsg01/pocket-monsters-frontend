import { useState, useEffect } from 'react';
import { Link, useLocation } from 'react-router-dom';
import { AppBar, Toolbar, Typography, Container, Box, Paper, Grid, Drawer, List, ListItem, ListItemIcon, ListItemText, ListItemButton, Divider, IconButton } from '@mui/material';
import { format } from 'date-fns';
import DashboardIcon from '@mui/icons-material/Dashboard';
import PetsIcon from '@mui/icons-material/Pets';
import CategoryIcon from '@mui/icons-material/Category';
import MenuIcon from '@mui/icons-material/Menu';

const Layout = ({ children }) => {
  const [currentDateTime, setCurrentDateTime] = useState(new Date());
  const [mobileOpen, setMobileOpen] = useState(false);
  const location = useLocation();
  
  // Update the date and time every second
  useEffect(() => {
    const timer = setInterval(() => {
      setCurrentDateTime(new Date());
    }, 1000);
    
    return () => clearInterval(timer);
  }, []);

  const handleDrawerToggle = () => {
    setMobileOpen(!mobileOpen);
  };

  const drawerWidth = 240;
  
  const menuItems = [
    { text: 'Dashboard', icon: <DashboardIcon />, path: '/' },
    { text: 'Monsters', icon: <PetsIcon />, path: '/monsters' },
    { text: 'Types', icon: <CategoryIcon />, path: '/types' },
  ];

  const drawer = (
    <>
      <Toolbar sx={{ justifyContent: 'center' }}>
        <Typography variant="h6" component="div">
          Navigation
        </Typography>
      </Toolbar>
      <Divider />
      <List>
        {menuItems.map((item) => {
          const isActive = location.pathname === item.path || 
            (item.path !== '/' && location.pathname.startsWith(item.path));
          
          return (
            <ListItem key={item.text} disablePadding>
              <ListItemButton 
                component={Link} 
                to={item.path}
                selected={isActive}
                sx={{
                  '&.Mui-selected': {
                    backgroundColor: 'rgba(144, 202, 249, 0.2)',
                  },
                  '&.Mui-selected:hover': {
                    backgroundColor: 'rgba(144, 202, 249, 0.3)',
                  },
                  transition: 'all 0.2s ease-in-out',
                }}
              >
                <ListItemIcon sx={{ color: isActive ? 'primary.main' : 'inherit' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          );
        })}
      </List>
    </>
  );
  
  return (
    <Box sx={{ display: 'flex', flexDirection: 'column', minHeight: '100vh' }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            color="inherit"
            aria-label="open drawer"
            edge="start"
            onClick={handleDrawerToggle}
            sx={{ mr: 2, display: { sm: 'none' } }}
          >
            <MenuIcon />
          </IconButton>
          <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
            Pocket Monsters
          </Typography>
          <Paper 
            elevation={3} 
            sx={{ 
              padding: '8px 16px', 
              background: 'rgba(255, 255, 255, 0.1)', 
              borderRadius: 2,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <Typography variant="body1">
              {format(currentDateTime, 'dd/MM/yyyy HH:mm:ss')}
            </Typography>
          </Paper>
        </Toolbar>
      </AppBar>
      
      <Box sx={{ display: 'flex', flexGrow: 1 }}>
        {/* Mobile drawer */}
        <Drawer
          variant="temporary"
          open={mobileOpen}
          onClose={handleDrawerToggle}
          ModalProps={{ keepMounted: true }}
          sx={{
            display: { xs: 'block', sm: 'none' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
          }}
        >
          {drawer}
        </Drawer>
        
        {/* Desktop drawer */}
        <Drawer
          variant="permanent"
          sx={{
            display: { xs: 'none', sm: 'block' },
            '& .MuiDrawer-paper': { boxSizing: 'border-box', width: drawerWidth },
            width: drawerWidth,
            flexShrink: 0,
          }}
          open
        >
          {drawer}
        </Drawer>
        
        <Container component="main" sx={{ flexGrow: 1, py: 4, px: { xs: 2, md: 3 } }}>
          <Toolbar sx={{ display: { sm: 'none' } }} />
          <Grid container spacing={3}>
            {children}
          </Grid>
        </Container>
      </Box>
      
      <Box 
        component="footer" 
        sx={{ 
          py: 3, 
          px: 2, 
          mt: 'auto', 
          backgroundColor: (theme) => theme.palette.background.paper,
          borderTop: (theme) => `1px solid ${theme.palette.divider}`
        }}
      >
        <Typography variant="body2" color="text.secondary" align="center">
          © {new Date().getFullYear()} Pocket Monsters Management System
        </Typography>
      </Box>
    </Box>
  );
};

export default Layout;