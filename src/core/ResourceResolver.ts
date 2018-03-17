class ResourceResolver {
  private resource: Resource;
  constructor (resource: Resource) {
    this.resource = resource;
  }

  public resolveResource(path: string, callback: ResourceCallback) {
		if (path === '/' || path === '') {
			callback(this.resource);
		}
    else {
      let paths = Utils.split_path(path);
      let p = paths.shift();

      let resolve_path = function(res: Resource, name: string) {
        let walking = false;
        if (paths.length > 0) walking = true;

        res.resolveChildResource(name, function(rv) {
          if (!rv) {
            callback(null);
          }
          else if (paths.length == 0) {
            callback(rv);
          }
          else {
            let p = paths.shift();
            resolve_path(rv, p);
          }
        }, walking);
      };

      resolve_path(this.resource, p);
    }
	}

  public storeResource(path: string, data: any, callback) {
    let self = this;

		if (path === '/' || path === '') {
		  this.resource.importData(data, callback);
		}
    else {
      let paths = Utils.split_path(path);
      let p = paths.shift();

      let resolve_path = function(res: Resource, name: string) {
        let walking = false;
        if (paths.length > 0) walking = true;

        res.resolveOrCreateChildResource(name, function(rv) {
          if (!rv) {
            callback(null);
          }
          else if (paths.length == 0) {
            rv.importData(data, callback);
          }
          else {
            let p = paths.shift();
            resolve_path(rv, p);
          }
        }, walking);
      };

      resolve_path(this.resource, p);
    }
  }

  public exportResources(path: string, callback) {
    this.resolveResource(path, function(res: Resource) {
      if (res) {
        res.exportChilrenResources(0, {
          start: function(ctype) {
          },
          write: function(data) {
            callback(data);
          },
          error: function(err) {
          },
          end: function() {
            callback(null);
          }
        });
      }
      else {
        callback(null);
      }
    });
  }

  public copyResource(fromPath: string, toPath: string, callback) {
    if (fromPath === '/' || fromPath === '') {
      callback();
      return;
    }
    if (fromPath === toPath) {
      callback();
      return;
    }

    let self = this;
    let processing = 0;

    let done = function() {
      if (processing === 0) {
        processing = -1;
        callback(arguments);
      }
    };

    this.exportResources(fromPath, function(data) {
      if (data) {
        let path = Utils.filename_path_append(toPath, data[':path']);
        processing++;
        self.storeResource(path, data, function() {
          processing--;
          done();
        });
      }
      else {
        done();
      }
    });
  }

  public moveResource(path: string, callback) {
    callback();
  }

}
