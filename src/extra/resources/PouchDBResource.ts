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

    //---
    let update_doc = function(doc) {
      self.db.put(doc)
        .then(function (rv) {
          update_data({_id:rv.id,_rev:rv.rev});
        })
        .catch(function (err) {
          console.log('X '+doc._id);
          console.log(err);
          if (callback) callback();
        });
    };

    //---
    let update_data = function(doc) {
      self.db.putAttachment(doc._id, 'content', doc._rev, blob, self.ctype)
        .then(function () {
          if (callback) callback();
        })
        .catch(function (err) {
          console.log('A '+doc._id);
          console.log(err);
          if (callback) callback();
        });
    };

    self.db.get(this.id)
      .then(function (doc) {
        update_data(doc);
      })
      .catch(function (err) {
        if (err.status === 404) {
          update_doc({ _id:self.id });
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

  protected escape_path(n) {
    return n.replace(/\//g, '!');
  }

  protected unescape_path(n) {
    return n.replace(/!/g, '/');
  }

  protected make_key(path): string {
    if (path) {
      let level = path.split('/').length;

      if (level > 1000) level = 999;
      else if (level <  9) level = '00'+level;
      else if (level < 99) level = '0'+level;

      return this.escape_path('p:' + level + path);
    }
    else {
      return this.escape_path('p:001/');
    }
  }

  protected ensurePathExists(path: string, callback) {
    let self = this;
    let p = path.split('/');
    let b = [];
    if (p.length > 2) {
      b.push(p.shift());

      let update_node = function(id, cb) {
        self.db.put({_id:id})
          .then(function() {
            cb();
          })
          .catch(function(err) {
            //console.log(err);
            cb();
          });
      };

      let get_node = function() {
        if (p.length > 0) {
          b.push(p.shift());
          let bp = b.join('/');
          let id = self.make_key(bp);

          self.db.get(id)
            .then(function() {
              get_node();
            })
            .catch(function (err) {
              update_node(id, get_node);
            });
        }
        else {
          callback(true);
        }
      };

      get_node();
    }
    else {
      callback(true);
    }
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

      self.db.put(doc)
        .then(function () {
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
        if (err.status === 404) {
          let doc = { _id: id };
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
          callback(false);
        }
      });
  }

  protected makeNewResource(name: string) {
    let path = this.getStoragePath();
    let res = new PouchDBResource(this.db, path, name);

    res.setEnableResourceCache(this.enableCache);
  }

  public removeChildResource(name: string, callback) {
    let self = this;
    let path = this.getStoragePath(name);
    let id = this.make_key(path);

    super.removeChildResource(name, function () {

      //---
      let remove_attachment = function(doc) {
        self.db.removeAttachment(doc._id, 'content', doc._rev)
          .then(function() {
            console.log('done');
          })
          .catch(function(err) {
            console.log('4');
            console.log(err);
          });
      };

      //---
      let remove_docs = function(todelete) {
        self.db.bulkDocs(todelete)
          .then(function() {
            callback();
          })
          .catch(function(err) {
            console.log('2');
            console.log(err);
            callback();
          });
      };

      self.db.allDocs({
          include_docs: true,
          attachments: false
        })
        .then(function(rv) {
          let todelete = [];
          for (var i = 0; i < rv.rows.length; i++) {
            var it = rv.rows[i];
            var key = self.unescape_path(it.id.substr(5));
            if (key.indexOf(path) === 0) {
              it.doc._deleted = true;
              todelete.push(it.doc);
              console.log('D:' + key);

              //remove_attachment(it.doc);
            }
          }

          remove_docs(todelete);
        })
        .catch(function(err) {
          console.log('1');
          console.log(err);
          callback();
        });
    });
  }

  public loadChildrenNames(callback: ChildrenNamesCallback) {
    let self = this;
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
          rv.push(Utils.filename(self.unescape_path(it.id)));
        }
        callback(rv);
      })
      .catch(function (err) {
        callback([]);
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
