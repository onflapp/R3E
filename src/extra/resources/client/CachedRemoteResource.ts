class CachedRemoteResourceContentWriter extends RemoteResourceContentWriter {
  constructor(filePath: string) {
    super(filePath);
  }
  public end(callback: any) {
    let data = this.buffer[0];
    localStorage.setItem(this.filePath, data);
    callback();
  }
}
class CachedRemoteResource extends RemoteResource {

  constructor(name: string, base ?: string, prefix ?:string) {
    super(name, base, prefix);
  }

  protected makeNewResource(name: string) {
    let path = this.getStoragePath();
    let res = new CachedRemoteResource(name, path, this.basePrefix);

    return res;
  }

  public getWriter(): ContentWriter {
    let path = this.getStoragePath();
    if (this.isDirectory) {
      this.isDirectory = false;
    }

    return new CachedRemoteResourceContentWriter(path);
  }

  protected remotePOST(url, values, callback): void {
    let data = JSON.stringify(values);
    localStorage.setItem(url, data);
    callback('ok');
  }

  protected remoteGET(url, json, callback): void {
    let data = localStorage.getItem(url);
    if (!data) {
      super.remoteGET(url, json, callback);
    }
    else if (json) {
      let val = JSON.parse(data);
      callback(val);
    }
    else {
      callback(data);
    }
  }
}
