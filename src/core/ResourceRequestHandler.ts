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
  private valueTransformers: Map<string, any>;

  protected refererPath: string;
  protected refererURL: string;
  protected currentURL: string;
  protected queryProperties: any;
  protected configProperties: any;
  protected pathParserRegexp: RegExp;

  constructor(resourceResolver: ResourceResolver, templateResolver: ResourceResolver, contentWriter: ContentWriter) {
    super();

    this.resourceResolver = resourceResolver;
    this.templateResolver = templateResolver;
    this.contentWriter = new OrderedContentWriter(contentWriter);
    this.resourceRenderer = new ResourceRenderer(this.templateResolver);

    //register default trandformers
    this.valueTransformers = new Map();
    this.valueTransformers['newUUID'] = function() {
      return Utils.makeUUID();
    };

    //set defaults for path parsing
    this.pathParserRegexp = new RegExp('^(?<path>\\/.*?)(\\.@(?<selector>[a-z\\-_]+)(?<dataPath>\\/.*?)?)?$');
    this.configProperties = {
      'X': '.@'
    };
  }

  public transformValues(data) {
    let toremove = [];
    for (let key in data) {
      let val = data[key];

      if (key.indexOf('|') !== -1) {
        let a = key.split('|');
        for (var i = 1; i < a.length; i++) {
          let t = a[i];
          let f = this.valueTransformers[t];

          if (f && !val) {
            val = f(data, a[0]);
          }
          else if (!val) {
            val = data[t];
          }
          data[a[0]] = val;
        }
        toremove.push(key);
      }
    }

    for (let i = 0; i < toremove.length;i++) {
      delete data[toremove[i]];
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

  public transformResource(data: any, selector: string, context: ResourceRequestContext, callback) {
    let rrend = this.resourceRenderer;
    let selectors = [selector];
    let renderTypes = [];

    if (data.getRenderTypes) {
      let rt = data.getRenderTypes();
      renderTypes = renderTypes.concat(rt);
    }
    else if (data['_rt']) {
      renderTypes = renderTypes.concat(data['_rt']);
    }
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

  protected assignContext(context: ResourceRequestContext, pathInfo: PathInfo) {
  }

  protected makeContext(pathInfo: PathInfo): ResourceRequestContext {
    if (pathInfo) {
      pathInfo.refererURL = this.refererURL;
      pathInfo.currentURL = this.currentURL;
      pathInfo.referer = this.parsePath(this.refererPath);
      pathInfo.query = this.queryProperties;

      let context = new ResourceRequestContext(pathInfo, this, new SessionData());
      return context;
    }
    else {
      let pi = new PathInfo();
      pi.path = '/';
      pi.resourcePath = '/';
      let context = new ResourceRequestContext(pi, this, new SessionData());
      return context;
    }
  }

  protected expandDataAndImport(resourcePath: string, data: any, callback) {
    let rres = this.resourceResolver;
    let imp = data[Resource.STORE_CONTENT_PROPERTY];

    let import_list = function (list) {
      if (!list || list.length == 0) {
        callback(arguments);
      }
      else {
        let item = list.shift();
        let path = Utils.filename_path_append(resourcePath, item[':path']);
        rres.storeResource(path, new Data(item), function () {
          import_list(list);
        });
      }
    };

    let import_text = function (text) {
      let list = JSON.parse(text);
      import_list(list);
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
        let p = key.substr(0, x);
        if (p.charAt(0) != '/') p = resourcePath + '/' + key.substr(0, x);

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

    let tostore = [];
    for (let key in datas) {
      let v = datas[key];
      let p = Utils.absolute_path(key);
      tostore.push({
        data:new Data(v),
        path:p
      });
    }

    let storedata = function() {
      let it = tostore.shift();
      if (!it) {
        callback();
        return;
      }

      rres.storeResource(it.path, it.data, function () {
        storedata();
      });
    }

    storedata();
  }

  /**********************************************************
   * default: ^\\d*(?<path>\\/.*?)(@(?<selector>[a-z]+)(?<dataPath>\\/.*?)?)?$
   * /cards/item1.@json/a/d
   * [path].@[selector][dataPath]
   */

  public setPathParserPattern(pattern: string) {
    this.pathParserRegexp = new RegExp(pattern);
  }

  public parsePath(rpath: string): PathInfo {
    if (!rpath) return null;

    let info = new PathInfo();
    let path = rpath.replace(/\/+/g, '/');

    let m = path.match(this.pathParserRegexp);

    if (m) {
      info.dataPath = Utils.unescape(m.groups.dataPath);
      info.path = Utils.unescape(Utils.absolute_path(m.groups.path));
      info.selector = m.groups.selector;

      info.dirname = Utils.filename_dir(info.path);
      info.name = Utils.filename(info.path);
      info.resourcePath = info.path;

      if (info.dataPath) info.dataPath = Utils.absolute_path(info.dataPath);

      info.dataName = Utils.filename(info.dataPath);

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

  public getRootContext(): ResourceRequestContext {
    return this.makeContext(null);
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

  public registerValueTranformer(name: string, func: any) {
    this.valueTransformers[name] = func;
  }

  public handleRequest(rpath: string) {
    this.renderRequest(rpath);
  }

  public forwardRequest(rpath: string) {
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
    let out = this.contentWriter.makeNestedContentWriter();
    let context = this.makeContext(info);

    try {
      if (info) {
        let sel = info.selector?info.selector:'default';

        self.assignContext(context, info);

        rres.resolveResource(info.resourcePath, function (res) {
          if (!res) {
            res = new NotFoundResource(info.resourcePath);
          }
          
          Utils.log_trace('transformResource', '[pre-render]');
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
    ncontext.setRenderResourceType(rstype);
    ncontext.setRenderSelector(sel);

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
      console.log(resourcePath + ',' + selector);
      console.log(ex);
      rrend.renderResource(new ErrorResource(ex), 'default', out, ncontext);
    }
  }

  /************************************************************************

  <form method="post" enctype="multipart/form-data" action="/content/path/">
    upload to folder

  <form method="post" enctype="multipart/form-data" action="/content/file.jpg">
    upload to the file

  <form method="post" enctype="multipart/form-data" action="{{req_path "{:name}" "sel"}}>
  	<input type="file" name=":name" value="">
  	<input type="hidden" name=":name@fileName" value="val1"> <<---- override the name
  	<input type="hidden" name="prop" value="val1">
  	<input type="hidden" name=":forward" value="{{currentPath.PREFIX}}{{currentPath.path}}.xhtml">
  </form>

  <form method="post" enctype="multipart/form-data" action="/content/path">
  	<input type="file" name=":import" value="">
  </form>

  <form>
  	<input type="text" name=":import" value="{json:value}">
  </form>

   ************************************************************************/

  public handleStore(rpath: string, data: any, callback?) {
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
      data = Utils.expandValues(data, data);
      let transform = data[':transform'];
      if (!transform) transform = 'pre-store';

      self.transformResource(data, transform, context, function (values: any) {
        if (values['content']) {
          self.contentWriter.start(values['contentType']);
          self.contentWriter.write(values['content']);
          self.contentWriter.end();
          self.handleEnd();
        }
        else {
          let storeto = Utils.absolute_path(values[':storeto']);
          if (!storeto) storeto = info.resourcePath;

          if (info.selector && values[':forward']) {
            let forward = values[':forward'];
            self.renderResource(info.resourcePath, null, info.selector, context, function(ctype, content) {
              if (callback) {
                callback();
              }
              else {
                self.handleEnd();
                self.forwardRequest(forward);
              }
            });
          }
          else {
            self.storeResource(storeto, values, function (error) {
              if (!error) {
                let forward = values[':forward'];

                if (callback) {
                  callback();
                }
                else if (forward) {
                  self.handleEnd(true);
                  self.forwardRequest(forward);
                }
                else {
                  self.handleEnd(true);
                  self.renderRequest(rpath);
                }
              }
              else {
                render_error(error);
              }
            });
          }
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
        self.dispatchAllEvents('stored', path, data);
        callback();
      });
    };

    try {
      let remove   = Utils.absolute_path(data[':delete'], resourcePath);
      let copyto   = Utils.absolute_path(data[':copyto'], resourcePath);
      let cloneto  = Utils.absolute_path(data[':cloneto'], resourcePath);
      let copyfrom = Utils.absolute_path(data[':copyfrom'], resourcePath);
      let moveto   = Utils.absolute_path(data[':moveto'], resourcePath);
      let importto = Utils.absolute_path(data[':import'], resourcePath);
      let reset    = Utils.absolute_path(data[':reset'], resourcePath);

      if (copyto) {
        rres.copyResource(resourcePath, copyto, function () {
          self.dispatchAllEvents('post-copyto', copyto, data);
          storedata(copyto);
        });
      }
      else if (cloneto) {
        rres.cloneResource(resourcePath, cloneto, function () {
          self.dispatchAllEvents('post-cloneto', cloneto, data);
          storedata(cloneto);
        });
      }
      else if (copyfrom) {
        rres.copyResource(copyfrom, resourcePath, function () {
          self.dispatchAllEvents('post-copyfrom', resourcePath, data);
          storedata(resourcePath);
        });
      }
      else if (moveto) {
        rres.moveResource(resourcePath, moveto, function () {
          self.dispatchAllEvents('post-moveto', moveto, data);
          storedata(moveto);
        });
      }
      else if (remove) {
        rres.removeResource(resourcePath, function () {
          self.dispatchAllEvents('post-remove', remove, data);
          callback();
        });
      }
      else if (importto) {
        let fn = data[':import'];

        if (fn) {
          let imp = data[fn+'/_content'];
          if (imp) {
            data['_content'] = imp;
            delete data[fn+'/_content'];
            delete data[fn+'/_ct'];
          }
        }

        self.expandDataAndImport(resourcePath, data, function () {
          delete data[':import'];
          delete data['_ct'];
          delete data['_content'];

          self.dispatchAllEvents('pre-importto', resourcePath, data);
          storedata(resourcePath);
        });
      }
      else if (reset) {
        rres.removeResource(reset, function () {
          self.dispatchAllEvents('pre-store', resourcePath, data);
          storedata(resourcePath);
        });
      }
      else {
        self.dispatchAllEvents('pre-store', resourcePath, data);
        storedata(resourcePath);
      }
    }
    catch (ex) {
      callback(new ErrorResource(ex));
    }
  }

  public handleEnd(stored?: boolean) {
    this.dispatchAllEvents('ended');
  }
}
