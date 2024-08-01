import { Stack, Typography, capitalize } from '@mui/material';
import Paper from '@mui/material/Paper';
import CircleRoundedIcon from '@mui/icons-material/CircleRounded';
import React, {useEffect, useMemo, useRef, useState} from "react";
import SosGetResult from "osh-js/source/core/datasource/sos/SosGetResult.datasource"
import {EventType} from 'osh-js/source/core/event/EventType';
import {Mode} from "osh-js/source/core/datasource/Mode";


//TODO: when state clears remove it from list
//TODO: add new lane status to the top of the list when a new state comes in
//TODO: Clicking lane routes you to live lane view of the lane u clicked on

export default function LaneStatus() {

    // let id = "ltcm1utn2mndo";
    let dataSourceList = [];
    let server = "192.168.1.69:8282/sensorhub/sos";
    let start = useMemo(() => new Date((Date.now() - 600000)).toISOString(), []);
    let end = "2055-01-01T00:00:00.000Z";

    let tamperProp = 'http://www.opengis.net/def/tamper-status';
    let alarmProp = 'http://www.opengis.net/def/alarm';

    const [statusBars, setStatus] = useState([]); //here is where ill add the lanes in
    const idVal = useRef(1);


    useEffect(() => {
        const datasource = new SosGetResult("Lane Status", {
            endpointUrl: server,
            offeringID: "urn:osh:sensor:rapiscan:rpm001",
            observedProperty: "http://www.opengis.net/def/alarm",
            startTime: start,
            endTime: "2055-01-01T00:00:00.000Z",
            mode: Mode.REAL_TIME
        });

        // let tamperSrc = new SosGetResult('tamper',{
        //     endpointUrl: server,
        //     offeringID: "urn:osh:sensor:rapiscan:rpm001",
        //     observedProperty: "http://www.opengis.net/def/tamper-status",
        //     startTime: start,
        //     endTime: "2055-01-01T00:00:00.000Z",
        //     mode: Mode.REAL_TIME
        // });
        // let gammaDataSrc = new SosGetResult('gamma',{
        //     endpointUrl: server,
        //     offeringID: "urn:osh:sensor:rapiscan:rpm001",
        //     observedProperty: "http://www.opengis.net/def/alarm",
        //     startTime: start,
        //     endTime: "2055-01-01T00:00:00.000Z",
        //     mode: Mode.REAL_TIME
        // });
        //
        // let neutronDataSrc = new SosGetResult('neutron', {
        //     endpointUrl: server,
        //     offeringID: "urn:osh:sensor:rapiscan:rpm001",
        //     observedProperty: "http://www.opengis.net/def/alarm",
        //     startTime: start,
        //     endTime: "2055-01-01T00:00:00.000Z",
        //     mode: Mode.REAL_TIME
        // });
        // dataSourceList.push(tamperSrc,gammaDataSrc, neutronDataSrc);

        let handleStatusData = ((message: any[]) => {
            console.log(message);

            // @ts-ignore
            const msgVal: any[] = message.values;

            msgVal.forEach((value) => setAlarm(value))
            function setAlarm(value:any[]){

                //TAMPER, ALARM, FAULT
                // let tamperState = findInObject(value,' tamperStatus')
                // let alarmState = findInObject(value, 'alarmState')

                // let src = findInObject(value, ''|| '')

                let state = findInObject(value, 'alarmState')

                // console.log(state)
                let circleColor, bkgColor;

                if(state == 'Alarm'){
                    circleColor = '#d12f30';
                    bkgColor = '#f0bfc0';
                } else if (state == 'Background'){
                    circleColor = '#2e7c33';
                    bkgColor = '#bfd6c1';
                }else if( state == 'Fault'){
                    circleColor = '#9b27b0';
                    bkgColor = '#e0bee7';
                }else if(state == 'Scan'){
                    circleColor = '#2195f2';
                    bkgColor = '#a9d6f3';
                }

                // if(src == datasource){
                //     alarmColor = '#d12f30';
                //     alarmHighlight = '#f0bfc0';
                // }
                // else if (src == neutronDataSrc){
                //     alarmColor = '#2195f2';
                //     alarmHighlight = '#8fb2cb';
                // }else if( (src == neutronDataSrc) && (src == datasource)){
                //     alarmColor = '#9b27b0';
                //     alarmHighlight = '#e0bee7';
                // }

                //the color of the status box is determined by the type of radiation: gamma, neutron, or both
                // if (src == gammaDataSrc) {
                //     circleColor = '#d12f30';
                //     bkgColor = '#f0bfc0';
                // } else if(src == neutronDataSrc && src == gammaDataSrc){
                //     circleColor = '#9b27b0';
                //     bkgColor = '#e0bee7';
                // }else if(src == neutronDataSrc){
                //     circleColor = '#2195f2';
                //     bkgColor = '#8fb2cb';
                // }
                //



                // create new status bar for each new notification
                const newStatus ={
                    src: "/FrontGateLeft.png", //this will change
                    name: datasource.name,
                    status: state, //fault, alarm or tamper
                    circle: circleColor,
                    background: bkgColor,
                    id: idVal.current++ //id incrementer
                };

                setStatus(prevStatus => [newStatus, ...prevStatus ]);
             }
         })
        datasource.subscribe(handleStatusData, [EventType.DATA]);
        datasource.connect();

        return () => {
            datasource.unsubscribe(handleStatusData);
            datasource.disconnect();
        };
    }, [server, start, end]);

    function findInObject(record: any, term: string) {

        let value: any = null;

        let targets: string[] = term.split("|");

        for (let targetIdx = 0; value === null && targetIdx < targets.length; ++targetIdx) {

            let key: string = targets[targetIdx].trim();

            if (Array.isArray(record)) {

                for (const field of record) {

                    value = findInObject(field, key);

                    if (value !== null) {
                        break;
                    }
                }

            } else {

                if (record.hasOwnProperty(key)) {

                    value = record[key];

                } else {

                    for (const k of Object.keys(record)) {

                        if (typeof record[k] === "object") {

                            value = findInObject(record[k], key);
                        }
                    }
                }
            }
        }

        return value;
    }

    return (
        <Paper variant='outlined' sx={{ maxHeight: "100%" }}>
            <Stack padding={2} justifyContent={"start"} spacing={1}>
                <Typography variant="h6">Lane Status</Typography>
                <Stack spacing={1} sx={{ overflow: "auto", maxHeight: "100%" }}>
                    {statusBars.map((item) => (
                        (item.status !== "none" ? (
                            <Paper key={item.id} variant='outlined' sx={{ padding: 1, backgroundColor: item.background}}>
                                <Stack direction={"row"}>
                                    <CircleRoundedIcon sx={{ color: item.circle, marginRight: 2 }} />
                                    <Typography variant="body1">{item.name} - {capitalize(item.status)}</Typography>
                                </Stack>
                            </Paper>
                        ) : (
                            <></>
                        ))
                    ))}
                </Stack>
            </Stack>
        </Paper>
    );
}

// let datasource = new SosGetResult("Lane Status",{
//     endpointUrl: server,
//     offeringID: "urn:osh:sensor:rapiscan:rpm001",
//     observedProperty: "http://www.opengis.net/def/alarm",
//     startTime: start,
//     endTime: "2055-01-01T00:00:00.000Z",
//     mode: Mode.REAL_TIME
// });
// const [alarmState, setAlarmState] = useState ("");
// const [alarmColor, setAlarmColor] = useState ("");
// const [alarmHighlight, setAlarmHighlight] = useState ("");
// setAlarmState(state);
// setAlarmColor(color);
// setAlarmHighlight(highlight);
//
// console.log(alarmColor)
// console.log(alarmState)
// console.log(alarmHighlight)
// if (state == "Alarm") {
//     setAlarmColor('red')
//     setAlarmHighlight('#FF7F7F')
// }
// else if (state == "Background"){
//     setAlarmColor('purple')
//     setAlarmHighlight('Lavender')
// }
// else if (state == "Fault - Neutron High"){
//     setAlarmColor('yellow')
//     setAlarmHighlight('LemonChiffon')
// }
// else if (state == "Scan"){
//     setAlarmColor('blue')
//     setAlarmHighlight('LightBlue')
// }
// console.log(alarmColor)
// console.log(alarmHighlight)
// msgVal.forEach((value) => {
//     let state = findInObject(value, 'alarmState');
//     console.log(state);
//     setAlarmState(alarmState)
//     if (state == "Alarm") {
//         setAlarmColor('red')
//         setAlarmHighlight('#FF7F7F')
//     }
//     // else if (state == "Fault") {
//     //     setAlarmColor('purple')
//     //     setAlarmHighlight('Lavender')
//     // } else if (state == "Tamper") {
//     //     setAlarmColor('blue')
//     //     setAlarmHighlight('LightBlue')
//     // }
//     else if (state == "Background"){
//         setAlarmColor('purple')
//         setAlarmHighlight('Lavender')
//     }
//     else if (state == "Fault - Neutron High"){
//         setAlarmColor('yellow')
//         setAlarmHighlight('LemonChiffon')
//     }
//     else if (state == "Scan"){
//         setAlarmColor('blue')
//         setAlarmHighlight('LightBlue')
//     }
//     console.log(alarmColor)
//     console.log(alarmHighlight)
// datasource.subscribe((message: any[]) => {
//     console.log(message);
//
//     // @ts-ignore
//     let msgVal: any[] = message.values;
//
//     msgVal.forEach((value) => setAlarm(value))
//
//     function setAlarm(value:any[]){
//
//         let state = findInObject(value, 'alarmState')
//         console.log(state)
//         setAlarmState(state)
//
//         if(state == "Alarm"){
//             setAlarmColor('red')
//             setAlarmHighlight('#FF7F7F')
//         }else if(state== "Fault"){
//             setAlarmColor('purple')
//             setAlarmHighlight('Lavender')
//         }else if(state== "Tamper"){
//             setAlarmColor('blue')
//             setAlarmHighlight('LightBlue')
//         }
//         // else if (state == "Background"){
//         //     setAlarmColor('purple')
//         //     setAlarmHighlight('Lavender')
//         // }
//         // else if (state == "Fault - Neutron High"){
//         //     setAlarmColor('yellow')
//         //     setAlarmHighlight('LemonChiffon')
//         // }
//         // else if (state == "Scan"){
//         //     setAlarmColor('blue')
//         //     setAlarmHighlight('LightBlue')
//         // }
//
//         console.log(alarmColor)
//         console.log(alarmHighlight)
//     }
//
// }, [EventType.DATA]);
// datasource.connect();
// let laneName = datasource.name;
// const demoLanes = [
//     {src: "/FrontGateLeft.png", name: laneName, status: alarmState, id: 1},
//     {src: "/FrontGateLeft.png", name: laneName, status: alarmState, id: 2}
// ]