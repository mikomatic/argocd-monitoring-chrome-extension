import React, {useEffect, useState} from 'react';
import logo from '../../assets/img/logo.svg';
import './Popup.css';
import {ApplicationsForEnv} from "../Model/model";
import {Application} from "@kubernetes-models/argo-cd/argoproj.io/v1alpha1";

const Popup = () => {

  const [argoApplications, setArgoApplications] = useState<ApplicationsForEnv[]>([]);
  const [currentEnv, setCurrentEnv] = useState<ApplicationsForEnv>();

  useEffect(() => {
    chrome.storage.local.get(['argoApplications'], function (result: any) {
      if (result && result.argoApplications) {
        console.log("loading storage: " + JSON.stringify(result))
        let argoApplications = result.argoApplications as ApplicationsForEnv[];

        setArgoApplications(argoApplications);
        setCurrentEnv(argoApplications[0])
      } else {
        console.log("No stored configuration");
      }
    });
  }, []);

  const tabs = () => {
    return argoApplications.map(argoApps => {
      let envName = argoApps.name;
      return <a key={envName} className={currentEnv?.name === envName ? "is-active" : ""}
                onClick={() => setCurrentEnv(argoApps)}>{envName}</a>
    });
  };

  const apps = () => {
    return argoApplications.filter(argoApps => argoApps.name === currentEnv?.name)
    .flatMap(argoApplications => argoApplications.apps)
    .map((application: Application) => {
      return <a
          href={currentEnv?.basePath + "/applications/" + application.metadata.name}
          target="_blank"
          key={application.metadata.name} className="panel-block is-active">
        <div className="columns is-mobile" style={{width: "100%"}}>
          <div className="column is-half">
            {application.metadata.name}
          </div>
          <div className="column">
              <span className="icon" color="red"><i
                  className="material-icons">favorite</i>
                {application.status?.health?.status}</span>

          </div>
          <div className="column">
            {application.status?.sync?.status}
          </div>
        </div>
      </a>
    });
  };


  return (
      <div className="App">
        <header>
          <img src={logo} className="App-logo" alt="logo"/>
        </header>
        <article className="panel is-info">
          <p className="panel-heading">
            ArgoCD Monitoring
          </p>
          <p className="panel-tabs">
            {tabs()}
          </p>
          {apps()}
        </article>
      </div>
  );
};

export default Popup;
