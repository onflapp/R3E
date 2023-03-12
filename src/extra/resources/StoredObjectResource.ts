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

  public resolveChildResource(name: string, callback: ResourceCallback, walking ? : boolean): void {
    let rfunc = super.resolveChildResource;
    let self = this;

    if (!this.rootResource && !this.loaded && this.storageResource) {
      this.loadObjectResource(function() {
        rfunc.call(self, name, callback, walking);
      });
    }
    else {
      super.resolveChildResource(name, callback, walking);
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
    if (this.loaded) {
      callback();
      return;
    }

    let self = this;
    let path = this.storagePath;
    let rres = new ResourceResolver(this.storageResource);

    this.loaded = true;
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
    let json = JSON.stringify(vals, null, 2);
    let rres = new ResourceResolver(root);
    let data = {
      '_content':json
    };
    rres.storeResource(path, new Data(data), function() {
      callback();
    });
  }

  protected makeNewObjectContentResource(rv: any, name: string) {
    let root = this.rootResource ? this.rootResource : this;
    return new StoredObjectContentResource(rv, name, root.storageResource);
  }
  
  protected makeNewObjectResource(rv: any, name: string) {
    let root = this.rootResource ? this.rootResource : this;
    let path = Utils.filename_path_append(this.basePath, this.resourceName);
    return new StoredObjectResource(rv, name, path, root);
  }
}

class StoredObjectContentResource extends ObjectContentResource {
  protected storageResource: Resource;

  constructor(obj: any, name: string, storage: any) {
    super(obj, name);
    this.storageResource = storage;
  }

  public read(writer: ContentWriter, callback: any): void {
    let rres = new ResourceResolver(this.storageResource);
    let path = this.values['_content'];
    rres.resolveResource(path, function(res) {
      if (res) {
        res.read(writer, callback);
      }
      else {
        callback();
      }
    });
  }

  public importContent(func, callback) {
    let self = this;
    let root = this.storageResource;
    let path = this.values['_content'];
    let rres = new ResourceResolver(root);

    rres.resolveResource(path, function(res) {
      if (res) {
        res.importContent(func, callback);
      }
      else {
        callback();
      }
    });
  }
}
