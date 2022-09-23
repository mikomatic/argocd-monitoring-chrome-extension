import React, {useState} from 'react';
import './Options.css';
import Header from './Header';
import GitlabSettings from "./GitlabSettings";
import GitlabProjects from "./GitlabProjects";

interface Props {
  title: string;
}

const Options: React.FC<Props> = ({title}: Props) => {

  let [showGitlabSettings, setShowGitlabSettings] = useState(true);
  const gitlabSettingsContent = () => {
    if (showGitlabSettings) {
      return <GitlabSettings/>
    }
  }

  const gitlabProjectsContent = () => {
    if (!showGitlabSettings) {
      return <GitlabProjects/>
    }
  }

  function projectClickHandler() {
    setShowGitlabSettings(false);
  }

  function gitlabSettingsHandler() {
    setShowGitlabSettings(true);
  }

  return <div>
    <Header/>
    <div className="container">
      <div className="columns">
        <div className="column is-3">
          <aside className="menu is-hidden-mobile">
            <p className="menu-label">
              General
            </p>
            <ul className="menu-list">
              <li onClick={gitlabSettingsHandler}><a className={showGitlabSettings ? "is-active" : ""}>Gitlab
                Settings</a></li>
              <li onClick={projectClickHandler}><a className={!showGitlabSettings ? "is-active" : ""}>Projects</a></li>
            </ul>
          </aside>
        </div>
        <div className="column">
          {gitlabSettingsContent()}
          {gitlabProjectsContent()}
        </div>
      </div>
    </div>
  </div>
    ;
};

export default Options;
