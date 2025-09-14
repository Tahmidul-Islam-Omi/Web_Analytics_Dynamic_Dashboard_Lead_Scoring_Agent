import React from 'react';
import { Container, Box } from '@mui/material';
import Header from '../components/Header';
import WebsiteForm from '../components/WebsiteForm';

const HomePage = () => {
    return (
        <Container
            maxWidth="lg"
            sx={{
                py: 4,
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center'
            }}
        >
            <Box sx={{ width: '100%', maxWidth: 1200 }}>
                <Header />
                <WebsiteForm />
            </Box>
        </Container>
    );
};

export default HomePage;