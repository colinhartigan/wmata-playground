import { useState, useEffect } from 'react';
import { styled } from '@mui/system'
import Icon from '@mdi/react'

import { Grid, Paper, Typography, Avatar, IconButton, Divider } from '@mui/material';

import { mdiAlertCircle, mdiMapMarker } from '@mdi/js';
import { Visibility } from '@mui/icons-material'

import { useWMATA } from '../../utilities/useWMATA';


const serviceTypes = {
    "Unknown": "Maintenance vehicle",
    "Special": "Special service",
    "NoPassengers": "No passengers"
}

function Train() {

    const WMATA = useWMATA();

    const [trainData, setTrainData] = useState(null);

    const [destinationName, setDestinationName] = useState(null);
    const [stationName, setStationName] = useState(null);
    const [stateText, setStateText] = useState(null)
    const [nextStopText, setNextStopText] = useState(null);


    useEffect(() => {
        update()
    }, [WMATA.trackedTrainId, WMATA.liveTrainStates])

    function update() {
        if (WMATA.trackedTrainId !== null && WMATA.liveTrainStates[WMATA.trackedTrainId] !== undefined) {
            var data = WMATA.liveTrainStates[WMATA.trackedTrainId]
            console.log(data)
            setTrainData(data);

            if (data.DestinationStationCode !== null) {
                var destination = WMATA.stations.find(station => station.Code === data.DestinationStationCode)
                setDestinationName(destination.Name)
            } else {
                setDestinationName("unknown")
            }

            var circuitId = data.CircuitId;
            var routes = WMATA.routes.filter(route => route.LineCode === data.LineCode)
            var routeSegments = null

            var destinationSegment;
            var currentSegment;

            for (let route of routes) {

                destinationSegment = route.TrackCircuits.find(segment => segment.StationCode === data.DestinationStationCode)
                currentSegment = route.TrackCircuits.find(segment => segment.CircuitId === circuitId)
                console.log(circuitId, currentSegment, destinationSegment)
                if (destinationSegment !== undefined && currentSegment !== undefined) {
                    routeSegments = route.TrackCircuits
                    break
                }
            }

            console.log(routeSegments)
            if(routeSegments === null){
                setNextStopText("")
            }

            if (data.LineCode !== "NS" && routeSegments !== null) {
                var segment = routeSegments.find(segment => segment.CircuitId === circuitId)
                var segmentIndex = segment.SeqNum;
                var stationCode = segment.StationCode

                if (stationCode !== null) {
                    var station = WMATA.stations.find(station => station.Code === stationCode)
                    setStationName(station.Name)
                    setStateText(`At ${station.Name}`)
                } else {
                    setStateText(`In transit`)
                }

                var nextStationCode;
                var nextStopText;

                var direction;
                if (currentSegment.SeqNum < destinationSegment.SeqNum) {
                    direction = 1;
                } else {
                    direction = -1;
                }
                
                if(currentSegment !== destinationSegment){
                    var i = direction === 1 ? segmentIndex + 1 : segmentIndex - 1;
                    while(i !== routeSegments.length && i !== -1) {
                        if (routeSegments[i].StationCode !== null) {
                            nextStationCode = routeSegments[i].StationCode
                            break
                        }
                        i += direction;
                    }

                    nextStopText = WMATA.stations.find(station => station.Code === nextStationCode).Name
                    setNextStopText(`Next stop - ${nextStopText}`);
                } else {
                    setNextStopText("") 
                }
            }

            
        }
    }

    return (
        <>
            {trainData !== null ?
                <Paper variant="outlined" color="primary" sx={{ width: "100%" }}>
                    <div style={{ margin: "10px" }}>

                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                            <Avatar sx={{ bgcolor: trainData.color, marginRight: "10px" }}>{trainData.LineCode}</Avatar>
                            <div style={{ display: "flex", flexDirection: "column", alignItems: "flex-start", justifyContent: "center" }}>
                                <Typography variant="h6" color="primary">
                                    Train {trainData.TrainId}
                                </Typography>
                                <Typography variant="overline" sx={{ lineHeight: 1, color: "#bbb" }}>
                                    to {destinationName}
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
                                {stateText}
                            </Typography>
                            <Typography variant="body2" color="#ddd" sx={{ marginLeft: "5px" }}>
                                {nextStopText}
                            </Typography>

                            {/* <Divider orientation="horizontal" sx={{ margin: "8px" }} />

                            <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                                <Icon path={mdiAlertCircle} color="#ddd" size={1} />
                                <Typography variant="body1" color="#ddd" sx={{ marginLeft: "5px" }}>
                                    No passengers
                                </Typography>
                            </div> */}
                        </div>

                        <div style={{ display: "flex", flexDirection: "row", alignItems: "center", justifyContent: "flex-start" }}>
                            <Typography variant="caption" color="secondary" sx={{ lineHeight: 1.1 }}>
                                dwelled for {trainData.SecondsAtLocation} seconds · {trainData.CarCount} cars
                            </Typography>
                        </div>

                    </div>
                </Paper>
                : null}
        </>
    );
}

export default Train;
