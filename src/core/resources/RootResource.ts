class RootResource extends ObjectResource {
  constructor(opts?: any) {
    super('', opts?opts:{});
  }

  public getType(): string {
    return 'resource/root';
  }
    
  public getSuperType(): string {
    return 'resource/node';
  }  

  public resolveChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    let rv = this.rootObject[name];
    if (rv && rv instanceof Resource) {
      rv.getName = function() {
        return name;
      };
      rv.resolveItself(function() {
        callback(rv);
      });
    }
    else callback(rv);
  }

  public createChildResource(name: string, callback: ResourceCallback): void {
    callback(null);
  }

  public importProperties(data: any, callback) {
    callback();
  }

}
