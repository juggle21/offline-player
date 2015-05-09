"use strict";

module.exports = function(test, driverObj) {
  test.it("should create webviews", function() {
    driverObj.driver.wait(function() {
      return driverObj.driver.executeAsyncScript(function() {
        var asyncDoneCallback = arguments[arguments.length - 1],
        intervalHandle;

        intervalHandle = setInterval(function() {
          if (document.querySelectorAll("webview").length === 2) {
            clearInterval(intervalHandle);
            asyncDoneCallback(true);
          }
        }, 100);
      });
    }, 1700);
  });

  test.it("should show both webviews", function() {
    driverObj.driver.wait(function() {
      return driverObj.driver.executeAsyncScript(function() {
        var asyncDoneCallback = arguments[arguments.length - 1];
        document.viewedSources = {};

        (function speedupCyclingForTests() {
          $rv.schedule.scheduleData.items.forEach(function(item) {
            item.duration = "0";
          });
          $rv.schedule.cycleItems();
        }());

        checkForBothPresentations();

        function checkForBothPresentations() {
          var intervalHandle = setInterval(function() {
            var webviews = document.querySelectorAll("webview");

            Array.prototype.forEach.call(webviews, function(wv) {
              if (wv.style.display === "block" && wv.src) {
                document.viewedSources[wv.src] = 1;
              }
              if (Object.keys(document.viewedSources).length === 2) {
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
