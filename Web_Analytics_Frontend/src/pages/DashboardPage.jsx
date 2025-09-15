import React, { useState } from 'react';
import { Container, Box, Grid } from '@mui/material';
import Header from '../components/Header';
import DashboardSidebar from '../components/DashboardSidebar';
import DashboardContent from '../components/DashboardContent';
import QueryBox from '../components/QueryBox';

const DashboardPage = () => {
    const [selectedSiteId, setSelectedSiteId] = useState('');
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
            
            <Box sx={{ flexGrow: 1 }}>
                {/* Top Row - Sidebar and Content */}
                <Grid container spacing={3} sx={{ mb: 3 }}>
                    <Grid item xs={12} md={6}>
                        <DashboardSidebar 
                            selectedSite={selectedSiteId}
                            onSiteChange={setSelectedSiteId}
                        />
                    </Grid>
                    
                    <Grid item xs={12} md={6}>
                        <DashboardContent selectedSiteId={selectedSiteId} />
                    </Grid>
                </Grid>
                
                {/* Bottom Row - Centered QueryBox */}
                <Box sx={{ display: 'flex', justifyContent: 'center' }}>
                    <Box sx={{ width: '100%', maxWidth: 900 }}>
                        <QueryBox />
                    </Box>
                </Box>
            </Box>
        </Container>
    );
};

export default DashboardPage;