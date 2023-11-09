class StoredObjectResource extends ObjectResource {
  protected storageResource: Resource;
  protected storagePath: string;
  protected basePath: string;
  protected rootResource: StoredObjectResource;
  protected loaded = false;
  protected externalizeContent = false;

  constructor(obj: any, name: string, base: string, root: any) {
    super({}, '');
    let self = this;

    if (!root) { //root
      this.storageResource = obj;
      this.storagePath = name;
      this.rootResource = null;
      this.basePath = '';

      EventDispatcher.global().addEventListener('cache-flush', function() {
        self.flushResourceCache();
      });
    }
    else { //child
      this.values = obj;
      this.resourceName = name;
      this.rootResource = root;
      this.basePath = base;
    }
  }

  public flushResourceCache() {
    this.loaded = false;
  }

  public setExternalizeContent(externalize: boolean) {
    this.externalizeContent = externalize;
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
    let externalize = this.rootResource ? this.rootResource.externalizeContent : this.externalizeContent;
    
    if (externalize) {
      let path = Utils.filename_path_append(this.basePath, this.resourceName);
      let rres = new ResourceResolver(root);
      let data = new Data({
        '_content':func
      });

      rres.storeResource(path, data, function() {
        self.importProperties({
          '_pt': 'resource/content',
          '_content':path
        }, callback);
      });
    }
    else {
      super.importContent(func, function() {
        self.storeObjectResource(function() {
          callback();
        });
      });
    }
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

    rres.resolveResource(path, function(res) {
      if (res) {
        res.read(new ContentWriterAdapter('utf8', function (data, ctype) {
          let rv = JSON.parse(data);
          if (Array.isArray(rv)) {
            self.values = {};
            let v = {};
            let ores = new ResourceResolver(new ObjectResource(v, ''));
            for (let i = 0; i < rv.length; i++) {
              let item = rv[i];
              let path = Utils.filename_path_append(self.resourceName, item[':path']);
              ores.storeResource(path, new Data(item), function () {
              });
            }
            for (let k in v) {
              self.values = v[k];
            }
          }
          else if (rv) {
            self.values = rv;
          }
          self.loaded = true;
          callback();
        }), null);
      }
      else {
        self.loaded = true;
        callback();
      }
    });
  }

  public storeObjectResource(callback) {
    let self = this;
    let vals = this.rootResource ? this.rootResource.values : this.values;
    let path = this.rootResource ? this.rootResource.storagePath : this.storagePath;
    let root = this.rootResource ? this.rootResource.storageResource : this.storageResource;
    if (this.rootResource && !this.rootResource['loaded']) {
      callback();
      return;
    }
    if (this.storageResource && !this.storageResource['loaded']) {
      callback();
      return;
    }

    let json = JSON.stringify(vals, null, 2);
    let rres = new ResourceResolver(root);
    let data = {
      '_content':json
    };
    rres.storeResource(path, new Data(data), function() {
      self.loaded = true;
      callback();
    });
  }

  protected makeNewObjectContentResource(rv: any, name: string) {
    let root = this.rootResource ? this.rootResource : this;
    if (root.externalizeContent) {
      return new StoredObjectContentResource(rv, name, root, root.storageResource);
    }
    else {
      return new StoredObjectContentResource(rv, name, root, null);
    }
  }
  
  protected makeNewObjectResource(rv: any, name: string) {
    let root = this.rootResource ? this.rootResource : this;
    let path = Utils.filename_path_append(this.basePath, this.resourceName);
    return new StoredObjectResource(rv, name, path, root);
  }
}

class StoredObjectContentResource extends ObjectContentResource {
  protected storageResource: Resource;
  protected rootResource: StoredObjectResource;

  constructor(obj: any, name: string, root: StoredObjectResource, storage: Resource) {
    super(obj, name);
    this.storageResource = storage;
    this.rootResource = root;
  }

  public read(writer: ContentWriter, callback: any): void {
    if (this.storageResource) {
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
    else {
      super.read(writer, callback);
    }
  }

  public importContent(func, callback) {
    let self = this;
    let storage = this.storageResource;
    if (storage) {
      let path = this.values['_content'];
      let rres = new ResourceResolver(storage);

      rres.resolveResource(path, function(res) {
        if (res) {
          res.importContent(func, callback);
        }
        else {
          callback();
        }
      });
    }
    else {
      super.importContent(func, function() {
        self.rootResource.storeObjectResource(function() {
          callback();
        });
      });
    }
  }
}
