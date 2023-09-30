class SessionStorageResource extends LocalStorageResource {
  protected storageName: string;
  protected rootResource: SessionStorageResource;
  constructor(obj: any, name: string, root: LocalStorageResource) {
    super(obj, name, root);
  }

  public storeLocalStorage() {
    let data = JSON.stringify(this.values, null, 2);
    sessionStorage.setItem(this.storageName, data);
  }

  public loadLocalStorage() {
    let data = sessionStorage.getItem(this.storageName);
    if (data) {
      this.values = JSON.parse(data);
    }
  }
}
