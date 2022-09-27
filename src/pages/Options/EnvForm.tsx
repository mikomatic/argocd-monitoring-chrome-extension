import React, {useState} from "react";
import {ArgoEnvironment} from "../Model/model";

interface Props {
  onAddEnvironment: (env: ArgoEnvironment) => void;
}

const EnvForm = ({onAddEnvironment}: Props) => {

  const addEnvironmentHandler = async () => {

    onAddEnvironment({name: name, basePath: baseUrl, token: token});

    setName('');
    setBaseUrl('');
    setToken('')
  };

  const [name, setName] = useState('');
  const [baseUrl, setBaseUrl] = useState('');
  const [token, setToken] = useState('');

  const basePathChangedHandler = (event: React.FormEvent<HTMLInputElement>) => {
    setBaseUrl(event.currentTarget.value);
  };

  const tokenChangeHandler = (event: React.FormEvent<HTMLInputElement>) => {
    setToken(event.currentTarget.value);
  };

  const nameChangedHandler = (event: React.FormEvent<HTMLInputElement>) => {
    setName(event.currentTarget.value);
  };
  return <div>
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
  </div>;
}


export default EnvForm;