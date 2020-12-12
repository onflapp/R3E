class CachedRemoteTemplateResource extends ObjectResource {
  private baseURL: string;
  private path: string;

  constructor(obj: any, base: string, path ? : string, name ? : string) {
    super(obj, name);
    this.baseURL = base;
    this.path = path ? path : '';
  }

  public getPath(): string {
    return this.path;
  }

  protected makeNewResource(obj: any, base: string, path: string, name: string): CachedRemoteTemplateResource {
    return new CachedRemoteTemplateResource(obj, base, path, name);
  }

  public resolveChildResource(name: string, callback: ResourceCallback, walking ? : boolean): void {
    let rv = this.values[name];

    if (typeof rv === 'object') {
      if (rv['_content'] || rv['_content64'] || rv['_pt'] === 'resource/content') callback(new ObjectContentResource(rv, name));
      else {
        let path = Utils.filename_path_append(this.getPath(), name);
        callback(this.makeNewResource(rv, this.baseURL, path, name));
      }
    }
    else if (typeof rv === 'function') {
      callback(new ObjectContentResource(rv, name));
    }
    else if (walking) {
      let path = Utils.filename_path_append(this.getPath(), name);
      rv = {};
      this.values[name] = rv;
      callback(this.makeNewResource(rv, this.baseURL, path, name));
    }
    else if (rv && rv === 'NA') {
        callback(null);
    }
    else {
      let self = this;
      let path = this.baseURL + '/' + this.getPath() + '/' + name;
      path = path.replace(/\/+/g, '/');

      this.requestData(path, function (ctype, text) {
        if (text) {
          rv = {
            _ct: ctype,
            _content: text,
          };
          self.values[name] = rv;
          callback(new ObjectContentResource(rv, name));
        }
        else {
          self.values[name] = 'NA';
          callback(null);
        }
      });
    }
  }

  protected requestData(path: string, callback): void {
    let xhr = new XMLHttpRequest();

    xhr.open('GET', path, true);
    xhr.onreadystatechange = function () {
      var DONE = 4;
      var OK = 200;
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          let ct = xhr.getResponseHeader('content-type');
          callback(ct, xhr.responseText);
        }
        else {
          callback(null);
        }
      }
    };

    xhr.send(null);
  }
}
