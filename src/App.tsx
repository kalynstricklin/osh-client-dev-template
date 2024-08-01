/*
 * Copyright (c) 2024.  Botts Innovative Research, Inc.
 * All Rights Reserved
 *
 * opensensorhub/osh-viewer is licensed under the
 *
 * Mozilla Public License 2.0
 * Permissions of this weak copyleft license are conditioned on making available source code of licensed
 * files and modifications of those files under the same license (or in certain cases, one of the GNU licenses).
 * Copyright and license notices must be preserved. Contributors provide an express grant of patent rights.
 * However, a larger work using the licensed work may be distributed under different terms and without
 * source code for files added in the larger work.
 *
 */

import LaneStatus from "./LaneStatus";
import React from "react";

export default function App() {
    // let server = "192.168.1.126:8282/sensorhub/sos";
    // let id = "ltcm1utn2mndo";
    // let start = useMemo(() => new Date((Date.now() - 600000)).toISOString(), []);
    // let end = "2055-01-01T00:00:00.000Z";
    //
    // const [alarmState, setAlarmState] = useState ("");
    // const [alarmColor, setAlarmColor] = useState ("");
    //
    // let neutronDataSource = new SosGetResult("neutronAlarmState",{
    //     endpointUrl: server,
    //     offeringID: "urn:osh:sensor:rapiscan:rpm001",
    //     observedProperty: "http://www.opengis.net/def/alarm",
    //     startTime: start,
    //     endTime: "2055-01-01T00:00:00.000Z",
    //     mode: Mode.REAL_TIME
    // });
    //
    // neutronDataSource.subscribe((message: any[]) => {
    //         console.log(message);
    //
    //         // @ts-ignore
    //     let msgVal: any[] = message.values;
    //
    //         msgVal.forEach((value) => setAlarm(value))
    //
    //         function setAlarm(value:any[]){
    //
    //             let state = findInObject(value, 'alarmState')
    //             console.log(state)
    //             setAlarmState(state)
    //
    //             if(state == "Alarm"){
    //                 // setAlarmColor('primary.alarm')
    //                 setAlarmColor('red')
    //             }else if (state == "Background"){
    //                 setAlarmColor('purple')
    //                 // setAlarmColor('purple')
    //             }else if (state == "Fault - Neutron High"){
    //                 // setAlarmColor('primary.fault')
    //                 setAlarmColor('yellow')
    //             }else if (state == "Scan"){
    //                 // setAlarmColor('primary.scan')
    //                 setAlarmColor('blue')
    //             }
    //         }
    //
    //     }, [EventType.DATA]);
    //
    //
    // let neutronLayerCurve = new CurveLayer({
    //     dataSourceId: neutronDataSource.id,
    //     name: "Neutron Chart (cps)",
    //     backgroundColor: 'rgba(220,89,67,0.83)',
    //     getValues: (rec: { neutronGrossCount: any; }, timeStamp: any) => {
    //         return {
    //             x: timeStamp,
    //             y: rec.neutronGrossCount
    //         }
    //     },
    // });
    //
    //
    // let neutronView = new ChartJsView({
    //     container: 'neutron-container',
    //     layers: [neutronLayerCurve],
    //     css: 'chart-view',
    //     type: "line"
    // });
    //
    // neutronDataSource.connect();


    // function findInObject(record: any, term: string) {
    //
    //     let value: any = null;
    //
    //     let targets: string[] = term.split("|");
    //
    //     for (let targetIdx = 0; value === null && targetIdx < targets.length; ++targetIdx) {
    //
    //         let key: string = targets[targetIdx].trim();
    //
    //         if (Array.isArray(record)) {
    //
    //             for (const field of record) {
    //
    //                 value = findInObject(field, key);
    //
    //                 if (value !== null) {
    //                     break;
    //                 }
    //             }
    //
    //         } else {
    //
    //             if (record.hasOwnProperty(key)) {
    //
    //                 value = record[key];
    //
    //             } else {
    //
    //                 for (const k of Object.keys(record)) {
    //
    //                     if (typeof record[k] === "object") {
    //
    //                         value = findInObject(record[k], key);
    //                     }
    //                 }
    //             }
    //         }
    //     }
    //
    //     return value;
    // }

    // return (
    //     <ThemeProvider
    //         theme={{
    //             pallet: {
    //                 primary: {
    //                     alarm: '#FF0000',
    //                     background: '#A020F0',
    //                     scan: '#FFFF00',
    //                     fault: '#359bec',
    //                 },
    //             },
    //         }}
    //
    //     >
    //         <div id="container">
    //                 <h2 className="title">Neutron Alarm State</h2>
    //                 <Box sx={{
    //                     width: 100,
    //                     height: 100,
    //                     borderRadius:1,
    //                     backgroundColor: alarmColor,
    //                 }}
    //                 >
    //                     {alarmState}
    //                 </Box>
    //             {/*<div className='char-container' id="neutron-container"></div>*/}
    //         </div>
    //     </ThemeProvider>
    // );

    return(
        <div>
            <LaneStatus></LaneStatus>
        </div>

    )
}