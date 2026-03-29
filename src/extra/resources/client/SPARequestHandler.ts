class SPARequestHandler extends ClientRequestHandler {

  constructor(resourceResolver: ResourceResolver, templateResolver: ResourceResolver, contentWriter: DOMContentWriter) {
    super(resourceResolver, templateResolver, contentWriter);
    Utils.MAXIMIZE_CASHING = true;
  }

  public forwardRequest(rpath: string) {
    let p = rpath;
    let self = this;
    if (p.indexOf('http://') === 0 || p.indexOf('https://') === 0) {
      var x = p.indexOf('#');
      var h = p.substr(0, x);
      if (window.location.toString().startsWith(h)) {
        p = unescape(p.substr(x+1));
      }
      else {
        Utils.flushResourceCache();

        window.location.replace(p);
        return;
      }
    }

    clearTimeout(window['__r3eforwardcb']);
    window['__r3eforwardcb'] = setTimeout(function() {
      delete window['__r3eforwardcb'];
      self.handleRequest(p);
    },10);
  }

  public renderRequest(rpath: string) {
    super.__renderRequest(rpath, false);
  }
}
