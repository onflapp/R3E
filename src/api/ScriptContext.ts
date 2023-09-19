interface ScriptContext {
  /* resolve */
  resolveResource(resourcePath: string) : Promise<any>;
  listResources(resourcePath: string, filter?:any) : Promise<any>;
  listResourceNames(resourcePath: string, filter?:any) : Promise<any>;
  listAllResourceNames(resourcePath: string, filter?:any) : Promise<any>;
  renderResource(resourcePath: string, rstype: string, selector: string) : Promise<any>;
  readResource(resourcePath: string, writer: ContentWriter, callback: any);

  /* store */
  storeResource(resourcePath: string, data: any) : Promise<void>;
  storeAndResolveResource(resourcePath: string, data: any) : Promise<Resource>;

  /* export */
  exportAllResources(resourcePath: string, level, writer: ContentWriter, incSource ? : boolean): void;

  /* flow */
  forwardRequest(rpath: string);
  sendStatus(code: number);
}
