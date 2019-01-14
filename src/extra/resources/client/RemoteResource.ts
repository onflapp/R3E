class RemoteResource extends ObjectResource {
  private baseURL: string;
  private baseName: string;
  private resolved: boolean = false;
  private childNames = [];

	constructor(name: string, base: string, obj?: any) {
		super(name, obj?obj:{});
    this.baseName = name;
    this.baseURL = base;
	}

  public getURL(name: string): string {
    let path = this.baseURL + '/' + name;
    return path;
  }

  protected getChildrenStoreName() {
    return 'children.json';
  }

  protected getPropertiesStoreName() {
    return 'properties.json';
  }

  protected makeNewResource(name: string, obj: any) {
    let b = this.baseURL;
    let n = name;
    if (n) b += '/' + n;
    return new RemoteResource(name, b, obj);
  }

  public resolveItself(callback) {
    if (this.resolved) {
      callback(this);
      return;
    }

    let self = this;
    let processed = 0;
    let found = 0;
    let done = function() {
      if (processed == 2) {
        if (found) {
          callback(self);
          self.resolved = true;
        }
        else callback(null);
      }
    };

    this.refresh(this.getPropertiesStoreName(), function(rv) {
      if (rv) {
        self.values = rv;
        found++;
      }
      processed++;
      done();
    });

    this.refresh(this.getChildrenStoreName(), function(rv) {
      if (rv) {
        self.childNames = rv;
        found++;
      }
      processed++;
      done();
    });

  }

  public resolveChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    if (walking) {
      let res = this.makeNewResource(name, {});
      callback(res);
    }
    else {
      let self = this;
      this.resolveItself(function(rv) {
        if (rv && self.childNames.indexOf(name) >= 0) {
          let res = self.makeNewResource(name, {});
          res.resolveItself(callback);
        }
        else callback(null);
      });
    }
  }

  public listChildrenNames(callback: ChildrenNamesCallback) {
    callback(this.childNames);
  }

  public allocateChildResource(name: string, callback: ResourceCallback): void {
    if (this.childNames.indexOf(name) === -1) this.childNames.push(name);

    let res = this.makeNewResource(name, {});
    this.store(this.getChildrenStoreName(), this.childNames, function() {
      callback(res);
    });
  }

  public importProperties(data: any, callback) {
    let self = this;
    super.importProperties(data, function() {
      self.store(self.getPropertiesStoreName(), self.values, function() {
        callback();
      });
    });
  }

  public removeChildResource(name: string, callback) {
    let self = this;
    this.childNames.splice(this.childNames.indexOf(name), 1);
    super.removeChildResource(name, function() {
      self.store(self.getChildrenStoreName(), self.childNames, function() {
        callback();
      });
    });
  }

  protected store(name, values, callback): void {
    let url = this.getURL(name);
    let data = JSON.stringify(values);
		let xhr = new XMLHttpRequest();
    let self = this;

    xhr.open('POST', url);

    xhr.setRequestHeader('Content-Type', 'application/json');//;charset=UTF-8');
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

    xhr.send(data);
  }

  protected refresh(name, callback): void {
    let url = this.getURL(name);
    let xhr = new XMLHttpRequest();

    xhr.open('GET', url);
		xhr.onreadystatechange = function() {
			var DONE = 4;
			var OK = 200;
			if (xhr.readyState === DONE) {
				if (xhr.status === OK) {
          let val = null;
					let data = xhr.responseText;
          if (data) {
            try {
              val = JSON.parse(data);
            }
            catch (ex) {
            }
          }
          callback(val);
				}
				else {
          callback(null);
				}
			}
		};

    xhr.send();
  }
}
