class LocalStorageResource extends ObjectResource {
  protected storageName: string;
  protected rootResource: LocalStorageResource;
  constructor(obj: any, name: string, root: LocalStorageResource) {
    super(obj, name);

    if (!name && typeof obj === 'string') {
      this.storageName = obj;
      this.loadLocalStorage();
    }
    else if (root) {
      this.rootResource = root;
    }
    else {
      this.storageName = name;
      this.loadLocalStorage();
    }
  }

  public storeLocalStorage() {
    let data = JSON.stringify(this.values, null, 2);
    localStorage.setItem(this.storageName, data);
  }

  public loadLocalStorage() {
    let data = localStorage.getItem(this.storageName);
    if (data) {
      this.values = JSON.parse(data);
    }
  }

  public importProperties(data: any, callback) {
    let self = this;
    let root = this.rootResource ? this.rootResource : this;
    super.importProperties(data, function() {
      root.storeLocalStorage();
      callback();
    });
  }

  public importContent(func, callback) {
    let self = this;
    let root = this.rootResource ? this.rootResource : this;
    let res = this.makeNewObjectContentResource(this.values, this.resourceName);
    func(res.getWriter(), function() {
      root.storeLocalStorage();
      callback();
    });
  }

  public removeChildResource(name: string, callback) {
    let self = this;
    let root = this.rootResource ? this.rootResource : this;
    super.removeChildResource(name, function() {
      root.storeLocalStorage();
      if (callback) callback();
    });
  }

  protected makeNewObjectContentResource(rv: any, name: string) {
    let root = this.rootResource ? this.rootResource : this;
    return new LocalStorageContentResource(rv, name, root);
  }

  protected makeNewObjectResource(rv: any, name: string) {
    let root = this.rootResource ? this.rootResource : this;
    return new LocalStorageResource(rv, name, root);
  }
}

class LocalStorageContentResource extends ObjectContentResource {
  protected rootResource: LocalStorageResource;

  constructor(obj: any, name: string, root: LocalStorageResource) {
    super(obj, name);
    this.rootResource = root;
  }

  public importContent(func, callback) {
    let self = this;
    super.importContent(func, function() {
      self.rootResource.storeLocalStorage();
      callback();
    });
  }
}
