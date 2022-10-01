import React, { useEffect, useState } from 'react';
import logo from '../../assets/img/logo.svg';
import './Popup.css';
import { ApplicationsForEnv, GlobalStatus } from '../Model/model';
import { Application } from '@kubernetes-models/argo-cd/argoproj.io/v1alpha1';
import ArgoApplicationRow from './ArgoApplicationRow';

const Popup = () => {
  const [argoApplications, setArgoApplications] = useState<
    ApplicationsForEnv[]
  >([]);
  const [currentEnv, setCurrentEnv] = useState<ApplicationsForEnv>();

  useEffect(() => {
    chrome.storage.local.get(['argoApplications'], function (result: any) {
      if (result && result.argoApplications) {
        console.log('loading storage: ' + JSON.stringify(result));
        let argoApplications = result.argoApplications as ApplicationsForEnv[];

        setArgoApplications(argoApplications);
      } else {
        console.log('No stored configuration');
      }
    });
  }, []);

  useEffect(() => {
    const storedEnv = JSON.parse(localStorage.getItem('currentEnv') ?? '');
    if (storedEnv) {
      setCurrentEnv(storedEnv);
    } else {
      setCurrentEnv(argoApplications[0]);
    }
  }, []);

  useEffect(() => {
    localStorage.setItem('currentEnv', JSON.stringify(currentEnv ?? ''));
  }, [currentEnv]);

  const showStatus = (status: GlobalStatus) => {
    if (status === GlobalStatus.KO) {
      return (
        <span className="icon" style={{ color: '#fab005' }}>
          <i className="material-icons">warning</i>
        </span>
      );
    } else if (status === GlobalStatus.UNKNOWN) {
      return <span className="tag is-light">?</span>;
    } else {
      return <span></span>;
    }
  };

  const tabs = () => {
    return argoApplications.map((argoApps) => {
      let envStatus = argoApps.status;
      if (argoApps.status === GlobalStatus.OK) {
        envStatus = calculateAppStatus(argoApps.apps);
      }

      let envName = argoApps.name;
      return (
        <a
          key={envName}
          className={currentEnv?.name === envName ? 'is-active' : ''}
          onClick={() => setCurrentEnv(argoApps)}
        >
          {envName} {showStatus(envStatus)}
        </a>
      );
    });
  };

  const calculateAppStatus = (applications: Application[]) => {
    let appStatus = GlobalStatus.UNKNOWN;
    if (applications) {
      let foundError: boolean = false;
      for (const application of applications) {
        if (
          application.status?.health?.status !== 'Healthy' ||
          application.status?.sync?.status !== 'Synced'
        ) {
          foundError = true;
          break;
        }
      }

      if (foundError) {
        appStatus = GlobalStatus.KO;
      } else {
        appStatus = GlobalStatus.OK;
      }
    }
    return appStatus;
  };

  const apps = () => {
    const appList = argoApplications
      .filter((argoApps) => argoApps.name === currentEnv?.name)
      .flatMap((argoApplications) => argoApplications.apps);

    if (appList.length === 0 || !currentEnv) {
      return <p>No apps configured or reachable</p>;
    }
    return appList.map((application: Application) => {
      return (
        <ArgoApplicationRow
          key={currentEnv.name + application.metadata.name}
          currentEnv={currentEnv}
          currentApp={application}
        />
      );
    });
  };

  return (
    <div className="App">
      <header>
        <img src={logo} className="App-logo" alt="logo" />
      </header>
      <article className="panel is-info">
        <p className="panel-heading">ArgoCD Monitoring</p>
        <p className="panel-tabs">{tabs()}</p>
        {apps()}
      </article>
    </div>
  );
};

export default Popup;
