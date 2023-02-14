class ResourceRequestContext implements ScriptContext {
  private pathInfo: PathInfo;
  private resourceRequestHandler: ResourceRequestHandler;
  private renderResourceType: string;
  private currentResource: Resource;

  constructor(pathInfo: PathInfo, handler: ResourceRequestHandler) {
    this.pathInfo = pathInfo;
    this.resourceRequestHandler = handler;
  }

  public __overrideCurrentResourcePath(resourcePath :string) {
    this.pathInfo.resourcePath = resourcePath;
  }

  public __overrideCurrentRenderResourceType(rstype :string) {
    this.renderResourceType = rstype;
  }

  public getCurrentSelector(): string {
    return this.pathInfo.selector;
  }

  public getCurrentResourcePath(): string {
    return this.pathInfo.resourcePath;
  }

  public getCurrentRequestPath(): string {
    return this.pathInfo.path;
  }

  public getCurrentDataPath(): string {
    return this.pathInfo.dataPath;
  }

  public getCurrentRenderResourceType(): string {
    return this.renderResourceType;
  }

  public getResourceResolver(): ResourceResolver {
    return this.resourceRequestHandler.getResourceResolver();
  }

  public getTemplateResourceResolver(): ResourceResolver {
    return this.resourceRequestHandler.getTemplateResourceResolver();
  }

  public renderResource(resourcePath: string, rstype: string, selector: string) : Promise<any>{
    let self = this;
    return new Promise(function (resolve) {
      self.resourceRequestHandler.renderResource(resourcePath, rstype, selector, self, function(contentType, content) {
        resolve({ contentType:contentType, content:content });
      });
    });
  }

  public resolveResource(resourcePath: string) : Promise<any> {
    let rres = this.getResourceResolver();
    let self = this;
    let base = this.getCurrentResourcePath();

    return new Promise(function (resolve) {
      if (resourcePath === '.' && self.currentResource) {
        let map = self.makePropertiesForResource(self.currentResource);
        map['path'] = self.getCurrentResourcePath();
        resolve(map);
      }
      else {
        resourcePath = Utils.absolute_path(resourcePath, base);
        rres.resolveResource(resourcePath, function(res) {
          if (res) {
            let map = self.makePropertiesForResource(res);
            map['path'] = resourcePath;
            resolve(map);
          }
          else {
            resolve(null);
          }
        });
      }
    });
  }

  public listResourceNames(resourcePath: string) : Promise<any> {
    let self = this;
    let rres = this.getResourceResolver();
    let base = this.getCurrentResourcePath();

    return new Promise(function (resolve) {
      if (resourcePath === '.' && self.currentResource) {
        self.currentResource.listChildrenNames(function(ls) {
          resolve(ls);
        });
      }
      else {
        resourcePath = Utils.absolute_path(resourcePath, base);
        rres.resolveResource(resourcePath, function(res) {
          if (res) {
            res.listChildrenNames(function(ls) {
              resolve(ls);
            });
          }
          else {
            resolve([]);
          }
        });
      }
    });
  }

  public listAllResourceNames(resourcePath: string, callback:any) : Promise<any> {
    let self = this;
    let rres = this.getResourceResolver();
    let base = this.getCurrentResourcePath();
    let ls = [];

    return new Promise(function (resolve) {
      let visit_all = function(res) {
        Tools.visitAllChidren(res, false, function(rpath) {
          if (rpath) {
            let rv = callback(rpath);
            if (rv) ls.push(rpath);
            return rv;
          }
          else {
            resolve(ls);
            return false;
          }
        });
      };

      if (resourcePath === '.' && self.currentResource) {
        visit_all(self.currentResource);
      }
      else {
        resourcePath = Utils.absolute_path(resourcePath, base);
        rres.resolveResource(resourcePath, function(res) {
          if (res) {
            visit_all(res);
          }
          else {
            resolve([]);
          }
        });
      }
    });
  }

  public listResources(resourcePath: string, cond?:any) : Promise<any> {
    let self = this;
    let rres = this.getResourceResolver();
    let base = this.getCurrentResourcePath();
    let res = self.currentResource;

    return new Promise(function (resolve) {
      let return_list = function(ls) {
        let rv = [];
        for (let i = 0; i < ls.length; i++) {
          let map = self.makePropertiesForResource(ls[i]);
          map['path'] = Utils.filename_path_append(base, ls[i].getName());

          if (cond) {
            try {
              if (cond(map)) rv.push(map);
            }
            catch(ex) {
              console.log(ex);
            }
          }
          else {
            rv.push(map);
          }
        }
        resolve(rv);
      };

      if (resourcePath === '.' && res) {
        res.listChildrenResources(return_list);
      }
      else {
        resourcePath = Utils.absolute_path(resourcePath, base);
        rres.resolveResource(resourcePath, function(res) {
          base = resourcePath;
          if (res) {
            res.listChildrenResources(return_list);
          }
          else {
            resolve([]);
          }
        });
      }
    });
  }

  public readResource(resourcePath: string, writer: ContentWriter, callback: any) {
    let self = this;
    let rres = this.getResourceResolver();
    let base = this.getCurrentResourcePath();

    if (resourcePath === '.' && this.currentResource) {
      this.currentResource.read(writer, callback);
    }
    else {
      resourcePath = Utils.absolute_path(resourcePath, base);
      rres.resolveResource(resourcePath, function(res) {
        if (res) {
          res.read(writer, callback);
        }
        else {
          writer.end(callback);
        }
      });
    }
  }

  public exportAllResources(resourcePath: string, level, writer: ContentWriter, incSource ? : boolean): void {
    let self = this;
    let rres = this.getResourceResolver();
    let base = this.getCurrentResourcePath();

    if (resourcePath === '.' && this.currentResource) {
      Tools.exportChilrenResources(this.currentResource, level, writer, incSource);
    }
    else {
      resourcePath = Utils.absolute_path(resourcePath, base);
      rres.resolveResource(resourcePath, function(res) {
        if (res) {
          Tools.exportChilrenResources(res, level, writer, incSource);
        }
        else {
          writer.end(null);
        }
      });
    }
  }

  public resolveTemplateResourceContent(resourcePath: string) : Promise<string> {
    let self = this;
    let tres = this.getTemplateResourceResolver();
    return new Promise(function (resolve) {
      tres.resolveResource(resourcePath, function(res) {
        if (res && res.isContentResource()) {
          res.read(new ContentWriterAdapter('utf8', function (buff) {
            resolve(buff);
          }), null);
        }
        else {
          resolve(null);
        }
      });
    });
  }

  public getQueryProperties() {
    return this.pathInfo.query;
  }

  public getQueryProperty(name: string) {
    if (this.pathInfo.query) return this.pathInfo.query[name];
    else return null;
  }

  public getConfigProperties() {
    return this.resourceRequestHandler.getConfigProperties();
  }

  public getConfigProperty(name: string) {
    var p = this.resourceRequestHandler.getConfigProperties();
    if (p) return p[name];
    else null;
  }

  public forwardRequest(rpath: string) {
    this.resourceRequestHandler.forwardRequest(rpath);
  }

  public sendStatus(code: number) {
    this.resourceRequestHandler.sendStatus(code);
  }

  public storeResource(resourcePath: string, data: any) : Promise<void> {
    let self = this;
    return new Promise(function (resolve) {
      self.resourceRequestHandler.storeResource(resourcePath, data, function() {
        resolve();
      });
    });
  }

  public storeAndResolveResource(resourcePath: string, data: any) : Promise<Resource> {
    let rres = this.getResourceResolver();
    let self = this;

    return new Promise(function (resolve) {
      self.resourceRequestHandler.storeResource(resourcePath, data, function() {
        rres.resolveResource(resourcePath, function(res) {
          resolve(res);
        });
      });
    });
  }

  public getRequestProperties(): any {
    let p = {};
    p['PATH'] = this.pathInfo.path;
    p['NAME'] = this.pathInfo.name;
    p['DIRNAME'] = this.pathInfo.dirname;
    p['SELECTOR'] = this.pathInfo.selector;
    p['DATA_PATH'] = this.pathInfo.dataPath;
    p['DATA_NAME'] = this.pathInfo.dataName;
    p['RES_PATH'] = this.pathInfo.resourcePath;

    p['PARENT_NAME'] = Utils.filename(this.pathInfo.dirname);
    p['PARENT_DIRNAME'] = Utils.filename_dir(this.pathInfo.dirname);

    if (this.pathInfo.refererURL) {
      p['REF_URL'] = this.pathInfo.refererURL;
      p['REF_PATH'] = this.pathInfo.referer.path;
    }

    return p;
  }

  public makeCurrentResource(res: Data) {

    if (res && res instanceof Resource) {
      this.currentResource = res;
    }
    else {
      this.currentResource = null;
    }
  }

  public makePropertiesForResource(res: Data) {
    let map = {};

    if (res && res instanceof Resource) {
      map['renderType'] = res.getRenderType();
      map['renderTypes'] = res.getRenderTypes();
      if (res.getSuperType() !== res.getType()) {
        map['superType'] = res.getSuperType();
      }
      if (res.getRenderSuperType()) {
        map['renderSuperType'] = res.getRenderSuperType();
      }
      map['type'] = res.getType();
      map['name'] = res.getName();
      map['isContentResource'] = res.isContentResource();

      let ctype = res.getContentType();
      if (ctype) {
        map['isTextContentResource'] = Utils.is_texttype(ctype);
        map['contentType'] = ctype;
        map['contentSize'] = res.getContentSize();
      }
      map['_'] = res.getProperties();
      map['path'] = this.getCurrentResourcePath();
    }

    return map;
  }

  public clone(): ResourceRequestContext {
    let ctx = new ResourceRequestContext(this.pathInfo.clone(), this.resourceRequestHandler);
    return ctx;
  }
}

class PathInfo {
  public parameters: any;
  public path: string;
  public name: string;
  public dirname: string;
  public dirnames: Array < string > ;
  public selector: string;
  public dataPath: string;
  public dataName: string;
  public resourcePath: string;
  public referer: PathInfo;
  public refererURL: string;
  public query: any;

  public clone(): PathInfo {
    let pi = new PathInfo();
    pi.parameters = this.parameters;
    pi.path = this.path;
    pi.name = this.name;
    pi.dirname = this.dirname;
    pi.dirnames = this.dirnames;
    pi.selector = this.selector;
    pi.dataPath = this.dataPath;
    pi.dataName = this.dataName;
    pi.resourcePath = this.resourcePath;
    pi.referer = this.referer;
    pi.query = this.query;
    pi.refererURL = this.refererURL;

    return pi;
  }
}
