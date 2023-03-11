class SPARequestHandler extends ClientRequestHandler {
  protected currentPath: string;

  constructor(resourceResolver: ResourceResolver, templateResolver: ResourceResolver, contentWriter: DOMContentWriter) {
    super(resourceResolver, templateResolver, contentWriter);

/* XXX
        window.addEventListener('hashchange', function (evt) {
      let path = window.location.hash.substr(1);
      self.handleRequest(path);
    });
*/
  }

  public handleEnd() {
    if (this.pendingForward) {
      let p = window.location.protocol + '//' + window.location.host + window.location.pathname + '#' + this.pendingForward;
      if (p == window.location.toString()) {
        let self = this;
        let p = this.pendingForward;
        setTimeout(function() {
          self.handleRequest(p);
        },10);
      }
      else {
        window.location.replace(p);
      }
    }
  }

  public renderRequest(rpath: string) {
    this.refererPath = sessionStorage['__LAST_REQUEST_PATH'];
    this.currentPath = rpath;
    super.renderRequest(rpath);
    sessionStorage['__LAST_REQUEST_PATH'] = rpath;
  }
}