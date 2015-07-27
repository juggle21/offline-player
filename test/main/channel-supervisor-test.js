"use strict";
var assert = require("assert"),
supervisorPath = "../../app/player/main/channel-supervisor.js",
supervisor,
mock = require("simple-mock").mock,
mockPlatformIO,
mockTokenRetriever,
mockChannelManager,
mockOnlineStatusObserver;

describe("channel supervisor", function() {
  beforeEach("setup mocks", function() {
    mockPlatformIO = {};
    mockTokenRetriever = {};
    mockChannelManager = {};
    mockOnlineStatusObserver = {};

    mock(mockPlatformIO, "isNetworkConnected").returnWith(true);
    mock(mockTokenRetriever, "getToken").resolveWith("test-token");
    mock(mockChannelManager, "createChannel").resolveWith(true);
    mock(mockChannelManager, "destroyChannel").resolveWith(true);
    mock(mockOnlineStatusObserver, "addEventHandler").resolveWith(true);

    supervisor = require(supervisorPath)(mockPlatformIO, mockTokenRetriever, mockChannelManager, mockOnlineStatusObserver);
  });

  it("exists", function() {
    assert.ok(supervisor);
  });

  it("properly starts supervisor creating channel and observing online status changes", function() {
    return supervisor.start().then(function() {
      assert(mockTokenRetriever.getToken.called);
      assert(mockChannelManager.createChannel.called);
      assert(!mockChannelManager.destroyChannel.called);
      assert(mockOnlineStatusObserver.addEventHandler.called);
    });
  });

  it("starts supervisor without creating channel and observing online status changes", function() {
    mock(mockPlatformIO, "isNetworkConnected").returnWith(false);

    return supervisor.start().then(function() {
      assert(!mockTokenRetriever.getToken.called);
      assert(!mockChannelManager.createChannel.called);
      assert(!mockChannelManager.destroyChannel.called);
      assert(mockOnlineStatusObserver.addEventHandler.called);
    });
  });

  it("properly starts supervisor creating channel and closing it when online status changes", function() {
    var statusChangeHandler;

    mockOnlineStatusObserver.addEventHandler = function(handler) {
      statusChangeHandler = handler;
    };

    return supervisor.start().then(function() {
      assert.equal(mockTokenRetriever.getToken.callCount, 1);
      assert.equal(mockChannelManager.createChannel.callCount, 1);
      assert.equal(mockChannelManager.destroyChannel.callCount, 0);
      
      return statusChangeHandler(false).then(function() {
        assert.equal(mockTokenRetriever.getToken.callCount, 1);
        assert.equal(mockChannelManager.createChannel.callCount, 1);
        assert.equal(mockChannelManager.destroyChannel.callCount, 1);
      });
    });
  });
});
