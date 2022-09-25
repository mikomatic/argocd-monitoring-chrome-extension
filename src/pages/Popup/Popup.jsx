import React from 'react';
import logo from '../../assets/img/logo.svg';
import './Popup.css';

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
        <div className="panel-block">
          <p className="control has-icons-left">
            <input className="input is-info" type="text" placeholder="Search"/>
            <span className="icon is-left">
      <i className="material-icons">search</i>
      </span>
          </p>
        </div>
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
        <a className="panel-block">
    <span className="panel-icon">
      <i className="fas fa-book" aria-hidden="true"></i>
    </span>
          jgthms.github.io
        </a>
      </article>
    </div>
  );
};

export default Popup;
