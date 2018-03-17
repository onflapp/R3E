class DefaultRenderingTemplates extends ObjectResource {
  constructor() {
    super('');
    this.rootObject = {
      resource: {
        error: {
          default:function(res: Resource, writer: ContentWriter, context: ResourceRequestContext) {
            res.read(writer);
          }
        }
      }
    };
  }
}
