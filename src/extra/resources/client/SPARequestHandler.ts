class SPADOMContentWriter extends DOMContentWriter {

  protected updateDocument(content) {
    let self = this;
    let u = window.location.toString();

    this.patchWindowObjects();
    this.patchHttpRequest();

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

  public forwardRequest(rpath: string) {
    let p = rpath;
    let self = this;
    if (p.indexOf('http://') === 0 || p.indexOf('https://') === 0) {
      var x = p.indexOf('#');
      var h = p.substr(0, x);
      if (window.location.toString().startsWith(h)) {
        p = decodeURIComponent(p.substr(x+1));
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
