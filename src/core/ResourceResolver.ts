class ResourceResolver {
  private resource: Resource;
  constructor(resource: Resource) {
    this.resource = resource;
  }

  public resolveResource(path: string, callback: ResourceCallback) {
    let self = this;
    Utils.log_trace_resolve('??', path);

    if (path === '/' || path === '') {
      Utils.log_trace_resolve('=>', path);
      this.resource.resolveItself(callback);
    }
    else {
      let l = Utils.split_path(path);
      let p = l.shift();

      let resolve_path = function (res: Resource, name: string, paths) {
        let walking = false;
        if (paths.length > 0) walking = true;

        res.resolveChildResource(name, function (rv) {
          if (!rv) {
            callback(null);
          }
          else if (paths.length == 0) {
            Utils.log_trace_resolve('=>', path);
            Utils.set_trace_path(rv, path);
            callback(rv);
          }
          else {
            let p = paths.shift();
            resolve_path(rv, p, paths);
          }
        }, walking);
      };

      resolve_path(self.resource, p, l);
    }
  }

  public storeResource(path: string, data: Data, callback) {
    let self = this;

    if (path === '/' || path === '') {
      this.resource.importData(data, callback);
    }
    else {
      let paths = Utils.split_path(path);
      let p = paths.shift();

      let resolve_path = function (res: Resource, name: string) {
        let walking = false;
        if (paths.length > 0) walking = true;

        res.resolveOrAllocateChildResource(name, function (rv) {
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
    this.resolveResource(path, function (res: Resource) {
      if (res) {
        Tools.exportChilrenResources(res, 0, {
          start: function (ctype) {},
          write: function (data) {
            callback(data);
          },
          error: function (err) {},
          end: function () {
            callback(null);
          }
        });
      }
      else {
        callback(null);
      }
    });
  }

  public removeResource(fromPath: string, callback) {
    let dirname = Utils.filename_dir(fromPath);
    let name = Utils.filename(fromPath);
    let self = this;

    self.resolveResource(dirname, function (res: Resource) {
      res.removeChildResource(name, function () {
        callback();
      });
    });
  }

  public moveResource(fromPath: string, toPath: string, callback) {
    let self = this;
    self.copyResource(fromPath, toPath, function () {
      self.removeResource(fromPath, function () {
        callback();
      });
    });
  }

  public cloneResource(fromPath: string, toPath: string, callback) {
    if (fromPath === '/' || fromPath === '') {
      callback();
      return;
    }
    if (fromPath === toPath) {
      callback();
      return;
    }

    let self = this;
    self.resolveResource(fromPath, function (res: Resource) {
      if (res) {
        let data = new Data(res.getValues());
        self.storeResource(toPath, data, function () {
          callback(arguments);
        });
      }
      else {
        callback(arguments);
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
    let ended = false;

    let done = function () {
      if (processing === 0 && ended) {
        callback(arguments);
      }
    };

    this.exportResources(fromPath, function (data: Data) {
      if (data) {
        let path = Utils.filename_path_append(toPath, data.values[':path']);
        processing++;
        self.storeResource(path, data, function () {
          processing--;
          done();
        });
      }
      else {
        ended = true;
        done();
      }
    });
  }

}
