class FileResourceContentWriter implements ContentWriter {
  private fd;
  private isbase64;
  private fs = require('fs-extra');
  protected filePath: string;

  constructor(filePath: string) {
    this.filePath = filePath;
  }

  public start(ctype: string) {
    if (ctype && ctype.indexOf('base64:') === 0) this.isbase64 = true;
    this.fd = this.fs.openSync(this.filePath, 'w');
  }

  public write(data: any) {
    if (this.isbase64) {
      this.fs.writeSync(this.fd, new Buffer(data, 'base64'));
    }
    else {
      this.fs.writeSync(this.fd, data);
    }
  }

  public error(error: Error) {
    console.log(error);
  }

  public end(callback: any) {
    this.fs.closeSync(this.fd);
    if (callback) callback();
  }
}

class FileResource extends StoredResource {
  private fs = require('fs-extra');

  constructor(name: string, base: string) {
    super(name, base);
  }

  protected makeNewResource(name: string) {
    let path = this.getStoragePath();
    let res = new FileResource(name, path);
    res.setEnableResourceCache(this.enableCache);

    return res;
  }

  public getType(): string {
    if (!this.isDirectory) return 'resource/content';
    else return 'resource/node';
  }

  protected storeChildrenNames(callback) {
    callback(true);
  }

  protected ensurePathExists(path, callback) {
    this.fs.mkdirs(path, function (err) {
      if (!err) {
        callback(true);
      }
      else if (err.code == 'EEXIST') {
        callback(true);
      }
      else {
        callback(false);
      }
    });
  }

  public loadChildrenNames(callback: ChildrenNamesCallback) {
    let path = this.getStoragePath();
    this.fs.readdir(path, function (err, items) {
      let ls = [];
      if (items) {
        for (var i = 0; i < items.length; i++) {
          let it = items[i];
          if (it.charAt(0) === '.') continue;

          ls.push(it);
        }
      }
      callback(ls);
    });
  }

  protected storeProperties(callback) {
    let self = this;
    let path = this.getMetadataPath();

    self.fs.writeFile(path, JSON.stringify(this.values), 'utf8', function () {
      callback(true);
    });
  }

  protected loadProperties(callback) {
    let self = this;
    let path = this.getStoragePath();

    let loadMetadata = function (path, callback) {
      self.fs.readFile(path, 'utf8', function (err, data) {
        if (data) {
          let rv = JSON.parse(data);
          self.values = rv ? rv : {};
        }
        else {
          self.values = {};
        }
        callback();
      });
    };

    self.fs.stat(path, function (err, stats) {
      if (err) callback(false);
      else {
        self.isDirectory = stats.isDirectory();
        self.contentSize = stats.size;

        loadMetadata(self.getMetadataPath(), function () {
          callback(true);
        });
      }
    });
  }

  public removeChildResource(name: string, callback) {
    let self = this;
    let path = this.getStoragePath(name);
    super.removeChildResource(name, function () {
      if (path === '' || path === '/') {
        console.log('invalid path');
        callback(null);
      }
      else {
        let mpath = self.getMetadataPath(name);
        self.fs.remove(mpath, function (err) {});

        self.fs.remove(path, function (err) {
          if (err) console.log(err);
          callback(true);
        });
      }
    });
  }

  public getWriter(): ContentWriter {
    let path = this.getStoragePath();
    if (this.isDirectory) {
      this.fs.removeSync(path);
      this.isDirectory = false;
    }

    this.loaded = false;
    return new FileResourceContentWriter(path);
  }

  public read(writer: ContentWriter, callback: any) {
    if (this.isDirectory) {
      writer.end(callback);
    }
    else {
      writer.start(this.getContentType());
      let path = this.getStoragePath();

      let fd = this.fs.openSync(path, 'r');
      let pos = 0;
      let sz = 0;
      while (true) {
        let buff = new Buffer(1024 * 500);
        sz = this.fs.readSync(fd, buff, 0, buff.length, pos);
        if (!sz) break;

        pos += sz;
        if (sz < buff.length) {
          writer.write(buff.slice(0, sz));
        }
        else {
          writer.write(buff);
        }
      }

      this.fs.closeSync(fd);
      writer.end(callback);
    }
  }
}
