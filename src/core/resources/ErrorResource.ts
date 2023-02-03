class ErrorResource extends ObjectResource {
  constructor(obj: any) {
    let err = obj;

    if (typeof err === 'string') err = obj;
    else err = '' + err;

    super({message:err}, '/');
  }

  public getType(): string {
    return 'resource/error';
  }

  public getSuperType(): string {
    return null;
  }
}
