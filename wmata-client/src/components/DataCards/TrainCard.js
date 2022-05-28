import { useState, useEffect } from 'react';
import { styled } from '@mui/system'
import Icon from '@mdi/react'

import { Grid, Paper, Typography, Avatar, IconButton, Divider } from '@mui/material';

import { mdiAlertCircle, mdiMapMarker } from '@mdi/js';
import { Visibility } from '@mui/icons-material'



function Train() {

    return (
        <Grid item>
            <Paper variant="outlined" color="primary" sx={{ width: "350px" }}>
                <div style={{ margin: "5px 10px 5px 10px" }}>


                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                        <Avatar sx={{ bgcolor: "#00b050", marginRight: "10px" }}>GR</Avatar>
                        <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center" }}>
                            <Typography variant="h6" color="primary">
                                Train 106
                            </Typography>
                            <Typography variant="overline" sx={{ lineHeight: 1, color: "#bbb" }}>
                                to Greenbelt
                            </Typography>
                        </div>
                        <div style={{ display: "flex", flexGrow: 1, flexDirection: "row", alignItems: "center", justifyContent: "flex-end" }}>
                            <IconButton>
                                <Visibility />
                            </IconButton>
                        </div>
                    </div>

                    <div style={{ margin: "10px" }}>
                        <Typography variant="body1" color="#ddd" sx={{ marginLeft: "5px" }}>
                            At a station - Gallery Pl-Chinatown
                        </Typography>
                        <Typography variant="body2" color="#ddd" sx={{ marginLeft: "5px" }}>
                            Next stop - Mt Vernon Sq 7th St-Convention Center
                        </Typography>

                        <Divider orientation="horizontal" sx={{margin: "8px"}}/>
                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                            <Icon path={mdiAlertCircle} color="#ddd" size={1} />
                            <Typography variant="body1" color="#ddd" sx={{ marginLeft: "5px" }}>
                                No passengers
                            </Typography>
                        </div>
                    </div>

                    <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                        <Typography variant="caption" color="secondary" sx={{ lineHeight: 1.1 }}>
                            updated 27 seconds ago · 6 cars
                        </Typography>
                    </div>

                </div>
            </Paper>
        </Grid>
    );
}

export default Train;
