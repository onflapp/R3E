class DOMContentWriter implements ContentWriter {
  private requestHandler: ClientRequestHandler;

  constructor() {
  }

  public setRequestHandler(requestHandler: ClientRequestHandler) {
    this.requestHandler = requestHandler;
  }

  public start(ctype) {
    document.open();
  }
  public write(content) {
    if (typeof content != 'string') document.write(JSON.stringify(content));
    else document.write(content);
  }
  public error(error: Error) {
    console.log(error); 
  }
  public end() {
    let self = this;
    document.addEventListener('readystatechange', function() {
      if (document.readyState === 'complete') {
        let requestHandler = self.requestHandler;
        document.body.addEventListener('submit', function(evt) {
          var target = evt.target;
          var info = requestHandler.parseFormElement(target);
          requestHandler.handleStore(info.formPath, info.formData);
          evt.preventDefault();
        });

        document.body.addEventListener('click', function(evt) {
          var target = evt.target as HTMLElement;
          var href = target.getAttribute('href');
          if (href && href.charAt(0) === '/') {
            requestHandler.handleRequest(href);
            evt.preventDefault();
          }
        });

      }
    });

    document.close();
  }
}

class ClientRequestHandler extends ResourceRequestHandler {
  constructor(resourceResolver: ResourceResolver, templateResolver: ResourceResolver, contentWriter: DOMContentWriter) {
    let writer = contentWriter ? contentWriter : new DOMContentWriter();
    super(resourceResolver, templateResolver, writer);
    writer.setRequestHandler(this);
  }

  public forwardRequest(rpath: string) {
    location.hash = rpath;
    super.renderRequest(rpath);
  }

  public renderRequest(rpath: string) {
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

        rv[name] = value.name;
        rv[Resource.STORE_CONTENT_PROPERTY] = function(writer, callback) {

          let reader = new FileReader();
          reader.onload = function(e) {
            writer.write(reader.result);
            writer.end();
            callback();
          };

          writer.start(value.type);
          reader.readAsArrayBuffer(value);
        };
      }
      else {
        rv[name] = value;
      }

    }

    this.transformValues(rv);

    let path = this.expandValue(action, rv);
    let info = new ClientFormInfo();

    info.formData = rv;
    info.formPath = path;

    return info;
  }
}
