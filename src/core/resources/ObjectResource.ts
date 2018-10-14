class ObjectResource extends Resource {

  constructor(name: string, obj: any) {
    super(name);
    if (!obj) throw new Error('no object for ObjectResource');

    this.values = obj;
  }

  public getRenderType(): string {
    let rt = this.values['_rt'];
    return rt?rt:null;
  }

  public resolveChildResource(name: string, callback: ResourceCallback, walking?: boolean): void {
    let rv = this.values[name];

    if (typeof rv === 'object') {
      if (rv['_content'] || rv['_content64'] || rv['_pt'] === 'resource/content') callback(new ObjectContentResource(name, rv));
      else callback(new ObjectResource(name, rv));
    }
    else {
      callback(null);
    }
  }

  public createChildResource(name: string, callback: ResourceCallback): void {
    let rv = {};
    this.values[name] = rv;
    callback(new ObjectResource(name, rv));
  }

  public listChildrenNames(callback: ChildrenNamesCallback) {
    var rv = [];
    for (var k in this.values) {
      var v = this.values[k];
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
        if (v) this.values[k] = v;
        else delete this.values[k];
      }
    }
    callback();
  }

  public importContent(func, callback) {
    let res = new ObjectContentResource(this.resourceName, this.values);
    func(res.getWriter(), callback);
  }

  public removeChildResource(name: string, callback) {
    delete this.values[name];
    if (callback) callback();
  }
}

class ObjectContentResourceWriter implements ContentWriter {
  private values;
  private isbase64;

  constructor(obj) {
    this.values = obj;
  }

  public start(ctype: string) {
    if (ctype && ctype.indexOf('base64:') === 0) {
      this.values['_ct'] = ctype.substr(7);
      this.isbase64 = true;
    }
    else this.values['_ct'] = ctype;

    this.values['_pt'] = 'resource/content';
  }
  
  public write(data: any) {
    if (data instanceof ArrayBuffer) {
      this.values['_content64'] = Utils.ArrayBuffer2base64(data);
    }
    else if (this.isbase64) {
      this.values['_content64'] = data;
    }
    else {
      this.values['_content'] = data;
    }
  }

  public error(error: Error) {
  }

  public end(callback: any) {
    if (callback) callback();
  }
}

class ObjectContentResource extends ObjectResource {
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
    let contentType = this.values['_ct'];
    return contentType;
  }

  public getWriter(): ContentWriter {
    return new ObjectContentResourceWriter(this.values);
  }

  public read(writer: ContentWriter, callback: any): void {
    let data = this.values;
    let contentType = this.getContentType();

    writer.start(contentType?contentType:'text/plain');

    if (data['_content'])              writer.write(data['_content']);
    else if (data['_content64'])       writer.write(Utils.base642ArrayBuffer(data['_content64']));
    else if (typeof data === 'string') writer.write(data);
    else                               writer.write(null);

    writer.end(callback);
  }

}
