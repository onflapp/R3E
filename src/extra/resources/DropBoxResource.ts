class DropBoxResourceContentWriter implements ContentWriter {
  protected dbx;
  protected filePath: string;
  protected buffer = [];

  constructor(dbx: any, filePath: string) {
    this.dbx = dbx;
    this.filePath = filePath;
  }

  public start(ctype: string) {
  }

  public write(data: any) {
    this.buffer.push(data);
  }

  public error(error: Error) {
    console.log(error);
  }

  public end(callback: any) {
    let self = this;
    let offset = 0;
    let fileid = null;

    let finish = function() {
      self.dbx.filesUploadSessionFinish({
        cursor: {
				  session_id: fileid.session_id,
          offset: offset
        },
				commit: {
					path: self.filePath,
					mode: 'overwrite'
        }
      })
      .then(function(response) {
        if (callback) callback();
      })
      .catch(function (err) {
        console.log(err);
        if (callback) callback();
      });
    };

    let store_chunk = function(data) {
      self.dbx.filesUploadSessionAppend({
        contents: data,
        offset: offset,
        session_id: fileid.session_id
      })
      .then(function(response) {
        if (data.length) offset += data.length;
        else if (data.byteLength) offset += data.byteLength;

        if (self.buffer.length > 0) store_chunk(self.buffer.shift());
        else finish();
      })
      .catch(function (err) {
        console.log(err);
        if (callback) callback();
      });
    };

    this.dbx.filesUploadSessionStart({
      contents: null,
			close: false
    })
    .then(function (response) {
			fileid = response;
      store_chunk(self.buffer.shift());
    })
    .catch(function (err) {
      console.log(err);
    });
  }
}

class DropBoxResource extends Resource {
  protected dbx: any;
  protected filePath: string;
  protected isDirectory: boolean = true;
  protected resources = null;

  constructor(dbx: any, path?: string, name?: string) {
    super(name);

    this.dbx = dbx;
    this.filePath = path?path:'';
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
    return this.values['_rt'];
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

  protected readResources(callback) {
    let self = this;
    if (self.resources) {
      callback(self.resources);
    }
    else if (self.isDirectory) {
      self.dbx.filesListFolder({path: this.filePath})
      .then(function(response) {
        self.resources = {};

        for (let i = 0; i < response.entries.length; i++) {
          let item = response.entries[i];
          let name = item.name;
          if (name.charAt(0) === '.') continue;

          let path = Utils.filename_path_append(self.filePath, name);
          let res = new DropBoxResource(self.dbx, path, name);
          
          if (item['.tag'] === 'file') res.isDirectory = false;
          else res.isDirectory = true;

          self.resources[name] = res;
        }
        callback(self.resources);
      })
      .catch(function(error) {
        callback();
      });
    }
    else {
      callback();
    }
  }

  public createChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    let self = this;
    this.readResources(function(rls) {
      let path = Utils.filename_path_append(self.filePath, name);
      let res = new DropBoxResource(self.dbx, path, name);

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

    this.dbx.filesUpload({
      contents:'xxx',
      path: path,
      mute: true,
      mode: 'overwrite'
    })
    .then(function(response) {
      callback();
    })
    .catch(function(error) {
      callback(null);
    });
  }

  public removeChildResource(name: string, callback) {
    this.resources = null;

    let path = Utils.filename_path_append(this.filePath, name);
    this.dbx.filesDelete({path:path})
    .then(function(response) {
      callback();
    })
    .catch(function(error) {
      callback(null);
    });
  }

  public resolveChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    if (walking) {
      if (this.resources) {
        callback(this.resources[name]);
      }
      else {
        this.resources = {};
        let path = Utils.filename_path_append(this.filePath, name);
        let res = new DropBoxResource(this.dbx, path, name);
        this.resources[name] = res;
        callback(res);
      }
    }
    else {
      this.readResources(function(rls) {
        if (rls) callback(rls[name]);
        else callback(null);
      });
    }
  }

  public listChildrenNames(callback: ChildrenNamesCallback) {
    this.readResources(function(rls) {
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

    return new DropBoxResourceContentWriter(this.dbx, this.filePath);
  }

  public read(writer: ContentWriter, callback: any) {
    if (this.isDirectory) {
      writer.end(callback);
    }
    else {
      let path = this.filePath;
      let ct = this.getContentType();
      
      this.dbx.filesDownload({path:this.filePath})
      .then(function(data) {
        let reader = new FileReader();
        reader.onload = function(event){
          writer.start(ct);
          writer.write(reader.result);
          writer.end(callback);
        };
        reader.readAsArrayBuffer(data.fileBlob) ; 
      })
      .catch(function(error) {
        writer.end(callback);
      });
    }
  }  
}
