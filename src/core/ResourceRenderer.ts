interface RendererFactory {
  makeRenderer(resource: Resource, callback: RendererFactoryCallback);
}

interface RendererFactoryCallback {
  (render: any, error?: Error);
}

interface ContentWriter {
  start(ctype: string);
  write(data: any);
  error(error: Error);
  end();
}

interface ContentReader {
  read(writer: ContentWriter): void;
}

interface ContentRendererFunction {
  (res: Resource, writer: ContentWriter, context: ResourceRequestContext);
}

class ContentWriterAdapter implements ContentWriter {
  private callback: any;
  private data = [];
  private ctype: string;
  private conversion: string;
  constructor(typ: string, callback: any) {
    this.callback = callback;
    this.conversion = typ;
  }

  public start(ctype: string) {
    this.ctype = ctype;
  }
  public write(data: any) {
    this.data.push(data);
  }
  public error(error: Error) {
    console.log(error);
  }
  public end() {
    if (this.conversion === 'utf8') {
      let v = this.data[0];
      if (typeof v === 'string') {
        this.callback(this.data.join(''), this.ctype);
      }
      else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(v)) {
        let b = Buffer.concat(this.data);
        this.callback(b.toString('utf8'), this.ctype);
      }
      else {
        this.callback(this.data, this.ctype);
      }
    }
    else {
      if (this.data.length === 1) {
        this.callback(this.data[0], this.ctype);
      }
      else {
        this.callback(this.data, this.ctype);
      }
    }
  }
}

class ResourceRenderer {
  protected rendererResolver: ResourceResolver;
  protected rendererFactories: Map<string, RendererFactory>;

  constructor(resolver: ResourceResolver) {
    this.rendererResolver = resolver;
    this.rendererFactories = new Map();

    //this.rendererFactories.set('', new InterFuncRendererFactory());
  }

  protected makeRenderTypePaths(renderTypes: Array<string>, selectors: Array<string>): Array<string> {
    var rv = [];
    var factories = this.rendererFactories;

    for (var i = 0; i < renderTypes.length; i++) {
		  factories.forEach(function(val, key, map) {
        if (key == '') return;

        let f = Utils.filename (renderTypes[i]);
        for (var z = 0; z < selectors.length; z++) {
          let sel = selectors[z];
          let p = renderTypes[i] + '/' + sel;
          rv.push(p);
          rv.push(p+'.'+key);

          p = renderTypes[i] + '/' + f + '.' + sel;
          rv.push(p);
          rv.push(p+'.'+key);
        }
      });
		}

    return rv;
  }

  protected makeRenderingFunction(path: string, resource: Resource, callback: RendererFactoryCallback) {
    let ext = Utils.filename_ext(path);
    let fact = this.rendererFactories.get(ext);

    fact.makeRenderer(resource, callback);
  }

  public registerFactory(typ: string, factory: RendererFactory) {
    this.rendererFactories.set(typ, factory);
  }

  protected renderError(message: string, resource: Resource, error: Error, writer: ContentWriter) {
    writer.start('text/plain');
    writer.write(message+'\n');
    writer.write('resource ' + resource.getName() + ':' + resource.getType() + '\n');
    if (error) writer.write(error.message);
    writer.end();
  }

  public renderResource(res: Resource, rtype: string, sel: string, writer: ContentWriter, context: ResourceRequestContext) {
    let self = this;
    let selectors = [sel];
    let renderTypes = res.getRenderTypes();
    renderTypes.push('any');

    this.resolveRenderer(renderTypes, selectors, function(rend: ContentRendererFunction, error?:Error) {
      if (rend) {
        rend(res, writer, context);
      }
      else {
        self.renderError('unable to render selector '+sel, res, error, writer);
      }
    });
  }

  public resolveRenderer(renderTypes: Array<string>, selectors: Array<string>, callback: RendererFactoryCallback) {
    let rtypes = this.makeRenderTypePaths(renderTypes, selectors);
    if (rtypes.length === 0) throw new Error ('no render factories registered?');

    let plist = rtypes.slice();
    let p = rtypes.shift();
    let self = this;

    let resolve_renderer = function(p: string) {
      console.log('try:' + p);
      self.rendererResolver.resolveResource(p, function(rend: Resource) {
        if (rend) {
          if (rend.isContentResource()) {
            self.makeRenderingFunction(p, rend, callback);
          }
          else {
            callback(null, new Error('no ContentResource at path :'+p));
          }
        }
        else if (rtypes.length > 0) {
          let p = rtypes.shift();
          resolve_renderer(p);
        }
        else {
          callback(null, new Error('paths:'+plist.join('\n')));
        }
      })
    };

    resolve_renderer(p);
  }
}
