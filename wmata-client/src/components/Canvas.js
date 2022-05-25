import { useState, useEffect } from 'react';
import { Box, Paper } from '@mui/material';

import Icon from '@mdi/react'
import { mdiCheckboxBlankCircle } from '@mdi/js'

function Canvas() {

    const [stations, setStations] = useState([]);

    useEffect(() => {
        fetch('/api/stations')
            .then(res => res.json())
            .then(data => {
                console.log(data);
                setStations(data["Stations"]);
            });
    }, []);

    return (
        <Box sx={{ minWidth: "100%", minHeight: "100%", position: "absolute", top: 0, left: 0, display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", backgroundColor: "secondary.dark" }}>
            <Paper variant="outlined" sx={{ width: "1100px", height: "1100px", display: "flex", flexDirection: "column", alignItems: "center", justifyContent: "center", position: "relative", margin: "auto", backgroundColor: "secondary.main" }}>
                <div style={{width: "1000px", height: "1000px", position: "relative", }}>
                    {Object.keys(stations).map(key => {
                        var station = stations[key];
                        return (
                            <>
                                <Icon path={mdiCheckboxBlankCircle}
                                    size={.35}
                                    color={station.ColorHex}
                                    key={station.Code} 
                                    style={{ position: "absolute", left: station.Lon, bottom: station.Lat }} 
                                />
                            </>
                        )
                    })}
                </div>
            </Paper>
        </Box>
    );
}

export default Canvas;
