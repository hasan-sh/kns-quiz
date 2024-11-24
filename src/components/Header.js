import React from 'react';
import { AppBar, Toolbar, Typography, Button, Container } from '@mui/material';
import { Link } from 'react-router-dom';

const Header = () => {
    return (
        <AppBar position="static" color="primary">
            <Container maxWidth="md">
                <Toolbar>
                    <Typography variant="h6" style={{ flexGrow: 1 }}>
                        Het Basisexamen
                    </Typography>
                    <Button color="inherit" component={Link} to="/kns">
                        KNS
                    </Button>
                    <Button color="inherit" component={Link} to="/spreken">
                        Spreken
                    </Button>
                </Toolbar>
            </Container>
        </AppBar>
    );
};

export default Header;
