class SPADOMContentWriter extends DOMContentWriter {

  constructor() {
    super();
    this.patchWindowObjects();
    this.patchHttpRequest();
  }

  protected updateDocument(content) {
    let self = this;
    let u = window.location.toString();

    document.documentElement.innerHTML = content;
    self.requestHandler.dispatchAllEvents('start', this);

    let done_loading = function () {
      self.evaluateScripts();
      self.loadExternal();
      self.attachListeners();
      
      if (window.parent == window) {
        sessionStorage.setItem('__CURRENT_REQUEST_URL', u);
      }

      self.requestHandler.dispatchAllEvents('loaded', this);
    };

    window.requestAnimationFrame(function() {
      done_loading();
    });
  }

  protected patchWindowObjects() {
    let self = this;
    let dopatch = function(obj) {
      if (obj['__myevents']) {
        for (let i = 0; i < obj['__myevents'].length; i++) {
          let v = obj['__myevents'][i];
          obj.removeEventListener(v.event, v.func, v.cap);
        }
      }

      obj['__myevents'] = [];
     
      if (!obj['orig_addEventListener']) {
        obj['orig_addEventListener'] = obj.addEventListener;
        obj.addEventListener = function(a, b, c) {
          obj['__myevents'].push({
            event:a,
            func:b,
            cap:c
          });

          obj['orig_addEventListener'](a, b, c);
        };
      }
    };

    /*
    dopatch(window);
    dopatch(window.document);
    dopatch(window.document.body);
    */

    if (!window['_customElements_orig_define']) {
      if (window['customElements']) {
        window['_customElements_orig_define'] = CustomElementRegistry.prototype.define;
        window.customElements.define = function(a, b, c) {
          if (!window.customElements.get(a)) {
            window['_customElements_orig_define'].call(this, a, b, c);
          }
        };
      }
    }
  }
}

class SPARequestHandler extends ClientRequestHandler {

  constructor(resourceResolver: ResourceResolver, templateResolver: ResourceResolver, contentWriter: DOMContentWriter) {
    let writer = contentWriter ? contentWriter : new SPADOMContentWriter();
    super(resourceResolver, templateResolver, writer);
  }

  protected initHandlers() {
    let self = this;
    window.addEventListener('hashchange', function (evt) {
      let path = window.location.hash.substr(1);
      self.handleRequest(path);
    });
  }

  public forwardRequest(rpath: string) {
    let p = rpath;
    let self = this;
    if (p.indexOf('http://') === 0 || p.indexOf('https://') === 0) {
    }
    else {
      p = window.location.protocol + '//' + window.location.host + window.location.pathname + '#' + rpath;
    }

    clearTimeout(window['__r3eforwardcb']);
    window['__r3eforwardcb'] = setTimeout(function() {
      delete window['__r3eforwardcb'];
      
      if (p == window.location.toString()) {
        window.location.reload();
      }
      else {
        window.location.replace(p);
      }

    },10);
  }

  public renderRequest(rpath: string) {
    super.__renderRequest(rpath, false);
  }

}
