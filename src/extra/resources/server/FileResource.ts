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

  public end() {
    this.fs.closeSync(this.fd);
  }
}

class FileResource extends Resource {
  protected rootPath: string;
  protected filePath: string;
  protected isDirectory: boolean;
  protected resourceProperties = {};

  private fs = require('fs-extra');
  
  constructor(root: string, name?: string) {
    super(name);

    this.rootPath = root;

    if (name) {
      this.filePath = Utils.filename_path_append(this.rootPath, name);
    }
    else {
      this.filePath = root;
    }
  }

  public getType(): string {
    if (this.isDirectory) return 'resource/node';
    else return 'resource/content';
  }

  public getSuperType(): string {
    if (this.getType() === 'resource/node') return null;
    else return 'resource/node';
  }

  public getRenderType(): string {
    return this.resourceProperties['_rt'];
  }

  protected makeMetadataPath(nm?: string):string {
    if (nm) {
      return this.filePath + '/.' + nm + '.metadata.json';
    }
    else if (this.isDirectory) {
      return Utils.filename_path_append(this.filePath, '.metadata.json');
    }
    else {
      let dirname = Utils.filename_dir(this.filePath);
      let name = Utils.filename(this.filePath);

      return dirname + '/.' + name + '.metadata.json';
    }
  }

  public createChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    let path = Utils.filename_path_append(this.filePath, name);
    let mask = '0755';
    let res = new FileResource(this.filePath, name);

    this.fs.mkdir(path, mask, function(err) {
      if (!err) {
        res.isDirectory = true;
        callback(res);
      }
      else if (err.code == 'EEXIST') {
        if (walking) callback(res);
        else res.resolveItself(callback);
      }
      else {
        callback(null);
      }
    });
  }

  public importContent(func, callback) {
    func(this.getWriter(), callback);
  }

  public importProperties(data: any, callback) {
    let self = this;
    let path = this.makeMetadataPath();
 
    self.fs.readFile(path, 'utf8', function(err, mdata) {
      let content = null;
      let count = 0;

      if (mdata) content = JSON.parse(mdata);
      if (!content) content = {};

      for (var key in data) {
        var v = data[key];
        key = key.trim();
        if (key.length === 0) continue;
        if (v) content[key] = data[key];
        else delete content[key];

        count++;
      }

      if (count > 0) {
        self.fs.writeFile(path, JSON.stringify(content), 'utf8', function() {
          callback();
        });
      }
      else {
        self.fs.unlink(path, function() {
          callback();
        });
      }
    });
  }

  public removeChildResource(name: string, callback) {
    let resolve = require('path').resolve;
    let path = Utils.filename_path_append(this.filePath, name);

    path = resolve(path);
    if (path === '' || path === '/') {
      console.log('invalid path');
      callback(null);
    }
    else {
      let mpath = this.makeMetadataPath(name);
      this.fs.remove(mpath, function(err) {
      });

      this.fs.remove(path, function(err) {
        if (err) console.log(err);
        callback(null);
      });
    }
  }

  protected readMetadata(callback) {
    let self = this;
    let path = this.makeMetadataPath();

    self.fs.readFile(path, 'utf8', function(err, data) {
      if (data) {
        let rv = JSON.parse(data);
        self.resourceProperties = rv?rv:{};
      }
      else {
        self.resourceProperties = {};
      }
      callback();
    });
  }

  protected checkExistence(callback) {
    let self = this;
    this.fs.stat(this.filePath, function(err, stat) {
      if (!stat) {
        callback(false);
      }
      else if (stat.isFile()) {
        self.isDirectory = false;
        callback(true);
      }
      else if (stat.isDirectory()) {
        self.isDirectory = true;
        callback(true);
      }
      else {
        callback(false);
      }
    });
  }

  public resolveItself(callback) {
    let self = this;
    this.checkExistence(function(stat) {
      if (stat) {
        self.readMetadata(function() {
          callback(self);
        });
      }
      else {
        callback(null);
      }
    });
  }

  public getPropertyNames(): Array<string> {
    var rv = [];
    for (var k in this.resourceProperties) {
      var v = this.resourceProperties[k];
      if (typeof v === 'function' || k.charAt(0) === '_') {
      }
      else {
        rv.push(k);
      }
    }

    return rv;
  }

  public getProperty(name: string): any {
    return this.resourceProperties[name];
  }

  public resolveChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    let res = new FileResource(this.filePath, name);
    if (walking) {
      res.checkExistence(function(stat) {
        if (stat) {
          callback(res);
        }
        else {
          callback(null);
        }
      });
    }
    else {
      res.resolveItself(callback);
    }
  }

  public listChildrenNames(callback: ChildrenNamesCallback) {
    this.fs.readdir(this.filePath, function(err, items) {
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

  public isContentResource(): boolean {
    return !this.isDirectory;
  }

  public getContentType(): string {
    let contentType = this.resourceProperties['_ct'];
    if (contentType) return contentType;
    
    let name = this.getName();
    let mime = require('mime-types');

    return mime.lookup(name) || null;
  }

  public getWriter(): ContentWriter {
    if (this.isDirectory) {
      this.fs.removeSync(this.filePath);
      this.isDirectory = false;
    }

    return new FileResourceContentWriter(this.filePath);
  }

  public read(writer: ContentWriter) {
    if (this.isDirectory) {
      writer.end();
    }
    else {
      writer.start(this.getContentType());

      let fd = this.fs.openSync(this.filePath, 'r');
      let pos = 0;
      let sz = 0;
      while (true) {
        let buff = new Buffer(1024*500);
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
      writer.end();
    }
  }  
}
