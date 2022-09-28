import React from 'react';
import {ApplicationsForEnv} from "../Model/model";
import {Application} from "@kubernetes-models/argo-cd/argoproj.io/v1alpha1";

interface Props {
  currentEnv?: ApplicationsForEnv
  currentApp: Application
}

const ArgoApplicationRow = ({currentEnv, currentApp}: Props) => {

  const showHealthStatus = (status: string | undefined) => {

    if (status === "Degraded") {
      return <span className="icon" style={{color: "red"}}><i
          className="material-icons">heart_broken</i>
        {status}</span>
    } else if (status === "Missing") {
      return <span className="icon" style={{color: "#ced4da"}}><i
          className="material-icons">radio_button_unchecked</i>
        {status}</span>
    } else if (status === "Healthy") {
      return <span className="icon" style={{color: "#12b886"}}><i
          className="material-icons">favorite</i>
        {status}</span>
    } else if (status === "Progressing") {
      return <span className="icon" style={{color: "#868e96"}}><i
          className="material-icons">run_circle</i>
        {status}</span>
    } else {
      return <span className="icon"><i
          className="material-icons">favorite</i>
        {status}</span>
    }
  }

  const showSyncStatus = (status: string | undefined) => {

    if (status === "Synced") {
      return <span className="icon" style={{color: "#12b886"}}><i
          className="material-icons">check_circle</i>
        {status}</span>
    } else if (status === "Unknown") {
      return <span className="icon" style={{color: "#ced4da"}}><i
          className="material-icons">radio_button_unchecked</i>
        {status}</span>
    } else if (status === "Healthy") {
      return <span className="icon" style={{color: "#12b886"}}><i
          className="material-icons">favorite</i>
        {status}</span>
    } else {
      return <span className="icon"><i
          className="material-icons">favorite</i>
        {status}</span>
    }
  }

  return <a
      href={currentEnv?.basePath + "/applications/" + currentApp.metadata.name}
      target="_blank"
      key={currentApp.metadata.name} className="panel-block is-active">
    <div className="columns is-mobile" style={{width: "100%"}}>
      <div className="column is-half">
        {currentApp.metadata.name}
      </div>
      <div className="column">
        {showHealthStatus(currentApp.status?.health?.status)}
      </div>
      <div className="column">
        {showSyncStatus(currentApp.status?.sync?.status)}
      </div>
    </div>
  </a>;
}

export default ArgoApplicationRow