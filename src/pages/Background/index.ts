'use strict';

import {Gitlab} from '@gitbeaker/browser';
import {GitlabConfiguration} from "./model";


chrome.runtime.onInstalled.addListener(() => {
  console.log("onInstalled...");

  // create alarm after extension is installed / upgraded
  chrome.alarms.create("refreshGitlabStatus", {periodInMinutes: 1});
  loadConfThenRefreshGitlabStatus();
});

chrome.alarms.onAlarm.addListener((alarm) => {
  loadConfThenRefreshGitlabStatus();
});

function loadConfThenRefreshGitlabStatus() {
  chrome.storage.local.get(['configuration'], function (result: any) {
    if (!result) {
      console.debug('no storage');
      return;
    }
    refreshGitlabStatus(<GitlabConfiguration>result.configuration);
  });
}

async function refreshGitlabStatus(configuration: GitlabConfiguration) {

  if (!configuration) {
    console.log('no configuration');
  }
  if (!configuration.host || !configuration.token || !configuration.projects) {
    console.log('not configured');
    return;
  }

  const api = new Gitlab({
    host: configuration.host,
    token: configuration.token,
  });

  for (let gitlabProject of configuration.projects) {
    console.log(`Checking projet [${gitlabProject.project}?ref=${gitlabProject.branch}]`);

    try {
      let pipelines = await api.Pipelines.all(gitlabProject.project, {"ref": gitlabProject.branch});
      console.debug(pipelines.length);
      let lastPipeline = pipelines.find((pipeline: { status: string; }) => {
        console.debug("status=" + pipeline.status);
        return pipeline.status === "success" || pipeline.status === "failed";
      });
      console.log(`[${gitlabProject.project}?ref=${gitlabProject.branch}] => ${lastPipeline?.status}`)
      switch (lastPipeline?.status) {
        case "failed":
          gitlabProject.status = "error";
          break;
        case "success":
          gitlabProject.status = "success";
          break;
        default:
          gitlabProject.status = "disconnected";
          break;
      }
    } catch (e) {
      console.error(e);
      gitlabProject.status = "disconnected";
    }

  }

  let globalStatus = "success";
  if (configuration.projects.findIndex((gitlabProject: { status: string; }) => gitlabProject.status === "disconnected") > -1) {
    globalStatus = "disconnected";
  }
  if (configuration.projects.findIndex((gitlabProject: { status: string; }) => gitlabProject.status === "error") > -1) {
    globalStatus = "error";
  }

  if (globalStatus === "disconnected" && (configuration.globalStatus === "success" || configuration.globalStatus === "none")) {
    chrome.notifications.create('NOTFICATION_ID', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL("/icons/disconnected/icon_48.png"),
      title: 'Disconnected pipelines',
      message: 'Some pipelines status could not be retrieved',
      priority: 2
    })
  }

  if (configuration.globalStatus !== "error" && globalStatus === "error") {
    chrome.notifications.create('NOTFICATION_ID', {
      type: 'basic',
      iconUrl: chrome.runtime.getURL("/icons/error/icon_48.png"),
      title: 'Pipeline failure',
      message: 'Some pipelines are in error',
      priority: 2
    })
  }
  configuration.globalStatus = <any>globalStatus;

  chrome.storage.local.set({configuration: configuration}, function () {
    console.debug("Configuration saved");
  });

  chrome.action.setIcon(
    {
      path: {
        "16": `/icons/${globalStatus}/icon_16.png`,
        "32": `/icons/${globalStatus}/icon_32.png`,
        "48": `/icons/${globalStatus}/icon_48.png`,
        "128": `/icons/${globalStatus}/icon_128.png`
      }
    }
  )
};