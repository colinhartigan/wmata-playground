import { useState, useEffect } from 'react';
import { Box, Paper } from '@mui/material';

import Map from './Map'
import Dashboard from './Dashboard'

import { useWMATAMaster } from '../utilities/useWMATA'
import useWindowDimensions from '../utilities/useWindowDimensions';

function Canvas() {

    const [
        stations,
        maxHeight,
        circuitSegments,
        trackSegments,
        liveTrainStates,
        setHeight,
        setStationSize,
        setTrainSize,
        setTrackSize,
        setRefreshInterval
    ] = useWMATAMaster();

    //const [width, height] = useWindowDimensions();
    const height = 1000;

    return (
        <Box sx={{ width: "100vw", height: "100vh", position: "absolute", top: 0, left: 0, display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "center", backgroundColor: "secondary.dark" }}>
            <Map />
            <Dashboard />
        </Box>
    );
}

export default Canvas;
