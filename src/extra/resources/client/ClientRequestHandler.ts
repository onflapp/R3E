class DOMContentWriter implements ContentWriter {
  private requestHandler: ClientRequestHandler;
  private htmldata;
  private extdata;

  constructor() {
  }

  protected escapeHTML(html){
    let text = document.createTextNode(html);
    let p = document.createElement('p');
    p.appendChild(text);
    return p.innerHTML;
  }

  protected attachListeners() {
    let requestHandler = this.requestHandler;
    document.body.addEventListener('submit', function(evt) {
      var target = evt.target;
      var info = requestHandler.parseFormElement(target);
      setTimeout(function() {
        requestHandler.handleStore(info.formPath, new Data(info.formData));
      });
      evt.preventDefault();
    });

    document.body.addEventListener('click', function(evt) {
      var target = evt.target as HTMLElement;
      var href = target.getAttribute('href');
      if (href && href.charAt(0) === '/') {
        setTimeout(function() {
          requestHandler.handleRequest(href);
        });
        evt.preventDefault();
      }
    });

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

    let doc = document.implementation.createHTMLDocument('');
    doc.documentElement.innerHTML = content;

    let additions = this.compareElements(doc.head.children, document.head.children);
    let removals = this.compareElements(document.head.children, doc.head.children);

    for (let i = 0; i < additions.length; i++) {
      document.head.appendChild(additions[i]);
    }
    for (let i = 0; i < removals.length; i++) {
      document.head.removeChild(removals[i]);
    }

    document.body = doc.body;
  }

  public setRequestHandler(requestHandler: ClientRequestHandler) {
    this.requestHandler = requestHandler;
  }

  public start(ctype) {
    if (ctype === 'text/html') this.htmldata = [];
    else {
      this.extdata = window.open('about:blank');
      this.extdata.document.open(ctype);
      this.extdata.document.write('<pre>');
    }
  }

  public write(content) {
    if (this.htmldata) this.htmldata.push(content);
    else {
      if (typeof content != 'string') this.extdata.document.write(JSON.stringify(content));
      else this.extdata.document.write(this.escapeHTML(content));
    }

  }
  public error(error: Error) {
    console.log(error); 
  }
  public end() {
    if (this.htmldata) {
      this.updateDocument(this.htmldata.join(''));
    }
    else {
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

    window.addEventListener('hashchange', function(evt) {
      let path = window.location.hash.substr(1);
      if (path !== self.currentPath) {
        self.renderRequest(path);
      }
    });
  }

  public forwardRequest(rpath: string) {
    this.renderRequest(rpath);
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

        if (name.lastIndexOf('/') > 0) pref = name.substr(0, name.lastIndexOf('/')+1);

        rv[name] = value.name;
        rv[pref+'_ct'] = ct;
        rv[pref+Resource.STORE_CONTENT_PROPERTY] = function(writer, callback) {
          let reader = new FileReader();
          reader.onload = function(e) {
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
