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
    let blob = null;
    
    if (typeof window !== 'undefined') {
      blob = new Blob(self.buffer, {
        type: self.ctype
      });
    }
    else {
      if (typeof this.buffer[0] === 'string') blob = new Buffer(this.buffer.join(''));
      else if (this.buffer[0] instanceof Buffer) blob = Buffer.concat(this.buffer);
      else blob = new Buffer('');
    }

    let update_doc = function(doc) {
      self.db.putAttachment(doc._id, 'content', doc._rev, blob, self.ctype).then(function () {
        if (callback) callback();
      })
      .catch(function (err) {
        console.log(err);
        if (callback) callback();
      });
    };

    self.db.get(this.id).then(function (doc) {
        update_doc(doc);
      })
      .catch(function (err) {
        if (err.status === 404) {
          update_doc({
            _id:self.id
          });
        }
        else {
          console.log(err);
          if (callback) callback();
        }
      });
  }
}

class PouchDBResource extends StoredResource {
  protected contentType: string;
  protected db: any;

  constructor(db: any, base ? : string, name ? : string) {
    super(name ? name : '', base ? base : '');

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
      return 'p:' + level + path;
    }
    else {
      return 'p:1/';
    }
  }

  public getContentType(): string {
    return this.contentType;
  }

  protected ensurePathExists(path: string, callback) {
    callback(true);
  }

  public storeChildrenNames(callback) {
    callback();
  }

  protected storeProperties(callback) {
    let self = this;
    let path = this.getStoragePath();
    let id = this.make_key(path);

    let update_doc = function (doc) {
      for (let key in self.values) {
        let v = self.values[key];
        key = key.trim();
        if (v && key) doc[self.escape_name(key)] = v;
      }

      self.db.put(doc).then(function () {
          callback(true);
        })
        .catch(function (err) {
          console.log(err);
          callback(false);
        });
    };

    self.db.get(id)
      .then(function (doc) {
        for (let key in doc) {
          if (key.charAt(0) === '_') continue;
          if (!self.values[key]) delete doc[key];
        }

        update_doc(doc);
      })
      .catch(function (err) {
        //not found, new?
        if (err.status === 404) {
          let doc = {
            _id: id
          };

          update_doc(doc);
        }
        else {
          console.log(err);
          callback(false);
        }
      });

  }

  protected loadProperties(callback) {
    let self = this;
    let path = this.getStoragePath();
    let id = this.make_key(path);

    self.db.get(id)
      .then(function (doc) {
        for (let key in doc) {
          let v = doc[key];
          if (key.charAt(0) === '_') continue;
          if (v) self.values[self.unescape_name(key)] = v;
        }
        if (doc._attachments) {
          self.contentType = doc._attachments.content.content_type;
          self.contentSize = doc._attachments.content.length;
          self.isDirectory = false;
        }
        else {
          self.contentSize = 0;
        }

        callback(true);
      })
      .catch(function (err) {
        if (err.status === 404 && path === '') { //special case for the root
          callback(true);
        }
        else {
          console.log(err);
          callback(false);
        }
      });
  }

  protected makeNewResource(name: string) {
    let path = this.getStoragePath();
    return new PouchDBResource(this.db, path, name);
  }

  public removeChildResource(name: string, callback) {
    let self = this;
    let path = this.getStoragePath(name);
    let id = this.make_key(path);

    super.removeChildResource(name, function () {
      self.db.get(id)
        .then(function (doc) {
          self.db.remove(doc);
        })
        .then(function (result) {
          callback();
        })
        .catch(function (err) {
          callback();
          console.log(err);
        });
    });
  }

  public loadChildrenNames(callback: ChildrenNamesCallback) {
    let path = this.getStoragePath() + '/';
    let id = this.make_key(path);

    this.db.allDocs({
        include_docs: false,
        attachments: false,
        startkey: id,
        endkey: id + '\ufff0'
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
    let path = this.getStoragePath();
    let id = this.make_key(path);

    this.loaded = false;

    return new PouchDBResourceContentWriter(this.db, id);
  }

  public read(writer: ContentWriter, callback: any) {
    let path = this.getStoragePath();
    let id = this.make_key(path);
    let self = this;


    self.db.get(id).then(function (doc) {
        self.db.getAttachment(doc._id, 'content', {
            rev: doc._rev
          }).then(function (data) {
            writer.start(data.type);
            writer.write(data);
            writer.end(callback);
          })
          .catch(function (err) {
            console.log(err);
            writer.end(callback);
          });
      })
      .catch(function (err) {
        console.log(err);
        writer.end(callback);
      });
  }
}
