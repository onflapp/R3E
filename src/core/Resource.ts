interface ResourceCallback {
  (resource: Resource): void
}

interface ChildrenNamesCallback {
  (names: Array<string>): void
}

abstract class Resource implements ContentWriter, ContentReader {
  public static IO_TIMEOUT = 2000;
  public static STORE_CONTENT_PROPERTY = '_content';
  public static STORE_RENDERTYPE_PROPERTY = '_rt';

  protected resourceName: string;

  constructor(name: string) {
    this.resourceName = name;
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

  public getPropertyNames(): Array<string> {
    return [];
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

  public abstract getProperty(name: string): any;
  public abstract resolveChildResource(name: string, callback: ResourceCallback, walking?: boolean): void;
  public abstract createChildResource(name: string, callback: ResourceCallback, walking?: boolean): void;

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
        self.read(res);
        callback();
      };
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

  public abstract importData(data: any, callback);
  public abstract removeChildResource(name: string, callback);
  public abstract listChildrenNames(callback: ChildrenNamesCallback);

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

  public start(ctype: string) {
  }
  public write(data: any) {
  }
  public error(error: Error) {
  }
  public end() {
  }
  public read(writer: ContentWriter) {
    writer.end();
  }
}
