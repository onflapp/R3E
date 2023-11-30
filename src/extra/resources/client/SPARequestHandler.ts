class SPARequestHandler extends ClientRequestHandler {

  constructor(resourceResolver: ResourceResolver, templateResolver: ResourceResolver, contentWriter: DOMContentWriter) {
    super(resourceResolver, templateResolver, contentWriter);
  }

  protected initHandlers() {
    let self = this;
    window.addEventListener('hashchange', function (evt) {
      let path = window.location.hash.substr(1);
      self.handleRequest(path);
    });
  }

  public forwardRequest(rpath: string) {
    let p = window.location.protocol + '//' + window.location.host + window.location.pathname + '#' + rpath;
    if (p == window.location.toString()) {
      let self = this;
      let p = rpath;
      setTimeout(function() {
        self.handleRequest(p);
      },10);
    }
    else {
      window.location.replace(p);
    }
  }
}
