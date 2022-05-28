import { useState, useEffect, useRef } from 'react';
import PrismaZoom from 'react-prismazoom'

import { Box, Paper, Tooltip, } from '@mui/material';

import { Circle } from '@mui/icons-material';

import useWindowDimensions from '../utilities/useWindowDimensions';
import { useWMATA } from '../utilities/useWMATA';

function Map() {

    //const [width, height] = useWindowDimensions();

    const WMATA = useWMATA();

    const zoomFrame = useRef(null);
    const [width, height] = useWindowDimensions()

    useEffect(() => {
        if (zoomFrame.current !== null)
            zoomFrame.current.zoomOut(.5);
    }, [zoomFrame])

    function trackTrain(id) {
        WMATA.setTrackedTrainId(id);
        zoomToTrain(id)
    }

    function zoomToTrain(id) {
        if (zoomFrame.current !== null && WMATA.liveTrainStates !== {}) {
            var train = WMATA.liveTrainStates[id];
            zoomFrame.current.zoomToZone(train.x - 100 + (WMATA.trainSize / 2), WMATA.maxHeight - (train.y + 100) - (WMATA.trainSize / 2), 200, 200);
        }
    }

    useEffect(() => {
        if (WMATA.trackedTrainId !== null) {
            zoomToTrain(WMATA.trackedTrainId);
        }
    }, [WMATA.liveTrainStates])

    return (
        <>
            {WMATA.maxHeight !== 0 ?
                <div style={{ position: "absolute", width: "100vw", height: "100vh", overflow: "hidden", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", }}>
                    <PrismaZoom minZoom={1} maxZoom={8} ref={zoomFrame} style={{ position: "absolute", width: WMATA.maxWidth, height: WMATA.maxHeight }}>
                        <div style={{ width: "100%", height: "100%", display: "flex", flexDirection: "row", justifyContent: "center", alignItems: "center", }}>
                            <div style={{ width: WMATA.maxWidth, height: WMATA.maxHeight, position: "absolute" }}>

                                {/* WMATA.stations */}
                                <div style={{ position: "absolute", left: 0, bottom: 0, zIndex: 2 }}>
                                    {WMATA.stations !== null ? Object.keys(WMATA.stations).map(key => {
                                        var station = WMATA.stations[key];
                                        return (
                                            <Tooltip arrow key={station.Code} title={station.Name} sx={{ fontWeight: 300 }}>
                                                <Circle sx={{ position: "absolute", width: "auto", height: WMATA.stationSize, left: station.Lon, bottom: station.Lat, color: "primary.light" }} onClick={() => { console.log(station.Name) }} />
                                            </Tooltip>
                                        )
                                    }) : null}
                                </div>

                                {/* trains */}
                                <div style={{ position: "absolute", left: 0, bottom: 0, zIndex: 3 }}>
                                    {WMATA.liveTrainStates !== {} ? Object.keys(WMATA.liveTrainStates).map(train => {
                                        // console.log(WMATA.liveTrainStates)
                                        var trainData = WMATA.liveTrainStates[train]
                                        //console.log(trainData)
                                        return (
                                            <Tooltip key={trainData.TrainId} title={trainData.status}>
                                                <Circle onClick={() => { trackTrain(trainData.TrainId) }} sx={{ position: "absolute", width: "auto", height: WMATA.trainSize, left: trainData.x, bottom: trainData.y, color: (trainData.color), transition: `left ${WMATA.refreshInterval}s linear, bottom ${WMATA.refreshInterval}s linear` }} />
                                            </Tooltip>
                                        )
                                    }) : null}
                                </div>

                                {/* track segments */}
                                <svg width={WMATA.maxWidth} height={WMATA.maxHeight} style={{ position: "absolute", bottom: 0, left: 0, transform: "scaleY(-1)", zIndex: 1 }}>
                                    {WMATA.trackSegments.map(segment => {
                                        return (
                                            <line key={`${segment.stationXCode} - ${segment.stationYCode}`} x1={segment.startX} y1={segment.startY} x2={segment.endX} y2={segment.endY} stroke={segment.lineColors[0]} strokeWidth={WMATA.trackSize} style={{ position: "absolute" }} />
                                        )
                                    })}
                                </svg>

                            </div>
                        </div>
                    </PrismaZoom>
                </div>
                : null}
        </>
    );
}

export default Map;
