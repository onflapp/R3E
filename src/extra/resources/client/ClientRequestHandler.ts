class DOMContentWriter implements ContentWriter {
  private requestHandler: ClientRequestHandler;
  private htmldata;
  private extdata;
  private exttype;
  private externalResources = {};

  constructor() {}

  protected escapeHTML(html) {
    let text = document.createTextNode(html);
    let p = document.createElement('p');
    p.appendChild(text);
    return p.innerHTML;
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

    dopatch(window);
    dopatch(window.document);
    dopatch(window.document.body);

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

    if (!window['XMLHttpRequest']['_prototype_orig_open']) {
      window['XMLHttpRequest']['_prototype_orig_open'] = window['XMLHttpRequest'].prototype.open;
      window['XMLHttpRequest'].prototype.open = function(method, path) {
        if (method.toUpperCase() === 'POST' && path.indexOf('#') !== -1) {
          this.__localpath = path.substr(path.indexOf('#')+1);
        }
        else {
          window['XMLHttpRequest']['_prototype_orig_open'].call(this, method, path);
        }
      };

      window['XMLHttpRequest']['_prototype_orig_send'] = window['XMLHttpRequest'].prototype.send;
      window['XMLHttpRequest'].prototype.send = function(data) {
        if (this.__localpath) {
          let info = self.requestHandler.parseFormData(this.__localpath, data);
          let cb = this.onreadystatechange;
          self.requestHandler.handleStore(info.formPath, info.formData, function(rv) {
            if (cb) cb();
          });
        }
        else {
          window['XMLHttpRequest']['_prototype_orig_send'].call(this, data);
        }
      };
    }
  }

  protected attachListeners() {
    let requestHandler = this.requestHandler;
    document.body.addEventListener('submit', function (evt) {
      evt.preventDefault();

      try {
        let target = evt.target as HTMLFormElement;
        let action = unescape(target.getAttribute('action'));
        let info = requestHandler.parseFormElement(target, evt.submitter);

        let forward = info.formData[':forward'];
        if (forward && forward.indexOf('#')) {
          info.formData[':forward'] = unescape(forward.substr(forward.indexOf('#')+1));
        }
        
        if (target.method.toUpperCase() === 'POST') {
          setTimeout(function () {
            requestHandler.handleStore(info.formPath, info.formData);
          });
        }
        else {
          let q = [];
          for (let k in info.formData) {
            let v = info.formData[k];
            q.push(k+'='+escape(v));
          }

          if (action.indexOf('#')) action = unescape(action.substr(action.indexOf('#')+1));
          if (q.length) action += '?'+q.join('&');

          setTimeout(function () {
            requestHandler.forwardRequest(action);
            requestHandler.handleEnd();
          });
        }
      }
      catch(ex) {
        console.log(ex);
      }
    });

    document.body.addEventListener('change', function (evt) {
      let el = evt.target;
      if (el['type'] == 'color') {
        el['checked'] = true;
      }
    });
  }

  protected evaluateScripts() {
    let scripts = document.querySelectorAll('script');
    for (var i = 0; i < scripts.length; i++) {
      let script = scripts[i];
      let code = script.innerText;

      if (code && !script.src) {
        try {
          window.eval(code);
        }
        catch (ex) {
          console.log(code);
          console.log(ex);
        }
      }
    }
  }

  protected loadExternal() {
    let scripts = document.querySelectorAll('script');
    let links = document.querySelectorAll('link');
    let processing = 0;
    
    let trigger_done = function() {
      if (processing !== 0) return;

      setTimeout(function() {
        //let evt = document.createEvent('MutationEvents'); 
        //evt.initMutationEvent('DOMContentLoaded', true, true, document, '', '', '', 0); 
        let evt = new Event("DOMContentLoaded", {
          bubbles: true,
          cancelable: true
        });
        //document.dispatchEvent(evt);

        let evt1 = document.createEvent('Event');  
        evt1.initEvent('load', false, false);  
        //window.dispatchEvent(evt1);
      });

      processing = -1;
    };

    for (let i = 0; i < scripts.length; i++) {
      let script = scripts[i];
      let el = document.createElement('script');

      if (script.src) {
        processing++;

        el.src = script.src;
        script.parentElement.replaceChild(el, script);

        el.onload = el.onerror = function () {
          processing--;
          trigger_done();
        };
      }
		}
    trigger_done();
  }

  protected updateDocument(content) {
    let self = this;

    this.patchWindowObjects();

    document.documentElement.innerHTML = content;
    self.requestHandler.dispatchAllEvents('start', this);

    let done_loading = function () {
      self.evaluateScripts();
      self.loadExternal();
      self.attachListeners();

      self.requestHandler.dispatchAllEvents('loaded', this);
    };

    window.requestAnimationFrame(function() {
      done_loading();
    });
  }

  public setRequestHandler(requestHandler: ClientRequestHandler) {
    this.requestHandler = requestHandler;
  }

  public start(ctype) {
    if (ctype && ctype.indexOf('text/') == 0) {
      this.htmldata = [];
    }
    else if (ctype && ctype == 'application/json') {
      this.htmldata = [];
      this.htmldata.push('<pre>');
    }
    else {
      this.exttype = ctype;
      this.extdata = [];
    }
  }

  public write(content) {
    if (this.htmldata) this.htmldata.push(content);
    else if (this.extdata) this.extdata.push(content);
  }

  public error(error: Error) {
    console.log(error);
  }

  public end() {
    if (this.htmldata) {
      this.updateDocument(this.htmldata.join(''));
    }
    else if ('object/javascript' == this.exttype) {
      let d = JSON. stringify(this.extdata[0]);
      this.updateDocument('<pre>'+d+'</pre>');
    }
    else if (this.extdata && this.extdata.length) {
      let blob = new Blob(this.extdata, {type:this.exttype})
      let uri = window.URL.createObjectURL(blob)
      
      this.requestHandler.dispatchAllEvents('ended', this);
      window.location.replace(uri);
    }
    this.htmldata = null;
    this.extdata = null;
    this.exttype = null;

    this.requestHandler.handleEnd();
  }
}

class ClientRequestHandler extends ResourceRequestHandler {
  protected currentPath: string;

  constructor(resourceResolver: ResourceResolver, templateResolver: ResourceResolver, contentWriter: DOMContentWriter) {
    let writer = contentWriter ? contentWriter : new DOMContentWriter();
    super(resourceResolver, templateResolver, writer);
    writer.setRequestHandler(this);

    this.initHandlers();
  }

  protected initHandlers() {
    let self = this;
    window.addEventListener('hashchange', function (evt) {
      window.location.reload();
    });
  }

  public sendStatus(code: number) {
    console.log('status:'+code);
  }

  public forwardRequest(rpath: string) {
    Utils.flushResourceCache();
    let p = rpath;
    if (p.indexOf('http://') === 0 || p.indexOf('https://') === 0) {
      //use the full URL
    }
    else {
      p = window.location.protocol + '//' + window.location.host + window.location.pathname + '#' + rpath;
    }

    if (p == window.location.toString()) {
      window.location.reload();
    }
    else {
      window.location.replace(p);
    }
  }

  public handleRequest(rpath: string) {
    var path = rpath;
    var x = rpath.indexOf('?');
    var p = {};
    if (x > 0) {
      var q = rpath.substr(x+1);
      path = rpath.substr(0, x);

      var a = q.split('&');
      for (var i = 0; i < a.length; i++) {
        var c = a[i].indexOf('=');
        if (c > 0) {
          var n = a[i].substr(0, c);
          var v = a[i].substr(c+1);

          p[unescape(n)] = unescape(v);
        }
      }
    }
    this.queryProperties = p;
    this.renderRequest(path);
  }

  public renderRequest(rpath: string) {
    Utils.flushResourceCache();

    var rr = this.parsePath(rpath);
    var rp = rpath;
    var i = rpath.indexOf(rr.path);
    if (i > 0) rp = rp.substr(i);

    var rp0 = sessionStorage['__LAST_REQUEST_PATH0'];
    var rp1 = sessionStorage['__LAST_REQUEST_PATH1'];
    this.refererPath = rp1?rp1:rp0;
    this.currentPath = rpath;
    if (window.parent == window) {
      if (!rp0) {
        sessionStorage['__LAST_REQUEST_PATH0'] = rp;
        sessionStorage['__LAST_REQUEST_PATH1'] = '';
      }
      else if (rp0 != rp) {
        if (rp0 != rp1) {
          sessionStorage['__LAST_REQUEST_PATH0'] = rp;
          sessionStorage['__LAST_REQUEST_PATH1'] = rp0;
          this.refererPath = rp0;
        }
        else {
          sessionStorage['__LAST_REQUEST_PATH0'] = rp;
        }
      }
    }
    super.renderRequest(rpath);
  }

  public parseFormData(action:string, data:any): ClientFormInfo {
    let rv = {};
    if (data['entries']) {
      let it = data.entries();
      let result = it.next();
      while (!result.done) {
        rv[result.value[0]] = result.value[1];
        result = it.next();
      }
    }
    else {
      rv = data;
    }

    rv = this.transformValues(rv);
    rv = Utils.expandValues(rv, rv);
    let path = Utils.expandValue(action, rv);
    let info = new ClientFormInfo();

    info.formData = rv;
    info.formPath = path;

    return info;
  }

  public parseFormElement(formElement, submitter): ClientFormInfo {
    let action = formElement.getAttribute('action');
    let rv = {};

    if (action.indexOf('#')) {
      action = action.substr(action.indexOf('#')+1);
    }
    action = unescape(action);

    for (let i = 0; i < formElement.elements.length; i++) {
      let p = formElement.elements[i];
      let type = p.type.toLowerCase();
      let name = p.name;
      let value = unescape(p.value);

      if (!name) continue;

      if (type === 'file') {
        let fv = p.files[0];
        if (!fv) continue;

        let pref = '';
        let ct = fv.type;

        if (name.indexOf('./') == 0) pref = name.substr(0, name.lastIndexOf('/') + 1);
        else if (name.lastIndexOf('/') > 0) pref = name.substr(0, name.lastIndexOf('/') + 1);

        let mime = Utils.filename_mime(fv.name); //try to guess one of our types first
        if (mime === 'application/octet-stream' && ct) mime = ct;

        if (action.endsWith('/')) {
          if (name.lastIndexOf('/') > 0) pref = name.substr(0, name.lastIndexOf('/') + 1);
          else if (name.indexOf(':') == 0) {
            pref = '{'+name+'}/';
          }
          else {
            pref = name+'/';
          }
        }

        rv[name] = fv.name;
        rv[pref + '_ct'] = mime;
        rv[pref + Resource.STORE_CONTENT_PROPERTY] = function (writer, callback) {
          let reader = new FileReader();
          reader.onload = function (e) {
            writer.write(reader.result);
            writer.end(callback);
          };

          writer.start(fv.type);
          reader.readAsArrayBuffer(fv);
        };
      }
      else if (type === 'submit') {
        if (p == submitter && name) {
          rv[name] = value;
        }
      }
      else if (type === 'checkbox') {
        if (p.checked) rv[name] = value;
        else rv[name] = '';
      }
      else if (type === 'color') {
        if (p['checked']) rv[name] = p.value;
      }
      else {
        rv[name] = value;
      }
    }

    rv = this.transformValues(rv);
    rv = Utils.expandValues(rv, rv);

    let path = Utils.expandValue(action, rv);
    let info = new ClientFormInfo();

    info.formData = rv;
    info.formPath = path;

    return info;
  }

  public handleEnd(stored?: boolean) {
    super.handleEnd(stored);
    if (stored) {
      localStorage.setItem('_md', new Date().toString());
    }
  }
}
