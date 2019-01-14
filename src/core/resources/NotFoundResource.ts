class NotFoundResource extends ObjectResource {
  constructor(name: string) {
    super (name, {});
  }

  public getRenderType(): string {
    return 'resource/notfound';
  }
}
