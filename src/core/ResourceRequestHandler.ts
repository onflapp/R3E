class ClientFormInfo {
  public formData: any;
  public formPath: string;
}

class ResourceRequestHandler extends EventDispatcher {
  private resourceResolver: ResourceResolver;
  private templateResolver: ResourceResolver;
  private configResolver: ResourceResolver;
  private contentWriter: OrderedContentWriter;
  private resourceRenderer: ResourceRenderer;
  protected refererPath: string;
  protected queryProperties: any;
  protected configProperties: any;
  protected pathParserRegexp: RegExp;
  protected pathContext: string;

  constructor(resourceResolver: ResourceResolver, templateResolver: ResourceResolver, contentWriter: ContentWriter) {
    super();

    this.resourceResolver = resourceResolver;
    this.templateResolver = templateResolver;
    this.contentWriter = new OrderedContentWriter(contentWriter);
    this.resourceRenderer = new ResourceRenderer(this.templateResolver);

    //set defaults for path parsing
    this.pathParserRegexp = new RegExp(/^(\/.*?)(\.x-([a-z,\-_]+))(\.([a-z0-9,\-\.]+))?(\/.*?)?$/);
    this.configProperties = {
      'X': '.x-'
    };
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
        let nkey = rv1[key.substr(1, key.length - 2)];
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

      if (key.indexOf(':') !== -1 && key.indexOf('|') !== -1) {
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
    for (let key in data) {
      let val = data[key];
      if (key.indexOf('@') !== -1) {
        let i = key.indexOf('@');
        let k = key.substr(0, i);
        let n = key.substr(i+1);

        if (data[n]) {
          data[k] = data[n];
        }
        else {
          data[k] = data[key];
        }

        delete data[key];
      }
    }

    return data;
  }

  public transformObject(object: any, rstype: string, selector: string, context: ResourceRequestContext, callback) {
    let data = new Data(object).wrap({
      getRenderTypes:function() {
        return [rstype];
      }
    });
    this.transformResource(data, selector, context, callback);
  }

  public transformResource(data: Data, selector: string, context: ResourceRequestContext, callback) {
    let rrend = this.resourceRenderer;
    let selectors = [selector];
    let renderTypes = data.getRenderTypes();
    renderTypes.push('any');

    rrend.resolveRenderer(renderTypes, selectors, function (rend: ContentRendererFunction, error ? : Error) {
      if (rend) {
        rend(data, new ContentWriterAdapter('object', callback), context);
      }
      else {
        callback(data);
      }
    });
  }

  protected makeContext(pathInfo: PathInfo): ResourceRequestContext {
    if (!pathInfo) return null;

    pathInfo.refererURL = this.refererPath;
    pathInfo.referer = this.parsePath(this.refererPath);
    pathInfo.query = this.queryProperties;

    let context = new ResourceRequestContext(pathInfo, this);
    return context;
  }

  protected expandDataAndImport(resourcePath: string, data: any, callback) {
    let rres = this.resourceResolver;
    let imp = data[Resource.STORE_CONTENT_PROPERTY];
    let processing = 0;

    let done = function () {
      if (processing === 0) {
        callback(arguments);
      }
    };

    let import_text = function (text) {
      let list = JSON.parse(text);
      if (list) {
        processing++;
        for (var i = 0; i < list.length; i++) {
          let item = list[i];
          let path = Utils.filename_path_append(resourcePath, item[':path']);
          processing++;
          rres.storeResource(path, new Data(item), function () {
            processing--;
            done();
          });
        }
        processing--;
      }

      done();
    };

    if (typeof imp === 'function') {
      imp(new ContentWriterAdapter('utf8', import_text));
    }
    else if (typeof imp === 'string') {
      import_text(imp);
    }
    else {
      callback();
    }
  }

  protected expandDataAndStore(resourcePath: string, data: any, callback) {
    let rres = this.resourceResolver;
    let datas = {};
    let count = 1;
    datas[resourcePath] = {};

    for (let key in data) {
      if (key.indexOf(':') !== -1) continue;

      let v = data[key];
      let x = key.lastIndexOf('/');
      if (x != -1) {
        let p = resourcePath + '/' + key.substr(0, x);
        let n = key.substr(x + 1);
        let d = datas[p];
        if (!d) {
          d = {};
          datas[p] = d;
          count++;
        }
        datas[p][n] = v;
      }
      else {
        datas[resourcePath][key] = v;
      }
    }

    for (let key in datas) {
      let v = datas[key];
      let p = Utils.absolute_path(key);

      rres.storeResource(p, new Data(v), function () {
        count--;

        if (count === 0) {
          callback();
        }
      });
    }
  }

  /**********************************************************
   * default: (/^(\/.*?)(\.x-([a-z,\-_]+))(\.([a-z0-9,\-\.]+))?(\/.*?)?$/)
   * /cards/item1.x-json.-1.223/a/d
   * [path].x-[selector].[selectorArgs][dataPath]
   */

  public setPathParserPattern(pattern: string) {
    this.pathParserRegexp = new RegExp(pattern);
  }

  public setPathContext(pref) {
    this.pathContext = pref;
  }

  public parsePath(rpath: string): PathInfo {
    if (!rpath) return null;

    let info = new PathInfo();
    let path = rpath.replace(/\/+/g, '/');

    if (this.pathContext) path = path.substr(this.pathContext.length);

    let m = path.match(this.pathParserRegexp);

    if (m) {
      info.dataPath = Utils.unescape(m[6] ? m[6] : null);
      info.selectorArgs = m[5] ? m[5] : null;
      info.path = Utils.unescape(Utils.absolute_path(m[1]));
      info.selector = m[3];
      info.suffix = m[2];


      info.dirname = Utils.filename_dir(info.path);
      info.name = Utils.filename(info.path);
      info.resourcePath = info.path;

      if (info.dataPath) info.dataPath = Utils.absolute_path(info.dataPath);

      info.dataName = Utils.filename(info.dataPath);

      return info;
    }
    else if (path.charAt(0) === '/') {
      info.path = Utils.unescape(Utils.absolute_path(path));
      info.selector = null;

      info.dirname = Utils.filename_dir(info.path);
      info.name = Utils.filename(info.path);
      info.resourcePath = info.path;

      return info;
    }
    else {
      return null;
    }
  }

  public getResourceResolver(): ResourceResolver {
    return this.resourceResolver;
  }

  public getTemplateResourceResolver(): ResourceResolver {
    return this.templateResolver;
  }

  public getConfigProperties() {
    return this.configProperties;
  }

  public setConfigProperties(cfg) {
    this.configProperties = cfg;
  }

  public registerFactory(typ: string, factory: RendererFactory) {
    this.resourceRenderer.registerFactory(typ, factory);
  }

  public registerMakeRenderTypePatterns(func: MakeRenderTypePatternsFunction) {
    this.resourceRenderer.registerMakeRenderTypePatterns(func);
  }

  public handleRequest(rpath: string) {
    this.renderRequest(rpath);
  }

  public forwardRequest(rpath: string) {
    this.renderRequest(rpath);
  }

  public sendStatus(code: number) {
  }

  protected renderRequest(rpath: string) {
    let rres = this.resourceResolver;
    let rrend = this.resourceRenderer;
    let self = this;

    if (!rres) throw new Error('no resource resolver');
    if (!rrend) throw new Error('no resource renderer');
    if (!this.contentWriter) throw new Error('no content writer');

    let info = this.parsePath(rpath);
    let context = this.makeContext(info);
    let out = this.contentWriter.makeNestedContentWriter();
    let sel = info.selector?info.selector:'default';

    try {

      if (info) {
        rres.resolveResource(info.resourcePath, function (res) {
          if (!res) {
            res = new NotFoundResource(info.resourcePath);
          }
          
          self.transformResource(res, 'pre-render', context, function() {
            rrend.renderResource(res, sel, out, context);
            out.end(null);
          });
        });
      }
      else {
        rrend.renderResource(new ErrorResource('invalid path ' + rpath), 'default', out, context);
        out.end(null);
      }

    }
    catch (ex) {
      console.log(ex);
      rrend.renderResource(new ErrorResource(ex), 'default', out, context);
      out.end(null);
    }
  }

  public renderResource(resourcePath: string, rstype: string, selector: string, context: ResourceRequestContext, callback: any) {
    let out = new OrderedContentWriter(new BufferedContentWriter(callback));
    let rres = this.resourceResolver;
    let rrend = this.resourceRenderer;
    let ncontext = context.clone();
    let sel = selector ? selector : 'default';

    ncontext.__overrideCurrentResourcePath(resourcePath);
    ncontext.__overrideCurrentRenderResourceType(rstype);
    ncontext.__overrideCurrentSelector(selector);

    try {

      if (resourcePath) {
        rres.resolveResource(resourcePath, function (res: Resource) {
          if (res) rrend.renderResource(res, sel, out, ncontext);
          else {
            let res = new NotFoundResource(resourcePath);
            rrend.renderResource(res, sel, out, ncontext);
          }
        });
      }
      else {
        rrend.renderResource(new ErrorResource('invalid path ' + resourcePath), 'default', out, ncontext);
      }

    }
    catch (ex) {
      console.log(ex);
      rrend.renderResource(new ErrorResource(ex), 'default', out, ncontext);
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
    let rres = this.resourceResolver;
    let rrend = this.resourceRenderer;
    let info = this.parsePath(rpath);
    let context = this.makeContext(info);

    let render_error = function (err) {
      console.log(err);

      let out = self.contentWriter.makeNestedContentWriter();
      rrend.renderResource(err, 'default', out, context);
      out.end(null);
    };

    if (context && info && info.resourcePath) {
      let tdata = new Data(data);
      tdata.values = this.expandValues(tdata.values, tdata.values);

      self.transformResource(tdata, 'pre-store', context, function (ddata: Data) {
        let storeto = Utils.absolute_path(ddata.values[':storeto']);
        if (!storeto) storeto = info.resourcePath;

        if (info.selector && ddata.values[':forward']) {
          let forward = Utils.absolute_path(ddata.values[':forward']);
          self.renderResource(info.resourcePath, null, info.selector, context, function(ctype, content) {
            self.forwardRequest(forward);
          });
        }
        else {
          self.storeResource(storeto, ddata.values, function (error) {
            if (!error) {
              let forward = Utils.absolute_path(ddata.values[':forward']);

              if (forward) self.forwardRequest(forward);
              else self.renderRequest(rpath);
            }
            else {
              render_error(error);
            }
          });
        }
      });
    }
    else {
      render_error(new ErrorResource('invalid path [' + rpath + ']'));
    }
  }

  public storeResource(resourcePath: string, data: any, callback) {
    let self = this;
    let rres = this.resourceResolver;

    let storedata = function(path) {
      self.expandDataAndStore(path, data, function () {
        self.dispatchAllEventsAsync('stored', path, data);
        callback();
      });
    };

    try {
      let remove   = Utils.absolute_path(data[':delete']);
      let copyto   = Utils.absolute_path(data[':copyto']);
      let copyfrom = Utils.absolute_path(data[':copyfrom']);
      let moveto   = Utils.absolute_path(data[':moveto']);
      let importto = Utils.absolute_path(data[':import']);

      if (copyto) {
        rres.copyResource(resourcePath, copyto, function () {
          self.dispatchAllEventsAsync('stored', copyto, data);
          storedata(copyto);
        });
      }
      else if (copyfrom) {
        rres.copyResource(copyfrom, resourcePath, function () {
          self.dispatchAllEventsAsync('stored', resourcePath, data);
          storedata(resourcePath);
        });
      }
      else if (moveto) {
        rres.moveResource(resourcePath, moveto, function () {
          self.dispatchAllEventsAsync('stored', moveto, data);
          storedata(moveto);
        });
      }
      else if (remove) {
        rres.removeResource(resourcePath, function () {
          self.dispatchAllEventsAsync('stored', remove, data);
          callback();
        });
      }
      else if (importto) {
        self.expandDataAndImport(resourcePath, data, function () {
          self.dispatchAllEventsAsync('stored', resourcePath, data);
          storedata(resourcePath);
        });
      }
      else {
        storedata(resourcePath);
      }
    }
    catch (ex) {
      callback(new ErrorResource(ex));
    }
  }
}
