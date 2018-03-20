class SimpleRemoteResource extends Resource {
  private baseURL: string;
  private path: string;

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

  public removeChildResource(name: string, callback) {
    callback(null);
  }

  public resolveChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    if (walking) {
      callback(new SimpleRemoteResource(this.baseURL, Utils.filename_path_append(this.getPath(), name)));
    }
    else {
      let path = this.baseURL + '/' + this.getPath() + '/' + name;
      path = path.replace(/\/+/g,'/');

      this.requestData(path, function(text) {
        if (text) {
          callback(new ObjectContentResource(name, text));
        }
        else {
          callback(null);
        }
      });
    }
  }

	public getPropertyNames(): Array < string > {
		return null;
	}

	public getProperty(name: string): any {
		return null;
	}

  public isContentResource(): boolean {
    return false;
  }

  protected requestData(path: string, callback): void {
		let xhr = new XMLHttpRequest();

    xhr.open('GET', path);

		xhr.onreadystatechange = function() {
			var DONE = 4; // readyState 4 means the request is done.
			var OK = 200; // status 200 is a successful return.
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
