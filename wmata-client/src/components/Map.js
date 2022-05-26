import { useState, useEffect } from 'react';
import { Box, Paper, Tooltip, } from '@mui/material';

import { Circle } from '@mui/icons-material';

import useWindowDimensions from '../utilities/useWindowDimensions';

function Map() {

    const [stations, setStations] = useState(null);
    const [circuitSegments, setCircuitSegments] = useState(null);

    const [circuitElements, setCircuitElements] = useState(null);

    const [liveTrainStates, setLiveTrainStates] = useState({});
    const [liveTrainElements, setLiveTrainElements] = useState({});

    const [maxHeight, setMaxHeight] = useState(0);
    const [maxWidth, setMaxWidth] = useState(0);

    //const [width, height] = useWindowDimensions();
    const height = 2000;

    const REFRESH_INTERVAL = 7;

    useEffect(() => {
        fetch(`/api/stations/all/${height - 40}`)
            .then(res => res.json())
            .then(data => {
                setMaxHeight(data.MaxHeight)
                setMaxWidth(data.MaxWidth)
                setStations(data["Stations"]);
            });

    }, []);

    useEffect(() => {
        if (stations !== null) {
            fetch("/api/circuits/all")
                .then(res => res.json())
                .then(data => {
                    generateCircuits(data["StandardRoutes"])
                });
        }
    }, [stations]);

    function trackTrains(circuitSegments) {
        setInterval(() => {
            console.log("train update")
            fetch("/api/trains")
                .then(res => res.json())
                .then(data => {
                    generateTrainData(data["TrainPositions"], circuitSegments);
                })
        }, REFRESH_INTERVAL*1000);
    }

    function generateTrainData(trains, circuitSegments) {
        if (circuitSegments !== null) {
            //console.log(circuitSegments)
            let newStates = liveTrainStates;
            trains.forEach(train => {
                if (circuitSegments.find(segment => segment.segmentId === train.CircuitId)) { //filter out trains not on main tracks
                    console.log(train);
                    var segment = circuitSegments.find(segment => segment.segmentId === train.CircuitId)
                    var anchorX = segment.anchorX
                    var anchorY = segment.anchorY

                    train.LineCode = train.LineCode !== null ? train.LineCode : "NS"

                    var status = "";
                    if (segment.stationCode !== null) {
                        var station = stations.find(station => station.Code === segment.stationCode)
                        status = " - at " + station.Name;
                    }

                    var trainStates = train.TrainId in Object.keys(liveTrainStates) ? liveTrainStates[train.TrainId] : {
                        trainId: train.TrainId,
                        lineCode: train.LineCode,
                        x: 0,
                        y: 0,
                        status: "",
                        color: train.LineColor !== null ? train.LineColor : "#fff" //set up initial states table
                    };

                    trainStates.x = anchorX - 10
                    trainStates.y = anchorY - 10
                    trainStates.status = `${train.LineCode} ${train.TrainId}${status}`;

                    let newState = { ...newStates, [train.TrainId]: trainStates }
                    //console.log(trainStates);
                    newStates = newState;

                }
            });
            setLiveTrainStates(newStates);
        }
    }

    //find two adjacent stations, figure out distance between them, split into X equal parts, draw X circuits between them and label
    function generateCircuits(circuits) {
        let segmentedCircuit = []
        let segmentElements = []
        circuits.forEach(line => {

            var segments = line.TrackCircuits

            var x = 0;
            var y = 1;

            while (x <= segments.length && y <= segments.length - 1) {
                if (segments[x].StationCode !== null) {
                    if (segments[y].StationCode !== null && segments[y].StationCode !== segments[x].StationCode) {

                        var stationXTarget = stations.find(station => station.Code === segments[x].StationCode);
                        var stationYTarget = stations.find(station => station.Code === segments[y].StationCode);

                        var segmentCount = y - x;

                        var xStep = (stationYTarget.Lon - stationXTarget.Lon) / segmentCount;
                        var yStep = (stationYTarget.Lat - stationXTarget.Lat) / segmentCount;
                        var startX = stationXTarget.Lon + 5;
                        var startY = stationXTarget.Lat + 5;

                        var xCoord = startX;
                        var yCoord = startY;


                        //first and last segments fall on a station dot, do not make a line

                        for (var i = 0; i < segmentCount; i++) {
                            var segmentData = segments[x + i];
                            if (segmentData.StationCode !== null) {
                                var segment = {
                                    startX: Math.round(xCoord),
                                    startY: Math.round(yCoord),
                                    endX: Math.round(xCoord),
                                    endY: Math.round(yCoord),
                                    anchorX: Math.round(xCoord) + ((Math.round(xCoord + xStep) - Math.round(xCoord)) / 2),
                                    anchorY: Math.round(yCoord) + ((Math.round(yCoord + yStep) - Math.round(yCoord)) / 2),
                                    segmentId: segmentData.CircuitId,
                                    order: segmentData.SeqNum,
                                    lineCode: line.LineCode,
                                    trackNum: line.TrackNum,
                                    lineColor: line.LineColor,
                                    stationCode: segmentData.StationCode,
                                }
                                segmentedCircuit.push(segment);
                            } else {
                                if (!segmentedCircuit.some(segment => segment.segmentId === segmentData.CircuitId && segment.lineCode === line.LineCode)) {
                                    var segment = {
                                        startX: Math.round(xCoord),
                                        startY: Math.round(yCoord),
                                        endX: Math.round(xCoord + xStep),
                                        endY: Math.round(yCoord + yStep),
                                        anchorX: Math.round(xCoord) + ((Math.round(xCoord + xStep) - Math.round(xCoord)) / 2),
                                        anchorY: Math.round(yCoord) + ((Math.round(yCoord + yStep) - Math.round(yCoord)) / 2),
                                        segmentId: segmentData.CircuitId,
                                        order: segmentData.SeqNum,
                                        lineCode: line.LineCode,
                                        trackNum: line.TrackNum,
                                        lineColor: line.LineColor,
                                        stationCode: segmentData.StationCode,
                                    }
                                    xCoord += xStep;
                                    yCoord += yStep;
                                    segmentedCircuit.push(segment);
                                }
                            }
                        }

                        x = y;
                        y += 1;

                    } else {
                        y++;
                    }

                } else {
                    x++;
                }

            }
            setCircuitSegments(segmentedCircuit);
        })
        segmentedCircuit.forEach(segment => {
            var element = <Tooltip key={`${segment.lineCode}_${segment.segmentId}`} title={`${segment.lineCode}_${segment.segmentId}`}>
                <line x1={segment.startX} y1={segment.startY} x2={segment.endX} y2={segment.endY} stroke={segment.lineColor} strokeWidth="2" style={{ position: "absolute" }} />
            </Tooltip>
            segmentElements.push(element)

        })
        setCircuitElements(segmentElements);
        trackTrains(segmentedCircuit);
    }

    return (
        <div style={{ margin: "20px 0px 20px 20px", width: maxWidth, height: maxHeight, position: "relative", }}>
            <div style={{ position: "absolute", left: 0, bottom: 0, zIndex: 2 }}>
                {stations !== null ? Object.keys(stations).map(key => {
                    var station = stations[key];
                    return (
                        <Tooltip arrow key={station.Code} title={station.Name} sx={{ fontWeight: 300 }}>
                            <Circle sx={{ position: "absolute", width: "auto", height: "10px", left: station.Lon, bottom: station.Lat, color: "#fff" }} />
                        </Tooltip>
                    )
                }) : null}
            </div>

            <div style={{ position: "absolute", left: 0, bottom: 0, zIndex: 3 }}>
                {Object.keys(liveTrainStates).map(train => {
                    console.log(liveTrainStates)
                    var trainData = liveTrainStates[train]
                    console.log(trainData)
                    return (
                        <Tooltip key={trainData.trainId} title={trainData.status}>
                            <Circle sx={{ position: "absolute", width: "auto", height: "20px", left: trainData.x, bottom: trainData.y, color: (trainData.color), transition: `${REFRESH_INTERVAL}s linear` }} />
                        </Tooltip>
                    )
                })}
            </div>

            <svg width={maxWidth} height={maxHeight} style={{ position: "absolute", transform: "scaleY(-1)", zIndex: 1 }}>
                {circuitElements !== null ? circuitElements : null}
            </svg>

        </div>
    );
}

export default Map;
