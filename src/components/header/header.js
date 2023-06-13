import React, { useState } from 'react'
import { useNavigate  } from 'react-router-dom'
import styles from './Header.module.css'

import AppBar from '@mui/material/AppBar';
import {Box, Fab} from '@mui/material';
import Toolbar from '@mui/material/Toolbar';
import IconButton from '@mui/material/IconButton';
import Typography from '@mui/material/Typography';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import mainLogo from '../../logo_128.png'
import AccountCircle from '@mui/icons-material/AccountCircle';
import SendAndArchiveOutlinedIcon from '@mui/icons-material/SendAndArchiveOutlined';
import WifiIcon from '@mui/icons-material/Wifi';

    
export default function Header({ setOpenDrawer, showConnection } ) {
    const [user, setUser] = useState(JSON.parse(localStorage.getItem('profile')))
    const history = useNavigate ()
    const [anchorEl, setAnchorEl] = React.useState(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] = React.useState(null);
  const [burnClickable, setBurnClickable] = useState(false)

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);
  window.showBurn = (v) => {
    setBurnClickable(v);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };
  const logout = () => {
    history('/')
    setUser(null)
}  
  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleProfileOpen = () => {
    history('/settings');
    handleMenuClose();
  };

  const handleMobileMenuOpen = (event) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const handleHamburgerMenuOpen = () => {
    console.log("hamburger");
    setOpenDrawer(true);
  };

  const menuId = 'primary-search-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={menuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleProfileOpen}>Profile</MenuItem>
      <MenuItem onClick={logout}>Logout</MenuItem>
    </Menu>
  );

  const mobileMenuId = 'primary-search-account-menu-mobile';
  const renderMobileMenu = (
    <Menu
      anchorEl={mobileMoreAnchorEl}
      anchorOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      id={mobileMenuId}
      keepMounted
      transformOrigin={{
        vertical: 'top',
        horizontal: 'right',
      }}
      open={isMobileMenuOpen}
      onClose={handleMobileMenuClose}
    >

      <MenuItem onClick={handleMobileMenuOpen}>
        <IconButton
          size="large"
          aria-label="account of current user"
          aria-controls="primary-search-account-menu"
          aria-haspopup="true"
          color="inherit"
        >
          <AccountCircle />
        </IconButton>
        <p>Profile</p>
      </MenuItem>
    </Menu>
  );

  if(!user) 
    return (
      <div className={styles.header2}>
        <img style={{width: '50px', cursor: 'pointer'}} onClick={()=> history('/')} src={mainLogo} alt="logo" />
        <button onClick={() => history('/login')} className={styles.login}>Get started</button>
      </div>
    )
  return (
    <Box sx={{ flexGrow: 1 }}>
      <AppBar position="static">
        <Toolbar>
          <IconButton
            size="large"
            edge="start"
            color="inherit"
            aria-label="open drawer"
            sx={{ mr: 2 }}
            onClick={handleHamburgerMenuOpen}
            >
            <MenuIcon />
          </IconButton>
          <Typography
            variant="h6"
            noWrap
            component="div"
            sx={{ display: { xs: 'none', sm: 'block' } }}
          >
            Noditron
          </Typography>

          <Box sx={{ flexGrow: 1 }} />
          {false &&  <Fab variant="extended" onClick={()=>showConnection(true)}>
        <WifiIcon />
      </Fab> }
      <Fab
        color="error"
        variant="extended"
        disabled = {!burnClickable}
        onClick={() => {
          window.nodes.upload();
        }}>
        <SendAndArchiveOutlinedIcon />
      </Fab>
        </Toolbar>
      </AppBar>
      {renderMobileMenu}
      {renderMenu}
    </Box>
  );
}