if (typeof module !== 'undefined') {
  module.exports = {
    ServerRequestHandler: ServerRequestHandler,
    MultiResourceResolver: MultiResourceResolver,
    ResourceResolver: ResourceResolver,
    ObjectResource: ObjectResource,
    HBSRendererFactory: HBSRendererFactory,
    JSRendererFactory: JSRendererFactory,
    InterFuncRendererFactory: InterFuncRendererFactory,
    ResourceRequestHandler: ResourceRequestHandler,
    DropBoxResource: DropBoxResource,
    GitHubResource: GitHubResource,
    PouchDBResource: PouchDBResource,
    LunrIndexResource: LunrIndexResource,
    JSONIndexResource: JSONIndexResource,
    FileResource: FileResource,
    RootResource: RootResource,
    Utils: Utils
  };
}
