import React, {useEffect, useState} from "react";
import {ArgoEnvironment, ArgoEnvironmentConfiguration, GlobalStatus} from "../Model/model";

const ArgoConfiguration: React.FC = () => {

  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [token, setToken] = useState('');
  const [environments, setEnvironments] = useState<ArgoEnvironment[]>([]);

  useEffect(() => {
    chrome.storage.local.get(['argoEnvironmentConfiguration'], function (result: any) {
      if (result) {
        console.log("loading storage: " + result)
        let configuration = result.argoEnvironmentConfiguration as ArgoEnvironmentConfiguration;
        setEnvironments(configuration.environments);

        let argoEnvironment = configuration.environments[0];
        fetch(argoEnvironment.basePath + "/api/v1/applications", {
          method: "GET",
          headers: {
            "Content-type": "application/json;charset=UTF-8",
            "Authorization": "Bearer " + argoEnvironment.token
          }
        })
        .then(response => response.json())
        .then(json => console.log(json))
        .catch(err => console.log(err));
      }
    });
  }, []);

  function saveArgoEnvConfToLocalStorage(newEnvs: ArgoEnvironment[]) {
    const argoConf: ArgoEnvironmentConfiguration = {environments: newEnvs};
    chrome.storage.local.set({'argoEnvironmentConfiguration': argoConf}, function () {
      if (chrome.runtime.lastError)
        console.debug('Error setting');

      console.debug("Configuration saved!: " + JSON.stringify(argoConf));
    });
  }

  const addEnvironmentHandler = async () => {

    const response = await fetch(baseUrl + "/api/v1/applications", {
      method: "GET",
      headers: {
        "Content-type": "application/json;charset=UTF-8",
        "Authorization": "Bearer " + token
      }
    })
    .catch(err => {
      console.log(err);
      return {status: 400}
    });
    setEnvironments((prevState: ArgoEnvironment[]) => {
      let newEnvs = [...prevState, {
        name: name,
        basePath: baseUrl,
        token: token,
        status: response.status === 200 ? GlobalStatus.ok : GlobalStatus.ko
      }];
      saveArgoEnvConfToLocalStorage(newEnvs);
      return newEnvs;
    })

    setName('');
    setBaseUrl('');
    setToken('')


  };

  const deleteEnv = (argoEnv: ArgoEnvironment) => {
    setEnvironments((prevState) => {
      let newEnvs = prevState.filter(p => p.name !== argoEnv.name);
      saveArgoEnvConfToLocalStorage(newEnvs);
      return newEnvs;
    })
  };

  const showStatus = (status: GlobalStatus) => {
    return status === GlobalStatus.ok ? <span className="tag is-success">Ok</span>
        :
        <span className="tag is-danger">KO</span>
  }

  const rows = () => {
    return environments.map(p => {
      return <tr>
        <td>{p.name}</td>
        <th>{p.basePath} {showStatus(p.status)}</th>
        <td>
          <button className="button is-warning" onClick={() => deleteEnv(p)}><i
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