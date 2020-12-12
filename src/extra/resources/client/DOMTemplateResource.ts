class DOMTemplateResource extends CachedRemoteTemplateResource {
  constructor(obj: any, base: string, path ? : string, name ? : string) {
    super(obj, base, path, name);
  }

  protected requestData(path: string, callback): void {
    var did = path.replace(/\//g, '_');
    var el = document.getElementById(did);

    if (el) callback(el['type'], el.innerHTML);
    else callback(null);
  }

  protected makeNewResource(obj: any, base: string, path: string, name: string): CachedRemoteTemplateResource {
    return new DOMTemplateResource(obj, base, path, name);
  }
}
