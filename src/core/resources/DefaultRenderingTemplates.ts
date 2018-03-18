class DefaultRenderingTemplates extends ObjectResource {
  constructor() {
    super('', {
      'resource': {
        'error': {
          'default':function(res: Resource, writer: ContentWriter, context: ResourceRequestContext) {
            res.read(writer);
          }
        }
      },
      'any': {
        'default':function(res: Resource, writer: ContentWriter, context: ResourceRequestContext) {
          writer.start('text/plain');
          writer.write('default renderer');
          writer.end();
        }
      }
    });
  }
}
