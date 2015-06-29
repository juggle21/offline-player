module.exports = function(platformIO, serviceUrls) {
  "use strict";
  var url = serviceUrls.scheduleFetchUrl;

  return {
    loadRemoteSchedule: function() {
      if (!platformIO.isNetworkConnected()) {
        return Promise.reject("no connection - aborting");
      }

      return getDisplayIdFromLocalStorage()
      .then(fetchRemoteScheduleContentJson)
      .then(retrieveScheduleFromContentObject) 
      .then(saveNewLocalSchedule);
    }
  };

  function err(msg) {
    return new Error("Remote schedule retriever: " + msg);
  }

  function getDisplayIdFromLocalStorage() {
    return platformIO.localObjectStore.get(["displayId"])
    .then(function(items) {
      if (!items.displayId) {throw err("no display id found in local storage");}
      return items.displayId;
    })
    .catch(function(e) {
      throw err("error retrieving display id from local storage - " + e.message);
    });
  }
  
  function fetchRemoteScheduleContentJson(displayId) {
    url = url.replace("DISPLAY_ID", displayId);
    console.log("Remote schedule retriever: retrieval for: " + displayId);

    return platformIO.httpFetcher(url, {credentials: "include"})
    .then(function(resp) {
      return resp.json();
    });
  }

  function retrieveScheduleFromContentObject(json) {
    if (!json.content || !json.content.schedule) {
      console.info(JSON.stringify(json));
      throw err("no schedule data in response");
    }
    return json.content.schedule;
  }

  function saveNewLocalSchedule(schedule) {
    return platformIO.localObjectStore.set({schedule: schedule})
    .then(function() {
      console.log("Remote schedule retriever: saved schedule");
      return true;
    })
    .catch(function(e) {
      throw err("error saving schedule" + e);
    });
  }
};
