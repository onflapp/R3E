class RemoteResourceContentWriter implements ContentWriter {
  protected filePath: string;
  protected contentType: string;
  protected buffer = [];

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  public start(ctype: string) {
    this.contentType = ctype;
  }

  public write(data: any) {
    this.buffer.push(data);
  }

  public error(error: Error) {
    console.log(error);
  }

  public end(callback: any) {
    let xhr = new XMLHttpRequest();
    let self = this;
    let data = this.buffer[0];

    xhr.open('POST', this.filePath, true);

    if (this.contentType) xhr.setRequestHeader('Content-Type', this.contentType);

    xhr.onreadystatechange = function () {
      var DONE = 4;
      var OK = 200;
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          callback();
        }
        else {
          callback();
        }
      }
    };

    xhr.send(data);
  }
}

class RemoteResource extends StoredResource {

  constructor(name: string, base ?: string, prefix ?:string) {
    super(name, base, prefix);
  }

  protected makeNewResource(name: string) {
    let path = this.getStoragePath();
    let res = new RemoteResource(name, path, this.basePrefix);

    return res;
  }

  protected ensurePathExists(path: string, callback) {
    callback(true);
  }

  protected storeChildrenNames(callback) {
    callback();
  }

  public getStoragePath(name ? : string): string {
    let base = this.basePath;
    let path = '';
    if (!base) base = '';

    if (base === this.basePrefix) path = base + this.baseName;
    else path = Utils.filename_path_append(base, this.baseName);

    if (name) path = Utils.filename_path_append(path, name);
    return path;
  }

  public removeChildResource(name: string, callback) {
    let url = this.getStoragePath(name);
    let rpath = url;
    let self = this;

    if (this.basePrefix && url.indexOf(this.basePrefix) == 0) {
      rpath = url.substr(this.basePrefix.length);
    }

    let val = {
      ':delete':rpath
    };

    url += '/.metadata.json'
    super.removeChildResource(name, function() {
      self.remotePOST(url, val, function() {
        callback();
      });
    });
  }

  protected loadChildrenNames(callback) {
    if (this.isDirectory) {
      let url = this.getStoragePath('.children.json');

      this.remoteGET(url, true, function(values) {
        callback(values?values:[]);
      });
    }
    else {
      callback([]);
    }
  }

  protected storeProperties(callback) {
    let url = this.getStoragePath('.metadata.json');

    this.remotePOST(url, this.values, function() {
      callback();
    });
  }

  protected loadProperties(callback) {
    let url = this.getMetadataPath();
    let self = this;

    if (this.resourceName.indexOf('.') > 0) { //assume this is a file name, try content first
      self.tryLoadContent(function(rv) {
        if (rv) {
          callback(true);
        }
        else {
          self.remoteGET(url, true, function(values) {
            if (values) {
              if (values._pt === 'resource/content') self.isDirectory = false;
              if (typeof values._contentsz !== 'undefined') self.contentSize = values._contentsz;

              self.values = values;
              callback(true);
            }
            else {
              callback(false);
            }
          });
        }
      });
    }
    else { //try metadata first
      this.remoteGET(url, true, function(values) {
        if (values) {
          if (values._pt === 'resource/content') self.isDirectory = false;
          if (typeof values._contentsz !== 'undefined') self.contentSize = values._contentsz;

          self.values = values;
          callback(true);
        }
        else {
          self.tryLoadContent(callback);
        }
      });
    }
  }

  protected tryLoadContent(callback) {
    let url = this.getStoragePath();
    let self = this;

    this.remoteGET(url, false, function(data) {
      if (data) {
        self.values._pt = 'resource/content';
        self.values._contentdata = data;
        self.isDirectory = false;
        self.loaded = true;
        callback(true);
      }
      else {
        callback(false);
      }
    });
  }

  public getWriter(): ContentWriter {
    let path = this.getStoragePath();
    if (this.isDirectory) {
      this.isDirectory = false;
    }

    //this.loaded = false;
    return new RemoteResourceContentWriter(path);
  }

  public read(writer: ContentWriter, callback: any) {
    if (this.isDirectory) {
      writer.end(callback);
    }
    else if (this.values._contentdata) {
      let ct = this.getContentType();
      let data = this.values._contentdata;

      writer.start(ct);
      writer.write(data);
      writer.end(callback);
    }
    else {
      let url = this.getStoragePath();
      let ct = this.getContentType();

      this.remoteGET(url, false, function(data) {
        writer.start(ct);
        writer.write(data);
        writer.end(callback);
      });
    }
  }

  protected remotePOST(url, values, callback): void {
    let xhr = new XMLHttpRequest();
    let self = this;

    xhr.open('POST', url, true);

    xhr.setRequestHeader('Content-Type', 'application/json'); //;charset=UTF-8');
    xhr.onreadystatechange = function () {
      var DONE = 4;
      var OK = 200;
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          callback(xhr.responseText);
        }
        else {
          callback(null);
        }
      }
    };

    let data = JSON.stringify(values);
    xhr.send(data);
  }

  protected remoteGET(url, json, callback): void {
    let xhr = new XMLHttpRequest();

    if (!json) xhr.responseType = 'arraybuffer';
    xhr.open('GET', url, true);
    xhr.onreadystatechange = function () {
      var DONE = 4;
      var OK = 200;
      if (xhr.readyState === DONE) {
        if (xhr.status === OK) {
          if (json) {
            let data = xhr.responseText;
            let val = null;
            if (data) {
              try {
                val = JSON.parse(data);
              }
              catch (ex) {}
            }
            callback(val);
          }
          else {
            callback(xhr.response);
          }
        }
        else {
          callback(null);
        }
      }
    };

    xhr.send();
  }
}
