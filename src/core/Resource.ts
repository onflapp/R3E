interface ResourceCallback {
  (resource: Resource): void
}

interface ChildrenNamesCallback {
  (names: Array < string > ): void
}

class Data {
  public values: any;

  constructor(obj ? : any) {
    this.values = obj ? obj : {};
  }

  public importProperties(data: any, callback) {
    for (let k in data) {
      let v = data[k];

      if (k.charAt(0) === ':') {
        continue;
      }
      else {
        if (v) this.values[k] = v;
        else delete this.values[k];
      }
    }
    callback();
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

  public getPropertyNames(): Array < string > {
    var rv = [];
    for (var k in this.values) {
      var v = this.values[k];
      if (typeof v === 'object' || typeof v === 'function' || k.charAt(0) === '_') {}
      else {
        rv.push(k);
      }
    }
    return rv;
  }

  public getProperty(name: string): any {
    return this.values[name];
  }

  public getRenderTypes(): Array < string > {
    let rv = [];
    let rt = this.values['_rt'];

    if (rt) rv.push(rt);
    rv.push('any');

    return rv;
  }

  public wrap(wrapper) {
    for (let name in wrapper) {
      let func = wrapper[name];
      if (typeof func === 'function') {
        this[name] = func;
      }
    }

    return this;
  }
}

abstract class Resource extends Data implements ContentReader {
  public static IO_TIMEOUT = 10000000;
  public static STORE_CONTENT_PROPERTY = '_content';
  public static STORE_RENDERTYPE_PROPERTY = '_rt';
  public static STORE_RESOURCETYPE_PROPERTY = '_pt';

  protected resourceName: string;

  constructor(name ? : string) {
    super({});
    this.resourceName = name ? name : '';
  }

  public resolveItself(callback) {
    if (callback) callback(this);
  }

  public getType(): string {
    return this.getSuperType();
  }

  public getSuperType(): string {
    return 'resource/node';
  }

  public getName(): string {
    return this.resourceName;
  }

  public getRenderType(): string {
    return null;
  }

  public getRenderTypes(): Array < string > {
    let rv = [];
    let rt = this.getRenderType();
    let st = this.getSuperType();
    let ct = this.getContentType();
    let pt = this.getType();

    if (rt) rv.push(rt);
    if (ct) rv.push('mime/' + ct);
    rv.push(pt);
    if (st && st !== pt) rv.push(st);

    return rv;
  }

  public abstract importContent(func, callback): void;
  public abstract resolveChildResource(name: string, callback: ResourceCallback, walking ? : boolean): void;
  public abstract allocateChildResource(name: string, callback: ResourceCallback, walking ? : boolean): void;
  public abstract removeChildResource(name: string, callback);
  public abstract listChildrenNames(callback: ChildrenNamesCallback);

  public resolveOrAllocateChildResource(name: string, callback: ResourceCallback, walking ? : boolean): void {
    let self = this;
    this.resolveChildResource(name, function (res) {
      if (res) {
        callback(res);
      }
      else {
        self.allocateChildResource(name, callback);
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

    if (this.getSuperType() !== this.getType()) {
      rv[Resource.STORE_RESOURCETYPE_PROPERTY] = this.getType();
    }

    if (this.isContentResource()) {
      rv[Resource.STORE_CONTENT_PROPERTY] = function (writer, callback) {
        self.read(writer, callback);
      };
    }

    if (ct) {
      rv['_ct'] = ct;
    }

    callback(new Data(rv));
  }

  public exportChilrenResources(level, writer: ContentWriter, incSource ? : boolean): void {
    let self = this;
    let processing = 0;

    let done = function () {
      if (processing === 0) {
        writer.end(null);
        processing = -1;
      }
    };

    let export_children = function (path, name, res) {
      processing++; //children
      processing++; //data

      res.exportData(function (data: Data) {
        if (name) data.values[':name'] = name;
        if (path) data.values[':path'] = path;

        writer.write(data);
        processing--; //data
        done();
      });

      res.listChildrenNames(function (names) {
        processing += names.length; //names

        for (var i = 0; i < names.length; i++) {
          let name = names[i];

          res.resolveChildResource(name, function (r) {
            let rpath = Utils.filename_path_append(path, name);

            export_children(rpath, name, r);
            processing--; //names
          });
        }

        processing--; //children
        done();
      });
    };

    writer.start('object/javascript');
    export_children(incSource ? this.getName() : '', this.getName(), this);
  }

  public importData(data: Data, callback) {
    let processing = 0;
    let ffunc = null;
    let ct = null;
    let mime = Utils.filename_mime(this.getName());

    let done = function () {
      if (processing === 0 && callback) callback();
    }

    processing++;
    let props = {};
    for (let k in data.values) {
      let v = data.values[k];

      if (k === Resource.STORE_CONTENT_PROPERTY && typeof v === 'function') {
        processing++;
        ffunc = v;
      }
      else if (k === Resource.STORE_CONTENT_PROPERTY && typeof v === 'string') {
        processing++;
        ct = data.values['_ct'];
        if (!ct) ct = mime;

        ffunc = function (writer, callback) {
          writer.start(ct ? ct : 'text/plain');
          writer.write(v);
          writer.end(callback);
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
      if (ct && ct.indexOf('base64:') === 0) {
        props['_ct'] = ct.substr(7);
      }

      this.importContent(ffunc, function () {
        processing--;
        done();
      });
    }

    this.importProperties(props, function () {
      processing--;
      done();
    });

  }

  public listChildrenResources(callback: any) {
    let self = this;
    this.listChildrenNames(function (ls) {
      let rv = [];
      let sz = 0;
      if (ls && ls.length > 0) {
        for (var i = 0; i < ls.length; i++) {
          let name = ls[i];
          self.resolveChildResource(name, function (res) {
            sz++;
            if (res) rv.push(res);
            if (sz === ls.length) {
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

  public read(writer: ContentWriter, callback: any) {
    if (writer) writer.end(callback);
  }
}
