class StoredObjectResource extends ObjectResource {
  protected storageResource: Resource;
  protected storagePath: string;
  protected basePath: string;
  protected rootResource: StoredObjectResource;
  protected loaded = false;

  constructor(obj: any, name: string, base: string, root: any) {
    super({}, '');
    if (!root) {
      this.storageResource = obj;
      this.storagePath = name;
      this.rootResource = null;
      this.basePath = '';
    }
    else {
      this.values = obj;
      this.resourceName = name;
      this.rootResource = root;
      this.basePath = base;
    }
  }

  public resolveItself(callback) {
    if (!this.rootResource && !this.loaded && this.storageResource) {
      let self = this;
      this.loadObjectResource(function() {
        if (callback) callback(self);
      });
    }
    else {
      if (callback) callback(this);
    }
  }

  public removeChildResource(name: string, callback) {
    let self = this;
    super.removeChildResource(name, function() {
      self.storeObjectResource(function() {
        if (callback) callback();
      });
    });
  }

  public importContent(func, callback) {
    let self = this;
    let root = this.rootResource ? this.rootResource.storageResource : this.storageResource;
    let path = Utils.filename_path_append(this.basePath, this.resourceName);
    let rres = new ResourceResolver(root);
    let data = new Data({
      '_content':func
    });

    rres.storeResource(path, data, function() {
      self.importProperties({
        '_content':path
      }, callback);
    });
  }

  public importProperties(data: any, callback) {
    let self = this;
    super.importProperties(data, function() {
      self.storeObjectResource(function() {
        callback();
      });
    });
  }

  protected loadObjectResource(callback) {
    let self = this;
    let path = this.storagePath;
    let rres = new ResourceResolver(this.storageResource);
    rres.resolveResource(path, function(res) {
      if (res) {
        res.read(new ContentWriterAdapter('utf8', function (data, ctype) {
          let rv = JSON.parse(data);
          if (rv) {
            self.values = rv;
          }
          callback();
        }), null);
      }
      else {
        callback();
      }
    });
  }

  protected storeObjectResource(callback) {
    let vals = this.rootResource ? this.rootResource.values : this.values;
    let path = this.rootResource ? this.rootResource.storagePath : this.storagePath;
    let root = this.rootResource ? this.rootResource.storageResource : this.storageResource;
    let json = JSON.stringify(vals);
    let rres = new ResourceResolver(root);
    let data = {
      '_content':json
    };
    rres.storeResource(path, new Data(data), function() {
      callback();
    });
  }

  public resolveChildResource(name: string, callback: ResourceCallback, walking ? : boolean): void {
    let rv = this.values[name];
    let root = this.rootResource ? this.rootResource.storageResource : this.storageResource;
    let rres = new ResourceResolver(root);

    if (typeof rv === 'object') {
      if (rv['_content'] && !walking) {
        let path = rv['_content'];
        rres.resolveResource(path, function(res) {
          callback(res);
        });
      }
      else callback(this.makeNewObjectResource(rv, name));
    }
    else {
      callback(null);
    }
  }

  protected makeNewObjectResource(rv: any, name: string) {
    let root = this.rootResource ? this.rootResource : this;
    let path = Utils.filename_path_append(this.basePath, this.resourceName);
    return new StoredObjectResource(rv, name, path, root);
  }
}
