class FileResource extends Resource {
  protected rootPath: string;
  protected filePath: string;
  protected isDirectory: boolean;
  protected renderType: string;
  protected primaryType: string;
  protected resourceProperties = {};

  private fs = require('fs');
  
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
    if (this.isDirectory) return null;
    else return 'resource/node';
  }  

  public createChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    let path = Utils.filename_path_append(this.filePath, name);
    let mask = '0755';
    let res = new FileResource(this.filePath, name);

    this.fs.mkdir(path, mask, function(err) {
      if (!err) {
        callback(res);
      }
      else if (err.code == 'EEXIST') {
        callback(res);
      }
      else {
        callback(null);
      }
    });
  }

  public importData(data: any, callback) {
    let self = this;
    let path = Utils.filename_path_append(self.filePath, '.metadata.json');
 
    self.fs.readFile(path, 'utf8', function(err, mdata) {
      let content = null;
      if (mdata) content = JSON.parse(mdata);
      if (!content) content = {};

      for (var key in data) {
        var v = data[key];
        key = key.trim();
        if (key.charAt(0) === ':') continue;
        if (key.length === 0) continue;
        if (v) content[key] = data[key];
        else delete content[key];
      }

      self.fs.writeFile(path, JSON.stringify(content), 'utf8', function() {
        callback();
      });
    });
  }

  public removeChildResource(name: string, callback) {
    callback(null);
  }

  protected readMetadata(callback) {
    let self = this;
    let path = Utils.filename_path_append(self.filePath, '.metadata.json');
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

  public resolveItself(callback) {
    let self = this;
    this.fs.stat(this.filePath, function(err, stat) {
      if (!stat) {
        callback(null);
      }
      else if (stat.isFile()) {
        callback(self);
      }
      else if (stat.isDirectory()) {
        self.isDirectory = true;
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
      callback(res);
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
    let contentType = this.resourceProperties['contentType'];
    if (contentType) return contentType;
    
    let name = this.getName();
    let mime = require('mime-types');

    return mime.lookup(name) || null;
  }

  public start(ctype: string) {
  }
  public write(data: any) {
  }
  public error(error: Error) {
  }
  public end() {
  }
  public read(writer: ContentWriter) {
    if (this.isDirectory) {
      writer.end();
    }
    else {
      writer.start(this.getContentType());

      let is = this.fs.createReadStream(this.filePath);
      is.on('error', function(err) {
        writer.error(err);
        writer.end();
      });

      is.on('data', function(data) {
        writer.write(data);
      });

      is.on('close', function() {
        writer.end();
      });

    }
  }  
}


