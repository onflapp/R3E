class InterFuncRendererFactory implements RendererFactory {
  public makeRenderer(resource: Resource, callback: RendererFactoryCallback) {
    resource.read(new ContentWriterAdapter(function(func) {
      if (func) {
        if (typeof func === 'function') {
          callback(func);
        }
        else {
          callback(null, new Error('is not a function'));
        }
      }
      else {
        callback(null, new Error('cannot read object as function'));
      }
    }));
  }
}
