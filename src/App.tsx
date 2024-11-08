import React, { useEffect, useRef, useState } from 'react';
import Systems from 'osh-js/source/core/sweapi/system/Systems';
import SystemFilter from "osh-js/source/core/sweapi/system/SystemFilter";
import DataStreamFilter from "osh-js/source/core/sweapi/datastream/DataStreamFilter";
import System from "osh-js/source/core/sweapi/system/System";
import DataStreams from "osh-js/source/core/sweapi/datastream/DataStreams";
import VideoView from 'osh-js/source/core/ui/view/video/VideoView';
import VideoDataLayer from 'osh-js/source/core/ui/layer/VideoDataLayer';
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource"
import {Mode} from 'osh-js/source/core/datasource/Mode';
import "./App.css";

function App() {

  const networkOpts = {
    endpointUrl: `localhost:8282/sensorhub/api`,
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
      const process = availableSystems.find((system: typeof System) => system.properties.properties.uid.includes("urn:osh:sensor:"));
      console.log("Process: ")
      console.log(process)
      const processDatastreamsCol = await process.searchDataStreams(undefined, 50);
      const processDatastreams = await processDatastreamsCol.nextPage();
      console.log("Process datastreams: ")
      console.log(processDatastreams)
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

  return (
    <div className="App">
      <h1>Lane: dd</h1>
      <div style={{ padding: 50 }}>
          <div id="video-container" style={{ width: "100%", height: "100%" }}/>
      </div>
    </div>
  );
}

export default App;
