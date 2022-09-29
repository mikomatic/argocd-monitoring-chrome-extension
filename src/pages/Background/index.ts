import {
  ApplicationsForEnv,
  ApplicationsResponse,
  ArgoEnvironmentConfiguration,
  GlobalStatus
} from "../Model/model";

let argoEnvironmentConfiguration: ArgoEnvironmentConfiguration;

chrome.runtime.onInstalled.addListener(() => {
  console.log("onInstalled...");

  // create alarm after extension is installed / upgraded
  chrome.alarms.create("refreshArgoCD", {periodInMinutes: 0.75});
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
        return result.argoApplications as ApplicationsForEnv[];
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

  let globalStatus = GlobalStatus.UNKNOWN;
  if (applicationStatus) {

    for (const applicationsForEnv of applicationStatus) {
      let currentStatus = calculateStatusForEnv(applicationsForEnv);

      const currentEnvStatus = currentStatus[0];
      const currentAppsStatus = currentStatus[1];
      if (currentEnvStatus !== GlobalStatus.OK || currentAppsStatus !== GlobalStatus.OK) {
        globalStatus = GlobalStatus.KO
      }

      const previousApplicationsForEnv = previousApplicationStatus.find(value => value.name === applicationsForEnv.name);
      const previousStatus = calculateStatusForEnv(previousApplicationsForEnv);
      let previousEnvStatus = previousStatus[0];

      const newEnvStatusFailed = (previousEnvStatus === GlobalStatus.OK || previousEnvStatus === GlobalStatus.UNKNOWN) && currentEnvStatus !== GlobalStatus.OK;

      if (newEnvStatusFailed) {
        chrome.notifications.create('ARGO_ENV_NOTIFICATION_ID', {
          type: 'basic',
          iconUrl: chrome.runtime.getURL("/icon-144.png"),
          title: 'ArgoCD Environment Status',
          message: `Impossible to contact ${applicationsForEnv.name} Argo Environment`,
          priority: 2
        })
      }

      let previousAppStatus = previousStatus[1];
      const newAppStatusFailed = (previousAppStatus === GlobalStatus.OK || previousAppStatus === GlobalStatus.UNKNOWN) && currentAppsStatus !== GlobalStatus.OK;
      if (newAppStatusFailed) {
        chrome.notifications.create('ARGO_ENV_NOTIFICATION_ID', {
          type: 'basic',
          iconUrl: chrome.runtime.getURL("/icon-144.png"),
          title: 'ArgoCD Applications Status',
          message: `Some applications require your attention in ${applicationsForEnv.name}  `,
          priority: 2
        })
      }

      const newAppStatusPK = (previousAppStatus === GlobalStatus.KO || previousAppStatus === GlobalStatus.UNKNOWN) && (currentAppsStatus === GlobalStatus.OK && currentEnvStatus === GlobalStatus.OK);
      if (newAppStatusPK) {
        chrome.notifications.create('ARGO_ENV_NOTIFICATION_ID', {
          type: 'basic',
          iconUrl: chrome.runtime.getURL("/icon-144.png"),
          title: 'ArgoCD Applications Status',
          message: `Everything went back to normal in env ${applicationsForEnv.name}  `,
          priority: 2
        })
      }
    }

    if (globalStatus !== GlobalStatus.KO) {
      globalStatus = GlobalStatus.OK;
    }

  }

  let previousStatus = calculateStatus(previousApplicationStatus);
  let currentStatus = calculateStatus(applicationStatus);


  console.log("previous status" + previousStatus)
  console.log("current" + currentStatus)
  if (globalStatus !== GlobalStatus.OK) {

    chrome.action.setIcon(
        {
          path: {
            "32": `icon-warning-32.png`
          }
        }
    )

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


const calculateStatusForEnv = (applicationStatusForEnv: ApplicationsForEnv | undefined) => {
  let envStatus = GlobalStatus.UNKNOWN;
  let appStatus = GlobalStatus.UNKNOWN;
  if (applicationStatusForEnv) {
    envStatus = applicationStatusForEnv.status;

    if (applicationStatusForEnv.apps) {
      let foundError: boolean = false;
      for (const argoApp of applicationStatusForEnv.apps) {

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