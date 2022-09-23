
export interface GitlabConfiguration {
    host: string,
    token: string,
}

export interface GitlabProject {
    project: string,
    branch: string,
    status: "success" | "error" | "disconnected" | "none"
}