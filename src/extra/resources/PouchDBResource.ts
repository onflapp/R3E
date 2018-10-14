class PouchDBResourceContentWriter implements ContentWriter {
  protected db: any;
  protected id: string;
  protected ctype: string;
  protected buffer = [];

  constructor(db: any, id: string) {
    this.db = db;
    this.id = id;
  }

  public start(ctype: string) {
    this.ctype = ctype;
  }

  public write(data: any) {
    this.buffer.push(data);
  }

  public error(error: Error) {
    console.log(error);
  }

  public end(callback: any) {
    let self = this;
    self.db.get(this.id).then(function(doc) {
      let blob = new Blob(self.buffer, {type: self.ctype});
      self.db.putAttachment(doc._id, 'content', doc._rev, blob, self.ctype).then(function() {
        if (callback) callback();
      })
      .catch(function(err) {
        console.log(err);
        if (callback) callback();
      });
    })
    .catch(function(err) {
      console.log(err);
      if (callback) callback();
    });
  }
}

class PouchDBResource extends Resource {
  protected nodePath: string;
  protected nodeName: string;
  protected contentType: string;
  protected db: any;

  constructor(db: any, path?: string, name?: string) {
    super(name);

    this.nodePath = path?path:'';
    this.nodeName = name?name:'';
    this.contentType = null;
    this.db = db;
  }

  protected escape_name(n) {
	  return n.replace('_', '%5F');
  }

  protected unescape_name(n) {
	  return n.replace('%5F', '_');
  }

  protected make_key(path): string {
    if (path) {
      let level = path.split('/').length;
      return 'p:'+level+path;
    }
    else {
      return 'p:1/';
    }
  }

  public getRenderType(): string {
    return this.values['_rt'];
  }

  public getType(): string {
    if (this.contentType) return 'resource/content';
    else return 'resource/node';
  }

  public getSuperType(): string {
    if (this.getType() === 'resource/node') return null;
    else return 'resource/node';
  }

  public isContentResource(): boolean {
    if (this.contentType) return true;
    else return false;
  }

  public getContentType(): string {
    return this.contentType;
  }

  protected storeNode(callback) {
    let self = this;
    let path = Utils.filename_path_append(this.nodePath, this.nodeName);
    
    let id = this.make_key(path);

    let item = {
      _id:id
    };

    this.db.put(item).then(function() {
      callback(self);
    })
    .catch(function(err) {
      console.log(err);
      callback();
    });
  }

  public importContent(func, callback) {
    func(this.getWriter(), callback);
  }

  public importProperties(data: any, callback) {
    let self = this;
    let path = Utils.filename_path_append(this.nodePath, this.nodeName);
    let id = this.make_key(path);

    self.db.get(id).then(function(doc) {
      for (let key in data) {
        let v = data[key];
        key = key.trim();
        if (key.length === 0) continue;
        if (v) doc[key] = data[key];
        else delete doc[key];
      }

      self.db.put(doc).then(function() {
        callback();
      })
      .catch(function(err) {
        console.log(err);
        callback();
      });
    })
    .catch(function(err) {
        console.log(err);
        callback();
    });
  }

  public resolveChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    let self = this;
    let path = Utils.filename_path_append(this.nodePath, this.nodeName);

    if (walking) {
      let res = new PouchDBResource(self.db, path, name);
       callback(res);
    }
    else {
      let bpath = Utils.filename_path_append(path, name);
      let id = this.make_key(bpath);

      this.db.get(id).then(function(doc) {
        let res = new PouchDBResource(self.db, path, name);
        res.values = {};

        for (let key in doc) {
				  let val = doc[key];

          if (key === '_attachments') res.contentType = doc._attachments.content.content_type;
          else if (key.charAt(0) !== '_') res.values[key] = val;
				}

        callback(res);
      }).catch(function (err) {
        callback(null);
        console.log(err);
      });
    }
  }
  public createChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    let path = Utils.filename_path_append(this.nodePath, this.nodeName);
    let res = new PouchDBResource(this.db, path, name);

    if (walking) callback(res);
    else {
      res.storeNode(callback);
    }
  }

  public removeChildResource(name: string, callback) {
    let self = this;
    let path = Utils.filename_path_append(this.nodePath, this.nodeName);
        path = Utils.filename_path_append(path, name);

    let id = this.make_key(path);

    self.db.get(id).then(function(doc) {
      self.db.remove(doc);
    })
    .then(function (result) {
      callback();
    })
    .catch(function (err) {
      callback();
      console.log(err);
    }); 
  }

  public listChildrenNames(callback: ChildrenNamesCallback) {
    let path = Utils.filename_path_append(this.nodePath, this.nodeName)+'/';
    let id = this.make_key(path);

    this.db.allDocs({
      include_docs: false,
      attachments: false,
      startkey: id,
      endkey: id+'\ufff0'
    })
    .then(function (result) {
      let rv = [];
      for (var i = 0; i < result.rows.length; i++) {
				let it = result.rows[i];
        rv.push(Utils.filename(it.id));
			}
      callback(rv);
    })
    .catch(function (err) {
      callback(null);
      console.log(err);
    });
  }

  public getWriter(): ContentWriter {
    let path = Utils.filename_path_append(this.nodePath, this.nodeName);
    let id = this.make_key(path);

    return new PouchDBResourceContentWriter(this.db, id);
  }

  public read(writer: ContentWriter, callback: any) {
    let path = Utils.filename_path_append(this.nodePath, this.nodeName);
    let id = this.make_key(path);
    let self = this;

    
    self.db.get(id).then(function(doc) {
      self.db.getAttachment(doc._id, 'content', {rev:doc._rev}).then(function(data) {
        writer.start(data.type);
        writer.write(data);
        writer.end(callback);
      })
      .catch(function(err) {
        console.log(err);
        writer.end(callback);
      });
    })
    .catch(function(err) {
      console.log(err);
      writer.end(callback);
    });
  }  
}
