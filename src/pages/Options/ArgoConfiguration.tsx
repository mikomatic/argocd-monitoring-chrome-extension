import React, {useEffect, useState} from "react";
import {ArgoEnvironment, ArgoEnvironmentConfiguration, GlobalStatus} from "../Model/model";

const ArgoConfiguration: React.FC = () => {

  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [token, setToken] = useState('');
  const [environments, setEnvironments] = useState<ArgoEnvironment[]>([]);

  useEffect(() => {
    chrome.storage.local.get(['argoEnvironmentConfiguration'], function (result: any) {
      if (result && result.argoEnvironmentConfiguration) {
        console.log("loading storage: " + JSON.stringify(result))
        let configuration = result.argoEnvironmentConfiguration as ArgoEnvironmentConfiguration;
        setEnvironments(configuration.environments);
      } else {
        console.log("No stored configuration");
      }
    });
  }, []);

  useEffect(() => {
    function saveArgoEnvConfToLocalStorage(newEnvs: ArgoEnvironment[]) {
      const argoConf: ArgoEnvironmentConfiguration = {environments: newEnvs};
      chrome.storage.local.set({'argoEnvironmentConfiguration': argoConf}, function () {
        if (chrome.runtime.lastError)
          console.debug('Error setting');

        console.debug("Configuration saved!: " + JSON.stringify(argoConf));
      });
    }

    saveArgoEnvConfToLocalStorage(environments)
  }, [environments]);


  const addEnvironmentHandler = async () => {

    setEnvironments((prevState: ArgoEnvironment[]) => {
      return [...prevState, {
        name: name,
        basePath: baseUrl,
        token: token,
        status: GlobalStatus.UNKNOWN
      }];
    })

    setName('');
    setBaseUrl('');
    setToken('')


  };

  const deleteEnv = (argoEnv: ArgoEnvironment) => {
    setEnvironments((prevState) => {
      return prevState.filter(p => p.name !== argoEnv.name);
    })
  };

  const rows = () => {
    return environments.map(env => {
      return <tr key={env.name}>
        <td>{env.name}</td>
        <th>{env.basePath}</th>
        <td>
          <button className="button is-warning" onClick={() => deleteEnv(env)}><i
            className="material-icons">delete</i>Remove
          </button>
        </td>
      </tr>
    });
  };

  const basePathChangedHandler = (event: React.FormEvent<HTMLInputElement>) => {
    setBaseUrl(event.currentTarget.value);
  };

  const tokenChangeHandler = (event: React.FormEvent<HTMLInputElement>) => {
    setToken(event.currentTarget.value);
  };

  const nameChangedHandler = (event: React.FormEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  };

  return <div className="container columns">
    <div className="column">
      <div className="field is-horizontal">
        <div className="field-body">
          <div className="field">
            <p className="control">
              <input className="input" type="text" value={name} placeholder="Name"
                     onChange={nameChangedHandler}/>
            </p>
          </div>
          <div className="field">
            <p className="control">
              <input className="input" type="text" value={baseUrl} placeholder="base url"
                     onChange={basePathChangedHandler}/>
            </p>
          </div>
          <div className="field">
            <p className="control">
              <input className="input" type="password" value={token} placeholder="token"
                     onChange={tokenChangeHandler}/>
            </p>
          </div>
          <button className="button is-info" onClick={addEnvironmentHandler}>Add</button>
        </div>
      </div>
      <div>
        <table className="table is-fullwidth">
          <thead>
          <tr>
            <th>Name</th>
            <th>Base URL</th>
            <th></th>
          </tr>
          </thead>
          <tbody>
          {rows()}
          </tbody>
        </table>
      </div>
    </div>
  </div>;
}

export default ArgoConfiguration;