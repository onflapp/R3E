interface RendererFactory {
	makeRenderer(resource: Resource, callback: RendererFactoryCallback);
}

interface RendererFactoryCallback {
	(render: any, error ? : Error);
}

interface ContentReader {
	read(writer: ContentWriter, callback: any): void;
}

interface ContentRendererFunction {
	(data: Data, writer: ContentWriter, context: ResourceRequestContext);
}

class ResourceRenderer {
	protected rendererResolver: ResourceResolver;
	protected rendererFactories: Map < string, RendererFactory > ;

	constructor(resolver: ResourceResolver) {
		this.rendererResolver = resolver;
		this.rendererFactories = new Map();

		//this.rendererFactories.set('', new InterFuncRendererFactory());
	}

	protected makeRenderTypePaths(renderTypes: Array<string> , selectors: Array<string> ): Array<string> {
		let rv = [];
		let factories = this.rendererFactories;

		for (let i = 0; i < renderTypes.length; i++) {
			factories.forEach(function(val, key, map) {
				if (key == '') return;

				let f = Utils.filename(renderTypes[i]);
				for (let z = 0; z < selectors.length; z++) {
					let sel = selectors[z];
					let p = renderTypes[i] + '/' + sel;
					rv.push(p);
					rv.push(p + '.' + key);

					p = renderTypes[i] + '/' + f + '.' + sel;
					rv.push(p);
					rv.push(p + '.' + key);
				}
			});
		}

		return rv;
	}

	protected makeRenderingFunction(path: string, resource: Resource, callback: RendererFactoryCallback) {
		let ext = Utils.filename_ext(path);
		let fact = this.rendererFactories.get(ext);

		fact.makeRenderer(resource, callback);
	}

	public registerFactory(typ: string, factory: RendererFactory) {
		this.rendererFactories.set(typ, factory);
	}

	protected renderError(message: string, resource: Resource, error: Error, writer: ContentWriter) {
		writer.start('text/plain');
		writer.write(message + '\n');
		writer.write('resource ' + resource.getName() + ':' + resource.getType() + '\n');
		if (error) writer.write(error.message + '\n' + error.stack);
		writer.end(null);
	}

	public renderResource(res: Resource, sel: string, writer: ContentWriter, context: ResourceRequestContext) {
		let self = this;
		let selectors = [sel];
		let renderTypes = res.getRenderTypes();
		renderTypes.push('any');

		this.resolveRenderer(renderTypes, selectors, function(rend: ContentRendererFunction, error? : Error) {
			if (rend) {
				rend(res, writer, context);
			}
			else {
				self.renderError('unable to render selector ' + sel, res, error, writer);
			}
		});
	}

	public resolveRenderer(renderTypes: Array<string> , selectors: Array<string> , callback: RendererFactoryCallback) {
		let rtypes = this.makeRenderTypePaths(renderTypes, selectors);
		if (rtypes.length === 0) throw new Error('no render factories registered?');

		let plist = rtypes.slice();
		let p = rtypes.shift();
		let self = this;

		let resolve_renderer = function(p: string) {
			console.log('try:' + p);
			self.rendererResolver.resolveResource(p, function(rend: Resource) {
				if (rend) {
					if (rend.isContentResource()) {
						self.makeRenderingFunction(p, rend, callback);
					}
					else {
						callback(null, new Error('no ContentResource at path :' + p));
					}
				}
				else if (rtypes.length > 0) {
					let p = rtypes.shift();
					resolve_renderer(p);
				}
				else {
					callback(null, new Error('paths:' + plist.join('\n')));
				}
			})
		};

		resolve_renderer(p);
	}
}
