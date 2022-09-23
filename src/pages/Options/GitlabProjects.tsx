import React, {useState} from "react";

const GitlabProjects: React.FC = () => {

  const [project, setProject] = useState('');
  const [branch, setBranch] = useState('');
  const [projects, setProjects] = useState<{ id: number, project: string, branch: string }[]>([]);

  const clickHandler = () => {
    projects.push({id: Math.random(), project: project, branch: branch})

    setProject('');
    setBranch('');
  };

  function deleteProject(project: { id: number; project: string; branch: string }) {
    setProjects((prevState) => {
      return prevState.filter(p => p.id !== project.id)
    })
  }

  const rows = () => {
    return projects.map(p => {
      return <tr>
        <th>{p.project}</th>
        <td>{p.branch}</td>
        <td>
          <button className="button is-warning" onClick={() => deleteProject(p)}><i
            className="material-icons">delete</i>Remove
          </button>
        </td>
      </tr>
    });
  };

  const projectChangedHandler = (event: React.FormEvent<HTMLInputElement>) => {
    setProject(event.currentTarget.value);
  };

  const branchChangeHandler = (event: React.FormEvent<HTMLInputElement>) => {
    setBranch(event.currentTarget.value);
  };

  return <div className="container">
    <div className="field is-horizontal">
      <div className="field-body">
        <div className="field">
          <p className="control">
            <input className="input" type="text" value={project} placeholder="group path"
                   onChange={projectChangedHandler}/>
          </p>
        </div>
        <div className="field">
          <p className="control">
            <input className="input" type="text" value={branch} placeholder="branch" onChange={branchChangeHandler}/>
          </p>
        </div>
        <button className="button is-info" onClick={clickHandler}>Add</button>
      </div>
    </div>
    <div>
      <table className="table is-fullwidth">
        <thead>
        <tr>
          <th>Project</th>
          <th>Branch</th>
          <th></th>
        </tr>
        </thead>
        <tbody>
        {rows()}
        </tbody>
      </table>
    </div>
  </div>;
}

export default GitlabProjects;