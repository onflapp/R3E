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

    return data;
  }

  protected transformData(data: Data, context: ResourceRequestContext, callback) {
    let rrend = this.resourceRenderer;
    let selectors = ['store'];
    let renderTypes = data.getRenderTypes();

    data.values = this.expandValues(data.values, data.values);

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
      let x = key.indexOf('/');
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

      rres.storeResource(key, new Data(v), function () {
        count--;

        if (count === 0) {
          callback();
        }
      });
    }
  }

  /**********************************************************
   * /cards/item1.xjson.-1.223/a/d
   * [path].x[selector].[selectorArgs][dataPath]
   */

  public parsePath(rpath: string): PathInfo {
    if (!rpath) return null;

    let info = new PathInfo();
    let path = rpath.replace(/\/+/g, '/');

    let m = path.match(/^(\/.*?)(\.x([a-z,\-_]+))(\.([a-z0-9,\-\.]+))?(\/.*?)?$/);

    if (m) {
      info.dataPath = unescape(m[6] ? m[6] : null);
      info.selectorArgs = m[5] ? m[5] : null;
      info.path = unescape(Utils.absolute_path(m[1]));
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
      info.path = unescape(Utils.absolute_path(path));
      info.selector = 'default';

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

  public handleRequest(rpath: string) {
    this.renderRequest(rpath);
  }

  public forwardRequest(rpath: string) {
    this.renderRequest(rpath);
  }

  protected renderRequest(rpath: string) {
    let rres = this.resourceResolver;
    let rrend = this.resourceRenderer;

    if (!rres) throw new Error('no resource resolver');
    if (!rrend) throw new Error('no resource renderer');
    if (!this.contentWriter) throw new Error('no content writer');

    let info = this.parsePath(rpath);
    let context = this.makeContext(info);
    let out = this.contentWriter.makeNestedContentWriter();

    try {

      if (info) {
        rres.resolveResource(info.resourcePath, function (res) {
          if (res) rrend.renderResource(res, info.selector, out, context);
          else {
            let res = new NotFoundResource(info.resourcePath);
            rrend.renderResource(res, info.selector, out, context);
          }
          out.end(null);
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

  public renderResource(resourcePath: string, selector: string, context: ResourceRequestContext, callback: any) {
    let out = new OrderedContentWriter(new BufferedContentWriter(callback));
    let rres = this.resourceResolver;
    let rrend = this.resourceRenderer;
    let ncontext = context.clone();
    let sel = selector ? selector : 'default';

    ncontext._setCurrentResourcePath(resourcePath);

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

    if (info.resourcePath) {
      self.transformData(new Data(data), context, function (ddata: Data) {
        let storeto = Utils.absolute_path(ddata.values[':storeto']);
        if (!storeto) storeto = info.resourcePath;

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
      });
    }
    else {
      render_error(new ErrorResource('invalid path ' + rpath));
    }
  }

  public storeResource(resourcePath: string, data: any, callback) {
    let self = this;
    let rres = this.resourceResolver;

    try {
      let remove = Utils.absolute_path(data[':delete']);
      let copyto = Utils.absolute_path(data[':copyto']);
      let moveto = Utils.absolute_path(data[':moveto']);
      let importto = Utils.absolute_path(data[':import']);

      if (copyto) {
        rres.copyResource(resourcePath, copyto, function () {
          self.dispatchAllEventsAsync('stored', resourcePath, data);
          callback();
        });
      }
      else if (moveto) {
        rres.moveResource(resourcePath, moveto, function () {
          self.dispatchAllEventsAsync('stored', resourcePath, data);
          callback();
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
          callback();
        });
      }
      else {
        self.expandDataAndStore(resourcePath, data, function () {
          self.dispatchAllEventsAsync('stored', resourcePath, data);
          callback();
        });
      }
    }
    catch (ex) {
      callback(new ErrorResource(ex));
    }
  }
}
