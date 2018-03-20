class ObjectResource extends Resource {
  protected rootObject: any;

  constructor(name: string, obj: any) {
    super(name);
    if (!obj) throw new Error('no object for ObjectResource');

    this.rootObject = obj;
  }

  public getRenderType(): string {
    let rt = this.rootObject['_rt'];
    return rt?rt:null;
  }

  public resolveChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    let rv = this.rootObject[name];

    if (!rv) {
      callback(null);
    }
    else {
      if (rv['_content'] || rv['_content64'] || rv['_rt'] === 'resource/content') callback(new ObjectContentResource(name, rv));
      else callback(new ObjectResource(name, rv));
    }
  }

  public createChildResource(name: string, callback: ResourceCallback): void {
    let rv = {};
    this.rootObject[name] = rv;
    callback(new ObjectResource(name, rv));
  }

  public getPropertyNames(): Array<string> {
    var rv = [];
    for (var k in this.rootObject) {
      var v = this.rootObject[k];
      if (typeof v === 'object' || typeof v === 'function' || k.charAt(0) === '_') {
      }
      else {
        rv.push(k);
      }
    }
    return rv;
  }

  public getProperty(name: string): any {
    return this.rootObject[name];
  }

  public listChildrenNames(callback: ChildrenNamesCallback) {
    var rv = [];
    for (var k in this.rootObject) {
      var v = this.rootObject[k];
      if (typeof v === 'object' && k.charAt(0) !== '_') {
        rv.push(k);
      }
    }
    callback(rv);
  }

  public importProperties(data: any, callback) {
    for (let k in data) {
      let v = data[k];

      if (k.charAt(0) === ':') {
        continue;
      }
      else {
        if (v) this.rootObject[k] = v;
        else delete this.rootObject[k];
      }
    }
    callback();
  }

  public importContent(func, callback) {
    let res = new ObjectContentResource(this.resourceName, this.rootObject);
    func(res, callback);
  }

  public removeChildResource(name: string, callback) {
    delete this.rootObject[name];
    if (callback) callback();
  }
}

class ObjectContentResourceWriter implements ContentWriter {
  private rootObject;

  constructor(obj) {
    this.rootObject = obj;
  }

  public start(ctype: string) {
    this.rootObject['_ct'] = ctype;
  }
  
  public write(data: any) {
    if (data instanceof ArrayBuffer) {
      this.rootObject['_content64'] = Utils.ArrayBuffer2base64(data);
    }
    else {
      this.rootObject['_content'] = data;
    }
  }

  public error(error: Error) {
  }

  public end() {
  }
}

class ObjectContentResource extends ObjectResource {
  protected rootObject: any;

  constructor(name: string, obj: any) {
    super (name, obj);
  }

  public getType(): string {
    return 'resource/content';
  }

  public getSuperType(): string {
    return 'resource/node';
  }  

  public isContentResource(): boolean {
    return true;
  }

  public getContentType(): string {
    let contentType = this.rootObject['_ct'];
    return contentType;
  }

  public getWriter(): ContentWriter {
    return new ObjectContentResourceWriter(this.rootObject);
  }

  public read(writer: ContentWriter): void {
    let data = this.rootObject;
    let contentType = this.getContentType();

    writer.start(contentType?contentType:'text/plain');

    if (data['_content'])              writer.write(data['_content']);
    else if (data['_content64'])       writer.write(Utils.base642ArrayBuffer(data['_content64']));
    else if (typeof data === 'string') writer.write(data);
    else                               writer.write(null);

    writer.end();
  }

}
