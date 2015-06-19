module.exports = function(platformIOFunctions) {
  var folderItems = {};

  return {
    fetchFoldersIntoFilesystem: function(scheduleItems) {
      return Promise.all(scheduleItems.map(function(scheduleItem) {
        var url = scheduleItem.objectReference;
        if (url.indexOf("risemedialibrary-") === -1) {
          return Promise.resolve("not fetching unless Rise Storage folder");
        }

        return platformIOFunctions.getRemoteFolderItemsList(url)
        .then(function(resp) {
          folderItems[platformIOFunctions.hash(url)] = resp;
        })
        .then(function() {
          return saveFolderItems(platformIOFunctions.hash(url));
        })
        .then(function() {
          platformIOFunctions.localObjectStore.set({folderItems: folderItems});
        })
        .catch(function(err) {
          var msg = "Remote folder fetcher: Could not retrieve folder " +
          "contents for " + url;
          console.log(msg);
        });
      }));
    },

    getFolderItems: function() { return folderItems;}
  };

  function saveFolderItems(mainUrlHash) {
    return folderItems[mainUrlHash].reduce(function(prev, curr) {
      return prev.then(function() {
        return platformIOFunctions.httpFetcher(curr.url)
        .then(function(resp) {
          return resp.blob();
        })
        .then(function(blob) {
          var fileName = mainUrlHash + curr.filePath.replace("/", "|");
          return platformIOFunctions.filesystemSave(fileName, blob); 
        })
        .then(function(url) {
          curr.localUrl = url;
        });
      });
    }, Promise.resolve());
  }
};