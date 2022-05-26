import { useState, useEffect } from 'react';
import { Box, Paper, Tooltip, } from '@mui/material';

import { Circle } from '@mui/icons-material';

import useWindowDimensions from '../utilities/useWindowDimensions';

function Map() {

    const [stations, setStations] = useState(null);

    const [circuitElements, setCircuitElements] = useState(null);

    const [maxHeight, setMaxHeight] = useState(0);
    const [maxWidth, setMaxWidth] = useState(0);

    const [width, height] = useWindowDimensions();

    useEffect(() => {
        console.log(height);
        fetch(`/api/stations/all/${height - 40}`)
            .then(res => res.json())
            .then(data => {
                console.log(data);
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

    //find two adjacent stations, figure out distance between them, split into X equal parts, draw X circuits between them and label
    function generateCircuits(circuits) {
        let segmentedCircuit = []
        let segmentElements = []
        circuits.forEach(line => {

            var segments = line.TrackCircuits

            var x = 0;
            var y = 1;

            console.log(line)

            while (x <= segments.length && y <= segments.length - 1) {
                if (segments[x].StationCode !== null) {
                    if (segments[y].StationCode !== null && segments[y].StationCode !== segments[x].StationCode) {
                        console.log("match")

                        var stationXTarget = stations.find(station => station.Code === segments[x].StationCode);
                        var stationYTarget = stations.find(station => station.Code === segments[y].StationCode);

                        var segmentCount = y - x - 1;

                        var xStep = (stationYTarget.Lon - stationXTarget.Lon) / segmentCount;
                        var yStep = (stationYTarget.Lat - stationXTarget.Lat) / segmentCount;
                        var startX = stationXTarget.Lon+5;
                        var startY = stationXTarget.Lat+5;

                        var xCoord = startX;
                        var yCoord = startY;

                        console.log(segmentCount, startX, startY)

                        //first and last segments fall on a station dot, do not make a line

                        for (var i = 1; i < segmentCount + 1; i++) {
                            var segmentData = segments[x + i];
                            var segment = {
                                startX: Math.round(xCoord),
                                startY: Math.round(yCoord),
                                endX: Math.round(xCoord + xStep),
                                endY: Math.round(yCoord + yStep),
                                segmentId: segmentData.CircuitId,
                                isStation: segmentData.StationCode !== null,
                                lineCode: line.LineCode,
                                trackNum: line.TrackNum,
                                lineColor: line.LineColor,
                            }
                            xCoord += xStep;
                            yCoord += yStep;
                            console.log(segmentData.CircuitId);
                            segmentedCircuit.push(segment);
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
            console.log(segmentedCircuit);

        })
        segmentedCircuit.forEach(segment => {
            var element =  <line x1={segment.startX} y1={segment.startY} x2={segment.endX} y2={segment.endY} stroke={segment.lineColor} strokeWidth="2" style={{ position: "absolute" }} />
            segmentElements.push(element)

        })
        setCircuitElements(segmentElements);
    }

    return (
        <div style={{ margin: "20px 0px 20px 20px", width: maxWidth, height: maxHeight, position: "relative", }}>
            <div style={{zIndex: 2}}>
                {stations !== null ? Object.keys(stations).map(key => {
                    var station = stations[key];
                    return (
                        <Tooltip arrow key={station.Code} title={station.Name} sx={{ fontWeight: 300 }}>
                            <Circle
                                sx={{ position: "absolute", width: "auto", height: "10px", left: station.Lon, bottom: station.Lat, color: "#fff" }}
                            />
                        </Tooltip>
                    )
                }) : null}
            </div>
            <svg width={maxWidth} height={maxHeight} style={{position: "absolute", transform: "scaleY(-1)", zIndex: 1}}>
                {circuitElements !== null ? circuitElements : null}
            </svg>
            
        </div>
    );
}

export default Map;
