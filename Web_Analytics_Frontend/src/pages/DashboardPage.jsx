import React from 'react';
import { Container, Box, Grid } from '@mui/material';
import Header from '../components/Header';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardContent from '../components/DashboardContent';
import ChatBox from '../components/ChatBox';

const DashboardPage = () => {
    return (
        <Container
            maxWidth="xl"
            sx={{
                py: 4,
                display: 'flex',
                flexDirection: 'column',
                minHeight: '100vh'
            }}
        >
            <Box sx={{ width: '100%', mb: 4 }}>
                <Header />
            </Box>
            
            <Grid container spacing={3} sx={{ flexGrow: 1 }}>
                {/* Left Sidebar */}
                <Grid item xs={12} md={3}>
                    <DashboardSidebar />
                </Grid>
                
                {/* Main Content */}
                <Grid item xs={12} md={6}>
                    <DashboardContent />
                </Grid>
                
                {/* Right Chatbox */}
                <Grid item xs={12} md={3}>
                    <ChatBox />
                </Grid>
            </Grid>
        </Container>
    );
};

export default DashboardPage;