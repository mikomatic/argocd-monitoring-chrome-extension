import React, {useEffect} from 'react';
import logo from '../../assets/img/logo.svg';
import './Popup.css';

const Popup = () => {

  useEffect(() => {
    chrome.storage.local.get(['argoApplications'], function (result: any) {
      if (result && result.argoApplications) {
        console.log("loading storage: " + JSON.stringify(result))
      } else {
        console.log("No stored configuration");
      }
    });
  }, []);

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
