import {Application} from "@kubernetes-models/argo-cd/argoproj.io/v1alpha1";

export interface GitlabConfiguration {
  globalStatus?: "success" | "error" | "disconnected" | "none",
  host?: string,
  token?: string,
  projects: GitlabProject[]
}

export interface GitlabProject {
  project: string,
  branch: string,
  status: "success" | "error" | "disconnected" | "none"
}

export interface ArgoEnvironmentConfiguration {
  environments: ArgoEnvironment[]
}

export class ApplicationsResponse {
  items: Application[] = []
}

export interface ApplicationsForEnv {
  environment: string
  apps: Application[]
}

export interface ArgoEnvironment {
  name: string,
  basePath: string,
  token: string,
  status: GlobalStatus
}

export enum GlobalStatus {
  ok, ko
}

export interface ArgoApp {
  env: string,
  name: string,
  sync: string,
  status: string
}