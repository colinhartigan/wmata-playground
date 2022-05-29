import { useState, useEffect } from 'react';
import { styled } from '@mui/system'
import Icon from '@mdi/react'

import { Grid, Paper, Typography, Avatar, IconButton, Divider } from '@mui/material';

import { mdiAlertCircle, mdiMapMarker } from '@mdi/js';
import { Visibility } from '@mui/icons-material'

import { useWMATA } from '../../utilities/useWMATA';

function NetworkStatus() {

    const WMATA = useWMATA();

    return (
        <>
            <Paper variant="outlined" color="primary" sx={{ width: "100%" }}>
                <div style={{ margin: "10px" }}>

                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                        <Typography variant="h6" color="primary">
                            Network Status
                        </Typography>
                    </div>

                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", marginRight: "10px" }}>
                            <Avatar sx={{ bgcolor: "#be1337", height: "35px", width: "35px", fontSize: 16 }}>RD</Avatar>
                        </div>
                        <Typography variant="body2" color="#ddd">
                            Local & Express shuttle bus service available at Stadium-Armory due to the summer\nplatform improvement project. Info: wmata.com/platforms
                        </Typography>
                    </div>

                </div>
            </Paper>
        </>
    );
}

export default NetworkStatus;
