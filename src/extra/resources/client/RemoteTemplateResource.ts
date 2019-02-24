class RemoteTemplateResource extends Resource {
  private baseURL: string;
  private path: string;
  private resources = {};
  private static failedPaths = {};

  constructor(base: string, path ? : string, name ? : string) {
    super(name ? name : '');
    this.baseURL = base;
    this.path = path ? path : '';
  }

  public getPath(): string {
    return this.path;
  }

  public allocateChildResource(name: string, callback: ResourceCallback, walking ? : boolean): void {
    callback(null);
  }

  public listChildrenNames(callback: ChildrenNamesCallback) {
    let rv = [];
    for (var key in this.resources) {
      rv.push(key);
    }

    callback(rv);
  }

  public importProperties(data: any, callback) {
    callback(null);
  }

  public importContent(func, callback) {
    callback(null);
  }

  public removeChildResource(name: string, callback) {
    callback(null);
  }

  public resolveChildResource(name: string, callback: ResourceCallback, walking ? : boolean): void {
    let res = this.resources[name];
    if (res) {
      callback(res);
    }
    else if (walking) {
      res = new RemoteTemplateResource(this.baseURL, Utils.filename_path_append(this.getPath(), name), name);
      this.resources[name] = res;
      callback(res);
    }
    else {
      let self = this;
      let path = this.baseURL + '/' + this.getPath() + '/' + name;
      path = path.replace(/\/+/g, '/');

      if (RemoteTemplateResource.failedPaths[path]) {
        callback(null);
        return;
      }

      this.requestData(path, function (ctype, text) {
        if (text) {
          res = new ObjectContentResource({
            _content: text,
            _ct: ctype
          }, name);
          self.resources[name] = res;
          callback(res);
        }
        else {
          RemoteTemplateResource.failedPaths[path] = true;
          callback(null);
        }
      });
    }
  }

  protected requestData(path: string, callback): void {
    let xhr = new XMLHttpRequest();

    xhr.open('GET', path);
    xhr.onreadystatechange = function () {
      var DONE = 4;
      var OK = 200;
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          let ct = xhr.getResponseHeader('content-type');
          callback(ct, xhr.responseText);
        }
        else {
          callback(null);
        }
      }
    };

    xhr.send(null);
  }
}
