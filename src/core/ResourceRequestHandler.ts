class ClientFormInfo {
  public formData: any;
  public formPath: string;
}

class ResourceRequestContext {
  public pathInfo: PathInfo;
  public resourceRequestHandler: ResourceRequestHandler;

  public getPathProperties():any {
    let p = {};
    p['PREFIX'] = this.pathInfo.prefix;
    p['SUFFIX'] = this.pathInfo.suffix;
    p['PATH'] = this.pathInfo.path;
    p['NAME'] = this.pathInfo.name;
    p['DATA_PATH'] = this.pathInfo.dataPath;
    p['DATA_NAME'] = this.pathInfo.dataName;

    let pplus = this.pathInfo.path;
    if (pplus !== '/') pplus = pplus+'/';
    p['PATH_APPEND'] = pplus;

    let dplus = this.pathInfo.dataPath?this.pathInfo.dataPath:'';
    if (dplus !== '/') dplus = dplus+'/';
    p['DATA_PATH_APPEND'] = dplus;

    return p;
  }

  public getEnvironmentProperties() {
    return this.resourceRequestHandler._environmentProperties;
  }

  public makeContextMap(res: Resource) {
    let map = {};
    let ctx = this.getPathProperties();

    if (res) {
      map['renderType'] = res.getRenderType();
      map['type'] = res.getType();
      map['name'] = res.getName();
      map['superType'] = res.getSuperType();
      map['isContentResource'] = res.isContentResource();
      map['_'] = res.getProperties();
    }

    map['R'] = ctx;
    map['E'] = this.getEnvironmentProperties();
    
    return map;
  }

  public clone(): ResourceRequestContext {
    let ctx = new ResourceRequestContext();
    ctx.pathInfo = this.pathInfo.clone();
    ctx.resourceRequestHandler = this.resourceRequestHandler;
    return ctx;
  }
}

class PathInfo {
  public parameters: any;
  public path: string;
  public name: string;
  public dirname: string;
  public dirnames: Array<string>;
  public selector: string;
  public selectorArgs: string;
  public prefix: string;
  public suffix: string;
  public dataPath: string;
  public dataName: string;
  public resourcePath: string;

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

    return pi;
  }
}

class ResourceRequestHandler extends EventDispatcher {
  private resourceResolver: ResourceResolver;
  private templateResolver: ResourceResolver;
  private contentWriter: OrderedContentWriter;
  private resourceRenderer: ResourceRenderer;
  public _environmentProperties: Map<string, any> = new Map();

  constructor(resourceResolver: ResourceResolver, templateResolver: ResourceResolver, contentWriter: ContentWriter) {
    super();

    this.resourceResolver = resourceResolver;
    this.templateResolver = templateResolver;
    this.contentWriter = new OrderedContentWriter(contentWriter);
    this.resourceRenderer = new ResourceRenderer(this.templateResolver);
  }

  protected expandValue(val, data) {
    if (typeof val !== 'string') return val;

    var rv = val;
    for (var key in data) {
      var v = data[key];
      if (typeof v !== 'string') continue;

      var p = '{' + key + '}';

      rv = rv.split(p).join(v);
    }

    return rv;
  }

  protected expandValues(values, data) {
    let rv1 = {};

    for (let key in values) {
      let v = values[key];
      rv1[key] = this.expandValue(v, data);
    }

    let rv2 = {};
    for (let key in rv1) {
      let val = rv1[key];
      
      if (key.indexOf('{:') === 0) {
        let nkey = rv1[key.substr(1, key.length-2)];
        if (nkey) rv2[nkey] = val;
      }
      else {
        rv2[key] = val;
      }
    }

    return rv2;
  }

  protected transformValues(data) {
    for (let key in data) {
      let val = data[key];
      
      if (key.charAt(0) === ':' && key.indexOf('|') !== -1) {
        let a = key.split('|');
        for (var i = 1; i < a.length; i++) {
          let t = a[i];
          if (t === 'newUUID' && !val) {
            val = Utils.makeUUID();
          }
          else if (!val) {
            val = data[t];
          }
          data[a[0]] = val;
        }
      }
    }
  }

  public setEnvironment(name: string, val: string) {
    this._environmentProperties[name] = val;
  }

/************************************************************************
 ** /cards/item1.xjson.-1.223/a/d
 ** [path].x[selector].[selectorArgs][dataPath]
 **
 ************************************************************************/

  public parsePath(rpath: string): PathInfo {
    let info = new PathInfo();
    let path = rpath.replace(/\/+/g,'/');

    let m = path.match(/^(\/.*?)(\.x([a-z,\-_]+))(\.([a-z0-9,\-\.]+))?(\/.*?)?$/);

    if (!m) return null;

    info.dataPath = m[6]?m[6]:null;
    info.selectorArgs = m[5]?m[5]:null;
    info.path = Utils.absolute_path(m[1]);
    info.selector = m[3];
    info.suffix = m[2];


    info.dirname = Utils.filename_dir(info.path);
    info.name = Utils.filename(info.path);
    info.resourcePath = info.path;

    if (info.dataPath) info.dataPath = Utils.absolute_path(info.dataPath);

    info.dataName = Utils.filename(info.dataPath);

    return info;
  }

  protected makeContext(pathInfo: PathInfo): ResourceRequestContext {
    let context = new ResourceRequestContext();
    context.pathInfo = pathInfo;
    context.resourceRequestHandler = this;

    return context;
  }

  public registerFactory(typ: string, factory: RendererFactory) {
    this.resourceRenderer.registerFactory(typ, factory);
  }

  public handleRequest(rpath: string) {
    this.renderRequest(rpath);
  }

  public forwardRequest(rpath: string) {
    this.renderRequest(rpath);
  }

  public renderRequest(rpath: string) {
    let out = this.contentWriter.makeNestedContentWriter();
    let info = this.parsePath(rpath);
    let rres = this.resourceResolver;
    let rrend = this.resourceRenderer;
    let context = this.makeContext(info);

    try {

      if (info) {
        rres.resolveResource(info.resourcePath, function(res) {
          if (res) rrend.renderResource(res, res.getType(), info.selector, out, context);
          else {
            let res = new NotFoundResource(info.resourcePath);
            rrend.renderResource(res, res.getType(), info.selector, out, context);
          }
        });
      }
      else {
        rrend.renderResource(new ErrorResource('invalid path '+rpath), null, 'default', out, context);
      }

    }
    catch(ex) {
      console.log(ex);
      rrend.renderResource(new ErrorResource(ex), null, 'default', out, context);
    }
  }

  public renderResource(resourcePath: string, rtype: string, selector: string, context: ResourceRequestContext, callback: any) {
    let out = new OrderedContentWriter(new BufferedContentWriter(callback));
    let rres = this.resourceResolver;
    let rrend = this.resourceRenderer;
    let ncontext = context.clone();
    
    ncontext.pathInfo.resourcePath = resourcePath;

    try {

      if (resourcePath) {
        rres.resolveResource(resourcePath, function(res: Resource) {
          if (res) rrend.renderResource(res, rtype, selector, out, ncontext);
          else {
            let res = new NotFoundResource(resourcePath);
            rrend.renderResource(res, res.getType(), selector, out, ncontext);
          }
        });
      }
      else {
        rrend.renderResource(new ErrorResource('invalid path '+resourcePath), null, 'default', out, ncontext);
      } 

    }
    catch(ex) {
      console.log(ex);
      rrend.renderResource(new ErrorResource(ex), null, 'default', out, ncontext);
    }
  }

/************************************************************************

<form method="post" enctype="multipart/form-data" action="{{currentPath.PREFIX}}{{currentPath.path}}/{:name}">
	<input type="file" name=":name" value="">
	<input type="hidden" name=":name@fileName" value="val1"> <<---- override the name
	<input type="hidden" name="prop" value="val1">
	<input type="hidden" name=":forward" value="{{currentPath.PREFIX}}{{currentPath.path}}.xhtml">
</form>

<form>
	<input type="file" name=":import" value="">
</form>

<form>
	<input type="text" name=":import" value="{json:value}">
</form>

 ************************************************************************/

  public handleStore(rpath: string, data: any) {
    let self = this;
    let info = this.parsePath(rpath);
    let context = this.makeContext(info);
    let rrend = this.resourceRenderer;
    let rres = this.resourceResolver;

    try { 
      data = this.expandValues(data, data);

      let forward = Utils.absolute_path(data[':forward']);
      let remove = Utils.absolute_path(data[':delete']);
      let copyto = Utils.absolute_path(data[':copyto']);

      if (info) {
        if (copyto) {
          rres.copyResource(info.resourcePath, copyto, function() {
            self.dispatchAllEventsAsync('stored', info.resourcePath, data);

            if (forward) self.forwardRequest(forward);
            else self.renderRequest(rpath);
          });
        }
        else if (remove) {
          let dirname = Utils.filename_dir(remove);
          let name = Utils.filename(remove);

          rres.resolveResource(dirname, function(res: Resource) {
            res.removeChildResource(name, function() {
              self.dispatchAllEventsAsync('stored', remove, data);

              if (forward) self.forwardRequest(forward);
              else self.renderRequest(rpath);
            });
          });
        }
        else {
          rres.storeResource(info.resourcePath, data, function() {
            self.dispatchAllEventsAsync('stored', info.resourcePath, data);

            if (forward) self.forwardRequest(forward);
            else self.renderRequest(rpath);
          });
        }
      }
      else {
        let out = this.contentWriter.makeNestedContentWriter();
        rrend.renderResource(new ErrorResource('invalid path '+rpath), null, 'default', out, context);
      }

    }
    catch(ex) {
      console.log(ex);
      let out = this.contentWriter.makeNestedContentWriter();
      rrend.renderResource(new ErrorResource(ex), null, 'default', out, context);
    }
  }
}
