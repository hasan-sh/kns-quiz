import React, { useState } from 'react';
import AppBar from '@mui/material/AppBar';
import Toolbar from '@mui/material/Toolbar';
import Typography from '@mui/material/Typography';
import IconButton from '@mui/material/IconButton';
import MenuIcon from '@mui/icons-material/Menu';
import Menu from '@mui/material/Menu';
import MenuItem from '@mui/material/MenuItem';
import { Link } from 'react-router-dom';

const Header = () => {
  const [anchorEl, setAnchorEl] = useState(null);

  const handleClick = (event) => {
    setAnchorEl(event.currentTarget);
  };
  const handleClose = () => {
    setAnchorEl(null);
  };

  return (
    <AppBar position="static" color="primary">
      <Toolbar>
        <IconButton
          size="large"
          edge="start"
          color="inherit"
          aria-label="menu"
          sx={{ mr: 2 }}
          onClick={handleClick}
        >
          <MenuIcon />
        </IconButton>
        <Typography variant="h6" component="div" sx={{ flexGrow: 1 }}>
          Het Basisexamen
        </Typography>
        <Menu
          id="menu-appbar"
          anchorEl={anchorEl}
          anchorOrigin={{
            vertical: 'top',
            horizontal: 'right',
          }}
          keepMounted
          open={!!anchorEl}
          onClose={handleClose}
        >
          <MenuItem component={Link} onClick={handleClose} to="/kns">
            KNS
          </MenuItem>
          <MenuItem component={Link} onClick={handleClose} to="/spreken">
            Spreken
          </MenuItem>
          <MenuItem component={Link} onClick={handleClose} to="/verbs-and-phrases">
            Verbs & Phrases
          </MenuItem>
        </Menu>
      </Toolbar>
    </AppBar>
  );
};

export default Header;