abstract class StoredResource extends Resource {
  protected basePath: string;
  protected baseName: string;
  protected basePrefix: string;
  protected childNames;
  protected isDirectory: boolean = true;
  protected contentSize: number = -1;
  protected resourceCache = {};
  protected loaded = false;

  constructor(name: string, base ? : string, prefix ? : string) {
    super(name);
    if (typeof base !== 'undefined') {
      this.baseName = name;
      this.basePath = base;
      this.basePrefix = prefix;
    }
    else {
      this.baseName = '';
      this.basePath = name;
      this.basePrefix = name;
    }
  }

  protected getCachedResource(name: string): Resource {
    let res = this.resourceCache[name];
    return res;
  }

  protected setCachedResource(name: string, res: StoredResource): Resource {
    if (res) {
      this.resourceCache[name] = res;
    }
    return res;
  }

  protected clearCachedResource(name: string) {
    if (name) delete this.resourceCache[name];
    else this.resourceCache = {};
  }

  public flushResourceCache() {
    this.resourceCache = {};
    this.childNames = null;
    this.loaded = false;
  }

  public getStoragePath(name ? : string): string {
    let path = Utils.filename_path_append(this.basePath, this.baseName);
    if (name) path = Utils.filename_path_append(path, name);
    return path;
  }

  public getMetadataPath(nm ? : string): string {
    if (nm) {
      return this.basePath + '/.' + nm + '.metadata.json';
    }
    else {
      return this.getStoragePath('.metadata.json');
    }
  }

  public getType(): string {
    if (this.isDirectory) return 'resource/node';
    else return 'resource/content';
  }

  public getRenderType(): string {
    return this.values['_rt'];
  }

  public getRenderSuperType(): string {
    return this.values['_st'];
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

  public getContentSize(): number {
    if (this.isDirectory) return 0;
    else return this.contentSize;
  }

  public resolveItself(callback) {
    let self = this;

    if (self.loaded) {
      callback(self);
    }
    else {
      self.loadProperties(function (rv) {
        self.loaded = rv ? true : false;

        if (rv) callback(self);
        else callback(null);
      });
    }
  }

  public resolveChildResource(name: string, callback: ResourceCallback, walking ? : boolean): void {
    let res = this.getCachedResource(name);
    let self = this;

    if (res) {
      if (walking) callback(res);
      else res.resolveItself(callback);
    }
    else {
      if (walking) {
        this.childNames = null;
        res = this.setCachedResource(name, this.makeNewResource(name));
        callback(res);
      }
      else {
        res = this.makeNewResource(name);
        res.resolveItself(function(rv) {
          if (rv) {
            self.setCachedResource(name, res as StoredResource);
            self.childNames = null;
            callback(res);
          }
          else callback(null);
        });
      }
    }
  }

  public listChildrenNames(callback: ChildrenNamesCallback) {
    let self = this;

    if (self.childNames) {
      callback(self.childNames);
    }
    else {
      this.loadChildrenNames(function (ls) {
        self.childNames = ls;
        callback(ls);
      });
    }
  }

  public allocateChildResource(name: string, callback: ResourceCallback): void {
    let res = this.setCachedResource(name, this.makeNewResource(name));
    this.childNames = null;
    callback(res);
  }

  public importProperties(data: any, callback) {
    if (!this.isDirectory) {
      callback();
      return;
    }

    let self = this;
    let path = this.getStoragePath();

    if (!this.isDirectory) {
      path = this.basePath;
    }

    super.importProperties(data, function () {
      self.ensurePathExists(path, function (rv) {
        if (rv) {
          self.storeProperties(function () {
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
    let self = this;
    let path = this.basePath;

    this.isDirectory = false;

    this.ensurePathExists(path, function (rv) {
      if (rv) {
        func(self.getWriter(), callback);
      }
      else {
        callback();
      }
    });
  }

  public removeChildResource(name: string, callback) {
    this.clearCachedResource(name);

    if (this.childNames) {
      this.childNames.splice(this.childNames.indexOf(name), 1);
    }

    this.storeChildrenNames(function () {
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
