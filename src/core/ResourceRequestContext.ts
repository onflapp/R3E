class ResourceRequestContext {
  private pathInfo: PathInfo;
  private resourceRequestHandler: ResourceRequestHandler;
  private renderResourceType: string;

  constructor(pathInfo: PathInfo, handler: ResourceRequestHandler) {
    this.pathInfo = pathInfo;
    this.resourceRequestHandler = handler;
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

    if (this.pathInfo.referer) {
      p['REF_PATH'] = this.pathInfo.referer.path;
      if (this.pathInfo.referer.suffix) p['REF_SUFFIX'] = this.pathInfo.referer.suffix;
    }

    return p;
  }

  public _setCurrentResourcePath(rpath: string) {
    this.pathInfo.resourcePath = rpath;
  }

  public _setCurrentSelector(sel: string) {
    this.pathInfo.selector = sel;
  }

  public _getCurrentRenderResourceType(rpath: string) {
    this.renderResourceType = rpath;
  }

  public getCurrentSelector(): string {
    return this.pathInfo.selector;
  }

  public getCurrentResourcePath(): string {
    return this.pathInfo.resourcePath;
  }

  public getCurrentDataPath(): string {
    return this.pathInfo.dataPath;
  }

  public getCurrentRenderResourceType(): string {
    return this.renderResourceType;
  }

  public renderResource(resourcePath: string, rstype: string, selector: string, context: ResourceRequestContext, callback: any) {
    this.resourceRequestHandler.renderResource(resourcePath, rstype, selector, context, callback);
  }

  public resolveResource(resourcePath: string, callback: ResourceCallback) {
    let rres = this.getResourceResolver();
    rres.resolveResource(resourcePath, callback);
  }

  public resolveTemplateResource(resourcePath: string, callback: ResourceCallback) {
    let trres = this.getTemplateResourceResolver();
    trres.resolveResource(resourcePath, callback);
  }

  public getQueryProperties() {
    return this.pathInfo.query;
  }

  public getConfigProperties() {
    return this.resourceRequestHandler.getConfigProperties();
  }

  public getResourceResolver(): ResourceResolver {
    return this.resourceRequestHandler.getResourceResolver();
  }

  public getTemplateResourceResolver(): ResourceResolver {
    return this.resourceRequestHandler.getTemplateResourceResolver();
  }

  public forwardRequest(rpath: string) {
    this.resourceRequestHandler.forwardRequest(rpath);
  }

  public sendStatus(code: number) {
    this.resourceRequestHandler.sendStatus(code);
  }

  public storeResource(resourcePath: string, data: any, callback) {
    this.resourceRequestHandler.storeResource(resourcePath, data, callback);
  }

  public storeAndResolveResource(resourcePath: string, data: any, callback) {
    let rres = this.getResourceResolver();
    this.resourceRequestHandler.storeResource(resourcePath, data, function() {
      rres.resolveResource(resourcePath, callback);
    });
  }

  public makeContextMap(res: Data) {
    let map = {};

    if (res instanceof Resource) {

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

    return pi;
  }
}
