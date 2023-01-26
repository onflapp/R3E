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

  public __overrideCurrentSelector(selector :string) {
    this.pathInfo.selector = selector;
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
    return new Promise(function (resolve) {
      rres.resolveResource(resourcePath, function(res) {
        let map = self.makePropertiesForResource(res);
        resolve(map);
      });
    });
  }

  public listResourceNames(resourcePath: string) : Promise<any> {
    let self = this;
    return new Promise(function (resolve) {
      if (resourcePath === '.' && self.currentResource) {
        self.currentResource.listChildrenNames(function(ls) {
          resolve(ls);
        });
      }
      else {
        resolve([]);
      }
    });
  }

  public listResources(resourcePath: string) : Promise<any> {
    let self = this;
    let base = this.getCurrentResourcePath();
    let res = self.currentResource;

    return new Promise(function (resolve) {
      if (resourcePath === '.' && res) {
        res.listChildrenResources(function(ls) {
          let rv = [];
          for (let i = 0; i < ls.length; i++) {
            let map = self.makePropertiesForResource(ls[i]);
            map['path'] = Utils.filename_path_append(base, ls[i].getName());
            rv.push(map);
          }
          resolve(rv);
        });
      }
      else {
        resolve([]);
      }
    });
  }

  public readResource(resourcePath: string, writer: ContentWriter, callback: any) {
    if (resourcePath === '.' && this.currentResource) {
      this.currentResource.read(writer, callback);
    }
  }

  public resolveTemplateResource(resourcePath: string) : Promise<Resource> {
    let trres = this.getTemplateResourceResolver();
    return new Promise(function (resolve) {
      trres.resolveResource(resourcePath, function(res) {
        resolve(res);
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
      this.resourceRequestHandler.storeResource(resourcePath, data, function() {
        rres.resolveResource(resourcePath, function(res) {
          resolve(res);
        });
      });
    });
  }

  public getRequestProperties(): any {
    let p = {};
    p['PREFIX'] = this.pathInfo.prefix;
    p['SUFFIX'] = this.pathInfo.suffix;
    p['PATH'] = this.pathInfo.path;
    p['NAME'] = this.pathInfo.name;
    p['DIRNAME'] = this.pathInfo.dirname;
    p['DATA_PATH'] = this.pathInfo.dataPath;
    p['DATA_NAME'] = this.pathInfo.dataName;

    let pplus = this.pathInfo.path;
    if (pplus !== '/') pplus = pplus + '/';
    p['PATH_APPEND'] = pplus;

    let dpplus = this.pathInfo.dirname;
    if (dpplus !== '/') dpplus = dpplus + '/';
    p['DIRNAME_APPEND'] = dpplus;

    let dplus = this.pathInfo.dataPath ? this.pathInfo.dataPath : '';
    if (dplus !== '/') dplus = dplus + '/';
    p['DATA_PATH_APPEND'] = dplus;

    if (this.pathInfo.refererURL) {
      p['REF_URL'] = this.pathInfo.refererURL;
      p['REF_PATH'] = this.pathInfo.referer.path;
      if (this.pathInfo.referer.suffix) p['REF_SUFFIX'] = this.pathInfo.referer.suffix;
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
      map['path'] = this.pathInfo.resourcePath;
      map['_'] = res.getProperties();
    }

    return map;
  }

  public makeContextMap(res: Data) {
    let map = this.makePropertiesForResource(res);

    map['R'] = this.getRequestProperties();
    map['Q'] = this.getQueryProperties();
    map['C'] = this.getConfigProperties();

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
  public selectorArgs: string;
  public prefix: string;
  public suffix: string;
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
    pi.selectorArgs = this.selectorArgs;
    pi.prefix = this.prefix;
    pi.suffix = this.suffix;
    pi.dataPath = this.dataPath;
    pi.dataName = this.dataName;
    pi.resourcePath = this.resourcePath;
    pi.referer = this.referer;
    pi.query = this.query;
    pi.refererURL = this.refererURL;

    return pi;
  }
}
