class NotFoundResource extends ObjectResource {
  constructor(name: string) {
    super({}, name);
  }

  public getType(): string {
    return 'resource/notfound';
  }
}
