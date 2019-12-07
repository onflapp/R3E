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

  constructor(name: string, base ?: string) {
    super(name, base);
  }
  
  protected makeNewResource(name: string) {
    let path = this.getStoragePath();
    let res = new RemoteResource(name, path);

    return res;
  }

  protected ensurePathExists(path: string, callback) {
    callback(true);
  }

  protected storeChildrenNames(callback) {
    callback();
  }

  public removeChildResource(name: string, callback) {
    let url = this.getStoragePath(name);
    let self = this;
    let val = {
      ':delete':url
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

    this.remoteGET(url, true, function(values) {
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

  public getWriter(): ContentWriter {
    let path = this.getStoragePath();
    if (this.isDirectory) {
      this.isDirectory = false;
    }

    this.loaded = false;
    return new RemoteResourceContentWriter(path);
  }

  public read(writer: ContentWriter, callback: any) {
    if (this.isDirectory) {
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
