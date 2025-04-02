class JSRendererFactory implements RendererFactory {
  private static cache = {};

  public makeRenderer(resource: Resource, callback: RendererFactoryCallback) {
    resource.read(new ContentWriterAdapter('utf8', function (data) {
      if (data) {
        var p = Utils.get_trace_path(resource);
        try {
          data = '/* '+p+' */\n'+data;
          var func = eval(data);
        }
        catch (ex) {
          console.log(data);
          console.log(ex);
          callback(null, ex);
        }
        if (typeof func === 'function') {
          Utils.copy_trace_path(resource, func);
          callback(func);
        }
        else {
          callback(null, new Error('not a function'));
        }
      }
      else {
        callback(null, new Error('unable to get data for JS'));
      }
    }), null);
  }
}
