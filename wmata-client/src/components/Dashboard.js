import { useState, useEffect } from 'react';
import { Grid, Paper } from '@mui/material';

import TrainCard from './DataCards/TrainCard'

function Dashboard() {

    return (
        <div style={{ width: "auto", height: "100vh", display: "flex", flexGrow: 1, flexDirection: "column", alignItems: "flex-start", justifyContent: "center", }}>
            <Grid container spacing={3} direction="row" sx={{width: "100%", height: "100%",}}>
                <TrainCard />
            </Grid>
        </div>
    );
}

export default Dashboard;
