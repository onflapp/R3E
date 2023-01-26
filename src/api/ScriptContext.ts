interface ScriptContext {
  /* resolve */
  resolveResource(resourcePath: string) : Promise<any>;
  listResources(resourcePath: string) : Promise<any>;
  listResourceNames(resourcePath: string) : Promise<any>;
  renderResource(resourcePath: string, rstype: string, selector: string) : Promise<any>;
  readResource(resourcePath: string, writer: ContentWriter, callback: any);

  /* store */
  storeResource(resourcePath: string, data: any) : Promise<void>;
  storeAndResolveResource(resourcePath: string, data: any) : Promise<Resource>;

  /* flow */
  forwardRequest(rpath: string);
  sendStatus(code: number);
}
