import {Application} from "@kubernetes-models/argo-cd/argoproj.io/v1alpha1";

export interface ArgoEnvironmentConfiguration {
  environments: ArgoEnvironment[]
}

export class ApplicationsResponse {
  items: Application[] = []
}

export interface ApplicationsForEnv {
  name: string,
  basePath: string,
  status: GlobalStatus,
  apps: Application[]
}

export interface ArgoEnvironment {
  name: string,
  basePath: string,
  token: string,
}

export enum GlobalStatus {
  OK = "OK", KO = "KO", UNKNOWN = "UNKNOWN"
}