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

    if (!window['XMLHttpRequest'].prototype.orig_open) {
      window['XMLHttpRequest'].prototype.orig_open = window['XMLHttpRequest'].prototype.open;
      window['XMLHttpRequest'].prototype.open = function(method, path, a) {
        if (method.toUpperCase() === 'POST' && path.indexOf('#') !== -1) {
          this.__localpath = path.substr(path.indexOf('#')+1);
        }
        else {
          window['XMLHttpRequest'].prototype.orig_open.call(this, method, path, a);
        }
      };

      window['XMLHttpRequest'].prototype.orig_send = window['XMLHttpRequest'].prototype.send;
      window['XMLHttpRequest'].prototype.send = function(data) {
        if (this.__localpath) {
          let info = self.requestHandler.parseFormData(this.__localpath, data);
          self.requestHandler.handleStore(info.formPath, info.formData);
        }
        else {
          window['XMLHttpRequest'].prototype.orig_send.call(this, data);
        }
      };
    }
  }

  protected attachListeners() {
    let requestHandler = this.requestHandler;
    document.body.addEventListener('submit', function (evt) {
      let target = evt.target;
      let info = requestHandler.parseFormElement(target);
      evt.preventDefault();

      setTimeout(function () {
        requestHandler.handleStore(info.formPath, info.formData);
      });
    });

    document.body.addEventListener('click', function (evt) {
      let target = evt.target as HTMLElement;
      let href = target.getAttribute('href');
      let tar = target.getAttribute('target');

      if (!href) href = target.parentElement.getAttribute('href');
      if (href && href.charAt(0) === '/' && evt.button === 0 && !evt.ctrlKey && !evt.altKey && !evt.shiftKey) {
        evt.preventDefault();

        setTimeout(function () {
          requestHandler.handleRequest(href);
        });
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
    if (ctype === 'text/html') this.htmldata = [];
    else {
      this.extdata = window.open('about:blank');
      if (this.extdata) { //may happen if popup windows are blocked
        this.extdata.document.open(ctype);
        this.extdata.document.write('<pre>\n');
      }
    }
  }

  public write(content) {
    if (this.htmldata) this.htmldata.push(content);
    else if (this.extdata) {
      if (typeof content != 'string') {
        this.extdata.document.write(JSON.stringify(content));
      }
      else {
        let val = this.escapeHTML(content);
        this.extdata.document.write(val);
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
      this.extdata.document.write('</pre>');
      this.extdata.document.close();
    }
    this.htmldata = null;
    this.extdata = null;
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
        self.renderRequest(path);
      }
    });
  }

  public forwardRequest(rpath: string) {
    this.renderRequest(rpath);
  }

  public sendStatus(code: number) {
    console.log('status:'+code);
  }

  public handleRequest(rpath: string) {
    this.renderRequest(rpath);
  }

  public renderRequest(rpath: string) {
    if (rpath != this.currentPath) {
      this.refererPath = this.currentPath;
    }
    this.currentPath = rpath;
    location.hash = rpath;
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
