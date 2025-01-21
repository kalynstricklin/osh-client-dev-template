import React, { useEffect, useMemo, useRef, useState } from 'react';
import Systems from 'osh-js/source/core/sweapi/system/Systems';
import Observations from 'osh-js/source/core/sweapi/observation/Observations';
import SystemFilter from "osh-js/source/core/sweapi/system/SystemFilter";
import DataStreamFilter from "osh-js/source/core/sweapi/datastream/DataStreamFilter";
import System from "osh-js/source/core/sweapi/system/System";
import DataStreams from "osh-js/source/core/sweapi/datastream/DataStreams";
import FeaturesOfInterest from "osh-js/source/core/sweapi/featureofinterest/FeatureOfInterests"
import FeatureOfInterest from "osh-js/source/core/sweapi/featureofinterest/FeatureOfInterest"
import VideoView from 'osh-js/source/core/ui/view/video/VideoView';
import VideoDataLayer from 'osh-js/source/core/ui/layer/VideoDataLayer';
import SweApi from "osh-js/source/core/datasource/sweapi/SweApi.datasource"
import DataSynchronizer from 'osh-js/source/core/timesync/DataSynchronizer'
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
  const features = new FeaturesOfInterest(networkOpts);
  const [obsArray, setObsArray] = useState<any[]>([]);

  useEffect(() => {
    async function fetchFois() {
      // console.log(features);
      const allFoisCol = await features.searchFeaturesOfInterest(undefined, 99999);
      const allFois = await allFoisCol.nextPage();
      console.log("FOIs", allFois);

      for (let index = 0; index < 30; index++) {
        // fetchDataStreamsFromFoi(allFois[index]);
        fetchSystemsFromFoi(allFois[index]);
      }
    }

    async function fetchDataStreamsFromFoi(foi: typeof FeatureOfInterest) {
        const dsCol = await datastreams.searchDataStreams(new DataStreamFilter({ foi: foi.properties.id }), 1000);
        const ds = await dsCol.nextPage();

        console.log(`FOI ${foi.properties.id} datastreams:`, ds);
    }

    async function fetchSystemsFromFoi(foi: typeof FeatureOfInterest) {
      const sysCol = await systems.searchSystems(new SystemFilter({ foi: foi.properties.id }), 1000);
      const sys = await sysCol.nextPage();

      console.log(`FOI ${foi.properties.id} systems:`, sys);
  }

    fetchFois();

    }
  , []);

  return (
    <div className="App" style={{ flex: 1, flexDirection: 'row'}}>
      {/* {obsArray.map((obs, index) => (
        <img key={index} src={obs.result["即時影像"]} alt={`Data from observation ${obs.id}`} />
      ))} */}
    </div>
  );
}

export default App;
