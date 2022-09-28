import {
  ApplicationsForEnv,
  ApplicationsResponse,
  ArgoEnvironmentConfiguration,
  GlobalStatus
} from "../Model/model";
import {Application} from "@kubernetes-models/argo-cd/argoproj.io/v1alpha1";

let argoEnvironmentConfiguration: ArgoEnvironmentConfiguration;

chrome.runtime.onInstalled.addListener(() => {
  console.log("onInstalled...");

  // create alarm after extension is installed / upgraded
  chrome.alarms.create("refreshArgoCD", {periodInMinutes: 0.5});
  loadConfiguration().then(async (result: any) => {
    console.log("background - loaded config" + JSON.stringify(result));

    argoEnvironmentConfiguration = result.argoEnvironmentConfiguration as ArgoEnvironmentConfiguration;

    await refreshApplicationsState();
  })
});


chrome.alarms.onAlarm.addListener(async () => {
  loadConfiguration().then(async (result: any) => {
    console.log("background - loaded config" + JSON.stringify(result));

    argoEnvironmentConfiguration = result.argoEnvironmentConfiguration as ArgoEnvironmentConfiguration;

    await refreshApplicationsState();
  })
});

async function refreshApplicationsState() {
  if (argoEnvironmentConfiguration) {

    let previousStatus = await loadArgoApplicationStatus().then(async (result: any) => {
      if (result && result.argoApplications) {
        let argoApplications = result.argoApplications as ApplicationsForEnv[];
        return argoApplications;
      }
    });


    let applicationStatus: ApplicationsForEnv[] = [];
    for (const argoEnv of argoEnvironmentConfiguration.environments) {
      await fetch(argoEnv.basePath + "/api/v1/applications", {
        method: "GET",
        headers: {
          "Content-type": "application/json;charset=UTF-8",
          "Authorization": "Bearer " + argoEnv.token
        }
      })
      .then(response => {
        return response.json()
      })
      .then((json: ApplicationsResponse) => {
        console.log("background - Updating apps status for env " + argoEnv.name);
        console.log("background - Updating apps status for env " + JSON.stringify(json.items));
        applicationStatus.push({
          name: argoEnv.name,
          status: GlobalStatus.OK,
          basePath: argoEnv.basePath,
          apps: json.items
        })
      }).catch((err) => {
            console.log(err)
            applicationStatus.push({
              name: argoEnv.name,
              status: GlobalStatus.KO,
              basePath: argoEnv.basePath,
              apps: []
            })
          }
      )

    }

    saveArgoAppsStatusLocalStorage(applicationStatus);
    notifyBrowser(previousStatus ?? [], applicationStatus);
  } else {
    console.log("No configuration");
  }
}


function notifyBrowser(previousApplicationStatus: ApplicationsForEnv[], applicationStatus: ApplicationsForEnv[]) {


  let previousStatus = calculateStatus(previousApplicationStatus);
  let currentStatus = calculateStatus(applicationStatus);

  let currentEnvStatus = currentStatus[0];
  let currentAppsStatus = currentStatus[1];

  console.log("previous status" + previousStatus)
  console.log("current" + currentStatus)
  if (currentEnvStatus !== GlobalStatus.OK || currentAppsStatus !== GlobalStatus.OK) {

    chrome.action.setIcon(
        {
          path: {
            "32": `icon-warning-32.png`
          }
        }
    )

    let previousEnvStatus = previousStatus[0];
    if ((previousEnvStatus === GlobalStatus.OK || previousEnvStatus === GlobalStatus.UNKNOWN) && currentEnvStatus !== GlobalStatus.OK) {
      chrome.notifications.create('ARGO_ENV_NOTIFICATION_ID', {
        type: 'basic',
        iconUrl: chrome.runtime.getURL("/icon-144.png"),
        title: 'ArgoCD Environment Status',
        message: 'Impossible to contact some Argo Environments',
        priority: 2
      })
    } else {
      let previousAppStatus = previousStatus[1];
      if ((previousAppStatus === GlobalStatus.OK || previousAppStatus === GlobalStatus.UNKNOWN) && currentAppsStatus !== GlobalStatus.OK) {
        chrome.notifications.create('ARGO_ENV_NOTIFICATION_ID', {
          type: 'basic',
          iconUrl: chrome.runtime.getURL("/icon-144.png"),
          title: 'ArgoCD Applications Status',
          message: 'Some applications require your attention',
          priority: 2
        })
      }
    }

  } else {
    chrome.action.setIcon(
        {
          path: {
            "128": "icon-144.png",
          }
        }
    )
  }


}
const calculateStatus = (applicationStatus: ApplicationsForEnv[]) => {
  let envStatus = GlobalStatus.UNKNOWN;
  let appStatus = GlobalStatus.UNKNOWN;
  for (const applicationsForEnv of applicationStatus) {
    envStatus = applicationsForEnv.status;

    if (applicationsForEnv.apps) {
      let foundError: boolean = false;
      for (const argoApp of applicationsForEnv.apps) {

        if (argoApp.status?.health?.status !== "Healthy" || argoApp.status?.sync?.status !== "Synced") {
          foundError = true;
          break
        }
      }

      if (foundError) {
        appStatus = GlobalStatus.KO
      } else {
        appStatus = GlobalStatus.OK
      }
    }
  }
  return [envStatus, appStatus];
};

function saveArgoAppsStatusLocalStorage(updatedApps: ApplicationsForEnv[]) {
  chrome.storage.local.set({'argoApplications': updatedApps}, function () {
    if (chrome.runtime.lastError)
      console.debug('Error setting application status to local storage');

    console.debug("background - Argo Aplications status storage saved!: " + JSON.stringify(updatedApps));
  });
}


// Reads all data out of storage.sync and exposes it via a promise.
//
// Note: Once the Storage API gains promise support, this function
// can be greatly simplified.
function loadArgoApplicationStatus() {
  // Immediately return a promise and start asynchronous work
  return new Promise((resolve, reject) => {
    // Asynchronously fetch all data from storage.sync.
    chrome.storage.local.get(['argoApplications'], (result) => {
      // Pass any observed errors down the promise chain.
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      // Pass the data retrieved from storage down the promise chain.
      resolve(result);
    });
  });
}


// Reads all data out of storage.local and exposes it via a promise.
//
// Note: Once the Storage API gains promise support, this function
// can be greatly simplified.
function loadConfiguration() {
  // Immediately return a promise and start asynchronous work
  return new Promise((resolve, reject) => {
    // Asynchronously fetch all data from storage.sync.
    chrome.storage.local.get(['argoEnvironmentConfiguration'], (result) => {
      // Pass any observed errors down the promise chain.
      if (chrome.runtime.lastError) {
        return reject(chrome.runtime.lastError);
      }
      // Pass the data retrieved from storage down the promise chain.
      resolve(result);
    });
  });
}


/*
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
};*/
