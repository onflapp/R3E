interface ResourceCallback {
  (resource: Resource): void
}

interface ChildrenNamesCallback {
  (names: Array<string>): void
}

abstract class Resource implements ContentReader {
  public static IO_TIMEOUT = 2000;
  public static STORE_CONTENT_PROPERTY = '_content';
  public static STORE_RENDERTYPE_PROPERTY = '_rt';

  protected resourceName: string;

  constructor(name?: string) {
    this.resourceName = name?name:'';
  }

  public resolveItself(callback) {
    if (callback) callback(this);
  }

  public getType(): string {
    return 'resource/node';
  }

  public getSuperType(): string {
    return null;
  }

  public getName(): string {
    return this.resourceName;
  }

  public getRenderType(): string {
    return null;
  }

  public getRenderTypes(): Array<string> {
    let rv = [];
    let rt = this.getRenderType();
    let st = this.getSuperType();

    if (rt) rv.push(rt);
    rv.push(this.getType());
    if (st) rv.push(st);

    return rv;
  }

  public getProperties() {
    let map = {};
    let names = this.getPropertyNames();
    for (let i = 0; i < names.length; i++) {
      let n = names[i];
      map[n] = this.getProperty(n);
    }

    return map;
  }

  public abstract getPropertyNames(): Array<string>;
  public abstract getProperty(name: string): any;
  public abstract importProperties(data: any, callback);
  public abstract resolveChildResource(name: string, callback: ResourceCallback, walking?: boolean): void;
  public abstract createChildResource(name: string, callback: ResourceCallback, walking?: boolean): void;
  public abstract removeChildResource(name: string, callback);
  public abstract listChildrenNames(callback: ChildrenNamesCallback);

  public resolveOrCreateChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    let self = this;
    this.resolveChildResource(name, function(res) {
      if (res) {
        callback(res);
      }
      else {
        self.createChildResource(name, callback);
      }
    }, walking);
  }

  public exportData(callback: any): void {
    let self = this;
    let names = this.getPropertyNames();
    let ct = this.getContentType();
    let rv = {};

    for (var i = 0; i < names.length; i++) {
      let name = names[i];
      let value = this.getProperty(name);

      if (value) rv[name] = value;
		}

    if (this.getRenderType()) {
      rv[Resource.STORE_RENDERTYPE_PROPERTY] = this.getRenderType();
    }

    if (this.isContentResource()) {
      rv[Resource.STORE_CONTENT_PROPERTY] = function(res, callback) {
        self.read(res.getWriter());
        callback();
      };
    }

    if (ct) {
      rv['_ct'] = ct;
    }

    callback(rv);
  }

  public exportChilrenResources(level, writer: ContentWriter): void {
    let self = this;
    let processing = 0;

    let done = function() {
      if (processing === 0) {
        writer.end();
        processing = -1;
      }
    };

    let export_children = function(path, name, res) {
      processing++; //children
      processing++; //data

      res.exportData(function(data) {
        if (name) data[':name'] = name;
        if (path) data[':path'] = path;

        writer.write(data);
        processing--; //data
        done();
      });

      res.listChildrenNames(function(names) {
        processing += names.length; //names

        for (var i = 0; i < names.length; i++) {
					let name = names[i];

          res.resolveChildResource(name, function(r) {
            let rpath = Utils.filename_path_append(path, name);

            export_children(rpath, name, r);
            processing--; //names
          });
				}

        processing--; //children
        done();
      });
    };

    writer.start('object');
    export_children('', this.getName(), this);
  }

  public importData(data: any, callback) {
    let processing = 0;
    let ffunc = null;
    let done = function() {
      if (processing === 0 && callback) callback();
    }

    processing++;
    let props = {};
    for (let k in data) {
      let v = data[k];

      if (k === Resource.STORE_CONTENT_PROPERTY && typeof v === 'function') {
        processing++;
        ffunc = v;
      }
      else if (k === Resource.STORE_CONTENT_PROPERTY && typeof v === 'string') {
        processing++;
        let ct = data['_ct'];
        ffunc = function(res, callback) {
          let writer = res.getWriter();
          writer.start(ct?ct:'text/plain');
          writer.write(v);
          writer.end();
          callback();
        };
      }
      else if (typeof v === 'function' || typeof v === 'object') {
        continue;
      }
      else if (k.charAt(0) === ':') {
        continue;
      }
      else {
        props[k] = v;
      }
    }

    if (ffunc) {
      this.importContent(ffunc, function() {
        processing--;
        done();
      });
    }

    this.importProperties(props, function() {
      processing--;
      done();
    });

  }

  public importContent(func, callback) {
    callback();
  }

  public listChildrenResources(callback: any) {
    let self = this;
    this.listChildrenNames(function(ls) {
      let rv = [];
      if (ls.length > 0) {
        for (var i = 0; i < ls.length; i++) {
          let name = ls[i];
          self.resolveChildResource(name, function(res) {
            rv.push(res);
            if (rv.length === ls.length) {
              callback(rv);
            }
          });
        }
      }
      else {
        callback([]);
      }
    });
  }

  public isContentResource(): boolean {
    return false;
  }

  public getContentType(): string {
    return null;
  }

  public getWriter(): ContentWriter {
    return null;
  }

  public read(writer: ContentWriter) {
    if (writer) writer.end();
  }
}
