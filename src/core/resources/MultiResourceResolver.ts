class MultiResourceResolver extends ResourceResolver {
  private resolvers: Array<ResourceResolver> = [];
  constructor (list: any) {
    super(null);
    for (var i = 0; i < list.length; i++) {
      let it = list[i];
      if (it instanceof Resource) {
        this.resolvers.push(new ResourceResolver(it));
      }
      else {
        this.resolvers.push(it);
      }
		}
  }

  public resolveResource(path: string, callback: ResourceCallback) {
    var i = 0;
    let resolvers = this.resolvers;
    let try_resolve = function() {
      if (i < resolvers.length) {
        var resolver = resolvers[i++];
        resolver.resolveResource(path, function(resource: Resource) {
          if (resource) callback(resource);
          else try_resolve();
        });
      }
      else {
        callback(null);
      }
    };
    try_resolve();
	}
}
