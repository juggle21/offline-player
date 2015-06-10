"use strict";

var assert = require("assert"),
retrieverPath = "../../app/player/schedule/remote-schedule-retriever.js",
mockIOProviderPath = "../platform/mock-io-provider.js",
mockIOScenario,
coreUrl = {scheduleFetchUrl: "test"};

describe("remote schedule retriever", function(){
  beforeEach("set up mock IO scenario", function() {
    mockIOScenario = {
      disconnected: false,
      failedLocalStorageSet: false,
      fetchContent: {content: {schedule: {}}}
    };
  });

  it("exists", function(){
    var mockPlatformIOFunctions = require(mockIOProviderPath)(),
    retriever = require(retrieverPath)(mockPlatformIOFunctions, coreUrl);

    assert.notEqual(retriever, undefined);
  });

  it("returns resolved promise with false value when disconnected", function() {
    var platformIOFunctions, retriever;
    mockIOScenario.disconnected = true;
    platformIOFunctions = require("../platform/mock-io-provider.js")(mockIOScenario);
    retriever = require(retrieverPath)(platformIOFunctions, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.equal(resp, false);
    });
  });

  it("rejects when local storage retrieval fails", function() {
    var platformIOFunctions = require("../platform/mock-io-provider.js")(),
    retriever = require(retrieverPath)(platformIOFunctions, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.fail(resp, "rejection", "expected rejected promise");
    })
    .catch(function(err) {
      assert.ok(true, "caught expected rejection");
    });
  });

  it("retrieves displayId from local storage", function() {
    var platformIOFunctions = require("../platform/mock-io-provider.js")(),
    retriever = require(retrieverPath)(platformIOFunctions, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.equal(platformIOFunctions.getCalledParams().localStorageGet, "displayId");
    });
  });

  it("fetches remote schedule url", function() {
    var platformIOFunctions = require("../platform/mock-io-provider.js")(),
    retriever = require(retrieverPath)(platformIOFunctions, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function() {
      assert.equal(platformIOFunctions.getCalledParams().httpFetcher, "test");
    });
  });

  it("throws if no schedule in response", function() {
    var platformIOFunctions, retriever;
    mockIOScenario.fetchContent = {content:{empty:{}}};
    platformIOFunctions = require("../platform/mock-io-provider.js")(mockIOScenario);
    retriever = require(retrieverPath)(platformIOFunctions, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function() {
      assert.fail(null, null, "expected rejected promise");
    })
    .catch(function(resp) {
      assert(resp.message.indexOf("no schedule data") > -1, "invalid failure message");
    });
  });

  it("saves local schedule", function() {
    var platformIOFunctions = require("../platform/mock-io-provider.js")(),
    retriever = require(retrieverPath)(platformIOFunctions, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.equal(resp, true);
    });
  });

  it("rejects on local storage update failure", function() {
    var platformIOFunctions, retriever;

    mockIOScenario.failedLocalStorageSet = true;
    platformIOFunctions = require("../platform/mock-io-provider.js")(mockIOScenario);
    retriever = require(retrieverPath)(platformIOFunctions, coreUrl);

    return retriever.loadRemoteSchedule()
    .then(function(resp) {
      assert.fail(null, null, "received resolved promise on failed storage update");
    })
    .catch(function(err) {
      assert(err.message.indexOf("error saving schedule") > -1, "invalid failure message");
    });
  });
});