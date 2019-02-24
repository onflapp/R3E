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
    let data = this.buffer.join('');
    let opts = {
      encode: true
    };

    this.repo.writeFile('master', this.filePath, data, '', opts, function () {
      callback();
    });
  }
}

class GitHubResource extends Resource {
  protected repo: any;
  protected filePath: string;
  protected isDirectory: boolean = true;
  protected resources = null;

  constructor(repo: any, path ? : string, name ? : string) {
    super(name);

    this.repo = repo;
    this.filePath = path ? path : '';
  }

  public getType(): string {
    if (this.isDirectory) return 'resource/node';
    else return 'resource/content';
  }

  public getRenderType(): string {
    return this.values['_rt'];
  }

  protected makeMetadataPath(nm ? : string): string {
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

  protected readResources(callback) {
    let self = this;
    if (self.resources) {
      callback(self.resources);
    }
    else if (self.isDirectory) {
      self.repo.getContents('master', this.filePath, false)
        .then(function (response) {
          self.resources = {};

          for (let i = 0; i < response.data.length; i++) {
            let item = response.data[i];
            let name = item.name;
            if (name.charAt(0) === '.') continue;

            let path = name;
            if (self.filePath) path = Utils.filename_path_append(self.filePath, name);

            let res = new GitHubResource(self.repo, path, name);

            if (item['type'] === 'file') res.isDirectory = false;
            else if (item['type'] === 'dir') res.isDirectory = true;
            else continue;

            self.resources[name] = res;
          }
          callback(self.resources);
        })
        .catch(function (error) {
          callback();
        });
    }
    else {
      callback();
    }
  }

  public allocateChildResource(name: string, callback: ResourceCallback, walking ? : boolean): void {
    let self = this;
    this.readResources(function (rls) {

      let path = name;
      if (self.filePath) path = Utils.filename_path_append(self.filePath, name);
      let res = new GitHubResource(self.repo, path, name);

      if (!self.resources) self.resources = {};
      self.resources[name] = res;
      callback(res);
    });
  }

  public importContent(func, callback) {
    func(this.getWriter(), callback);
  }

  public importProperties(data: any, callback) {
    let self = this;
    let path = this.makeMetadataPath();
    let str = JSON.stringify(data);
    let opts = {
      encode: true
    };

    this.repo.writeFile('master', path, str, '', opts, function () {
      callback();
    });
  }

  public removeChildResource(name: string, callback) {
    let self = this;
    let todelete = [];

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

    self.repo.getContents('master', this.filePath, false)
      .then(function (response) {
        for (let i = 0; i < response.data.length; i++) {
          let item = response.data[i];
          if (item.name === name) {
            let path = name;
            if (self.filePath) path = Utils.filename_path_append(self.filePath, name);
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


    this.resources = null;
  }

  public resolveChildResource(name: string, callback: ResourceCallback, walking ? : boolean): void {
    if (walking) {
      if (this.resources) {
        callback(this.resources[name]);
      }
      else {
        this.resources = {};
        let path = name;
        if (this.filePath) path = Utils.filename_path_append(this.filePath, name);

        let res = new GitHubResource(this.repo, path, name);
        this.resources[name] = res;
        callback(res);
      }
    }
    else {
      this.readResources(function (rls) {
        if (rls) callback(rls[name]);
        else callback(null);
      });
    }
  }

  public listChildrenNames(callback: ChildrenNamesCallback) {
    this.readResources(function (rls) {
      if (!rls) callback([]);
      else {
        let ls = [];
        for (let name in rls) {
          ls.push(name);
        }
        callback(ls);
      }
    });
  }

  public isContentResource(): boolean {
    return !this.isDirectory;
  }

  public getContentType(): string {
    if (this.isDirectory) return null;

    let contentType = this.values['_ct'];
    if (contentType) return contentType;
    else return Utils.filename_mime(this.getName());
  }

  public getWriter(): ContentWriter {
    if (this.isDirectory) {
      this.isDirectory = false;
    }

    return new GitHubResourceContentWriter(this.repo, this.filePath);
  }

  public read(writer: ContentWriter, callback: any) {
    if (this.isDirectory) {
      writer.end(callback);
    }
    else {
      let path = this.filePath;
      let ct = this.getContentType();

      this.repo.getContents('master', this.filePath, false)
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
