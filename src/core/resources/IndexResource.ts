abstract class IndexResource extends ObjectResource {
  private indx: any;
  private parentIndexResource: IndexResource;
  protected basePath: string;
  protected baseName: string;

  constructor(name ? : string, base ? : string, index?: any) {
    super({}, name);
    if (typeof base !== 'undefined') {
      this.baseName = name;
      this.basePath = base;
    }
    else {
      this.baseName = '';
      this.basePath = name ? name : '';
    }

    this.parentIndexResource = index;
  }

  public getType(): string {
    return 'resource/index';
  }

  protected getIndexEngine(): any {
    let indx = this.parentIndexResource?this.parentIndexResource.indx:this.indx;
    return indx;
  }

  public resolveChildResource(name: string, callback: ResourceCallback, walking ? : boolean): void {
    this.allocateChildResource(name, callback);
  }

  public buildIndex(callback) {
    callback();
  }

  protected abstract initIndexEngine(callback);
  protected abstract indexTextData(text, callback);  
  protected abstract searchResourceNames(qry: string, callback);
  protected abstract removeResourcesFromIndex(name: string, callback);

  public resolveItself(callback) {
    let self = this;
    if (!this.parentIndexResource && !this.indx) {
      this.initIndexEngine(function(indx) {
        self.indx = indx;
        self.buildIndex(function() {
          if (callback) callback(self);
        });
      });
    }
    else {
      if (callback) callback(self);
    }
  }

  public getStoragePath(name ? : string): string {
    let path = Utils.filename_path_append(this.basePath, this.baseName);
    if (name) path = Utils.filename_path_append(path, name);
    return path;
  }

  public allocateChildResource(name: string, callback: ResourceCallback): void {
    let path = this.getStoragePath();
    let ctr = (<any>this.constructor);
    callback(new ctr(name, path, this.parentIndexResource?this.parentIndexResource:this));
  }

  public importContent(func, callback) {
    let self = this;
    let text = null;

    func(new ContentWriterAdapter('utf8', function (data, ctype) {
      text = data;

    }), function() {

      if (text) {
        self.indexTextData(text, callback);
      }
      else if (callback) callback();
    });
  }

  public importProperties(data: any, callback) {
    let text = [];
    let self = this;

    for (let k in data) {
      let v = data[k];

      this.values[k] = v;
      if (v && k) text.push(k+' = '+v);
    }

    if (text.length > 0) {
      self.indexTextData(text.join('\n'), callback);
    }
    else if (callback) callback();
  }

  public removeChildResource(name: string, callback) {
    if (name == '_THE_INDEX_' && !this.parentIndexResource) {
      let self = this;
      this.initIndexEngine(function(indx) {
        self.indx = indx;
        if (callback) callback();
      });
    }
    else {
      this.removeResourcesFromIndex(name, callback);
    }
  }
}
