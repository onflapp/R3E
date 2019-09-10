class ShellCommands {
  private context: ResourceRequestContext;
  constructor(context: ResourceRequestContext) {
    this.context = context;
  }

  public async ls(path) {
    let context = this.context;
    let p = new Promise(function(resolve, reject) {
      context.resolveResource(path, function(res) {
        if (res) {
          res.listChildrenNames(function(ls) {
            resolve(ls);
          });
        }
        else {
          reject();
        }
      });
    });

    let rv = await p;
    return rv;
  }
  public cp(fpath, tpath) {
  }
  
  public rm(path) {
  }
  
  public mv(fpath, tpath) {
  }

  public cat(path) {
  }
}
