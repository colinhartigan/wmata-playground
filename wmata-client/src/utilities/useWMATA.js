import { useEffect, useState } from 'react';
import { createGlobalState } from 'react-hooks-global-state';

const defaultState = {
    stations: null,
    lines: null,
    routes: null,
    circuitSegments: null,
    trackSegments: [],
    liveTrainStates: {},

    trackedTrainId: null,

    maxHeight: 0,
    maxWidth: 0,

    height: 1000,
    stationSize: 10,
    trainSize: 20,
    trackSize: 2,
    refreshInterval: 7,
}

const { useGlobalState } = createGlobalState(defaultState);
const scaleFactor = 1

function useWMATAMaster(startHeight) {
    const [stations, setStations] = useGlobalState('stations');
    const [lines, setLines] = useGlobalState('lines');
    const [routes, setRoutes] = useGlobalState('routes');
    const [circuitSegments, setCircuitSegments] = useGlobalState('circuitSegments');
    const [trackSegments, setTrackSegments] = useGlobalState('trackSegments');
    const [liveTrainStates, setLiveTrainStates] = useGlobalState('liveTrainStates')

    const [trackedTrainId, setTrackedTrainId] = useGlobalState('trackedTrainId');

    const [maxHeight, setMaxHeight] = useGlobalState('maxHeight');
    const [maxWidth, setMaxWidth] = useGlobalState('maxWidth');

    const [height, setHeight] = useGlobalState('height');
    const [stationSize, setStationSize] = useGlobalState('stationSize');
    const [trainSize, setTrainSize] = useGlobalState('trainSize');
    const [trackSize, setTrackSize] = useGlobalState('trackSize');
    const [refreshInterval, setRefreshInterval] = useGlobalState('refreshInterval');

    useEffect(() => {
        startHeight = startHeight * scaleFactor; 

        setHeight(startHeight);
        setStationSize(startHeight / 200);
        setTrainSize(startHeight / 90);
        setTrackSize(startHeight / 500);

        fetch("/api/lines")
            .then(res => res.json())
            .then(data => {
                setLines(data.Lines);
            })

    }, []);

    useEffect(() => {
        if (lines !== null) {
            fetch(`/api/stations/all`)
                .then(res => res.json())
                .then(data => {
                    setMaxHeight(data.MaxHeight)
                    setMaxWidth(data.MaxWidth)
                    parseStations(data.Stations)
                });
        }
    }, [lines])

    useEffect(() => {
        if (stations !== null) {
            fetch("/api/circuits/all")
                .then(res => res.json())
                .then(data => {
                    generateCircuits(data["StandardRoutes"])
                });
        }
    }, [stations]);

    useEffect(() => {
        if (circuitSegments !== null) {
            function update() {
                console.log("train update")
                fetch("/api/trains")
                    .then(res => res.json())
                    .then(data => {
                        generateTrainData(data["TrainPositions"]);
                    })
            }
            update();
            setInterval(() => {
                update();
            }, refreshInterval * 1000);
        }
    }, [circuitSegments])


    function parseStations(stations) {
        var h = height - (trainSize * 4)
        console.log(h)

        var lats = stations.map(station => station.Lat);
        var lons = stations.map(station => station.Lon);

        var maxLat = Math.max.apply(null, lats)
        var maxLon = Math.max.apply(null, lons)
        var minLat = Math.min.apply(null, lats)
        var minLon = Math.min.apply(null, lons)

        for (let station of stations) {
            station.Lat = Math.round((station.Lat - minLat) / (maxLat - minLat) * h) + (trainSize / 2);
            station.Lon = Math.round((station.Lon - minLon) / (maxLon - minLon) * h) + (trainSize / 2);
            station.ColorHex = lines[station.LineCode1].ColorHex;
        }

        var maxHeight = Math.max.apply(null, stations.map(station => station.Lat)) + trainSize;
        var maxWidth = Math.max.apply(null, stations.map(station => station.Lon)) + trainSize;

        setMaxHeight(maxHeight)
        setMaxWidth(maxWidth)
        setStations(stations)

    }

    function generateTrainData(trains) {
        if (circuitSegments !== null) {
            //console.log(circuitSegments)
            let newStates = {};
            trains.forEach(train => {
                if (circuitSegments.find(segment => segment.segmentId === train.CircuitId)) { //filter out trains not on main tracks
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
                        ...train,
                        x: 0,
                        y: 0,
                        status: "",
                        color: train.LineColor !== null ? train.LineColor : "#fff" //set up initial states table
                    };

                    trainStates.x = anchorX - trainSize / 2
                    trainStates.y = anchorY - trainSize / 2
                    trainStates.status = `${train.LineCode} ${train.TrainId}${status}`;

                    newStates[train.TrainId] = trainStates;
                    //console.log(trainStates)

                    // let newState = { ...newStates, [train.TrainId]: trainStates }
                    // //console.log(trainStates);
                    // newStates = newState;

                }
            });
            console.log(newStates);
            setLiveTrainStates(newStates);
        }
    }

    //find two adjacent stations, figure out distance between them, split into X equal parts, draw X circuits between them and label
    function generateCircuits(circuits) {
        console.log(circuits)

        let segmentedCircuit = []
        let trackSegments = []

        var trackSegmentId = 0;

        circuits.forEach(line => {

            var segments = line.TrackCircuits

            var x = 0;
            var y = 1;

            while (x <= segments.length && y <= segments.length - 1) {
                if (segments[x].StationCode !== null) {
                    if (segments[y].StationCode !== null && segments[y].StationCode !== segments[x].StationCode) {
                        console.log(segments[x].StationCode, segments[y].StationCode)
                        var stationXTarget = stations.find(station => station.Code === segments[x].StationCode);
                        var stationYTarget = stations.find(station => station.Code === segments[y].StationCode);
                        console.log(stationXTarget);

                        var segmentCount = y - x;

                        var xStep = (stationYTarget.Lon - stationXTarget.Lon) / segmentCount;
                        var yStep = (stationYTarget.Lat - stationXTarget.Lat) / segmentCount;
                        var startX = stationXTarget.Lon + stationSize / 2;
                        var startY = stationXTarget.Lat + stationSize / 2;
                        var endX = stationYTarget.Lon + stationSize / 2;
                        var endY = stationYTarget.Lat + stationSize / 2;

                        var xCoord = startX;
                        var yCoord = startY;

                        //generate data for each inter-station track segment
                        var trackSegment;
                        var segmentExists = trackSegments.find(segment => (segment.stationXCode === stationXTarget.Code && segment.stationYCode === stationYTarget.Code) || (segment.stationXCode === stationYTarget.Code && segment.stationYCode === stationXTarget.Code) || (segment.stationYCode === stationXTarget.Code && segment.stationXCode === stationYTarget.Code))
                        if (segmentExists !== undefined) {
                            console.log("dupe")
                            trackSegment = segmentExists
                            console.log(trackSegment)
                        } else {
                            trackSegment = {
                                stationXCode: stationXTarget.Code,
                                stationYCode: stationYTarget.Code,
                                stationXName: stationXTarget.Name,
                                stationYName: stationYTarget.Name,
                                startX: startX,
                                startY: startY,
                                endX: endX,
                                endY: endY,
                                id: trackSegmentId,
                                lineCodes: [],
                                lineColors: [],
                                includedCircuitSegments: [],
                            }
                        }

                        if (!trackSegment.lineCodes.includes(line.LineCode))
                            trackSegment.lineCodes.push(line.LineCode);
                        
                        if(!trackSegment.lineColors.includes(line.LineColor))
                            trackSegment.lineColors.push(line.LineColor);



                        //first and last segments fall on a station dot, do not make a line
                        //generate data for each circuit section
                        for (var i = 0; i < segmentCount + 1; i++) {
                            var segmentData = segments[x + i];
                            var circuitSegment;

                            trackSegment.includedCircuitSegments.push(segmentData.CircuitId);

                            if (segmentData.StationCode !== null) {
                                circuitSegment = {
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
                                segmentedCircuit.push(circuitSegment);
                            } else {
                                if (!segmentedCircuit.some(segment => segment.segmentId === segmentData.CircuitId && segment.lineCode === line.LineCode)) {
                                    circuitSegment = {
                                        startX: xCoord,
                                        startY: yCoord,
                                        endX: xCoord + xStep,
                                        endY: yCoord + yStep,
                                        anchorX: (xCoord + (xCoord + xStep - xCoord) / 2),
                                        anchorY: (yCoord + (yCoord + yStep - yCoord) / 2),
                                        segmentId: segmentData.CircuitId,
                                        order: segmentData.SeqNum,
                                        lineCode: line.LineCode,
                                        trackNum: line.TrackNum,
                                        lineColor: line.LineColor,
                                        stationCode: segmentData.StationCode,
                                    }
                                    xCoord += xStep;
                                    yCoord += yStep;
                                    segmentedCircuit.push(circuitSegment);
                                }
                            }
                        }

                        if (segmentExists === undefined)
                            trackSegments.push(trackSegment);

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
            setTrackSegments(trackSegments);
            setRoutes(circuits);
        })
    }

    return [];
}

function useWMATA() {
    const [stations, setStations] = useGlobalState('stations');
    const [lines, setLines] = useGlobalState('lines');
    const [routes, setRoutes] = useGlobalState('routes');
    const [circuitSegments, setCircuitSegments] = useGlobalState('circuitSegments');
    const [trackSegments, setTrackSegments] = useGlobalState('trackSegments');
    const [liveTrainStates, setLiveTrainStates] = useGlobalState('liveTrainStates');

    const [trackedTrainId, setTrackedTrainId] = useGlobalState('trackedTrainId');

    const [maxHeight, setMaxHeight] = useGlobalState('maxHeight');
    const [maxWidth, setMaxWidth] = useGlobalState('maxWidth')

    const [height, setHeight] = useGlobalState('height');
    const [stationSize, setStationSize] = useGlobalState('stationSize');
    const [trainSize, setTrainSize] = useGlobalState('trainSize');
    const [trackSize, setTrackSize] = useGlobalState('trackSize');
    const [refreshInterval, setRefreshInterval] = useGlobalState('refreshInterval');

    function updateScale(zoom) {
        setStationSize(defaultState.stationSize / zoom);
        setTrainSize(defaultState.trainSize / zoom);
        setTrackSize(defaultState.trackSize / zoom);
    }

    const controller = {
        stations: stations,
        lines: lines,
        routes: routes,
        circuitSegments: circuitSegments,
        trackSegments: trackSegments,
        liveTrainStates: liveTrainStates,
        trackedTrainId: trackedTrainId,
        maxHeight: maxHeight,
        maxWidth: maxWidth,
        height: height,
        stationSize: stationSize,
        trainSize: trainSize,
        trackSize: trackSize,
        refreshInterval: refreshInterval,

        setStations: setStations,
        setLines: setLines,
        setCircuitSegments: setCircuitSegments,
        setTrackSegments: setTrackSegments,
        setLiveTrainStates: setLiveTrainStates,
        setTrackedTrainId: setTrackedTrainId,
        setMaxHeight: setMaxHeight,
        setMaxWidth: setMaxWidth,
        setHeight: setHeight,
        setStationSize: setStationSize,
        setTrainSize: setTrainSize,
        setTrackSize: setTrackSize,
        setRefreshInterval: setRefreshInterval,
    }

    return controller;
}

export { useWMATAMaster, useWMATA };