"use strict";

module.exports = function(test, driverObj) {
  test.it("should create two webviews", function() {
    driverObj.driver.manage().timeouts().setScriptTimeout(10000);
    driverObj.driver.wait(function() {
      return driverObj.driver.executeAsyncScript(function() {
        var asyncDoneCallback = arguments[arguments.length - 1],
        intervalHandle,
        scheduleData;

        intervalHandle = setInterval(function() {
          if (document.querySelectorAll("webview").length === 2) {
            clearInterval(intervalHandle);
            asyncDoneCallback(true);
          }
        }, 100);
      });
    }, 1700);
  });

  test.it("should show a webview", function() {
    driverObj.driver.wait(function() {
      return driverObj.driver.executeAsyncScript(function() {
        var asyncDoneCallback = arguments[arguments.length - 1];
        document.viewedSources = {};

        checkForBothPresentations();

        function checkForBothPresentations() {
          var intervalHandle = setInterval(function() {
            var webviews = document.querySelectorAll("webview");

            Array.prototype.forEach.call(webviews, function(wv) {
              if (wv.style.display === "block" && wv.src) {
                clearInterval(intervalHandle);
                asyncDoneCallback(true);
              }
            });
          }, 100);
        }
      });
    }, 5000);
  });
};