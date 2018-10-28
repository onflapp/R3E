abstract class StoredResource extends Resource {
  protected basePath: string;
  protected baseName: string;
  protected childNames;
  protected isDirectory: boolean = true;

	constructor(name: string, base?: string) {
		super(name);
    if (typeof base !== 'undefined') {
      this.baseName = name;
      this.basePath = base;
    }
    else {
      this.baseName = '';
      this.basePath = name;
    }
	}

  public getStoragePath(name?: string): string {
    let path = Utils.filename_path_append(this.basePath, this.baseName);
    if (name) path = Utils.filename_path_append(path, name);
    return path;
  }

  public getType(): string {
    if (this.isDirectory) return 'resource/node';
    else return 'resource/content';
  }

  public getSuperType(): string {
    if (this.getType() === 'resource/node') return null;
    else return 'resource/node';
  }

  public getRenderType(): string {
    return this.values['_rt'];
  }

  public isContentResource(): boolean {
    return !this.isDirectory;
  }

  public getContentType(): string {
    if (this.isDirectory) return null;

    let contentType = this.values['_ct'];
    if (contentType) return contentType;
    else return Utils.filename_mime(this.getName());
  }

  public resolveItself(callback) {
    let self = this;
    this.loadProperties(function(rv) {
      if (rv) callback(self);
      else callback(null);
    });
  }

  public resolveChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    if (walking) {
      let res = this.makeNewResource(name);
      callback(res);
    }
    else {
      let self = this;
      this.listChildrenNames(function(childNames) {
        if (childNames && childNames.indexOf(name) >= 0) {
          let res = self.makeNewResource(name);
          res.resolveItself(callback);
        }
        else callback(null);
      });
    }
  }

  public listChildrenNames(callback: ChildrenNamesCallback) {
    let self = this;
    if (self.childNames) {
      callback(self.childNames);
    }
    else {
      this.loadChildrenNames(function(ls) {
        self.childNames = ls;
        callback(ls);
      });
    }
  }

  public allocateChildResource(name: string, callback: ResourceCallback): void {
    if (this.childNames.indexOf(name) === -1) this.childNames.push(name);

    let res = this.makeNewResource(name);
    this.storeChildrenNames(function() {
      callback(res);
    });
  }

  public importProperties(data: any, callback) {
    let self = this;
    let path = this.getStoragePath();
    super.importProperties(data, function() {
      self.ensurePathExists(path, function(rv) {
        if (rv) {
          self.storeProperties(function() {
            callback();
          });
        }
        else {
          callback();
        }
      });
    });
  }

  public importContent(func, callback) {
    func(this.getWriter(), callback);
  }

  public removeChildResource(name: string, callback) {
    this.childNames.splice(this.childNames.indexOf(name), 1);
    this.storeChildrenNames(function() {
      callback();
    });
  }

  protected abstract makeNewResource(name: string);
  protected abstract ensurePathExists(path: string, callback);
  protected abstract storeChildrenNames(callback);
  protected abstract loadChildrenNames(callback);

  protected abstract storeProperties(callback);
  protected abstract loadProperties(callback);
}
