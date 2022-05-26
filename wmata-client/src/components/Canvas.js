import { useState, useEffect } from 'react';
import { Box, Paper } from '@mui/material';

import Map from './Map'

function Canvas() {

    return (
        <Box sx={{ minWidth: "100%", minHeight: "100%", position: "absolute", top: 0, left: 0, display: "flex", flexDirection: "column", justifyContent: "center", backgroundColor: "secondary.dark" }}>
            <Map/>
        </Box>
    );
}

export default Canvas;
