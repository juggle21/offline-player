"use strict";
var assert = require("assert"),
mockIOProvider = require("../platform/mock-io-provider.js")(),
dataCacherPath = "../../app/player/cache/url-data-cacher.js",
urlDataCacher,
mockSchedule;

describe("url data cache", function() {
  beforeEach(function() {
    urlDataCacher = require(dataCacherPath)(mockIOProvider);
    mockSchedule = {items: [{objectReference: "A"}, {objectReference: "B"}]};
  });

  it("exists", function() {
    assert.ok(urlDataCacher);
  });

  it("extracts schedule urls", function() {
    urlDataCacher.setSchedule(mockSchedule);
    assert.deepEqual(urlDataCacher.getUrls(), ["A", "B"]);
  });

  it("saves the url data", function() {
    urlDataCacher.setSchedule(mockSchedule);
    return urlDataCacher.saveUrlDataToFilesystem()
    .then(function() {
      assert.deepEqual(mockIOProvider.getCalledParams().httpFetcher, ["A", "B"]);
      assert.deepEqual((mockIOProvider.getCalledParams().filesystemSave),
      [["6dcd4ce23d88e2ee9568ba546c007c63d9131c1b", "mock-blob"],
      ["ae4f281df5a5d0ff3cad6371f76d5c29b6d953ec", "mock-blob"]]);
    });
  });
});
