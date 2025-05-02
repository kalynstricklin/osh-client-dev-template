import React, { useEffect, useMemo, useRef, useState } from 'react';
import Systems from "osh-js/source/core/consysapi/system/Systems.js"
import ControlStreams from "osh-js/source/core/consysapi/controlstream/ControlStreams.js"
import DataStreams from "osh-js/source/core/consysapi/datastream/DataStreams.js"
import DataStream from "osh-js/source/core/consysapi/datastream/DataStream.js"
import SamplingFeatures from "osh-js/source/core/consysapi/samplingfeature/SamplingFeatures.js"
import Observations from "osh-js/source/core/consysapi/observation/Observations.js"
import ObservationFilter from "osh-js/source/core/consysapi/observation/ObservationFilter.js"
import VideoView from "osh-js/source/core/ui/view/video/VideoView.js"
import VideoDataLayer from "osh-js/source/core/ui/layer/VideoDataLayer.js"
import Commands from "osh-js/source/core/consysapi/command/Commands.js"
import ConSysApi from "osh-js/source/core/datasource/consysapi/ConSysApi.datasource.js"
import { Mode } from "osh-js/source/core/datasource/Mode";
import DataSynchronizer from "osh-js/source/core/timesync/DataSynchronizer.js"

import "./App.css";

function App() {

  const networkOpts ={
    endpointUrl: '104.179.198.202:8282/sensorhub/api',
    connectorOpts: {
        username: 'admin',
        password: 'oscar',
    }
  };

  const systems = new Systems(networkOpts);
  const datastreams = new DataStreams(networkOpts);
  const observations = new Observations(networkOpts);
  const controlstreams = new ControlStreams(networkOpts);
  const commands = new Commands(networkOpts);
  const features = new SamplingFeatures(networkOpts);

  const [time, setTime] = useState("2025-04-23T16:51:53Z");

  let videoSource: typeof ConSysApi = null;
  let videoView: typeof VideoView = null;
  let videoLayer: typeof VideoDataLayer = null;
  let ds: typeof DataStream = null;
  let masterTimeController: typeof DataSynchronizer = null;

  const [weatherObs, setWeatherObs] = useState("");

  useEffect(() => {
    async function fetchData() {
      // Lane system
      const sys = await systems.getSystemById("haso9uhmu6imu");
      console.log(sys);

      ds = await datastreams.getDataStreamById("mkin73ik1q45m");

      videoSource = new ConSysApi('video', {
        protocol: ds.networkProperties.streamProtocol,
        endpointUrl: ds.networkProperties.endpointUrl,
        resource: `/datastreams/${ds.properties.id}/observations`,
        tls: false,
        startTime: "2025-04-23T16:51:53Z",
        endTime: "2025-04-23T17:54:32Z",
        responseFormat: "application/swe+binary",
        mode: Mode.REPLAY,
      });

      console.log(ds);

      // weatherDs.streamObservations(undefined, (obs: any) => {
      //   setWeatherObs(obs[0].result);
      //   // console.log(obs[0].result);
      // });

      videoLayer = new VideoDataLayer({
        dataSourceId: videoSource.id,
        getFrameData: (rec: any) => rec.img,
        getTimestamp: (rec: any) => rec.timestamp,
      })

      videoView = new VideoView({
        container: "video-view",
        showStats: false,
        showTime: false,
        layers: [videoLayer]
      });

      masterTimeController =  new DataSynchronizer({
        replaySpeed: 1,
        intervalRate: 5,
        dataSources: [videoSource]
      });
    }
    fetchData();
  }, []);

  function start() {
    masterTimeController.connect();
  }

  function moveTime(newTime: String) {
    console.log(masterTimeController);
    masterTimeController.setTimeRange(
        newTime,
        "2025-04-23T17:52:32Z",
        masterTimeController.getReplaySpeed(),
        false
    );
  }

  function printCurrentData() {
    console.log(videoLayer.getProps())
    console.log(videoLayer.getCurrentProps())
  }
  async function setFrame() {

    const sys = await systems.getSystemById("haso9uhmu6imu");

    const ds = await datastreams.getDataStreamById("mkin73ik1q45m");

    const obs = await ds.searchObservations(new ObservationFilter({
      format: 'application/swe+binary',
      phenomenonTime: `${/*startTime+500ms*/}/${/*endTime-500ms*/}`
    }), 1);

    const obsPage = await obs.nextPage();

    let imgBlob = new Blob([obsPage[3].img.data]);
    let url = window.URL.createObjectURL(imgBlob);

    var imgTag = document.getElementById("test");
    let oldBlobURL = imgTag.src;
    imgTag.src = url;
  }

  let frameSrc = "";

  function pause() {
    console.log(masterTimeController)
    masterTimeController.disconnect();
    console.log(masterTimeController)
    var img = document.getElementsByClassName("video-mjpeg");
    frameSrc = (img[0].src);
  }

  function play() {
    console.log(masterTimeController);
    var img = document.getElementsByClassName("video-mjpeg");

    masterTimeController.connect().finally(() => {
      if(img.length > 0) {
        console.log("Setting src to ", img[0].src);
        img[0].src = frameSrc;
        console.log(frameSrc);
      }
    });
  }

  return (
    <div className="App" style={{ flex: 1, flexDirection: 'row'}}>
      <h2>Streaming data from weather sensor</h2>
      {/*<div>{JSON.stringify(weatherObs)}</div>*/}
      {/*<div id='rainChart'>rain</div>*/}
      <button onClick={() => play()}>START</button>
      <button onClick={() => pause()}>PAUSE</button>
      <button onClick={() => setFrame()}>SET FRAME</button>
      <button onClick={() => moveTime(time)}>MOVE TIME</button>
      <button onClick={() => printCurrentData()}>CURRENT DATA</button>
      <input type="text" value={time} onChange={e => setTime(e.target.value)}></input>
      <div id='video-view' style={{ height:"100%", width:"100%"}}></div>
      <img id='test'></img>
    </div>
    
  );
}

export default App;
