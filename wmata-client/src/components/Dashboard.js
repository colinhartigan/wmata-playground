import { useState, useEffect } from 'react';
import { Grid, Paper } from '@mui/material';

import TrainCard from './DataCards/TrainCard'

function Dashboard() {

    return (
        <div style={{ width: "400px", height: "500px", position: "absolute", left: 20, top: 20, display: "flex", flexDirection: "row", alignItems: "flex-start", justifyContent: "center", backgroundColor: "transparent" }}>
            <TrainCard />
        </div>
    );
}

export default Dashboard;
