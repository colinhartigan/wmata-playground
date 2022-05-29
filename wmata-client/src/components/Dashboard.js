import { useState, useEffect } from 'react';
import { Grid, Paper } from '@mui/material';

import TrainCard from './DataCards/TrainCard'
import NetworkStatus from './DataCards/NetworkStatus'

function Dashboard() {

    return (
        <div style={{ width: "400px", height: "500px", position: "absolute", left: 20, top: 20, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "flex-start", backgroundColor: "transparent", gap: "10px 0px" }}>
            <TrainCard />
            {/* <NetworkStatus /> */}
        </div>
    );
}

export default Dashboard;
