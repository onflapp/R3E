class JSRendererFactory implements RendererFactory {
  public makeRenderer(resource: Resource, callback: RendererFactoryCallback) {
    resource.read(new ContentWriterAdapter (function(data) {
      if (data) {
        try {
          var func = eval(data);
        }
        catch(ex) {
          callback(null, ex);
        }
        if (typeof func === 'function') {
          callback(func);
        }
        else {
          callback(null, new Error('not a function'));
        }
      }
      else {
        callback(null, new Error('unable to get data for JS'));
      }
    }));
  }
}
