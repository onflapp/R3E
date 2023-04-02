interface RendererFactory {
  makeRenderer(resource: Resource, callback: RendererFactoryCallback);
}

interface RendererFactoryCallback {
  (render: any, error ? : Error);
}

interface ContentReader {
  read(writer: ContentWriter, callback: any): void;
}

interface ContentRendererFunction {
  (data: any, writer: ContentWriter, context: ResourceRequestContext);
}

interface MakeRenderTypePatternsFunction {
  (factoryType: string, renderType: string, name: string, sel: string): Array <string>;
}

class ResourceRenderer {
  protected rendererResolver: ResourceResolver;
  protected rendererFactories: Map<string,RendererFactory>;
  protected makeRenderTypePatterns: MakeRenderTypePatternsFunction;

  constructor(resolver: ResourceResolver) {
    this.rendererResolver = resolver;
    this.rendererFactories = new Map();

    this.makeRenderTypePatterns = function(factoryType: string, renderType: string, name: string, sel: string): Array <string> {
      let rv = [];

      // web/page/edit.hbs
      // web/page/default.hbs
      rv.push(renderType + '/' + sel + '.' + factoryType);

      return rv;
    };
  }

  protected makeRenderTypePaths(renderTypes: Array<string> , selectors: Array<string> ): Array<string> {
    let rv = [];
    let factories = this.rendererFactories;
    let self = this;

    for (let i = 0; i < renderTypes.length; i++) {
      factories.forEach(function (val, key, map) {
        if (key == '') return;

        let name = Utils.filename(renderTypes[i]);
        for (let z = 0; z < selectors.length; z++) {
          let rt = renderTypes[i];
          let sel = selectors[z];

          rv = rv.concat(self.makeRenderTypePatterns(key, rt, name, sel));
        }
      });
    }

    return rv;
  }

  public makeRenderingFunction(resource: Resource, callback: RendererFactoryCallback) {
    let ext = Utils.filename_ext(resource.getName());
    let fact = this.rendererFactories.get(ext);
    let self = this;

    fact.makeRenderer(resource, function(render, error) {
      if (ext == 'js' || ext == 'func') {
        callback(render, error);
      }
      else if (render) {
        Utils.log_trace('makeRenderingFunction', `factory/[${ext}] pre-render`);
        self.resolveRenderer(['factory/'+ext], ['pre-render'], function(rend: ContentRendererFunction, error ? : Error) {
          if (rend) {
            try {
              rend(fact, new ContentWriterAdapter('object', function() { 
                callback(render, error); 
              }), null);
            }
            catch(ex) {
              console.log(ex);
              callback(null, error);
            }
          }
          else {
            callback(null, error);
          }
        });
      }
      else {
        callback(render, error);
      }
    });
  }

  public registerMakeRenderTypePatterns(func: MakeRenderTypePatternsFunction) {
    if (func) {
      this.makeRenderTypePatterns = func;
    }
  }

  public registerFactory(typ: string, factory: RendererFactory) {
    this.rendererFactories.set(typ, factory);
  }

  protected renderError(message: string, resource: Resource, error: Error, writer: ContentWriter) {
    writer.start('text/plain');
    writer.write(message + '\n');
    writer.write('resource:[' + resource.getName() + '] with type:[' + resource.getType() + ']\n');
    if (error) writer.write(error.message + '\n' + error.stack);
    writer.end(null);
  }

  public renderResource(res: Resource, sel: string, writer: ContentWriter, context: ResourceRequestContext) {
    let self = this;
    let selectors = [sel];
    let renderTypes = res.getRenderTypes();

    if (context.getRenderResourceType()) { //override the render type from the context, if any
      renderTypes = [context.getRenderResourceType()];
    }
    else {
      renderTypes.push('any');
    }

    Utils.log_trace('resolveRenderer', `renderTypes:[${renderTypes}] selectors:[${selectors}]`);
    this.resolveRenderer(renderTypes, selectors, function (rend: ContentRendererFunction, error ? : Error) {
      if (rend) {
        context.makeCurrentResource(res);
        context.startRenderSession();
        try {
          let map = context.makePropertiesForResource(res);

          let rv = rend(map, writer, context);
          if (rv && rv.constructor.name === 'Promise') {
            rv.then(function () {
              writer.end(null);
            })
            .catch(function(err) {
              console.log(rend);
              console.log(err);
              self.renderError('unable to render selector:[' + sel + "]", res, err, writer);
            });
          }
        }
        catch(ex) {
          console.log(ex);
          self.renderError('unable to render selector:[' + sel + "]", res, ex, writer);
        }
      }
      else {
        self.renderError('unable to render selector:[' + sel + "]", res, error, writer);
      }
    });
  }

  public resolveRenderer(renderTypes: Array<string> , selectors: Array<string> , callback: RendererFactoryCallback) {
    let rtypes = this.makeRenderTypePaths(renderTypes, selectors);
    if (rtypes.length === 0) throw new Error('no render factories registered?');

    let plist = rtypes.slice();
    let p = rtypes.shift();
    let self = this;

    let resolve_renderer = function (p: string) {
      //console.log('try:' + p);
      self.rendererResolver.resolveResource(p, function (rend: Resource) {
        if (rend) {
          if (rend.isContentResource()) {
            self.makeRenderingFunction(rend, callback);
          }
          else {
            callback(null, new Error('no ContentResource at path :' + p));
          }
        }
        else if (rtypes.length > 0) {
          let p = rtypes.shift();
          resolve_renderer(p);
        }
        else {
          callback(null, null);
        }
      })
    };

    resolve_renderer(p);
  }
}
