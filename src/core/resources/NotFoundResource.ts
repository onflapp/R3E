class NotFoundResource extends ObjectResource {
  constructor(path: string) {
    let name = Utils.filename(path);
    let data = {
      notFoundPath:path
    };
    super(data, name);
  }

  public getType(): string {
    return 'resource/notfound';
  }
}
