"use strict";
var crypto = require("crypto"); 

module.exports = function(mockScenario) {
  var calledParams = {
    httpFetcher: [],
    filesystemSave: [],
    filesystemRetrieve: [],
    localStorage: {}
  };

  if (!mockScenario) {mockScenario = {};}
  if (!mockScenario.failedLocalStorage) {mockScenario.failedLocalStorage = {};}

  mockScenario = {
    disconnected: mockScenario.disconnected ?
    mockScenario.disconnected : false,

    failedLocalStorage: {
      get: mockScenario.failedLocalStorage.get ?
      mockScenario.failedLocalStorage.get : false,

      set: mockScenario.failedLocalStorage.set ?
      mockScenario.failedLocalStorage.set : false,

      emptyGet: mockScenario.failedLocalStorage.emptyGet ?
      mockScenario.failedLocalStorage.emptyGet: false
    },

    failedFilesystemSave: mockScenario.failedFilesystemSave ?
    mockScenario.failedFilesystemSave : false,

    fetchContent: mockScenario.fetchContent ? mockScenario.fetchContent : {
      content: {schedule: {}}
    } 
  };

  function localStorage(getOrSet, itemArray) {
    var retval = {};
    if (getOrSet === "get") {
      itemArray.forEach(function(item) {retval[item] = "mock-result";});
    }

    calledParams.localStorage[getOrSet] = itemArray;

    if (mockScenario.failedLocalStorage[getOrSet]) {
      return Promise.reject(new Error("failed local object " + getOrSet));
    }
    if (mockScenario.failedLocalStorage.emptyGet === true) {
      return Promise.resolve({});
    }
    return Promise.resolve(retval);
  }

  return {
    httpFetcher: function(param) {
      calledParams.httpFetcher.push(param);
      return Promise.resolve({
        json: function() {return Promise.resolve(mockScenario.fetchContent);},
        blob: function() {return Promise.resolve("mock-blob");}
      });
    },
    localObjectStore: {
      get: function(itemArray) {return localStorage("get", itemArray);},
      set: function(itemArray) {return localStorage("set", itemArray);}
    },
    filesystemSave: function(hash, blob) {
      calledParams.filesystemSave.push([hash, blob]);
      if (mockScenario.failedFilesystemSave) {
        return console.log("Failed filesystem save");
      }
      return true;
    },
    filesystemRetrieve: function(hash) {
      calledParams.filesystemRetrieve.push(hash);
      return true;
    },
    isNetworkConnected: function() {return !mockScenario.disconnected;},
    hash: function(str) {
      var sha1sum = crypto.createHash('sha1');
      sha1sum.update(str);
      return sha1sum.digest("hex");
    },
    getCalledParams: function() {return calledParams;}
  };
};
