import {ApplicationsResponse, ArgoEnvironment} from "../Model/model";
import {Application} from "@kubernetes-models/argo-cd/argoproj.io/v1alpha1";

const fetchApplication = (argoEnvironment: ArgoEnvironment): Promise<Application[]> => {
  return fetch(argoEnvironment.basePath + "/api/v1/applications", {
    method: "GET",
    headers: {
      "Content-type": "application/json;charset=UTF-8",
      "Authorization": "Bearer " + argoEnvironment.token
    }
  })
  .then(response => response.json())
  .then((json: ApplicationsResponse) => {
    return json.items;
  })
};

export default fetchApplication;