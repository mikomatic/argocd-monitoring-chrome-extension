
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