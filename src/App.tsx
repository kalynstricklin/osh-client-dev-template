import React, { useEffect, useMemo, useRef, useState } from 'react';
import Systems from 'osh-js/source/core/sweapi/system/Systems';
import SystemFilter from "osh-js/source/core/sweapi/system/SystemFilter";
import DataStreamFilter from "osh-js/source/core/sweapi/datastream/DataStreamFilter";
import System from "osh-js/source/core/sweapi/system/System";
import DataStreams from "osh-js/source/core/sweapi/datastream/DataStreams";
import VideoView from 'osh-js/source/core/ui/view/video/VideoView';
import VideoDataLayer from 'osh-js/source/core/ui/layer/VideoDataLayer';
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource"
import DataSynchronizer from 'osh-js/source/core/timesync/DataSynchronizer'
import {Mode} from 'osh-js/source/core/datasource/Mode';
import "./App.css";

function App() {

  const networkOpts = {
    endpointUrl: `162.238.96.81:8781/sensorhub/api`,
    tls: false,
    connectorOpts: {
        username: 'admin',
        password: 'admin',
    }
  };

  const systems = new Systems(networkOpts);
  const datastreams = new DataStreams(networkOpts);

  useEffect(() => {

    async function fetchSystems() {
      // Get collection of top level systems by a tag (ex: "lane" to get systems with "Lane"/"lane" in the name) with ability to select pageSize in case of large amount of lanes
      const availableSystemsCollection = await systems.searchSystems(new SystemFilter(), /*pageSize = */10);
      const availableSystems = await availableSystemsCollection.nextPage();
      console.log(availableSystems); // List of osh-js "System" objects
      
      const lane1 = availableSystems[0]; // Get whichever lane, filter by "properties.properties.uid" to ensure it matches "urn:osh:system:lane"
      // console.log(lane1); 

      const lane1SubsystemsCollection = await lane1.searchMembers(); // Returns collection of subsystems of the lane 
      const lane1Subsystems = await lane1SubsystemsCollection.nextPage();
      console.log(lane1Subsystems);

      // Retrieve certain drivers from 
      // const rpmDriver = lane1Subsystems.find((system: typeof System) => system.properties.properties.uid.startsWith("urn:osh:sensor:rapiscan"));

      // Retrieve ALL Datastreams from a system
      // const rpmDatastreamsCollection = await rpmDriver.searchDataStreams(undefined, /*pageSize = */30); // Get all datastreams 
      // // Filter by observed property, this yields only the "Occupancy" Datastream
      // const rpmOccupancyStreamsCollection = await rpmDriver.searchDataStreams(new DataStreamFilter({ observedProperty: ["http://www.opengis.net/def/occupancy"] }))
      
      // const occupancyDatastream = (await rpmOccupancyStreamsCollection.nextPage())[0];

      // You can directly subscribe to a datastreams observations
      // occupancyDatastream.streamObservations(undefined, (message: any) => {
      //   console.log(message);
      // });

      // Or create a SweApi for videostream observations
      // const process = availableSystems.find((system: typeof System) => system.properties.properties.uid.includes("urn:osh:sensor:"));
      // console.log("Process: ")
      // console.log(process)
      // const processDatastreamsCol = await process.searchDataStreams(undefined, 50);
      // const processDatastreams = await processDatastreamsCol.nextPage();
      // console.log("Process datastreams: ")
      // console.log(processDatastreams)
      // const videoDatastreamsCol = await videoDriver.searchDataStreams(new DataStreamFilter({ ObservationFilter: ["http://www.opengis.net/def/Video"] }));

      // Get all datastreams from a node paginated for whatever size
      if(datastreams !== undefined) {
        const allDatastreamsCol = await datastreams.searchDataStreams(new DataStreamFilter({ 
          q: "urn:osh:sensor:ffmpeg:lane-video002:video",
        }), /*pageSize = */100);
        const allDatastreams = await allDatastreamsCol.nextPage();
        const filteredDatastreams = allDatastreams.filter((ds: any) => ds.properties.observedProperties[0].definition.includes("http://sensorml.com/ont/swe/property/RasterImage")
      && ds.properties.outputName === "urn:osh:sensor:ffmpeg:lane-video002:video");
        console.log(filteredDatastreams); // Prints 86 individual datastreams that are directly subscribable
      }
    }

    fetchSystems();

    }
  , []);

    let videoDs: any = useMemo(() => 
      new SweApi("Videostream", {
        connectorOpts: networkOpts.connectorOpts,
        endpointUrl: networkOpts.endpointUrl,
        tls: networkOpts.tls, 
        resource: "/datastreams/i8maba56u3ms4/observations", // i8maba56u3ms4 // 4ef7f56me5422
        mode: "replay",
        protocol: "ws",
        responseFormat: "application/swe+binary",
        startTime: "2024-11-08T21:02:11Z",
        endTime: "2024-11-08T21:02:24Z"
      }), []);
      let video2Ds: any = useMemo(() => 
        new SweApi("Videostream", {
          connectorOpts: networkOpts.connectorOpts,
          endpointUrl: networkOpts.endpointUrl,
          tls: networkOpts.tls, 
          resource: "/datastreams/4ef7f56me5422/observations", // i8maba56u3ms4 // 4ef7f56me5422
          mode: "replay",
          protocol: "ws",
          responseFormat: "application/swe+binary",
          startTime: "2024-11-08T21:02:11Z",
          endTime: "2024-11-08T21:02:24Z"
        }), []);

    let masterTimeController = useMemo(() => new DataSynchronizer({
      replaySpeed: 1,
      intervalRate: 5,
      dataSources: [videoDs, video2Ds]
    }), [videoDs]);

      let videoView = useMemo(() => new VideoView({
        container: "video-container",
        name: "cat video",
        showTime: false,
        showStats: false,
        layers: [new VideoDataLayer({
          dataSourceId: [videoDs.getId()],
          getFrameData: (rec: any) => {
            return rec.img;
          },
          getTimestamp: (rec:any) => {
            return rec.timestamp;
          }
        })]
      }), [videoDs]);
      
      let video2View = useMemo(() => new VideoView({
        container: "video2-container",
        name: "cat video2",
        showTime: false,
        showStats: false,
        layers: [new VideoDataLayer({
          dataSourceId: [videoDs.getId()],
          getFrameData: (rec: any) => {
            return rec.img;
          },
          getTimestamp: (rec:any) => {
            return rec.timestamp;
          }
        })]
      }), [video2Ds]);

    useEffect(() => {
      console.log(videoDs)
      async function tryConnect() {
        if(videoDs === undefined || videoDs === null) {
          return;
        }
        const isConnected = await videoDs.isConnected();
        if(!isConnected) {
          console.log("Connecting")
          masterTimeController.connect();
        }
      }
      tryConnect();
    }, [videoDs]);

  return (
    <div className="App" style={{ flex: 1, flexDirection: 'row'}}>
      <h1>Lane: dd</h1>
      <div style={{ padding: 50 }}>
          <h2>Video From Livestream</h2>
          <div id="video-container" style={{ width: "100%", height: "100%" }}/>
      </div>
      <div style={{ padding: 50 }}>
          <h2>Video From Process Data</h2>
          <div id="video2-container" style={{ width: "100%", height: "100%" }}/>
      </div>
    </div>
  );
}

export default App;
