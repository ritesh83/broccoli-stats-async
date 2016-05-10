var Plugin    = require('broccoli-plugin');
var path      = require('path');
var fs        = require('fs');
var RSVP      = require('rsvp');

StatsAsyncPlugin.prototype = Object.create(Plugin.prototype);
StatsAsyncPlugin.prototype.constructor = StatsAsyncPlugin;

function StatsAsyncPlugin(inputNodes, options) {
    options = options || {};
    
    Plugin.call(this, inputNodes, {
        annotation: options.annotation
    });
    
    this.options = options;
}

StatsAsyncPlugin.prototype.build = function() {
  var srcDir = this.inputPaths[0];
  var outPath = this.outputPath;
  var totalSize = 0;
  
  return new RSVP.Promise(function(resolve, reject) {
      fs.readdir(srcDir, function(err,files) {
          var totalSizePromise = new RSVP.Promise(function(resolve, reject) {
              files.forEach(function(file, index) {
                  var fromPath = path.join(srcDir, file);
                  
                  var stat = fs.statSync(fromPath);
                  totalSize += stat["size"];
                      
                  if(index === files.length-1) {
                      resolve(totalSize);
                  }
              });
          });

          totalSizePromise.then(function(totalSize) {
              var output = {"size":totalSize, "timestamp": Date.now()};

              fs.writeFileSync(path.join(outPath, 'build.txt'), JSON.stringify(output));  
              
              resolve();
          });
      });
  });
};

module.exports = StatsAsyncPlugin;