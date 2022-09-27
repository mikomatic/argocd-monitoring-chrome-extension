import React, {useEffect, useState} from "react";
import {ArgoEnvironment, ArgoEnvironmentConfiguration} from "../Model/model";
import EnvForm from "./EnvForm";

const ArgoConfiguration: React.FC = () => {

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


  const addEnvironmentHandler = async (addedEnv: ArgoEnvironment) => {
    setEnvironments((prevState: ArgoEnvironment[]) => {
      return [...prevState,
        addedEnv
      ];
    })
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

  return <div className="container columns">
    <div className="column">
      <EnvForm onAddEnvironment={addEnvironmentHandler}/>
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