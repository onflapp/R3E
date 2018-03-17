class RootResource extends Resource {
  private resources = {};

  constructor() {
    super('');
  }

  public getType(): string {
    return 'resource/root';
  }
    
  public getSuperType(): string {
    return super.getType();
  }  

  public resolveChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    let rv = this.resources[name];
    callback(rv);
  }

  public createChildResource(name: string, callback: ResourceCallback): void {
    callback(null);
  }

  public getPropertyNames(): Array<string> {
    return [];
  }

  public getProperty(name: string): any {
    return null;
  }

  public listChildrenNames(callback: ChildrenNamesCallback) {
    let rv = [];
    for (let k in this.resources) {
      let v: Resource = this.resources[k];
      rv.push(v.getName());
    }
    callback(rv);
  }

  public importData(data: any, callback) {
    for (let k in data) {
      let v = data[k];
      if (v instanceof Resource) {
        this.resources[v.getName()] = v;
      }
    }
    if (callback) callback();
  }

  public removeChildResource(name: string, callback) {
    delete this.resources[name];
    if (callback) callback();
  }
}
