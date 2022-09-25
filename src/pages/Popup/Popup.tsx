import React, {useState} from 'react';
import logo from '../../assets/img/logo.svg';
import './Popup.css';
import {Application} from "@kubernetes-models/argo-cd/argoproj.io/v1alpha1";
import {ArgoEnvironment} from "../Model/model";
import {IApplication} from "@kubernetes-models/argo-cd/argoproj.io/v1alpha1/Application";

const apps: Application[] = [{
  kind: "Application",
  apiVersion: "argoproj.io/v1alpha1",

  spec: {destination: {}, project: "po", source: {repoURL: "repoUrl"}},
  metadata: {name: "app name"},
  status: {
    health: {status: "healthy"},
    sync: {status: "synced"},
  },
  toJSON(): any {
  },
  validate() {
  }
}];


const Popup = () => {
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
          <a className="is-active">All</a>
          <a>Public</a>
          <a>Private</a>
          <a>Sources</a>
          <a>Forks</a>
        </p>
        <a className="panel-block is-active">
    <span className="panel-icon">
      <i className="fas fa-book" aria-hidden="true"></i>
    </span>
          bulma
        </a>
        <a className="panel-block">
    <span className="panel-icon">
      <i className="fas fa-book" aria-hidden="true"></i>
    </span>
          marksheet
        </a>
        <a className="panel-block">
    <span className="panel-icon">
      <i className="fas fa-book" aria-hidden="true"></i>
    </span>
          minireset.css
        </a>
      </article>
    </div>
  );
};

export default Popup;
