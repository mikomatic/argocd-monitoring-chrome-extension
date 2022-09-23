import React, {useEffect, useState} from "react";
import {GitlabConfiguration} from "../../model/model";

const GitlabSettings: React.FC = () => {
  const [gitlabUrl, setGitlabUrl] = useState('');
  const [token, setToken] = useState('');


  useEffect(() => {
    chrome.storage.local.get(['gitlabConfiguration'], function (result: any) {
      if (result) {
        let configuration = result.gitlabConfiguration as GitlabConfiguration;
        setGitlabUrl(configuration.host);
        setToken(configuration.token)
      }
    });
  }, []);

  const gitlabUrlChangeHandler = (event: React.FormEvent<HTMLInputElement>) => {
    setGitlabUrl(event.currentTarget.value);
    saveGitlabConfiguration();
  };

  const tokenChangedHandler = (event: React.FormEvent<HTMLInputElement>) => {
    setToken(event.currentTarget.value);
    saveGitlabConfiguration();
  };

  const saveGitlabConfiguration = () => {
    const gitlabConfiguration: GitlabConfiguration = {host: gitlabUrl, token: token};

    chrome.storage.local.set({'gitlabConfiguration': gitlabConfiguration}, function () {
      if (chrome.runtime.lastError)
        console.debug('Error setting');

      console.debug("Configuration saved!: " + JSON.stringify(gitlabConfiguration));
    });
  }


  return <div>
    <div className="field">
      <label className="label">Gitlab URL</label>
      <div className="control">
        <input className="input" type="text" value={gitlabUrl} placeholder="Gitlab URL"
               onChange={gitlabUrlChangeHandler}/>
      </div>
    </div>
    <div className="field">
      <label className="label">Gitlab Token</label>
      <div className="control">
        <input className="input" type="password" value={token} placeholder="Gitlab Personal Token"
               onChange={tokenChangedHandler}/>
      </div>
    </div>
  </div>;
}

export default GitlabSettings;