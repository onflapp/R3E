if (typeof module !== 'undefined') {
  module.exports = {
    ServerRequestHandler:ServerRequestHandler,
    MultiResourceResolver:MultiResourceResolver,
    ResourceResolver:ResourceResolver,
    CachingResourceResolver:CachingResourceResolver,
    ObjectResource:ObjectResource,
    HBSRendererFactory:HBSRendererFactory,
    JSRendererFactory:JSRendererFactory,
    FileResource:FileResource,
    RootResource:RootResource,
    DefaultRenderingTemplates:DefaultRenderingTemplates,
    Utils:Utils
  };
}
