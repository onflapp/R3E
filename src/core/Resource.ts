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
  public static STORE_RENDERSUPERTYPE_PROPERTY = '_st';
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

  public getRenderSuperType(): string {
    return null;
  }

  public getRenderTypes(): Array < string > {
    let rv = [];
    let rt = this.getRenderType();
    let st = this.getRenderSuperType();
    let nt = this.getSuperType();
    let ct = this.getContentType();
    let pt = this.getType();

    if (rt) rv.push(rt);
    if (st) rv.push(st);
    if (ct) rv.push('mime/' + ct);
    rv.push(pt);
    if (nt && nt !== pt) rv.push(nt);

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

    if (this.getRenderSuperType()) {
      rv[Resource.STORE_RENDERSUPERTYPE_PROPERTY] = this.getRenderSuperType();
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

  public importData(data: Data, callback) {
    let processingf = 0;
    let processingp = 0;
    let ffunc = null;
    let ct = null;
    let self = this;
    let mime = Utils.filename_mime(this.getName());

    let done = function () {
      if (processingf === 0 && processingp === 0 && callback) callback();
    }

    let props = {};
    for (let k in data.values) {
      let v = data.values[k];

      if (k === Resource.STORE_CONTENT_PROPERTY && typeof v === 'function') {
        ffunc = v;
      }
      else if (k === Resource.STORE_CONTENT_PROPERTY && typeof v === 'string') {
        ct = data.values['_ct'];
        if (!ct) ct = mime;

        ffunc = function (writer, cb) {
          writer.start(ct ? ct : 'text/plain');
          writer.write(v);
          writer.end(cb);
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

      processingf++;
      this.importContent(ffunc, function () {
        processingf--;
        done();
      });
    }
    else {
      processingp++;
      this.importProperties(props, function () {
        processingp--;
        done();
      });
    }
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

  public getContentSize(): number {
    return -1;
  }

  public getWriter(): ContentWriter {
    return null;
  }

  public read(writer: ContentWriter, callback: any) {
    if (writer) writer.end(callback);
  }
}
