interface ScriptContext {
  /* resolve */
  resolveResource(resourcePath: string) : Promise<any>;
  resolveResources(resourcePaths: string[]) : Promise<any>;
  listResources(resourcePath: string, filter?:any) : Promise<any>;
  listResourceNames(resourcePath: string, filter?:any) : Promise<any>;
  listAllResourceNames(resourcePath: string, filter?:any) : Promise<any>;
  renderResource(resourcePath: string, rstype: string, selector: string) : Promise<any>;
  readResource(resourcePath: string, writer: ContentWriter, callback: any);

  /* content */
  resolveTemplateResourceContent(resourcePath: string) : Promise<string>;
  resolveResourceContent(resourcePath: string) : Promise<string>;

  /* store */
  storeResource(resourcePath: string, data: any) : Promise<void>;
  storeAndResolveResource(resourcePath: string, data: any) : Promise<Resource>;

  /* export */
  exportAllResources(resourcePath: string, level, writer: ContentWriter, incSource ? : boolean): void;

  /* flow */
  storeRequest(resourcePath: string, data: any);
  forwardRequest(rpath: string);
  sendStatus(code: number);

  /* search */
  searchResources(resolveResource: string, query: string) : Promise<any>;
  searchResourceNames(resolveResource: string, query: string) : Promise<any>;
}
