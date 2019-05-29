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

  protected attachListeners() {
    if (document.body.dataset['dom_content_writer_attached']) return;

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

    document.body.dataset['dom_content_writer_attached'] = 'true';
  }

  protected compareElements(lista, listb) {
    let rv = [];
    for (let i = 0; i < lista.length; i++) {
      let itema = lista[i];
      let found = false;
      for (let z = 0; z < listb.length; z++) {
        let itemb = listb[z];
        if (itemb.isEqualNode(itema)) {
          found = true;
          break;
        }
      }

      if (!found) rv.push(itema);
    }

    return rv;
  }

  protected updateDocument(content) {
    //let parser = new DOMParser();
    //let doc = parser.parseFromString(content, 'text/html');

    let processing = 0;
    let doc = document.implementation.createHTMLDocument('');
    doc.documentElement.innerHTML = content;

    let additions = this.compareElements(doc.head.children, document.head.children);
    let removals = this.compareElements(document.head.children, doc.head.children);

    let done_loading = function () {
      if (document.readyState !== 'complete') {
        setTimeout(done_loading, 10);
        return;
      }
      window.requestAnimationFrame(function() {
        let scripts = document.querySelectorAll('script');
        for (var i = 0; i < scripts.length; i++) {
          let script = scripts[i];
          let code = script.innerText;

          if (script['__evaluated']) continue;
          try {
            eval(code);
          }
          catch (ex) {
            console.log(ex);
          }
          script['__evaluated'] = true;
        }
      });
    };

    for (let i = 0; i < additions.length; i++) {
      let el = additions[i];
      if (el.tagName === 'SCRIPT') {
        if (!el.getAttribute('src')) {
          document.head.appendChild(el);
        }
        else if (!this.externalResources[el.src]) {
          processing++;

          el = document.createElement('script');
          el.src = additions[i].src;
          el.onload = el.onerror = function () {
            processing--;
            if (processing === 0) done_loading();
          };

          this.externalResources[el.src] = 'y';
          document.head.appendChild(el);
        }
      }
      else {
        document.head.appendChild(el);
      }
    }
    for (let i = 0; i < removals.length; i++) {
      document.head.removeChild(removals[i]);
    }

    document.body = doc.body;
    if (processing === 0) done_loading();
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
    this.attachListeners();
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
    this.currentPath = rpath;
    location.hash = rpath;
    super.renderRequest(rpath);
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
