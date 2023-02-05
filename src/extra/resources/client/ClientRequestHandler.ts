class DOMContentWriter implements ContentWriter {
  private requestHandler: ClientRequestHandler;
  private htmldata;
  private extdata;
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

    if (window['__myevents']) {
      for (let i = 0; i < window['__myevents'].length; i++) {
        let v = window['__myevents'][i];
				window.removeEventListener(v.event, v.func, v.cap);
			}
    }

    window['__myevents'] = [];
   
    if (!window['orig_addEventListener']) {
      window['orig_addEventListener'] = window.addEventListener;
      window.addEventListener = function(a, b, c) {
        window['__myevents'].push({
          event:a,
          func:b,
          cap:c
        });

        window['orig_addEventListener'](a, b, c);
      };
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
          self.requestHandler.handleStore(info.formPath, info.formData);
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
        let action = target.getAttribute('action');
        let info = requestHandler.parseFormElement(target);

        let forward = info.formData[':forward'];
        if (forward && forward.indexOf('#')) {
          info.formData[':forward'] = forward.substr(forward.indexOf('#')+1);
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
          setTimeout(function () {
            requestHandler.handleRequest(action+'?'+q.join('&'));
          },10);
        }
      }
      catch(ex) {
        console.log(ex);
      }
    });

    /*
    document.body.addEventListener('click', function (evt) {
      let target = evt.target as HTMLElement;
      let href = target.getAttribute('href');
      let tar = target.getAttribute('target');

      if (!href) href = target.parentElement.getAttribute('href');
      if (href && href.charAt(0) === '/' && evt.button === 0 && !evt.ctrlKey && !evt.altKey && !evt.shiftKey) {
        evt.preventDefault();

        setTimeout(function () {
          requestHandler.handleRequest(href);
        },10);
      }
    });
   */
  }

  protected evaluateScripts() {
    let scripts = document.querySelectorAll('script');
    for (var i = 0; i < scripts.length; i++) {
      let script = scripts[i];
      let code = script.innerText;

      if (code && !script.src) {
        try {
          eval(code);
        }
        catch (ex) {
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
        let evt = document.createEvent('MutationEvents'); 
        evt.initMutationEvent('DOMContentLoaded', true, true, document, '', '', '', 0); 
        document.dispatchEvent(evt);

        let evt1 = document.createEvent('Event');  
        evt1.initEvent('load', false, false);  
        window.dispatchEvent(evt1);
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

    let done_loading = function () {
      self.evaluateScripts();
      self.loadExternal();
      self.attachListeners();
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
    else if (ctype) {
      document.open(ctype);
      document.write('<pre>');
      this.extdata = document;
    }
    /*
    else if (ctype) {
      this.extdata = window.open('about:blank');
      if (this.extdata) { //may happen if popup windows are blocked
        this.extdata.document.open(ctype);
        this.extdata.document.write('<pre>\n');
      }
    }
   */
    else {
      this.htmldata = [];
    }
  }

  public write(content) {
    if (this.htmldata) this.htmldata.push(content);
    else if (this.extdata) {
      if (typeof content != 'string') {
        this.extdata.write(JSON.stringify(content));
      }
      else {
        this.extdata.write(content);
      }
    }

  }
  public error(error: Error) {
    console.log(error);
  }
  public end() {
    if (this.htmldata) {
      this.updateDocument(this.htmldata.join(''));
    }
    else if (this.extdata) {
      this.extdata.close();
    }
    this.htmldata = null;
    this.extdata = null;

    this.requestHandler.handleEnd();
  }
}

class ClientRequestHandler extends ResourceRequestHandler {
  protected currentPath: string;

  constructor(resourceResolver: ResourceResolver, templateResolver: ResourceResolver, contentWriter: DOMContentWriter) {
    let writer = contentWriter ? contentWriter : new DOMContentWriter();
    super(resourceResolver, templateResolver, writer);
    writer.setRequestHandler(this);
    let self = this;

    window.addEventListener('hashchange', function (evt) {
      let path = window.location.hash.substr(1);
      if (path !== self.currentPath) {
        self.handleRequest(path);
      }
    });
  }

  public sendStatus(code: number) {
    console.log('status:'+code);
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

  public handleRequest(rpath: string) {
    var path = rpath;
    var x = rpath.indexOf('?');
    if (x > 0) {
      var q = rpath.substr(x+1);
      var p = {};
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

      this.queryProperties = p;
    }
    this.renderRequest(path);
  }

  public renderRequest(rpath: string) {
    if (rpath != this.currentPath) {
      this.refererPath = this.currentPath;
    }
    this.currentPath = rpath;
    super.renderRequest(rpath);
  }

  public parseFormData(action:string, data:any): ClientFormInfo {
    let rv = {};

    let it = data.entries();
    let result = it.next();
    
    while (!result.done) {
      rv[result.value[0]] = result.value[1];
      result = it.next();
    }

    rv = this.transformValues(rv);
    let path = this.expandValue(action, rv);
    let info = new ClientFormInfo();

    info.formData = rv;
    info.formPath = path;

    return info;
  }

  public parseFormElement(formElement): ClientFormInfo {
    let action = formElement.getAttribute('action');
    let rv = {};

    for (let i = 0; i < formElement.elements.length; i++) {
      let p = formElement.elements[i];
      let type = p.type.toLowerCase();

      if (type === 'submit' || type == 'button') continue;

      let name = p.name;
      let value = p.value;

      if (type === 'file') {
        value = p.files[0];
        if (!value) continue;

        let pref = '';
        let ct = value.type;

        if (name.lastIndexOf('/') > 0) pref = name.substr(0, name.lastIndexOf('/') + 1);

        let mime = Utils.filename_mime(value.name); //try to guess one of our types first
        if (mime === 'application/octet-stream' && ct) mime = ct;

        rv[name] = value.name;
        rv[pref + '_ct'] = mime;
        rv[pref + Resource.STORE_CONTENT_PROPERTY] = function (writer, callback) {
          let reader = new FileReader();
          reader.onload = function (e) {
            writer.write(reader.result);
            writer.end(callback);
          };

          writer.start(value.type);
          reader.readAsArrayBuffer(value);
        };
      }
      else {
        rv[name] = value;
      }
    }

    rv = this.transformValues(rv);

    let path = this.expandValue(action, rv);
    let info = new ClientFormInfo();

    info.formData = rv;
    info.formPath = path;

    return info;
  }
}
