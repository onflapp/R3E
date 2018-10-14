class SimpleRemoteResource extends Resource {
  private baseURL: string;
  private path: string;
  private static failedPaths = {};

	constructor(base: string, path?: string) {
		super('/');
    this.baseURL = base;
    this.path = path?path:'';
	}

  public getPath(): string {
    return this.path;
  }

  public createChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    callback(null);
  }

  public listChildrenNames(callback: ChildrenNamesCallback) {
    callback(null);
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

  public resolveChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    if (walking) {
      let res = new SimpleRemoteResource(this.baseURL, Utils.filename_path_append(this.getPath(), name));
      callback(res);
    }
    else {
      let self = this;
      let path = this.baseURL + '/' + this.getPath() + '/' + name;
      path = path.replace(/\/+/g,'/');

      if (SimpleRemoteResource.failedPaths[path]) {
        callback(null);
        return;
      }

      this.requestData(path, function(text) {
        if (text) {
          callback(new ObjectContentResource(name, text));
        }
        else {
          SimpleRemoteResource.failedPaths[path] = true;
          callback(null);
        }
      });
    }
  }

  protected requestData(path: string, callback): void {
		let xhr = new XMLHttpRequest();

    xhr.open('GET', path);

		xhr.onreadystatechange = function() {
			var DONE = 4;
			var OK = 200;
			if (xhr.readyState === DONE) {
				if (xhr.status === OK) {
					callback(xhr.responseText);
				}
				else {
          callback(null);
				}
			}
		};

    xhr.send(null);
  }
}
