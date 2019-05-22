class GitHubResourceContentWriter implements ContentWriter {
  protected repo;
  protected filePath: string;
  protected buffer = [];

  constructor(repo: any, filePath: string) {
    this.repo = repo;
    this.filePath = filePath;
  }

  public start(ctype: string) {}

  public write(data: any) {
    this.buffer.push(data);
  }

  public error(error: Error) {
    console.log(error);
  }

  public end(callback: any) {
    let self = this;
    let data = '';
    let opts = {
      encode: true
    };

    if (typeof Buffer !== 'undefined' && this.buffer[0] instanceof Buffer) {
      let b = Buffer.concat(this.buffer);
      data = b.toString('base64');
      opts.encode = false;
    }
    else if (typeof this.buffer[0] === 'string') {
      data = this.buffer.join('');
    }

    this.repo.writeFile('master', this.filePath, data, '', opts, function () {
      callback();
    });
  }
}

class GitHubResource extends StoredResource {
  protected repo: any;
  protected resources = null;

  constructor(repo: any, name ? : string, base ? : string) {
    super(name ? name : '', base ? base : '');

    this.repo = repo;
  }

  protected makeNewResource(name: string) {
    let path = this.getStoragePath();
    let res = new GitHubResource(this.repo, name, path);

    return res;
  }

  public getStoragePath(name ? : string): string {
    let path = Utils.filename_path_append(this.basePath, this.baseName);
    if (name) path = Utils.filename_path_append(path, name);

    if (path.charAt(0) === '/') path = path.substr(1);
    return path;
  }

  public storeProperties(callback) {
    let self = this;
    let path = this.getMetadataPath();
    let str = JSON.stringify(self.values);
    let opts = {
      encode: true
    };

    this.repo.writeFile('master', path, str, '', opts, function () {
      callback();
    });
  }

  protected loadProperties(callback) {
    let self = this;
    let storePath = this.getStoragePath();

    let load_metadata = function() {
      let metadata = self.getMetadataPath();
      self.repo.getContents('master', metadata, false)
        .then(function (response) {
          if (response.data.content) {
            let str = Utils.base642ArrayBuffer(response.data.content);
            if (str) {
              self.values = JSON.parse(str.toString());
            }
          }
          
          callback(true);
        })
        .catch(function (error) {
          if (error.response.status === 404) callback(true);
          else callback(false);
        });

    };

    if (storePath) {
      self.repo.getContents('master', storePath, false)
        .then(function (response) {
          if (response.data.type && response.data.type === 'file') {
            self.isDirectory = false;
            self.contentSize = response.data.size;
            callback(true);
          }
          else {
            self.contentSize = 0;
            load_metadata();
          }
        })
        .catch(function (error) {
          callback(false);
        });
    }
    else {
      callback(true);
    }
  }

  public loadChildrenNames(callback: ChildrenNamesCallback) {
    let self = this;
    let storePath = this.getStoragePath();

    self.repo.getContents('master', storePath, false)
      .then(function (response) {

        let rv = [];
        for (let i = 0; i < response.data.length; i++) {
          let item = response.data[i];
          let name = item.name;
          if (name.charAt(0) === '.') continue;

          rv.push(name);
        }
        callback(rv);
      })
      .catch(function (error) {
        callback([]);
      });
  }

  public storeChildrenNames(callback) {
    callback();
  }

  protected ensurePathExists(path: string, callback) {
    callback(true);
  }

  public importContent(func, callback) {
    func(this.getWriter(), callback);
  }

  public removeChildResource(name: string, callback) {
    let self = this;
    let todelete = [];
    let storePath = Utils.filename_dir(this.getStoragePath(name));

    let delete_paths = function (paths) {
      if (paths.length) {
        let path = paths.pop();
        self.repo.deleteFile('master', path, function () {
            delete_paths(todelete);
          })
          .catch(function () {
            callback(null);
          });
      }
      else {
        callback();
      }
    };

    let cc = 0;
    let collect_all = function (path) {
      self.repo.getContents('master', path, false)
        .then(function (response) {
          cc++;
          for (let i = 0; i < response.data.length; i++) {
            let item = response.data[i];
            let np = Utils.filename_path_append(path, item.name);
            if (item.type === 'dir') {
              collect_all(np);
            }
            else {
              todelete.push(np);
            }
          }
          cc--;
          if (cc === 0) {
            delete_paths(todelete);
          }
        })
        .catch(function (error) {
          callback(null);
        });
    };

    self.repo.getContents('master', storePath, false)
      .then(function (response) {
        for (let i = 0; i < response.data.length; i++) {
          let item = response.data[i];
          if (item.name === name) {
            let path = name;
            if (storePath) path = Utils.filename_path_append(storePath, name);
            if (item.type === 'dir') {
              collect_all(path);
              return;
            }
            else {
              todelete.push(path);
              delete_paths(todelete);
              return;
            }
          }
        }
        callback();
      })
      .catch(function (error) {
        callback(null);
      });

    if (this.childNames) this.childNames.splice(this.childNames.indexOf(name), 1);
    this.clearCachedResource(name);
  }

  public getWriter(): ContentWriter {
    let path = this.getStoragePath();
    if (this.isDirectory) {
      this.isDirectory = false;
    }

    this.loaded = false;
    return new GitHubResourceContentWriter(this.repo, path);
  }

  public read(writer: ContentWriter, callback: any) {
    if (this.isDirectory) {
      writer.end(callback);
    }
    else {
      let storePath = this.getStoragePath();
      let ct = this.getContentType();

      this.repo.getContents('master', storePath, false)
        .then(function (data) {
          let content = data.data.content;
          let encoding = data.data.encoding;

          writer.start(ct);
          writer.write(Utils.base642ArrayBuffer(content));
          writer.end(callback);
        })
        .catch(function (error) {
          writer.end(callback);
        });
    }
  }
}
