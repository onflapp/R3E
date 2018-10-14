class ResourceProxyResolver extends ResourceResolver {

  public resolveResource(path: string, callback: ResourceCallback) {
    super.resolveResource(path, function(resource: Resource) {
      callback(resource);
    });
	}
}
