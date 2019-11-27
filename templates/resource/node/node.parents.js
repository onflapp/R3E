(function (res, writer, context) {
  writer.start('object/javascript');

  var path = context.getCurrentResourcePath();

  var parentResources = [];
  var parentPaths = [];
  var ps = Utils.split_path(path);
  ps.pop();

  var parentResource = function(callback) {
    var rpath = ps.join('/');
    if (rpath == '') {
      callback();
    }
    else {
      context.resolveResource('/'+rpath, function(pres) {
        var map = context.makeContextMap(pres);
        map.path = '/'+rpath;
        parentResources.unshift(map);

        ps.pop();
        parentResource(callback);
      });
    }
  };

  parentResource(function() {
    writer.write(parentResources);
    writer.end();
  });

});
