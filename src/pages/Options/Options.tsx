import React from 'react';
import './Options.css';
import Header from './Header';
import ArgoEnvironments from './ArgoConfiguration';

const Options: React.FC = () => {
  return (
    <div>
      <Header />
      <div className="container">
        <div className="columns">
          <div className="column is-3">
            <aside className="menu is-hidden-mobile">
              <p className="menu-label">General</p>
              <ul className="menu-list">
                <li>
                  <a className={'is-active'}>Environments</a>
                </li>
              </ul>
            </aside>
          </div>
          <div className="column">
            <ArgoEnvironments />
          </div>
        </div>
      </div>
    </div>
  );
};

export default Options;
