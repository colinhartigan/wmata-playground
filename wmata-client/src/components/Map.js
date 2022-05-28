import { useState, useEffect } from 'react';
import PrismaZoom from 'react-prismazoom'

import { Box, Paper, Tooltip, } from '@mui/material';

import { Circle } from '@mui/icons-material';

import useWindowDimensions from '../utilities/useWindowDimensions';
import { useWMATA } from '../utilities/useWMATA';

function Map() {

    const [circuitElements, setCircuitElements] = useState([]);

    //const [width, height] = useWindowDimensions();

    const [
        stations, 
        maxHeight, 
        maxWidth, 
        circuitSegments, 
        trackSegments, 
        liveTrainStates, 
        setHeight, 
        stationSize, 
        setStationSize, 
        trainSize, 
        setTrainSize, 
        trackSize, 
        setTrackSize, 
        refreshInterval, 
        setRefreshInterval
    ] = useWMATA();

    useEffect(() => {
        console.log(maxWidth)
        let segmentElements = []

        trackSegments.forEach(segment => {
            var element = <line key={`${segment.stationXCode} - ${segment.stationYCode}`} x1={segment.startX} y1={segment.startY} x2={segment.endX} y2={segment.endY} stroke={segment.lineColors[0]} strokeWidth={trackSize} style={{ position: "absolute" }} />
            segmentElements.push(element)
        })

        //DEBUG: render segments
        // segmentedCircuit.forEach(segment => {
        //     var element = <Tooltip key={`${segment.lineCode}_${segment.segmentId}`} title={`${segment.lineCode}_${segment.segmentId}`}>
        //         <line x1={segment.startX} y1={segment.startY} x2={segment.endX} y2={segment.endY} stroke={segment.lineColor} strokeWidth="2" style={{ position: "absolute" }} />
        //     </Tooltip>
        //     segmentElements.push(element)

        // })

        setCircuitElements(segmentElements);
    }, [trackSegments])

    useEffect(() => {
        console.log(liveTrainStates)
    }, [liveTrainStates])

    return (
        <>
            {maxHeight !== 0 ?
                <div style={{ margin: "15px 20px 15px 20px", width: maxWidth, height: maxHeight, position: "relative", overflow: "hidden" }}>
                    <PrismaZoom minZoom={1} style={{ width: "100%", height: "100%" }}>
                        <div style={{ position: "absolute", top: maxHeight, }}>
                            <div style={{ position: "absolute", left: 0, bottom: 0, zIndex: 2 }}>
                                {stations !== null ? Object.keys(stations).map(key => {
                                    var station = stations[key];
                                    return (
                                        <Tooltip arrow key={station.Code} title={station.Name} sx={{ fontWeight: 300 }}>
                                            <Circle sx={{ position: "absolute", width: "auto", height: stationSize, left: station.Lon, bottom: station.Lat, color: "primary.light" }} onClick={() => { console.log(station.Name) }} />
                                        </Tooltip>
                                    )
                                }) : null}
                            </div>

                            <div style={{ position: "absolute", left: 0, bottom: 0, zIndex: 3 }}>
                                {Object.keys(liveTrainStates).map(train => {
                                    // console.log(liveTrainStates)
                                    var trainData = liveTrainStates[train]
                                    console.log(trainData)
                                    return (
                                        <Tooltip key={trainData.trainId} title={trainData.status}>
                                            <Circle sx={{ position: "absolute", width: "auto", height: trainSize, trainSize, left: trainData.x, bottom: trainData.y, color: (trainData.color), transition: `left ${refreshInterval}s, bottom ${refreshInterval}s` }} />
                                        </Tooltip>
                                    )
                                })}
                            </div>

                            <svg width={maxWidth} height={maxHeight} style={{ position: "absolute", bottom: 0, left: 0, transform: "scaleY(-1)", zIndex: 1 }}>
                                {circuitElements !== [] ? circuitElements : null}
                            </svg>
                        </div>
                    </PrismaZoom>
                </div>
                : null}
        </>
    );
}

export default Map;
