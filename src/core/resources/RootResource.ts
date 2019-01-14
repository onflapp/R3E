class RootResource extends ObjectResource {
  constructor(opts?: any) {
    super('', opts);
  }

  public getType(): string {
    return 'resource/node';
  }
    
  public getSuperType(): string {
    return 'resource/root';
  }  

  public resolveChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    let rv = this.values[name];
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

  public allocateChildResource(name: string, callback: ResourceCallback): void {
    callback(null);
  }

  public importProperties(data: any, callback) {
    callback();
  }

}
