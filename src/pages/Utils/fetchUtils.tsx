import {ArgoEnvironment} from "../Model/model";

const fetchApplication = (argoEnvironment: ArgoEnvironment) => {
  fetch(argoEnvironment.basePath + "/api/v1/applications", {
    method: "GET",
    headers: {
      "Content-type": "application/json;charset=UTF-8",
      "Authorization": "Bearer " + argoEnvironment.token
    }
  })
  .then(response => response.json())
  .then(json =>  console.log(json))
  .catch(err => console.log(err));
};

export default fetchApplication;