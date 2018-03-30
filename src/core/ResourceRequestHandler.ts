class ClientFormInfo {
  public formData: any;
  public formPath: string;
}

class ResourceRequestHandler extends EventDispatcher {
  private resourceResolver: ResourceResolver;
  private templateResolver: ResourceResolver;
  private contentWriter: OrderedContentWriter;
  private resourceRenderer: ResourceRenderer;
  protected refererPath: string;
  protected queryProperties: any;
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
  }

  public getResourceResolver(): ResourceResolver {
    return this.resourceResolver;
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
    if (!rpath) return null;

    let info = new PathInfo();
    let path = rpath.replace(/\/+/g,'/');

    let m = path.match(/^(\/.*?)(\.x([a-z,\-_]+))(\.([a-z0-9,\-\.]+))?(\/.*?)?$/);

    if (m) {
      info.dataPath = unescape(m[6]?m[6]:null);
      info.selectorArgs = m[5]?m[5]:null;
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

    let done = function() {
      if (processing === 0) {
        callback(arguments);
      }
    };

    let import_text = function(text) {
      let list = JSON.parse(text);
      if (list) {
        processing++;
        for (var i = 0; i < list.length; i++) {
          let item = list[i];
          let path = Utils.filename_path_append(resourcePath, item[':path']);
          processing++;
          rres.storeResource(path, item, function() {
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

      rres.storeResource(key, v, function() {
        count--;

        if (count === 0) {
          callback();
        }
      });
    }
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
    
    ncontext._setCurrentResourcePath(resourcePath);

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
      let importto = Utils.absolute_path(data[':import']);

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
        else if (importto) {
          self.expandDataAndImport(info.resourcePath, data, function() {
            self.dispatchAllEventsAsync('stored', info.resourcePath, data);

            if (forward) self.forwardRequest(forward);
            else self.renderRequest(rpath);
          });
        }
        else {
          self.expandDataAndStore(info.resourcePath, data, function() {
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
