class CachingResourceResolver extends ResourceResolver {
  private cache = {};

  protected getCachedResource(path: string): Resource {
    return this.cache[path];
  }
  protected setCachedResource(path: string, resource: Resource): void {
    this.cache[path] = resource;
  }

  public resolveResource(path: string, callback: ResourceCallback) {
    let self = this;
    let cres: Resource = this.getCachedResource(path);
    if (cres) {
      callback(cres);
    }
    else {
      super.resolveResource(path, function(resource: Resource) {
        self.setCachedResource(path, resource);
        callback(resource);
      });
    }
	}
}
