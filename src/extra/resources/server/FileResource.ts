class FileResource extends Resource {
  protected rootPath: string;
  protected filePath: string;
  protected isDirectory: boolean;
  protected renderType: string;
  protected primaryType: string;
  protected resourceProperties: Map<string, any>;

  private fs = require('fs');
  
  constructor(root: string, name: string) {
    super(name);

    this.resourceProperties = new Map();
    this.rootPath = root;
    this.filePath = filename_path_append(this.rootPath, name);
  }

  public getRenderTypes(): Array<string> {
    var rv = [];
    if (this.primaryType) rv.push(this.primaryType);
    if (this.renderType)  rv.push(this.renderType);

    rv.push(this.getType());
    return rv;
  }

  protected ensureNodePathExists(dir, pdir) {
    var paths = dir.split('/');
    var parents = [];

    if (pdir) paths.pop();

    while (1) {
      var p = paths.shift();

      if (p === '') continue;
      if (!p) break;

      if (paths.length >= 0) {
        parents.push(p);

        var ndir = null;//putil.join(this.rootPath, parents.join('/'));

        try {
          this.fs.mkdirSync(ndir, '0755');
        }
        catch (ex) {
        }
      }
    }
  }

  protected readMetadata(): any {
    let self = this;
    return new Promise(function(resolve, reject) {
      let path = filename_path_append(self.filePath, '.metadata.json');
      self.fs.readFile(path, 'utf8', function(err, data) {
        if (data) {
          let rv = JSON.parse(data);
          for (let key in rv) {
            if (key.charAt(0) == '_') {
              if      (key == '_pt') self.primaryType = rv[key];
              else if (key == '_rt') self.renderType = rv[key];
            }
            else if (!self.resourceProperties.get(key)) {
              self.resourceProperties.set(key, rv[key]);
            }
          }
        }
        resolve();
      });
    });
  }

  protected readInfo(): any {
    let self = this;
    return new Promise(function(resolve, reject) {
      self.fs.stat(self.filePath, function(err, stat) {
        if (!stat) {
          reject();
        }
        else if (stat.isFile()) {
          self.resourceType = "resource/file";

          resolve();
        }
        else if (stat.isDirectory()) {
          self.isDirectory = true;
          self.resourceType = "resource/plain";

          self.readMetadata().then(function() {
            resolve();
          });
        }
        else {
          reject();
        }
      });
    });
  }


  protected checkValidity(callback: any) {
    this.readInfo().then(function() {
      callback(true);

    }, function() {
      callback(false);

    });
  }

  public getPropertyNames(): Array<string> {
    let rv = [];
		this.resourceProperties.forEach(function(val, key, map) {
      rv.push(key);
    });

    return rv;
  }

  public getProperty(name: string): any {
    return this.resourceProperties.get(name);
  }

  public resolveResource(path: string, callback: ResourceCallback): void {
    let res = new FileResource(this.filePath, path);
    res.checkValidity(function(valid) {
      if (valid) callback(res);
      else callback(null);
    });
  }

  public listChildrenNames(callback: ChildrenNamesCallback) {
    this.fs.readdir(this.rootPath, function(err, items) {
      callback(items);
    });
  }

  public hasContent(): boolean {
    return !this.isDirectory;
  }

  public copyToWriter(typ: string, writer: ContentWriter): void {
    writer.end();
    /*
    if (this.isDirectory) callback(null);
    else {
      this.fs.readFile(this.filePath, typ, callback);
    }
    */
  }
}


