import React, { useEffect, useRef, useState } from 'react';
import Systems from 'osh-js/source/core/sweapi/system/Systems';
import ObservationFilter from "osh-js/source/core/sweapi/observation/ObservationFilter";
import VideoView from 'osh-js/source/core/ui/view/video/VideoView';
import VideoDataLayer from 'osh-js/source/core/ui/layer/VideoDataLayer';
import Box from "@mui/material/Box/Box"
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource"
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

  const [source, setSource] = useState(null);
  const [laneName, setLaneName] = useState("unknown");

  const systems = new Systems(networkOpts);

  useEffect(() => {

    async function fetchSystems() {
      const availableSystems = await systems.searchSystems();
      const page = await availableSystems.nextPage();
      // console.log(page);
    }

    fetchSystems();

    async function fetchSubsystems(id: string) {
      const system = await systems.getSystemById(id);
      const subsystems = await system.searchMembers();
      const page = await subsystems.nextPage();
      
      console.log(page);

      const subsystem = page[0];
      const dataStreams = await subsystem.searchDataStreams();
      const dsPage = await dataStreams.nextPage();

      const occupancyStream = dsPage[0];

      occupancyStream.streamObservations(new ObservationFilter(), (message: any[]) => {
        console.log(message[0]);
      });


      const videoSystem = page[1];
      const videoStreams = await videoSystem.searchDataStreams();
      const vsPage = await videoStreams.nextPage();

      const videoStream = vsPage[0];

      setLaneName(system.properties.properties.name);

      console.log(videoStream);

      const source = new SweApi(videoStream.properties.name, {
        protocol: videoStream.networkProperties.streamProtocol,
        endpointUrl: videoStream.networkProperties.endpointUrl,
        resource: `/datastreams/${videoStream.properties.id}/observations`,
        mode: Mode.REAL_TIME,
        tls: false,
        responseFormat: 'application/swe+binary',
        connectorOpts: videoStream.networkProperties.connectorOpts
      });
      console.log(source);
      source.connect();

      setSource(source);
    }

    // Pull id from "availableSystems"
    fetchSubsystems("k5o2ekjbnp280");
  }, []);

  useEffect(() => {
    console.log("trying to render video")

    if(source !== null){

      console.log("Video view rendering")
        const view = new VideoView({
          container: "video-container",
          showTime: false,
          showStats: false,
          layers: [new VideoDataLayer({
              dataSourceId: [source.getId()],
              getFrameData: (rec: any) => rec.img,
              getTimestamp: (rec: any) => rec.time,
          })]
      });
    }
  }, [source]);

  return (
    <div className="App">
      <h1>Lane: {laneName}</h1>
      <div style={{ padding: 50 }}>
          <div id="video-container" style={{ width: "100%", height: "100%" }}/>
      </div>
    </div>
  );
}

export default App;
