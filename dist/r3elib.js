class Utils {
    static makeUUID() {
        let d = new Date().getTime();
        let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            let r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    }
    static listSortByNames(list, names) {
        let rv = [];
        let done = {};
        for (let i = 0; i < names.length; i++) {
            let x = list.indexOf(names[i]);
            if (x != -1) {
                rv.push(list[x]);
                done[names[i]] = 'y';
            }
        }
        for (let i = 0; i < list.length; i++) {
            if (!done[list[i]])
                rv.push(list[i]);
        }
        return rv;
    }
    static listRemoveNames(list, names) {
        let rv = [];
        for (let i = 0; i < list.length; i++) {
            if (names.indexOf(list[i]) === -1) {
                rv.push(list[i]);
            }
        }
        return rv;
    }
    static listMoveItem(list, item, ref, offset) {
        let x = 0;
        let v = list.indexOf(item);
        if (item === ref) {
            x = v + offset;
            if (x >= 0) {
                if (v >= 0)
                    list.splice(v, 1);
                list.splice(x, 0, item);
            }
        }
        else {
            if (v >= 0)
                list.splice(v, 1);
            if (ref) {
                x = list.indexOf(ref);
                if (x >= 0) {
                    if (offset > 0)
                        x += offset;
                    else
                        x += offset + 1;
                }
                else
                    x = list.length;
            }
            list.splice(x, 0, item);
        }
    }
    static unescape(str) {
        if (!str)
            return str;
        else
            return unescape(str);
    }
    static string2object(str, obj) {
        if (!str)
            return obj ? obj : null;
        let rv = JSON.parse(str);
        if (rv)
            return rv;
        else
            return obj ? obj : null;
    }
    static filename_path_append(path, name) {
        if (!name)
            return path;
        let p = path;
        if (p.charAt(p.length - 1) != '/')
            p += '/';
        p += name;
        return p.replace(/\/+/g, '/');
    }
    static filename(path) {
        if (!path)
            return path;
        let i = path.lastIndexOf('/');
        if (i == -1)
            return path;
        else {
            let name = path.substr(i + 1);
            return name;
        }
    }
    static filename_dir(path) {
        if (!path)
            return path;
        let i = path.lastIndexOf('/');
        if (i == -1)
            return '';
        else {
            let name = path.substr(0, i);
            return name;
        }
    }
    static filename_ext(path) {
        let i = path.lastIndexOf('.');
        if (i == -1)
            return '';
        else {
            let ext = path.substr(i + 1);
            return ext;
        }
    }
    static absolute_path(path, cpath) {
        if (!path)
            return null;
        if (path.charAt(0) !== '/' && cpath) {
            path = cpath + '/' + path;
        }
        else if (path === '.' && cpath) {
            path = cpath;
        }
        else if (path.indexOf('./') == 0 && cpath) {
            path = cpath + path.substr(1);
        }
        let stack = path.split('/');
        let rv = [];
        for (var i = 0; i < stack.length; i++) {
            let it = stack[i];
            if (it === '.')
                continue;
            if (it === '')
                continue;
            if (it === '..')
                rv.pop();
            else
                rv.push(it);
        }
        let s = rv.join('/');
        if (s.charAt(0) === '/')
            return s;
        else
            return '/' + s;
    }
    static split_path(path) {
        if (path === '' || path === '/')
            return [];
        let ls = path.split('/');
        let names = [];
        for (var i = 0; i < ls.length; i++) {
            if (ls[i] != '') {
                names.push(ls[i]);
            }
        }
        return names;
    }
    static is_texttype(mime) {
        if (!mime)
            return false;
        let texttypes = ['application/json', 'application/javascript'];
        if (mime.indexOf('text/') === 0 || texttypes.indexOf(mime) >= 0)
            return true;
        else
            return false;
    }
    static filename_mime(path) {
        if (!path)
            return null;
        let ext = Utils.filename_ext(path).toLowerCase();
        if (ext === 'jpg' || ext === 'jpeg')
            return 'image/jpeg';
        if (ext === 'png')
            return 'image/png';
        if (ext === 'gif')
            return 'image/gif';
        if (ext === 'txt')
            return 'text/plain';
        if (ext === 'pdf')
            return 'application/pdf';
        if (ext === 'html' || ext === 'htm')
            return 'text/html';
        if (ext === 'xml')
            return 'text/xml';
        if (ext === 'js')
            return 'text/javascript';
        if (ext === 'css')
            return 'text/css';
        if (ext === 'json')
            return 'text/plain';
        if (ext === 'md')
            return 'text/x-markdown';
        if (ext === 'hbs')
            return 'text/plain';
        return 'application/octet-stream';
    }
    static Blob2Text(blob, callback) {
        let reader = new FileReader();
        reader.addEventListener('loadend', function (evt) {
            callback(reader.result);
        });
        reader.readAsText(blob);
    }
    static ArrayBuffer2base64(arrayBuffer) {
        var base64 = '';
        var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/';
        var bytes = new Uint8Array(arrayBuffer);
        var byteLength = bytes.byteLength;
        var byteRemainder = byteLength % 3;
        var mainLength = byteLength - byteRemainder;
        var a, b, c, d;
        var chunk;
        for (var i = 0; i < mainLength; i = i + 3) {
            chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2];
            a = (chunk & 16515072) >> 18;
            b = (chunk & 258048) >> 12;
            c = (chunk & 4032) >> 6;
            d = chunk & 63;
            base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d];
        }
        if (byteRemainder == 1) {
            chunk = bytes[mainLength];
            a = (chunk & 252) >> 2;
            b = (chunk & 3) << 4;
            base64 += encodings[a] + encodings[b] + '==';
        }
        else if (byteRemainder == 2) {
            chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1];
            a = (chunk & 64512) >> 10;
            b = (chunk & 1008) >> 4;
            c = (chunk & 15) << 2;
            base64 += encodings[a] + encodings[b] + encodings[c] + '=';
        }
        return base64;
    }
    static base642ArrayBuffer(base64) {
        if (typeof window !== 'undefined') {
            var binary_string = window.atob(base64);
            var len = binary_string.length;
            var bytes = new Uint8Array(len);
            for (var i = 0; i < len; i++) {
                bytes[i] = binary_string.charCodeAt(i);
            }
            return bytes.buffer;
        }
        else {
            var buff = Buffer.from(base64, 'base64');
            return buff;
        }
    }
    static log_trace(typ, msg) {
        if (Utils.ENABLE_TRACE_LOG) {
            console.log(typ + ':' + msg);
        }
    }
    static log_trace_resolve(typ, path) {
        if (Utils.ENABLE_TRACE_LOG) {
            console.log(typ + 'resolve:' + path);
        }
    }
    static set_trace_path(obj, path) {
        obj['__trace_context_path'] = path;
    }
    static copy_trace_path(src, dest) {
        if (src && dest) {
            let v = src['__trace_context_path'];
            if (v)
                dest['__trace_context_path'] = v;
        }
    }
    static get_trace_path(obj) {
        return obj['__trace_context_path'];
    }
    static glob_match(path, glob) {
        return false;
    }
    static flushResourceCache() {
        EventDispatcher.global().dispatchAllEvents('cache-flush');
    }
    static RegExpFilter(rx) {
        return function (p) {
            if (!p || !rx)
                return false;
            else if (p.match(rx))
                return true;
            else
                return false;
        };
    }
    static GlobFilter(rx) {
        return function (p) {
            if (!p || !rx)
                return false;
            else if (Utils.glob_match(p, rx))
                return true;
            else
                return false;
        };
    }
}
Utils.ENABLE_TRACE_LOG = false;
Utils.EXPORT_RENDER_CONTEXT = false;
class EventDispatcher {
    constructor() {
        this._eventHandlers = {};
    }
    addEventListener(evt, handler) {
        this._eventHandlers[evt] = this._eventHandlers[evt] || [];
        this._eventHandlers[evt].push(handler);
    }
    removeEventListener(evt, handler) {
        let handlers = this._eventHandlers[evt];
        if (handlers) {
            for (let i = 0; i < handlers.length; i += 1) {
                if (handlers[i] === handler)
                    handlers.splice(i, 1);
            }
        }
    }
    removeEventListeners(evt) {
        delete this._eventHandlers[evt];
    }
    dispatchAllEvents(evt, ...args) {
        let handlers = this._eventHandlers[evt];
        if (handlers) {
            for (let i = 0; i < handlers.length; i += 1) {
                handlers[i](evt, ...args);
            }
        }
    }
    dispatchAllEventsAsync(evt, ...args) {
        let self = this;
        setTimeout(function () {
            self.dispatchAllEvents(evt, ...args);
        }, 0);
    }
    static global() {
        if (!EventDispatcher._global) {
            EventDispatcher._global = new EventDispatcher();
        }
        return EventDispatcher._global;
    }
}
EventDispatcher._global = null;
class Data {
    constructor(obj) {
        this.values = obj ? obj : {};
        this.context = {};
    }
    importProperties(data, callback) {
        for (let k in data) {
            let v = data[k];
            if (k.charAt(0) === ':') {
                continue;
            }
            else {
                if (v)
                    this.values[k] = v;
                else
                    delete this.values[k];
            }
        }
        callback();
    }
    getValues() {
        var rv = {};
        for (var k in this.values) {
            var v = this.values[k];
            if (typeof v === 'object' || typeof v === 'function') { }
            else {
                rv[k] = this.values[k];
            }
        }
        return rv;
    }
    getProperties() {
        let map = {};
        let names = this.getPropertyNames();
        for (let i = 0; i < names.length; i++) {
            let n = names[i];
            map[n] = this.getProperty(n);
        }
        return map;
    }
    getPropertyNames() {
        var rv = [];
        for (var k in this.values) {
            var v = this.values[k];
            if (typeof v === 'object' || typeof v === 'function' || k.charAt(0) === '_') { }
            else {
                rv.push(k);
            }
        }
        return rv;
    }
    getProperty(name) {
        return this.values[name];
    }
    getContextValue(name) {
        return this.context[name];
    }
    setContextValue(name, value) {
        if (value)
            this.context[name] = value;
        else
            delete this.context[name];
    }
    getRenderTypes() {
        let rv = [];
        let rt = this.values['_rt'];
        if (rt)
            rv.push(rt);
        return rv;
    }
    wrap(wrapper) {
        for (let name in wrapper) {
            let func = wrapper[name];
            if (typeof func === 'function') {
                this[name] = func;
            }
        }
        return this;
    }
}
class Resource extends Data {
    constructor(name) {
        super({});
        this.resourceName = name ? name : '';
    }
    resolveItself(callback) {
        if (callback)
            callback(this);
    }
    getType() {
        return this.getSuperType();
    }
    getSuperType() {
        return 'resource/node';
    }
    getName() {
        return this.resourceName;
    }
    getRenderType() {
        return null;
    }
    getRenderSuperType() {
        return null;
    }
    getRenderTypes() {
        let rv = [];
        let rt = this.getRenderType();
        let st = this.getRenderSuperType();
        let nt = this.getSuperType();
        let ct = this.getContentType();
        let pt = this.getType();
        if (rt)
            rv.push(rt);
        if (st)
            rv.push(st);
        if (ct)
            rv.push('mime/' + ct);
        rv.push(pt);
        if (nt && nt !== pt)
            rv.push(nt);
        return rv;
    }
    resolveOrAllocateChildResource(name, callback, walking) {
        let self = this;
        this.resolveChildResource(name, function (res) {
            if (res) {
                callback(res);
            }
            else {
                self.allocateChildResource(name, callback);
            }
        }, walking);
    }
    exportData(callback) {
        let self = this;
        let names = this.getPropertyNames();
        let ct = this.getContentType();
        let rv = {};
        for (var i = 0; i < names.length; i++) {
            let name = names[i];
            let value = this.getProperty(name);
            if (value)
                rv[name] = value;
        }
        if (this.getRenderType()) {
            rv[Resource.STORE_RENDERTYPE_PROPERTY] = this.getRenderType();
        }
        if (this.getRenderSuperType()) {
            rv[Resource.STORE_RENDERSUPERTYPE_PROPERTY] = this.getRenderSuperType();
        }
        if (this.getSuperType() !== this.getType()) {
            rv[Resource.STORE_RESOURCETYPE_PROPERTY] = this.getType();
        }
        if (this.isContentResource()) {
            rv[Resource.STORE_CONTENT_PROPERTY] = function (writer, callback) {
                self.read(writer, callback);
            };
        }
        if (ct) {
            rv['_ct'] = ct;
        }
        callback(new Data(rv));
    }
    importData(data, callback) {
        let processingf = 0;
        let processingp = 0;
        let ffunc = null;
        let ct = null;
        let self = this;
        let mime = Utils.filename_mime(this.getName());
        let done = function () {
            if (processingf === 0 && processingp === 0 && callback)
                callback();
        };
        let props = {};
        for (let k in data.values) {
            let v = data.values[k];
            if (k === Resource.STORE_CONTENT_PROPERTY && typeof v === 'function') {
                ffunc = v;
            }
            else if (k === Resource.STORE_CONTENT_PROPERTY && typeof v === 'string') {
                ct = data.values['_ct'];
                if (!ct)
                    ct = mime;
                ffunc = function (writer, cb) {
                    writer.start(ct ? ct : 'text/plain');
                    writer.write(v);
                    writer.end(cb);
                };
            }
            else if (typeof v === 'function' || typeof v === 'object') {
                continue;
            }
            else if (k.charAt(0) === ':') {
                continue;
            }
            else {
                props[k] = v;
            }
        }
        if (ffunc) {
            if (ct && ct.indexOf('base64:') === 0) {
                props['_ct'] = ct.substr(7);
            }
            processingf++;
            this.importContent(ffunc, function () {
                processingf--;
                done();
            });
        }
        else {
            processingp++;
            this.importProperties(props, function () {
                processingp--;
                done();
            });
        }
    }
    listChildrenResources(callback) {
        let self = this;
        this.listChildrenNames(function (ls) {
            let rv = [];
            let sz = 0;
            if (ls && ls.length > 0) {
                for (var i = 0; i < ls.length; i++) {
                    let name = ls[i];
                    self.resolveChildResource(name, function (res) {
                        sz++;
                        if (res)
                            rv.push(res);
                        if (sz === ls.length) {
                            callback(rv);
                        }
                    });
                }
            }
            else {
                callback([]);
            }
        });
    }
    isContentResource() {
        return false;
    }
    getContentType() {
        return null;
    }
    getContentSize() {
        return -1;
    }
    getWriter() {
        return null;
    }
    read(writer, callback) {
        if (writer)
            writer.end(callback);
    }
}
Resource.IO_TIMEOUT = 10000000;
Resource.STORE_CONTENT_PROPERTY = '_content';
Resource.STORE_RENDERTYPE_PROPERTY = '_rt';
Resource.STORE_RENDERSUPERTYPE_PROPERTY = '_st';
Resource.STORE_RESOURCETYPE_PROPERTY = '_pt';
class ResourceResolver {
    constructor(resource) {
        this.resource = resource;
    }
    resolveResource(path, callback) {
        let self = this;
        Utils.log_trace_resolve('??', path);
        if (path === '/' || path === '') {
            Utils.log_trace_resolve('=>', path);
            this.resource.resolveItself(callback);
        }
        else {
            let paths = Utils.split_path(path);
            let p = paths.shift();
            let resolve_path = function (res, name) {
                let walking = false;
                if (paths.length > 0)
                    walking = true;
                res.resolveChildResource(name, function (rv) {
                    if (!rv) {
                        callback(null);
                    }
                    else if (paths.length == 0) {
                        Utils.log_trace_resolve('=>', path);
                        Utils.set_trace_path(rv, path);
                        callback(rv);
                    }
                    else {
                        let p = paths.shift();
                        resolve_path(rv, p);
                    }
                }, walking);
            };
            resolve_path(this.resource, p);
        }
    }
    storeResource(path, data, callback) {
        let self = this;
        if (path === '/' || path === '') {
            this.resource.importData(data, callback);
        }
        else {
            let paths = Utils.split_path(path);
            let p = paths.shift();
            let resolve_path = function (res, name) {
                let walking = false;
                if (paths.length > 0)
                    walking = true;
                res.resolveOrAllocateChildResource(name, function (rv) {
                    if (!rv) {
                        callback(null);
                    }
                    else if (paths.length == 0) {
                        rv.importData(data, callback);
                    }
                    else {
                        let p = paths.shift();
                        resolve_path(rv, p);
                    }
                }, walking);
            };
            resolve_path(this.resource, p);
        }
    }
    exportResources(path, callback) {
        this.resolveResource(path, function (res) {
            if (res) {
                Tools.exportChilrenResources(res, 0, {
                    start: function (ctype) { },
                    write: function (data) {
                        callback(data);
                    },
                    error: function (err) { },
                    end: function () {
                        callback(null);
                    }
                });
            }
            else {
                callback(null);
            }
        });
    }
    removeResource(fromPath, callback) {
        let dirname = Utils.filename_dir(fromPath);
        let name = Utils.filename(fromPath);
        let self = this;
        self.resolveResource(dirname, function (res) {
            res.removeChildResource(name, function () {
                callback();
            });
        });
    }
    moveResource(fromPath, toPath, callback) {
        let self = this;
        self.copyResource(fromPath, toPath, function () {
            self.removeResource(fromPath, function () {
                callback();
            });
        });
    }
    cloneResource(fromPath, toPath, callback) {
        if (fromPath === '/' || fromPath === '') {
            callback();
            return;
        }
        if (fromPath === toPath) {
            callback();
            return;
        }
        let self = this;
        self.resolveResource(fromPath, function (res) {
            if (res) {
                let data = new Data(res.getValues());
                self.storeResource(toPath, data, function () {
                    callback(arguments);
                });
            }
            else {
                callback(arguments);
            }
        });
    }
    copyResource(fromPath, toPath, callback) {
        if (fromPath === '/' || fromPath === '') {
            callback();
            return;
        }
        if (fromPath === toPath) {
            callback();
            return;
        }
        let self = this;
        let processing = 0;
        let ended = false;
        let done = function () {
            if (processing === 0 && ended) {
                callback(arguments);
            }
        };
        this.exportResources(fromPath, function (data) {
            if (data) {
                let path = Utils.filename_path_append(toPath, data.values[':path']);
                processing++;
                self.storeResource(path, data, function () {
                    processing--;
                    done();
                });
            }
            else {
                ended = true;
                done();
            }
        });
    }
}
class ResourceRenderer {
    constructor(resolver) {
        this.rendererResolver = resolver;
        this.rendererFactories = new Map();
        this.makeRenderTypePatterns = function (factoryType, renderType, name, sel) {
            let rv = [];
            rv.push(renderType + '/' + sel + '.' + factoryType);
            return rv;
        };
    }
    makeRenderTypePaths(renderTypes, selectors) {
        let rv = [];
        let factories = this.rendererFactories;
        let self = this;
        for (let i = 0; i < renderTypes.length; i++) {
            factories.forEach(function (val, key, map) {
                if (key == '')
                    return;
                let name = Utils.filename(renderTypes[i]);
                for (let z = 0; z < selectors.length; z++) {
                    let rt = renderTypes[i];
                    let sel = selectors[z];
                    rv = rv.concat(self.makeRenderTypePatterns(key, rt, name, sel));
                }
            });
        }
        return rv;
    }
    makeRenderingFunction(resource, callback) {
        let ext = Utils.filename_ext(resource.getName());
        let fact = this.rendererFactories.get(ext);
        let self = this;
        fact.makeRenderer(resource, function (render, error) {
            if (ext == 'js' || ext == 'func') {
                callback(render, error);
            }
            else if (render) {
                Utils.log_trace('makeRenderingFunction', `factory/[${ext}] pre-render`);
                self.resolveRenderer(['factory/' + ext], ['pre-render'], function (rend, error) {
                    if (rend) {
                        try {
                            rend(fact, new ContentWriterAdapter('object', function () {
                                Utils.copy_trace_path(resource, render);
                                callback(render, error);
                            }), null);
                        }
                        catch (ex) {
                            console.log(ex);
                            callback(null, error);
                        }
                    }
                    else {
                        callback(null, error);
                    }
                });
            }
            else {
                callback(render, error);
            }
        });
    }
    registerMakeRenderTypePatterns(func) {
        if (func) {
            this.makeRenderTypePatterns = func;
        }
    }
    registerFactory(typ, factory) {
        this.rendererFactories.set(typ, factory);
    }
    renderError(message, resource, error, writer) {
        writer.start('text/plain');
        writer.write(message + '\n');
        writer.write('resource:[' + resource.getName() + '] with type:' + resource.getRenderTypes() + '\n');
        if (error)
            writer.write(error.message + '\n' + error.stack);
        writer.end(null);
    }
    renderResource(res, sel, writer, context) {
        let self = this;
        let selectors = [sel];
        let renderTypes = res.getRenderTypes();
        if (context.getRenderResourceType()) {
            renderTypes = [context.getRenderResourceType()];
        }
        else {
            renderTypes.push('any');
        }
        Utils.log_trace('resolveRenderer', `renderTypes:[${renderTypes}] selectors:[${selectors}]`);
        this.resolveRenderer(renderTypes, selectors, function (rend, error) {
            if (rend) {
                context.makeCurrentResource(res);
                context.startRenderSession();
                try {
                    let map = context.makePropertiesForResource(res);
                    if (context['sessionData'].renderSessionCount == 1) {
                        if (Utils.EXPORT_RENDER_CONTEXT) {
                            window['CTX'] = context;
                            window['MAP'] = map;
                        }
                    }
                    Utils.copy_trace_path(rend, context['traceRenderInfo']);
                    let rv = rend(map, writer, context);
                    if (rv && rv.constructor.name === 'Promise') {
                        rv.then(function () {
                            writer.end(null);
                        })
                            .catch(function (err) {
                            console.log('path:' + Utils.get_trace_path(rend));
                            console.log(rend);
                            console.log(err);
                            self.renderError('unable to render selector:[' + sel + "]", res, err, writer);
                        });
                    }
                }
                catch (ex) {
                    console.log(ex);
                    self.renderError('unable to render selector:[' + sel + "]", res, ex, writer);
                }
            }
            else {
                self.renderError('unable to render selector:[' + sel + "]", res, error, writer);
            }
        });
    }
    resolveRenderer(renderTypes, selectors, callback) {
        let rtypes = this.makeRenderTypePaths(renderTypes, selectors);
        if (rtypes.length === 0)
            throw new Error('no render factories registered?');
        let plist = rtypes.slice();
        let p = rtypes.shift();
        let self = this;
        let resolve_renderer = function (p) {
            self.rendererResolver.resolveResource(p, function (rend) {
                if (rend) {
                    if (rend.isContentResource()) {
                        self.makeRenderingFunction(rend, callback);
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
                    callback(null, null);
                }
            });
        };
        resolve_renderer(p);
    }
}
class ResourceRequestContext {
    constructor(pathInfo, handler, sessionData) {
        this.pathInfo = pathInfo;
        this.resourceRequestHandler = handler;
        this.sessionData = sessionData;
        this.traceRenderInfo = {};
    }
    __overrideCurrentResourcePath(resourcePath) {
        this.pathInfo.resourcePath = resourcePath;
    }
    setRenderResourceType(rstype) {
        this.renderResourceType = rstype;
    }
    getRenderResourceType() {
        return this.renderResourceType;
    }
    setRenderSelector(sel) {
        this.renderSelector = sel;
    }
    getRenderSelector() {
        return this.renderSelector;
    }
    getCurrentSelector() {
        return this.pathInfo.selector;
    }
    getCurrentResourcePath() {
        return this.pathInfo.resourcePath;
    }
    getCurrentRequestPath() {
        return this.pathInfo.path;
    }
    getCurrentDataPath() {
        return this.pathInfo.dataPath;
    }
    getResourceResolver() {
        return this.resourceRequestHandler.getResourceResolver();
    }
    getTemplateResourceResolver() {
        return this.resourceRequestHandler.getTemplateResourceResolver();
    }
    renderResource(resourcePath, rstype, selector) {
        let self = this;
        return new Promise(function (resolve) {
            self.resourceRequestHandler.renderResource(resourcePath, rstype, selector, self, function (contentType, content) {
                resolve({ contentType: contentType, content: content });
            });
        });
    }
    resolveResource(resourcePath) {
        let rres = this.getResourceResolver();
        let self = this;
        let base = this.getCurrentResourcePath();
        return new Promise(function (resolve) {
            if (resourcePath === '.' && self.currentResource) {
                let map = self.makePropertiesForResource(self.currentResource);
                map['path'] = self.getCurrentResourcePath();
                resolve(map);
            }
            else {
                resourcePath = Utils.absolute_path(resourcePath, base);
                rres.resolveResource(resourcePath, function (res) {
                    if (res) {
                        let map = self.makePropertiesForResource(res);
                        map['path'] = resourcePath;
                        resolve(map);
                    }
                    else {
                        resolve(null);
                    }
                });
            }
        });
    }
    listResourceNames(resourcePath, filter) {
        let self = this;
        let rres = this.getResourceResolver();
        let base = this.getCurrentResourcePath();
        return new Promise(function (resolve) {
            if (resourcePath === '.' && self.currentResource) {
                self.currentResource.listChildrenNames(function (ls) {
                    if (filter && ls)
                        resolve(ls.filter(function (p) {
                            return filter(p);
                        }));
                    else
                        resolve(ls);
                });
            }
            else {
                resourcePath = Utils.absolute_path(resourcePath, base);
                rres.resolveResource(resourcePath, function (res) {
                    if (res) {
                        res.listChildrenNames(function (ls) {
                            if (filter && ls)
                                resolve(ls.filter(function (p) {
                                    return filter(p);
                                }));
                            else
                                resolve(ls);
                        });
                    }
                    else {
                        resolve([]);
                    }
                });
            }
        });
    }
    listAllResourceNames(resourcePath, filter) {
        let self = this;
        let rres = this.getResourceResolver();
        let base = this.getCurrentResourcePath();
        let ls = [];
        return new Promise(function (resolve) {
            let visit_all = function (res) {
                Tools.visitAllChidren(res, false, function (rpath) {
                    if (rpath) {
                        if (filter) {
                            let rv = filter(rpath);
                            if (rv == 1 || rv == true) {
                                ls.push(rpath);
                                return false;
                            }
                            else if (rv < 0) {
                                return true;
                            }
                            else {
                                return false;
                            }
                        }
                        else {
                            ls.push(rpath);
                            return false;
                        }
                    }
                    else {
                        resolve(ls);
                        return false;
                    }
                });
            };
            if (resourcePath === '.' && self.currentResource) {
                visit_all(self.currentResource);
            }
            else {
                resourcePath = Utils.absolute_path(resourcePath, base);
                rres.resolveResource(resourcePath, function (res) {
                    if (res) {
                        visit_all(res);
                    }
                    else {
                        resolve([]);
                    }
                });
            }
        });
    }
    listResources(resourcePath, filter) {
        let self = this;
        let rres = this.getResourceResolver();
        let base = this.getCurrentResourcePath();
        let res = self.currentResource;
        return new Promise(function (resolve) {
            let return_list = function (ls) {
                let rv = [];
                for (let i = 0; i < ls.length; i++) {
                    let map = self.makePropertiesForResource(ls[i]);
                    map['path'] = Utils.filename_path_append(base, ls[i].getName());
                    if (filter) {
                        try {
                            if (filter(map['name']))
                                rv.push(map);
                        }
                        catch (ex) {
                            console.log(ex);
                        }
                    }
                    else {
                        rv.push(map);
                    }
                }
                resolve(rv);
            };
            if (resourcePath === '.' && res) {
                res.listChildrenResources(return_list);
            }
            else {
                resourcePath = Utils.absolute_path(resourcePath, base);
                rres.resolveResource(resourcePath, function (res) {
                    base = resourcePath;
                    if (res) {
                        res.listChildrenResources(return_list);
                    }
                    else {
                        resolve([]);
                    }
                });
            }
        });
    }
    readResource(resourcePath, writer, callback) {
        let self = this;
        let rres = this.getResourceResolver();
        let base = this.getCurrentResourcePath();
        if (resourcePath === '.' && this.currentResource) {
            this.currentResource.read(writer, callback);
        }
        else {
            resourcePath = Utils.absolute_path(resourcePath, base);
            rres.resolveResource(resourcePath, function (res) {
                if (res) {
                    res.read(writer, callback);
                }
                else {
                    writer.end(callback);
                }
            });
        }
    }
    exportAllResources(resourcePath, level, writer, incSource) {
        let self = this;
        let rres = this.getResourceResolver();
        let base = this.getCurrentResourcePath();
        if (resourcePath === '.' && this.currentResource) {
            Tools.exportChilrenResources(this.currentResource, level, writer, incSource);
        }
        else {
            resourcePath = Utils.absolute_path(resourcePath, base);
            rres.resolveResource(resourcePath, function (res) {
                if (res) {
                    Tools.exportChilrenResources(res, level, writer, incSource);
                }
                else {
                    writer.end(null);
                }
            });
        }
    }
    resolveTemplateResourceContent(resourcePath) {
        let self = this;
        let tres = this.getTemplateResourceResolver();
        return new Promise(function (resolve) {
            tres.resolveResource(resourcePath, function (res) {
                if (res && res.isContentResource()) {
                    res.read(new ContentWriterAdapter('utf8', function (buff) {
                        resolve(buff);
                    }), null);
                }
                else {
                    resolve(null);
                }
            });
        });
    }
    getQueryProperties() {
        return this.pathInfo.query;
    }
    getQueryProperty(name) {
        if (this.pathInfo.query)
            return this.pathInfo.query[name];
        else
            return null;
    }
    getConfigProperties() {
        return this.resourceRequestHandler.getConfigProperties();
    }
    getConfigProperty(name) {
        var p = this.resourceRequestHandler.getConfigProperties();
        if (p)
            return p[name];
        else
            null;
    }
    forwardRequest(rpath) {
        this.resourceRequestHandler.forwardRequest(rpath);
    }
    sendStatus(code) {
        this.resourceRequestHandler.sendStatus(code);
    }
    storeResource(resourcePath, data) {
        let self = this;
        return new Promise(function (resolve) {
            self.resourceRequestHandler.storeResource(resourcePath, data, function () {
                resolve();
            });
        });
    }
    storeAndResolveResource(resourcePath, data) {
        let rres = this.getResourceResolver();
        let self = this;
        return new Promise(function (resolve) {
            self.resourceRequestHandler.storeResource(resourcePath, data, function () {
                rres.resolveResource(resourcePath, function (res) {
                    resolve(res);
                });
            });
        });
    }
    getSessionProperties() {
        let p = this.sessionData.getValues();
        p['RENDER_COUNT'] = this.sessionData.renderSessionCount;
        return p;
    }
    getRequestProperties() {
        let p = {};
        p['PATH'] = this.pathInfo.path;
        p['NAME'] = this.pathInfo.name;
        p['DIRNAME'] = this.pathInfo.dirname;
        p['SELECTOR'] = this.pathInfo.selector;
        p['DATA_PATH'] = this.pathInfo.dataPath;
        p['DATA_NAME'] = this.pathInfo.dataName;
        p['RES_PATH'] = this.pathInfo.resourcePath;
        p['PARENT_NAME'] = Utils.filename(this.pathInfo.dirname);
        p['PARENT_DIRNAME'] = Utils.filename_dir(this.pathInfo.dirname);
        if (this.pathInfo.refererURL && this.pathInfo.referer) {
            p['REF_URL'] = this.pathInfo.refererURL;
            p['REF_PATH'] = this.pathInfo.referer.path;
        }
        return p;
    }
    startRenderSession() {
        this.sessionData.renderSessionCount++;
    }
    makeCurrentResource(res) {
        if (res && res instanceof Resource) {
            this.currentResource = res;
        }
        else {
            this.currentResource = null;
        }
    }
    makePropertiesForResource(res) {
        let map = {};
        if (res && res instanceof Resource) {
            map['renderType'] = res.getRenderType();
            map['renderTypes'] = res.getRenderTypes();
            if (res.getSuperType() !== res.getType()) {
                map['superType'] = res.getSuperType();
            }
            if (res.getRenderSuperType()) {
                map['renderSuperType'] = res.getRenderSuperType();
            }
            map['type'] = res.getType();
            map['name'] = res.getName();
            map['isContentResource'] = res.isContentResource();
            let ctype = res.getContentType();
            if (ctype) {
                map['isTextContentResource'] = Utils.is_texttype(ctype);
                map['contentType'] = ctype;
                map['contentSize'] = res.getContentSize();
            }
            map['_'] = res.getProperties();
            map['path'] = this.getCurrentResourcePath();
        }
        return map;
    }
    clone() {
        let ctx = new ResourceRequestContext(this.pathInfo.clone(), this.resourceRequestHandler, this.sessionData);
        ctx.traceRenderInfo = {};
        ctx.renderSelector = this.renderSelector;
        return ctx;
    }
}
class SessionData extends Data {
    constructor() {
        super(...arguments);
        this.renderSessionCount = 0;
    }
}
class PathInfo {
    clone() {
        let pi = new PathInfo();
        pi.parameters = this.parameters;
        pi.path = this.path;
        pi.name = this.name;
        pi.dirname = this.dirname;
        pi.dirnames = this.dirnames;
        pi.selector = this.selector;
        pi.dataPath = this.dataPath;
        pi.dataName = this.dataName;
        pi.resourcePath = this.resourcePath;
        pi.referer = this.referer;
        pi.query = this.query;
        pi.refererURL = this.refererURL;
        return pi;
    }
}
class ClientFormInfo {
}
class ResourceRequestHandler extends EventDispatcher {
    constructor(resourceResolver, templateResolver, contentWriter) {
        super();
        this.resourceResolver = resourceResolver;
        this.templateResolver = templateResolver;
        this.contentWriter = new OrderedContentWriter(contentWriter);
        this.resourceRenderer = new ResourceRenderer(this.templateResolver);
        this.valueTransformers = new Map();
        this.valueTransformers['newUUID'] = function () {
            return Utils.makeUUID();
        };
        this.pathParserRegexp = new RegExp('^(?<path>\\/.*?)(\\.@(?<selector>[a-z\\-_]+)(?<dataPath>\\/.*?)?)?$');
        this.configProperties = {
            'X': '.@'
        };
    }
    expandValue(val, data) {
        if (typeof val !== 'string')
            return val;
        var rv = val;
        for (var key in data) {
            var v = data[key];
            if (typeof v !== 'string')
                continue;
            var p = '{' + key + '}';
            rv = rv.split(p).join(v);
        }
        return rv;
    }
    expandValues(values, data) {
        let rv1 = {};
        for (let key in values) {
            let v = values[key];
            rv1[key] = this.expandValue(v, data);
        }
        let rv2 = {};
        for (let key in rv1) {
            let val = rv1[key];
            if (key.indexOf('{:') !== -1) {
                for (let xkey in rv1) {
                    if (xkey.charAt(0) === ':' && key.indexOf(xkey) > 0) {
                        key = key.split('{' + xkey + '}').join(rv1[xkey]);
                        if (key) {
                            rv2[key] = val;
                        }
                    }
                }
            }
            else {
                rv2[key] = val;
            }
        }
        return rv2;
    }
    transformValues(data) {
        for (let key in data) {
            let val = data[key];
            if (key.indexOf(':') !== -1 && key.indexOf('|') !== -1) {
                let a = key.split('|');
                for (var i = 1; i < a.length; i++) {
                    let t = a[i];
                    let f = this.valueTransformers[t];
                    if (f && !val) {
                        val = f(data);
                    }
                    else if (!val) {
                        val = data[t];
                    }
                    data[a[0]] = val;
                }
            }
        }
        for (let key in data) {
            let val = data[key];
            if (key.indexOf('@') !== -1) {
                let i = key.indexOf('@');
                let k = key.substr(0, i);
                let n = key.substr(i + 1);
                if (data[n]) {
                    data[k] = data[n];
                }
                else {
                    data[k] = data[key];
                }
                delete data[key];
            }
        }
        return data;
    }
    transformObject(object, rstype, selector, context, callback) {
        let data = new Data(object).wrap({
            getRenderTypes: function () {
                return [rstype];
            }
        });
        this.transformResource(data, selector, context, callback);
    }
    transformResource(data, selector, context, callback) {
        let rrend = this.resourceRenderer;
        let selectors = [selector];
        let renderTypes = [];
        if (data['_rt'])
            renderTypes = renderTypes.concat(data['_rt']);
        renderTypes.push('any');
        rrend.resolveRenderer(renderTypes, selectors, function (rend, error) {
            if (rend) {
                rend(data, new ContentWriterAdapter('object', callback), context);
            }
            else {
                callback(data);
            }
        });
    }
    makeContext(pathInfo) {
        if (pathInfo) {
            pathInfo.refererURL = this.refererPath;
            pathInfo.referer = this.parsePath(this.refererPath);
            pathInfo.query = this.queryProperties;
            let context = new ResourceRequestContext(pathInfo, this, new SessionData());
            return context;
        }
        else {
            let pi = new PathInfo();
            pi.path = '/';
            pi.resourcePath = '/';
            let context = new ResourceRequestContext(pi, this, new SessionData());
            return context;
        }
    }
    expandDataAndImport(resourcePath, data, callback) {
        let rres = this.resourceResolver;
        let imp = data[Resource.STORE_CONTENT_PROPERTY];
        let processing = 0;
        let done = function () {
            if (processing === 0) {
                callback(arguments);
            }
        };
        let import_text = function (text) {
            let list = JSON.parse(text);
            if (list) {
                processing++;
                for (var i = 0; i < list.length; i++) {
                    let item = list[i];
                    let path = Utils.filename_path_append(resourcePath, item[':path']);
                    processing++;
                    rres.storeResource(path, new Data(item), function () {
                        processing--;
                        done();
                    });
                }
                processing--;
            }
            done();
        };
        if (typeof imp === 'function') {
            imp(new ContentWriterAdapter('utf8', import_text));
        }
        else if (typeof imp === 'string') {
            import_text(imp);
        }
        else {
            callback();
        }
    }
    expandDataAndStore(resourcePath, data, callback) {
        let rres = this.resourceResolver;
        let datas = {};
        let count = 1;
        datas[resourcePath] = {};
        for (let key in data) {
            if (key.indexOf(':') !== -1)
                continue;
            let v = data[key];
            let x = key.lastIndexOf('/');
            if (x != -1) {
                let p = resourcePath + '/' + key.substr(0, x);
                let n = key.substr(x + 1);
                let d = datas[p];
                if (!d) {
                    d = {};
                    datas[p] = d;
                    count++;
                }
                datas[p][n] = v;
            }
            else {
                datas[resourcePath][key] = v;
            }
        }
        let tostore = [];
        for (let key in datas) {
            let v = datas[key];
            let p = Utils.absolute_path(key);
            tostore.push({
                data: new Data(v),
                path: p
            });
        }
        let storedata = function () {
            let it = tostore.shift();
            if (!it) {
                callback();
                return;
            }
            rres.storeResource(it.path, it.data, function () {
                storedata();
            });
        };
        storedata();
    }
    setPathParserPattern(pattern) {
        this.pathParserRegexp = new RegExp(pattern);
    }
    parsePath(rpath) {
        if (!rpath)
            return null;
        let info = new PathInfo();
        let path = rpath.replace(/\/+/g, '/');
        let m = path.match(this.pathParserRegexp);
        if (m) {
            info.dataPath = Utils.unescape(m.groups.dataPath);
            info.path = Utils.unescape(Utils.absolute_path(m.groups.path));
            info.selector = m.groups.selector;
            info.dirname = Utils.filename_dir(info.path);
            info.name = Utils.filename(info.path);
            info.resourcePath = info.path;
            if (info.dataPath)
                info.dataPath = Utils.absolute_path(info.dataPath);
            info.dataName = Utils.filename(info.dataPath);
            return info;
        }
        else {
            return null;
        }
    }
    getResourceResolver() {
        return this.resourceResolver;
    }
    getTemplateResourceResolver() {
        return this.templateResolver;
    }
    getConfigProperties() {
        return this.configProperties;
    }
    setConfigProperties(cfg) {
        this.configProperties = cfg;
    }
    registerFactory(typ, factory) {
        this.resourceRenderer.registerFactory(typ, factory);
    }
    registerMakeRenderTypePatterns(func) {
        this.resourceRenderer.registerMakeRenderTypePatterns(func);
    }
    registerValueTranformer(name, func) {
        this.valueTransformers[name] = func;
    }
    handleRequest(rpath) {
        this.renderRequest(rpath);
    }
    forwardRequest(rpath) {
        this.pendingForward = rpath;
    }
    sendStatus(code) {
    }
    renderRequest(rpath) {
        this.pendingForward = null;
        let rres = this.resourceResolver;
        let rrend = this.resourceRenderer;
        let self = this;
        if (!rres)
            throw new Error('no resource resolver');
        if (!rrend)
            throw new Error('no resource renderer');
        if (!this.contentWriter)
            throw new Error('no content writer');
        let info = this.parsePath(rpath);
        let out = this.contentWriter.makeNestedContentWriter();
        let context = this.makeContext(info);
        try {
            if (info) {
                let sel = info.selector ? info.selector : 'default';
                rres.resolveResource(info.resourcePath, function (res) {
                    if (!res) {
                        res = new NotFoundResource(info.resourcePath);
                    }
                    Utils.log_trace('transformResource', '[pre-render]');
                    self.transformResource(res, 'pre-render', context, function () {
                        rrend.renderResource(res, sel, out, context);
                        out.end(null);
                    });
                });
            }
            else {
                rrend.renderResource(new ErrorResource('invalid path ' + rpath), 'default', out, context);
                out.end(null);
            }
        }
        catch (ex) {
            console.log(ex);
            rrend.renderResource(new ErrorResource(ex), 'default', out, context);
            out.end(null);
        }
    }
    renderResource(resourcePath, rstype, selector, context, callback) {
        let out = new OrderedContentWriter(new BufferedContentWriter(callback));
        let rres = this.resourceResolver;
        let rrend = this.resourceRenderer;
        let ncontext = context.clone();
        let sel = selector ? selector : 'default';
        ncontext.__overrideCurrentResourcePath(resourcePath);
        ncontext.setRenderResourceType(rstype);
        ncontext.setRenderSelector(sel);
        try {
            if (resourcePath) {
                rres.resolveResource(resourcePath, function (res) {
                    if (res)
                        rrend.renderResource(res, sel, out, ncontext);
                    else {
                        let res = new NotFoundResource(resourcePath);
                        rrend.renderResource(res, sel, out, ncontext);
                    }
                });
            }
            else {
                rrend.renderResource(new ErrorResource('invalid path ' + resourcePath), 'default', out, ncontext);
            }
        }
        catch (ex) {
            console.log(resourcePath + ',' + selector);
            console.log(ex);
            rrend.renderResource(new ErrorResource(ex), 'default', out, ncontext);
        }
    }
    handleStore(rpath, data) {
        let self = this;
        let rres = this.resourceResolver;
        let rrend = this.resourceRenderer;
        let info = this.parsePath(rpath);
        let context = this.makeContext(info);
        let render_error = function (err) {
            console.log(err);
            let out = self.contentWriter.makeNestedContentWriter();
            rrend.renderResource(err, 'default', out, context);
            out.end(null);
        };
        if (context && info && info.resourcePath) {
            data = this.expandValues(data, data);
            self.transformResource(data, 'pre-store', context, function (values) {
                let storeto = Utils.absolute_path(values[':storeto']);
                if (!storeto)
                    storeto = info.resourcePath;
                if (info.selector && values[':forward']) {
                    let forward = values[':forward'];
                    self.renderResource(info.resourcePath, null, info.selector, context, function (ctype, content) {
                        self.forwardRequest(forward);
                        self.handleEnd();
                    });
                }
                else {
                    self.storeResource(storeto, values, function (error) {
                        if (!error) {
                            let forward = values[':forward'];
                            if (forward)
                                self.forwardRequest(forward);
                            else
                                self.renderRequest(rpath);
                            self.handleEnd();
                        }
                        else {
                            render_error(error);
                        }
                    });
                }
            });
        }
        else {
            render_error(new ErrorResource('invalid path [' + rpath + ']'));
        }
    }
    storeResource(resourcePath, data, callback) {
        let self = this;
        let rres = this.resourceResolver;
        let storedata = function (path) {
            self.expandDataAndStore(path, data, function () {
                self.dispatchAllEvents('stored', path, data);
                callback();
            });
        };
        try {
            let remove = Utils.absolute_path(data[':delete'], resourcePath);
            let copyto = Utils.absolute_path(data[':copyto'], resourcePath);
            let cloneto = Utils.absolute_path(data[':cloneto'], resourcePath);
            let copyfrom = Utils.absolute_path(data[':copyfrom'], resourcePath);
            let moveto = Utils.absolute_path(data[':moveto'], resourcePath);
            let importto = Utils.absolute_path(data[':import'], resourcePath);
            let reset = Utils.absolute_path(data[':reset'], resourcePath);
            if (copyto) {
                rres.copyResource(resourcePath, copyto, function () {
                    self.dispatchAllEvents('post-copyto', copyto, data);
                    storedata(copyto);
                });
            }
            else if (cloneto) {
                rres.cloneResource(resourcePath, cloneto, function () {
                    self.dispatchAllEvents('post-cloneto', cloneto, data);
                    storedata(cloneto);
                });
            }
            else if (copyfrom) {
                rres.copyResource(copyfrom, resourcePath, function () {
                    self.dispatchAllEvents('post-copyfrom', resourcePath, data);
                    storedata(resourcePath);
                });
            }
            else if (moveto) {
                rres.moveResource(resourcePath, moveto, function () {
                    self.dispatchAllEvents('post-moveto', moveto, data);
                    storedata(moveto);
                });
            }
            else if (remove) {
                rres.removeResource(resourcePath, function () {
                    self.dispatchAllEvents('post-remove', remove, data);
                    callback();
                });
            }
            else if (importto) {
                self.expandDataAndImport(resourcePath, data, function () {
                    delete data[':import'];
                    delete data['_ct'];
                    delete data['_content'];
                    self.dispatchAllEvents('pre-importto', resourcePath, data);
                    storedata(resourcePath);
                });
            }
            else if (reset) {
                rres.removeResource(reset, function () {
                    self.dispatchAllEvents('pre-store', resourcePath, data);
                    storedata(resourcePath);
                });
            }
            else {
                self.dispatchAllEvents('pre-store', resourcePath, data);
                storedata(resourcePath);
            }
        }
        catch (ex) {
            callback(new ErrorResource(ex));
        }
    }
    handleEnd() {
    }
}
class Tools {
    static makeID(resource) {
        let v = resource.getProperty('_lastid');
        let n = Number.parseInt(v);
        if (!n)
            n = 1;
        else
            n++;
        resource.values['_lastid'] = '' + n;
        return n;
    }
    static reoderChildren(children, order) {
        children.sort(function (a, b) {
            let ai = order.indexOf(a.getName());
            let bi = order.indexOf(b.getName());
            return (ai - bi);
        });
    }
    static exportChilrenResources(resource, level, writer, incSource) {
        let processingc = 0;
        let processingd = 0;
        let processingn = 0;
        let done = function () {
            if (processingc === 0 && processingd === 0 && processingn === 0) {
                writer.end(null);
            }
        };
        let export_children = function (path, name, res) {
            processingc++;
            processingd++;
            res.exportData(function (data) {
                if (name)
                    data.values[':name'] = name;
                if (path)
                    data.values[':path'] = path;
                writer.write(data);
                processingd--;
                done();
            });
            res.listChildrenNames(function (names) {
                processingn += names.length;
                for (var i = 0; i < names.length; i++) {
                    let name = names[i];
                    res.resolveChildResource(name, function (r) {
                        let rpath = Utils.filename_path_append(path, name);
                        export_children(rpath, name, r);
                        processingn--;
                        done();
                    });
                }
                processingc--;
                done();
            });
        };
        writer.start('object/javascript');
        export_children(incSource ? resource.getName() : '', resource.getName(), resource);
    }
    static visitAllChidren(res, resolve, callback) {
        let processing = 0;
        let done = function () {
            if (processing === 0) {
                callback(null);
                processing = -1;
            }
            else if (processing === -1) {
                console.log('something is wrong, we should be finished by now!');
            }
        };
        let visit_children = function (path, name, res) {
            processing++;
            res.listChildrenNames(function (names) {
                processing += names.length;
                for (var i = 0; i < names.length; i++) {
                    let name = names[i];
                    res.resolveChildResource(name, function (r) {
                        let rpath = Utils.filename_path_append(path, name);
                        let skip = callback(rpath, r);
                        if (!skip) {
                            visit_children(rpath, name, r);
                        }
                        processing--;
                        done();
                    }, !resolve);
                }
                processing--;
                done();
            });
        };
        visit_children('', res.getName(), res);
    }
}
class ContentWriterAdapter {
    constructor(typ, callback) {
        this.data = [];
        this.callback = callback;
        this.conversion = typ;
    }
    __cleanup() {
        this.callback = null;
        this.data = null;
    }
    start(ctype) {
        this.ctype = ctype;
    }
    write(data) {
        this.data.push(data);
    }
    error(error) {
        console.log(error);
    }
    end(cb) {
        if (this.conversion === 'utf8') {
            let v = this.data[0];
            let self = this;
            if (!v) {
                this.callback('', this.ctype);
                self.__cleanup();
            }
            else if (typeof v === 'string') {
                this.callback(this.data.join(''), this.ctype);
                self.__cleanup();
            }
            else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(v)) {
                let b = Buffer.concat(this.data);
                this.callback(b.toString('utf8'), this.ctype);
                self.__cleanup();
            }
            else if (v instanceof Blob && typeof window !== 'undefined') {
                let reader = new FileReader();
                reader.onload = function () {
                    self.callback(reader.result, self.ctype);
                    self.__cleanup();
                };
                reader.readAsText(v);
            }
            else if (v instanceof ArrayBuffer && typeof window !== 'undefined') {
                let t = new window['TextDecoder']('utf-8').decode(v);
                this.callback(t, this.ctype);
                self.__cleanup();
            }
            else if (v) {
                this.callback(this.data, this.ctype);
                self.__cleanup();
            }
            else {
                this.callback(null, this.ctype);
                self.__cleanup();
            }
        }
        else {
            if (this.data.length === 1) {
                this.callback(this.data[0], this.ctype);
                this.__cleanup();
            }
            else {
                this.callback(this.data, this.ctype);
                this.__cleanup();
            }
        }
        if (cb)
            cb();
    }
}
class OrderedContentWriter {
    constructor(delegate) {
        this.instances = 0;
        this.contentQueue = new Array();
        this.delegateWriter = delegate;
    }
    makeNestedContentWriter() {
        let p = this.parentWriter ? this.parentWriter : this;
        let w = new OrderedContentWriter(null);
        w.parentWriter = p;
        this.contentQueue.push(w);
        p.instances++;
        return w;
    }
    write(content) {
        let p = this.parentWriter ? this.parentWriter : this;
        p.contentQueue.push(content);
    }
    start(contentType) {
        let p = this.parentWriter ? this.parentWriter : this;
        if (p.contentType) {
            console.log(`reset ${p.contentType} with ${contentType}`);
        }
        p.contentType = contentType;
        p.contentQueue = new Array();
    }
    error(err) {
        console.log(err);
    }
    end() {
        let p = this.parentWriter ? this.parentWriter : this;
        if (p.instances > 0) {
            p.instances--;
        }
        else if (p.instances == 0) {
            p.endAll();
            this.contentQueue = null;
            this.parentWriter = null;
            this.delegateWriter = null;
        }
    }
    endAll() {
        let delegate = this.delegateWriter;
        if (!delegate)
            return;
        let writeOutQueue = function (writer) {
            if (writer.contentQueue) {
                for (var i = 0; i < writer.contentQueue.length; i++) {
                    var content = writer.contentQueue[i];
                    if (content instanceof OrderedContentWriter) {
                        writeOutQueue(content);
                    }
                    else {
                        delegate.write(content);
                    }
                }
            }
            writer.parentWriter = null;
            writer.contentQueue = new Array();
            writer.contentType = null;
        };
        delegate.start(this.contentType);
        writeOutQueue(this);
        setTimeout(function () {
            delegate.end(null);
        });
    }
}
class BufferedContentWriter {
    constructor(callback) {
        this.content = [];
        this.callback = callback;
    }
    start(ctype) {
        this.contentType = ctype;
    }
    write(data) {
        this.content.push(data);
    }
    error(err) {
        console.log(err);
    }
    end() {
        if (this.content.length === 0) {
            this.callback(this.contentType, null);
        }
        else if (this.contentType && Utils.is_texttype(this.contentType)) {
            this.callback(this.contentType, this.content.join(''));
        }
        else if (this.content.length == 1) {
            this.callback(this.contentType, this.content[0]);
        }
        else {
            this.callback(this.contentType, this.content);
        }
        this.content = null;
        this.callback = null;
    }
}
class ObjectResource extends Resource {
    constructor(obj, name) {
        super(name);
        if (!obj)
            throw new Error('no object for ObjectResource');
        this.values = obj;
    }
    getRenderType() {
        let rt = this.values['_rt'];
        return rt ? rt : null;
    }
    getRenderSuperType() {
        let st = this.values['_st'];
        return st ? st : null;
    }
    getType() {
        let st = this.values['_pt'];
        return st ? st : 'resource/node';
    }
    resolveChildResource(name, callback, walking) {
        let rv = this.values[name];
        if (typeof rv === 'object') {
            if (rv['_content'] || rv['_content64'] || rv['_pt'] === 'resource/content')
                callback(this.makeNewObjectContentResource(rv, name));
            else
                callback(this.makeNewObjectResource(rv, name));
        }
        else if (typeof rv === 'function') {
            callback(this.makeNewObjectContentResource(rv, name));
        }
        else {
            callback(null);
        }
    }
    allocateChildResource(name, callback) {
        let rv = {};
        this.values[name] = rv;
        callback(this.makeNewObjectResource(rv, name));
    }
    listChildrenNames(callback) {
        var rv = [];
        for (var k in this.values) {
            var v = this.values[k];
            if (typeof v === 'object' && k.charAt(0) !== '.') {
                rv.push(k);
            }
        }
        callback(rv);
    }
    importContent(func, callback) {
        let res = this.makeNewObjectContentResource(this.values, this.resourceName);
        func(res.getWriter(), callback);
    }
    removeChildResource(name, callback) {
        delete this.values[name];
        if (callback)
            callback();
    }
    makeNewObjectContentResource(rv, name) {
        return new ObjectContentResource(rv, name);
    }
    makeNewObjectResource(rv, name) {
        return new ObjectResource(rv, name);
    }
}
class ObjectContentResourceWriter {
    constructor(obj) {
        this.buffer = [];
        this.values = obj;
    }
    start(ctype) {
        if (ctype && ctype.indexOf('base64:') === 0) {
            ctype = ctype.substr(7);
            this.values['_ct'] = ctype;
            this.isbase64 = true;
        }
        else {
            this.values['_ct'] = ctype;
        }
        this.istext = Utils.is_texttype(ctype);
        this.values['_pt'] = 'resource/content';
    }
    write(data) {
        this.buffer.push(data);
    }
    error(error) { }
    end(callback) {
        let data = this.buffer[0];
        if (data instanceof ArrayBuffer) {
            if (this.istext && typeof window !== 'undefined')
                this.values['_content'] = new window['TextDecoder']('utf-8').decode(data);
            else
                this.values['_content64'] = Utils.ArrayBuffer2base64(data);
        }
        else if (typeof Buffer !== 'undefined' && data instanceof Buffer) {
            data = Buffer.concat(this.buffer);
            if (this.istext) {
                let t = data.toString('utf8');
                this.values['_content'] = t;
            }
            else {
                this.values['_content64'] = data.toString('base64');
                this.values['_content64sz'] = data.length;
            }
        }
        else if (this.isbase64) {
            this.values['_content64'] = data;
        }
        else if (this.buffer) {
            var t = this.buffer.join('');
            this.values['_content'] = t;
        }
        this.buffer = [];
        if (callback)
            callback();
    }
}
class ObjectContentResource extends ObjectResource {
    constructor(obj, name) {
        super(obj, name);
    }
    getType() {
        return 'resource/content';
    }
    isContentResource() {
        return true;
    }
    getContentType() {
        let contentType = this.values['_ct'];
        if (contentType)
            return contentType;
        else
            return Utils.filename_mime(this.getName());
    }
    getContentSize() {
        let t = this.values['_content'];
        let z = this.values['_content64sz'];
        if (z)
            return z;
        else if (t)
            return t.length;
        else
            return 0;
    }
    getWriter() {
        delete this.values['_content64sz'];
        delete this.values['_content64'];
        delete this.values['_content'];
        return new ObjectContentResourceWriter(this.values);
    }
    read(writer, callback) {
        let data = this.values;
        let contentType = this.getContentType();
        writer.start(contentType ? contentType : 'text/plain');
        if (typeof data['_content'] !== 'undefined') {
            if (data['_content']['type'] === 'Buffer' && data['_content']['data']) {
                writer.write(Int8Array.from(data['_content']['data']).buffer);
            }
            else {
                writer.write(data['_content']);
            }
        }
        else if (data['_content64']) {
            writer.write(Utils.base642ArrayBuffer(data['_content64']));
        }
        else {
            writer.write(data);
        }
        writer.end(callback);
    }
}
class RootResource extends ObjectResource {
    constructor(opts) {
        super(opts, '');
    }
    getType() {
        return 'resource/root';
    }
    resolveChildResource(name, callback, walking) {
        let rv = this.values[name];
        if (rv && rv instanceof Resource) {
            rv.getName = function () {
                return name;
            };
            rv.resolveItself(function () {
                callback(rv);
            });
        }
        else
            super.resolveChildResource(name, callback, walking);
    }
}
class InterFuncRendererFactory {
    makeRenderer(resource, callback) {
        resource.read(new ContentWriterAdapter('object', function (func) {
            if (func) {
                if (typeof func === 'function') {
                    callback(func);
                }
                else {
                    callback(null, new Error('is not a function'));
                }
            }
            else {
                callback(null, new Error('cannot read object as function'));
            }
        }), null);
    }
}
class TemplateOutputPlaceholder {
    constructor(id, session) {
        this.buffer = [];
        this.closed = false;
        let self = this;
        this.id = id;
        this.placeholder = '_D3EASW_' + id + '_G4FDH9_';
        this.session = session;
        setTimeout(function () {
            if (!self.closed) {
                self.buffer = ['write timeout'];
                self.end();
            }
        }, Resource.IO_TIMEOUT);
    }
    write(str) {
        if (!this.closed) {
            this.buffer.push(str);
        }
        else {
            console.log('error: write to closed stream');
        }
    }
    end() {
        this.session.processPendingReplacements();
        this.closed = true;
    }
    toString() {
        return this.buffer.join('');
    }
}
class TemplateRendererSession {
    constructor() {
        this.outputPlaceholderID = 1;
        this.placeholders = [];
        this.pending = 0;
    }
    makeOutputPlaceholder() {
        let self = this;
        let p = new TemplateOutputPlaceholder(this.outputPlaceholderID++, this);
        this.placeholders.push(p);
        this.pending++;
        return p;
    }
    replaceOutputPlaceholders(text, callback) {
        let self = this;
        let replaceFunc = function () {
            let ls = self.placeholders.sort(function (a, b) {
                return +(a.id > b.id) - +(a.id < b.id);
            });
            for (let i = 0; i < ls.length; i++) {
                let it = ls[i];
                let tt = it.toString();
                text = text.split(it.placeholder).join(tt);
            }
            callback(text);
            self.close();
        };
        if (this.pending === 0)
            replaceFunc();
        else
            this.deferredReplaceFunc = replaceFunc;
    }
    processPendingReplacements() {
        this.pending--;
        if (this.pending === 0 && this.deferredReplaceFunc) {
            this.deferredReplaceFunc();
        }
        else if (this.pending < 0) {
            console.log('pending not in sync ' + this.pending);
        }
    }
    close() {
        this.pending = 0;
        this.deferredReplaceFunc = null;
        this.placeholders = null;
    }
}
class TemplateRendererFactory {
    compileTemplate(template) {
        return function () {
            return template;
        };
    }
    expadPath(path, context) {
        if (path === '.')
            return context.getCurrentResourcePath();
        else if (path.charAt(0) === '/') {
            return Utils.absolute_path(path);
        }
        else {
            let p = Utils.filename_path_append(context.getCurrentResourcePath(), path);
            return Utils.absolute_path(p);
        }
    }
    makeRenderer(resource, callback) {
        let self = this;
        resource.read(new ContentWriterAdapter('utf8', function (data) {
            if (data) {
                let tfunc = TemplateRendererFactory.cache[data];
                if (!tfunc) {
                    try {
                        tfunc = self.compileTemplate(data);
                    }
                    catch (ex) {
                        callback(null, ex);
                        return;
                    }
                }
                TemplateRendererFactory.cache[data] = tfunc;
                let session = new TemplateRendererSession();
                callback(function (data, writer, context) {
                    let map = Object.assign({}, data);
                    map['R'] = context.getRequestProperties();
                    map['Q'] = context.getQueryProperties();
                    map['C'] = context.getConfigProperties();
                    map['S'] = context.getSessionProperties();
                    map['_session'] = session;
                    map['_context'] = context;
                    let render_ouput = function (txt) {
                        session.replaceOutputPlaceholders(txt, function (txt) {
                            writer.start('text/html');
                            writer.write(txt);
                            writer.end(null);
                        });
                    };
                    if (typeof tfunc === 'function') {
                        try {
                            let txt = tfunc(map);
                            render_ouput(txt);
                        }
                        catch (ex) {
                            callback(null, ex);
                        }
                    }
                    else if (typeof tfunc.callback === 'function') {
                        tfunc.callback(map, function (txt, error) {
                            if (txt)
                                render_ouput(txt);
                            else
                                callback(null, error);
                        });
                    }
                    else {
                        console.log(tfunc);
                        callback(null, new Error('invlid renderer function'));
                    }
                });
            }
            else {
                callback(null, new Error('unable to read utf8 from resource'));
            }
        }), null);
    }
}
TemplateRendererFactory.cache = {};
class JSRendererFactory {
    makeRenderer(resource, callback) {
        resource.read(new ContentWriterAdapter('utf8', function (data) {
            if (data) {
                try {
                    var func = eval(data);
                }
                catch (ex) {
                    console.log('path:' + Utils.get_trace_path(data));
                    console.log(data);
                    console.log(ex);
                    callback(null, ex);
                }
                if (typeof func === 'function') {
                    Utils.copy_trace_path(resource, func);
                    callback(func);
                }
                else {
                    callback(null, new Error('not a function'));
                }
            }
            else {
                callback(null, new Error('unable to get data for JS'));
            }
        }), null);
    }
}
JSRendererFactory.cache = {};
class ErrorResource extends ObjectResource {
    constructor(obj) {
        let err = obj;
        if (typeof err === 'string')
            err = obj;
        else
            err = '' + err;
        super({ message: err }, '/');
    }
    getType() {
        return 'resource/error';
    }
    getSuperType() {
        return null;
    }
}
class NotFoundResource extends ObjectResource {
    constructor(path) {
        let name = Utils.filename(path);
        let data = {
            notFoundPath: path
        };
        super(data, name);
    }
    getType() {
        return 'resource/notfound';
    }
}
class MultiResourceResolver extends ResourceResolver {
    constructor(list) {
        super(null);
        this.resolvers = [];
        for (var i = 0; i < list.length; i++) {
            let it = list[i];
            if (it instanceof Resource) {
                this.resolvers.push(new ResourceResolver(it));
            }
            else {
                this.resolvers.push(it);
            }
        }
    }
    resolveResource(path, callback) {
        var i = 0;
        let resolvers = this.resolvers;
        let try_resolve = function () {
            if (i < resolvers.length) {
                var resolver = resolvers[i++];
                resolver.resolveResource(path, function (resource) {
                    if (resource) {
                        callback(resource);
                    }
                    else
                        try_resolve();
                });
            }
            else {
                callback(null);
            }
        };
        try_resolve();
    }
}
class IndexResource extends ObjectResource {
    constructor(name, base, index) {
        super({}, name);
        if (typeof base !== 'undefined') {
            this.baseName = name;
            this.basePath = base;
        }
        else {
            this.baseName = '';
            this.basePath = name;
        }
        this.parentIndexResource = index;
    }
    getType() {
        return 'resource/index';
    }
    getIndexEngine() {
        let indx = this.parentIndexResource ? this.parentIndexResource.indx : this.indx;
        return indx;
    }
    resolveChildResource(name, callback, walking) {
        this.allocateChildResource(name, callback);
    }
    resolveItself(callback) {
        let self = this;
        if (!this.parentIndexResource && !this.indx) {
            this.initIndexEngine(function (indx) {
                self.indx = indx;
                if (callback)
                    callback(self);
            });
        }
        else {
            if (callback)
                callback(self);
        }
    }
    getStoragePath(name) {
        let path = Utils.filename_path_append(this.basePath, this.baseName);
        if (name)
            path = Utils.filename_path_append(path, name);
        return path;
    }
    allocateChildResource(name, callback) {
        let path = this.getStoragePath();
        let ctr = this.constructor;
        callback(new ctr(name, path, this.parentIndexResource ? this.parentIndexResource : this));
    }
    importContent(func, callback) {
        let self = this;
        let text = null;
        func(new ContentWriterAdapter('utf8', function (data, ctype) {
            text = data;
        }), function () {
            if (text) {
                self.indexTextData(text, callback);
            }
            else if (callback)
                callback();
        });
    }
    importProperties(data, callback) {
        let text = [];
        let self = this;
        for (let k in data) {
            let v = data[k];
            this.values[k] = v;
            if (v && k)
                text.push(k + ' = ' + v);
        }
        if (text.length > 0) {
            self.indexTextData(text.join('\n'), callback);
        }
        else if (callback)
            callback();
    }
    removeChildResource(name, callback) {
        if (name == '_THE_INDEX_' && !this.parentIndexResource) {
            let self = this;
            this.initIndexEngine(function (indx) {
                self.indx = indx;
                if (callback)
                    callback();
            });
        }
        else {
            this.removeResourcesFromIndex(name, callback);
        }
    }
}
class HBSRendererFactory extends TemplateRendererFactory {
    constructor() {
        super();
        this.Handlebars = null;
        if (typeof window !== 'undefined' && window['Handlebars'])
            this.Handlebars = window['Handlebars'];
        else
            this.Handlebars = require('handlebars');
        let self = this;
        let include = function (arg0, arg1) {
            let path = arg0;
            let block = arg1;
            let selector = null;
            let rtype = null;
            if (arguments.length == 3) {
                if (arguments[1].indexOf('/') > 0)
                    rtype = arguments[1];
                else
                    selector = arguments[1];
                block = arguments[2];
            }
            else if (arguments.length == 4) {
                rtype = arguments[1];
                selector = arguments[2];
                block = arguments[3];
            }
            let safe = (block.name === 'include_safe') ? true : false;
            let session = block.data.root._session;
            let context = block.data.root._context;
            if (!selector)
                selector = context.getRenderSelector();
            if (!selector)
                selector = 'default';
            let render = function (contentType, content) {
                if (contentType === 'object/javascript') {
                    let out = '';
                    if (Array.isArray(content)) {
                        for (var i = 0; i < content.length; i++) {
                            let it = content[i];
                            if (typeof block.fn === 'function') {
                                let map = it;
                                if (typeof it === 'string') {
                                    map = { toString: function () { return it; } };
                                }
                                map['R'] = context.getRequestProperties();
                                map['Q'] = context.getQueryProperties();
                                map['C'] = context.getConfigProperties();
                                map['S'] = context.getSessionProperties();
                                out += block.fn(map);
                            }
                            else
                                out += JSON.stringify(it);
                        }
                    }
                    else {
                        let it = content;
                        if (typeof block.fn === 'function') {
                            let map = it;
                            if (typeof it === 'string') {
                                map = { toString: function () { return it; } };
                            }
                            map['R'] = context.getRequestProperties();
                            map['Q'] = context.getQueryProperties();
                            map['C'] = context.getConfigProperties();
                            map['S'] = context.getSessionProperties();
                            out += block.fn(map);
                        }
                        else
                            out += JSON.stringify(it);
                    }
                    if (safe)
                        out = self.Handlebars.Utils.escapeExpression(out);
                    p.write(out);
                    p.end();
                }
                else {
                    if (safe)
                        content = self.Handlebars.Utils.escapeExpression(content);
                    p.write(content);
                    p.end();
                }
            };
            let p = session.makeOutputPlaceholder();
            if (typeof path === 'string') {
                path = self.expadPath(path, context);
                context.renderResource(path, rtype, selector).then(function (rv) {
                    render(rv.contentType, rv.content);
                });
            }
            else {
                render('object/javascript', path);
            }
            return p.placeholder;
        };
        this.Handlebars.registerHelper('include', include);
        this.Handlebars.registerHelper('include_safe', include);
    }
    compileTemplate(template) {
        return this.Handlebars.compile(template);
    }
}
class StoredResource extends Resource {
    constructor(name, base, prefix) {
        super(name);
        this.isDirectory = true;
        this.contentSize = -1;
        this.resourceCache = {};
        this.loaded = false;
        let self = this;
        if (typeof base !== 'undefined') {
            this.baseName = name;
            this.basePath = base;
            this.basePrefix = prefix;
        }
        else {
            this.baseName = '';
            this.basePath = name;
            this.basePrefix = name;
            EventDispatcher.global().addEventListener('cache-flush', function () {
                self.flushResourceCache();
            });
        }
    }
    getCachedResource(name) {
        let res = this.resourceCache[name];
        return res;
    }
    setCachedResource(name, res) {
        if (res) {
            this.resourceCache[name] = res;
        }
        return res;
    }
    clearCachedResource(name) {
        if (name)
            delete this.resourceCache[name];
        else
            this.resourceCache = {};
    }
    flushResourceCache() {
        this.resourceCache = {};
        this.childNames = null;
        this.loaded = false;
    }
    getStoragePath(name) {
        let path = Utils.filename_path_append(this.basePath, this.baseName);
        if (name)
            path = Utils.filename_path_append(path, name);
        return path;
    }
    getMetadataPath(nm) {
        if (nm) {
            return this.basePath + '/.' + nm + '.metadata.json';
        }
        else {
            return this.getStoragePath('.metadata.json');
        }
    }
    getType() {
        if (this.isDirectory)
            return 'resource/node';
        else
            return 'resource/content';
    }
    getRenderType() {
        return this.values['_rt'];
    }
    getRenderSuperType() {
        return this.values['_st'];
    }
    isContentResource() {
        return !this.isDirectory;
    }
    getContentType() {
        if (this.isDirectory)
            return null;
        let contentType = this.values['_ct'];
        if (contentType)
            return contentType;
        else
            return Utils.filename_mime(this.getName());
    }
    getContentSize() {
        if (this.isDirectory)
            return 0;
        else
            return this.contentSize;
    }
    resolveItself(callback) {
        let self = this;
        if (self.loaded) {
            callback(self);
        }
        else {
            self.loadProperties(function (rv) {
                self.loaded = rv ? true : false;
                if (rv)
                    callback(self);
                else
                    callback(null);
            });
        }
    }
    resolveChildResource(name, callback, walking) {
        let res = this.getCachedResource(name);
        let self = this;
        if (res) {
            if (walking)
                callback(res);
            else
                res.resolveItself(callback);
        }
        else {
            if (walking) {
                this.childNames = null;
                res = this.setCachedResource(name, this.makeNewResource(name));
                callback(res);
            }
            else {
                res = this.makeNewResource(name);
                res.resolveItself(function (rv) {
                    if (rv) {
                        self.setCachedResource(name, res);
                        self.childNames = null;
                        callback(res);
                    }
                    else
                        callback(null);
                });
            }
        }
    }
    listChildrenNames(callback) {
        let self = this;
        if (self.childNames) {
            callback(self.childNames);
        }
        else {
            this.loadChildrenNames(function (ls) {
                self.childNames = ls;
                callback(ls);
            });
        }
    }
    allocateChildResource(name, callback) {
        let res = this.setCachedResource(name, this.makeNewResource(name));
        this.childNames = null;
        callback(res);
    }
    importProperties(data, callback) {
        if (!this.isDirectory) {
            callback();
            return;
        }
        let self = this;
        let path = this.getStoragePath();
        if (!this.isDirectory) {
            path = this.basePath;
        }
        super.importProperties(data, function () {
            self.ensurePathExists(path, function (rv) {
                if (rv) {
                    self.storeProperties(function () {
                        callback();
                    });
                }
                else {
                    callback();
                }
            });
        });
    }
    importContent(func, callback) {
        let self = this;
        let path = this.basePath;
        this.isDirectory = false;
        this.ensurePathExists(path, function (rv) {
            if (rv) {
                func(self.getWriter(), callback);
            }
            else {
                callback();
            }
        });
    }
    removeChildResource(name, callback) {
        this.clearCachedResource(name);
        if (this.childNames) {
            this.childNames.splice(this.childNames.indexOf(name), 1);
        }
        this.storeChildrenNames(function () {
            callback();
        });
    }
}
class StoredObjectResource extends ObjectResource {
    constructor(obj, name, base, root) {
        super({}, '');
        this.loaded = false;
        this.externalizeContent = false;
        let self = this;
        if (!root) {
            this.storageResource = obj;
            this.storagePath = name;
            this.rootResource = null;
            this.basePath = '';
            EventDispatcher.global().addEventListener('cache-flush', function () {
                self.flushResourceCache();
            });
        }
        else {
            this.values = obj;
            this.resourceName = name;
            this.rootResource = root;
            this.basePath = base;
        }
    }
    flushResourceCache() {
        this.loaded = false;
    }
    setExternalizeContent(externalize) {
        this.externalizeContent = externalize;
    }
    resolveItself(callback) {
        if (!this.rootResource && !this.loaded && this.storageResource) {
            let self = this;
            this.loadObjectResource(function () {
                if (callback)
                    callback(self);
            });
        }
        else {
            if (callback)
                callback(this);
        }
    }
    resolveChildResource(name, callback, walking) {
        let rfunc = super.resolveChildResource;
        let self = this;
        if (!this.rootResource && !this.loaded && this.storageResource) {
            this.loadObjectResource(function () {
                rfunc.call(self, name, callback, walking);
            });
        }
        else {
            super.resolveChildResource(name, callback, walking);
        }
    }
    removeChildResource(name, callback) {
        let self = this;
        super.removeChildResource(name, function () {
            self.storeObjectResource(function () {
                if (callback)
                    callback();
            });
        });
    }
    importContent(func, callback) {
        let self = this;
        let root = this.rootResource ? this.rootResource.storageResource : this.storageResource;
        let externalize = this.rootResource ? this.rootResource.externalizeContent : this.externalizeContent;
        if (externalize) {
            let path = Utils.filename_path_append(this.basePath, this.resourceName);
            let rres = new ResourceResolver(root);
            let data = new Data({
                '_content': func
            });
            rres.storeResource(path, data, function () {
                self.importProperties({
                    '_pt': 'resource/content',
                    '_content': path
                }, callback);
            });
        }
        else {
            super.importContent(func, function () {
                self.storeObjectResource(function () {
                    callback();
                });
            });
        }
    }
    importProperties(data, callback) {
        let self = this;
        super.importProperties(data, function () {
            self.storeObjectResource(function () {
                callback();
            });
        });
    }
    loadObjectResource(callback) {
        if (this.loaded) {
            callback();
            return;
        }
        let self = this;
        let path = this.storagePath;
        let rres = new ResourceResolver(this.storageResource);
        this.loaded = true;
        rres.resolveResource(path, function (res) {
            if (res) {
                res.read(new ContentWriterAdapter('utf8', function (data, ctype) {
                    let rv = JSON.parse(data);
                    if (Array.isArray(rv)) {
                        self.values = {};
                        let v = {};
                        let ores = new ResourceResolver(new ObjectResource(v, ''));
                        for (let i = 0; i < rv.length; i++) {
                            let item = rv[i];
                            let path = Utils.filename_path_append(self.resourceName, item[':path']);
                            ores.storeResource(path, new Data(item), function () {
                            });
                        }
                        for (let k in v) {
                            self.values = v[k];
                        }
                    }
                    else if (rv) {
                        self.values = rv;
                    }
                    callback();
                }), null);
            }
            else {
                callback();
            }
        });
    }
    storeObjectResource(callback) {
        let vals = this.rootResource ? this.rootResource.values : this.values;
        let path = this.rootResource ? this.rootResource.storagePath : this.storagePath;
        let root = this.rootResource ? this.rootResource.storageResource : this.storageResource;
        let json = JSON.stringify(vals, null, 2);
        let rres = new ResourceResolver(root);
        let data = {
            '_content': json
        };
        rres.storeResource(path, new Data(data), function () {
            callback();
        });
    }
    makeNewObjectContentResource(rv, name) {
        let root = this.rootResource ? this.rootResource : this;
        if (root.externalizeContent) {
            return new StoredObjectContentResource(rv, name, root, root.storageResource);
        }
        else {
            return new StoredObjectContentResource(rv, name, root, null);
        }
    }
    makeNewObjectResource(rv, name) {
        let root = this.rootResource ? this.rootResource : this;
        let path = Utils.filename_path_append(this.basePath, this.resourceName);
        return new StoredObjectResource(rv, name, path, root);
    }
}
class StoredObjectContentResource extends ObjectContentResource {
    constructor(obj, name, root, storage) {
        super(obj, name);
        this.storageResource = storage;
        this.rootResource = root;
    }
    read(writer, callback) {
        if (this.storageResource) {
            let rres = new ResourceResolver(this.storageResource);
            let path = this.values['_content'];
            rres.resolveResource(path, function (res) {
                if (res) {
                    res.read(writer, callback);
                }
                else {
                    callback();
                }
            });
        }
        else {
            super.read(writer, callback);
        }
    }
    importContent(func, callback) {
        let self = this;
        let storage = this.storageResource;
        if (storage) {
            let path = this.values['_content'];
            let rres = new ResourceResolver(storage);
            rres.resolveResource(path, function (res) {
                if (res) {
                    res.importContent(func, callback);
                }
                else {
                    callback();
                }
            });
        }
        else {
            super.importContent(func, function () {
                self.rootResource.storeObjectResource(function () {
                    callback();
                });
            });
        }
    }
}
class RemoteResourceContentWriter {
    constructor(filePath) {
        this.buffer = [];
        this.filePath = filePath;
    }
    start(ctype) {
        this.contentType = ctype;
    }
    write(data) {
        this.buffer.push(data);
    }
    error(error) {
        console.log(error);
    }
    end(callback) {
        let xhr = new XMLHttpRequest();
        let self = this;
        let data = this.buffer[0];
        xhr.open('POST', this.filePath, true);
        if (this.contentType)
            xhr.setRequestHeader('Content-Type', this.contentType);
        xhr.onreadystatechange = function () {
            var DONE = 4;
            var OK = 200;
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    callback();
                }
                else {
                    callback();
                }
            }
        };
        xhr.send(data);
    }
}
class RemoteResource extends StoredResource {
    constructor(name, base, prefix) {
        super(name, base, prefix);
    }
    makeNewResource(name) {
        let path = this.getStoragePath();
        let res = new RemoteResource(name, path, this.basePrefix);
        return res;
    }
    ensurePathExists(path, callback) {
        callback(true);
    }
    storeChildrenNames(callback) {
        callback();
    }
    removeChildResource(name, callback) {
        let url = this.getStoragePath(name);
        let rpath = url;
        let self = this;
        if (this.basePrefix && url.indexOf(this.basePrefix) == 0) {
            rpath = url.substr(this.basePrefix.length);
        }
        let val = {
            ':delete': rpath
        };
        url += '/.metadata.json';
        super.removeChildResource(name, function () {
            self.remotePOST(url, val, function () {
                callback();
            });
        });
    }
    loadChildrenNames(callback) {
        if (this.isDirectory) {
            let url = this.getStoragePath('.children.json');
            this.remoteGET(url, true, function (values) {
                callback(values ? values : []);
            });
        }
        else {
            callback([]);
        }
    }
    storeProperties(callback) {
        let url = this.getStoragePath('.metadata.json');
        this.remotePOST(url, this.values, function () {
            callback();
        });
    }
    loadProperties(callback) {
        let url = this.getMetadataPath();
        let self = this;
        if (this.resourceName.indexOf('.') > 0) {
            self.tryLoadContent(function (rv) {
                if (rv) {
                    callback(true);
                }
                else {
                    self.remoteGET(url, true, function (values) {
                        if (values) {
                            if (values._pt === 'resource/content')
                                self.isDirectory = false;
                            if (typeof values._contentsz !== 'undefined')
                                self.contentSize = values._contentsz;
                            self.values = values;
                            callback(true);
                        }
                        else {
                            callback(false);
                        }
                    });
                }
            });
        }
        else {
            this.remoteGET(url, true, function (values) {
                if (values) {
                    if (values._pt === 'resource/content')
                        self.isDirectory = false;
                    if (typeof values._contentsz !== 'undefined')
                        self.contentSize = values._contentsz;
                    self.values = values;
                    callback(true);
                }
                else {
                    self.tryLoadContent(callback);
                }
            });
        }
    }
    tryLoadContent(callback) {
        let url = this.getStoragePath();
        let self = this;
        this.remoteGET(url, false, function (data) {
            if (data) {
                self.values._pt = 'resource/content';
                self.values._contentdata = data;
                self.isDirectory = false;
                callback(true);
            }
            else {
                callback(false);
            }
        });
    }
    getWriter() {
        let path = this.getStoragePath();
        if (this.isDirectory) {
            this.isDirectory = false;
        }
        this.loaded = false;
        return new RemoteResourceContentWriter(path);
    }
    read(writer, callback) {
        if (this.isDirectory) {
            writer.end(callback);
        }
        else if (this.values._contentdata) {
            let ct = this.getContentType();
            let data = this.values._contentdata;
            writer.start(ct);
            writer.write(data);
            writer.end(callback);
        }
        else {
            let url = this.getStoragePath();
            let ct = this.getContentType();
            this.remoteGET(url, false, function (data) {
                writer.start(ct);
                writer.write(data);
                writer.end(callback);
            });
        }
    }
    remotePOST(url, values, callback) {
        let xhr = new XMLHttpRequest();
        let self = this;
        xhr.open('POST', url, true);
        xhr.setRequestHeader('Content-Type', 'application/json');
        xhr.onreadystatechange = function () {
            var DONE = 4;
            var OK = 200;
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    callback(xhr.responseText);
                }
                else {
                    callback(null);
                }
            }
        };
        let data = JSON.stringify(values);
        xhr.send(data);
    }
    remoteGET(url, json, callback) {
        let xhr = new XMLHttpRequest();
        if (!json)
            xhr.responseType = 'arraybuffer';
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            var DONE = 4;
            var OK = 200;
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    if (json) {
                        let data = xhr.responseText;
                        let val = null;
                        if (data) {
                            try {
                                val = JSON.parse(data);
                            }
                            catch (ex) { }
                        }
                        callback(val);
                    }
                    else {
                        callback(xhr.response);
                    }
                }
                else {
                    callback(null);
                }
            }
        };
        xhr.send();
    }
}
class LocalStorageResource extends ObjectResource {
    constructor(obj, name, root) {
        super(obj, name);
        let self = this;
        let initialized = false;
        if (!name && typeof obj === 'string') {
            this.storageName = obj;
            this.loadLocalStorage();
            initialized = true;
        }
        else if (root) {
            this.rootResource = root;
        }
        else {
            this.storageName = name;
            this.loadLocalStorage();
            initialized = true;
        }
        if (initialized) {
            EventDispatcher.global().addEventListener('cache-flush', function () {
                self.loadLocalStorage();
            });
        }
    }
    storeLocalStorage() {
        let data = JSON.stringify(this.values, null, 2);
        localStorage.setItem(this.storageName, data);
    }
    loadLocalStorage() {
        let data = localStorage.getItem(this.storageName);
        if (data) {
            this.values = JSON.parse(data);
        }
    }
    importProperties(data, callback) {
        let self = this;
        let root = this.rootResource ? this.rootResource : this;
        super.importProperties(data, function () {
            root.storeLocalStorage();
            callback();
        });
    }
    importContent(func, callback) {
        let self = this;
        let root = this.rootResource ? this.rootResource : this;
        let res = this.makeNewObjectContentResource(this.values, this.resourceName);
        func(res.getWriter(), function () {
            root.storeLocalStorage();
            callback();
        });
    }
    removeChildResource(name, callback) {
        let self = this;
        let root = this.rootResource ? this.rootResource : this;
        super.removeChildResource(name, function () {
            root.storeLocalStorage();
            if (callback)
                callback();
        });
    }
    makeNewObjectContentResource(rv, name) {
        let root = this.rootResource ? this.rootResource : this;
        return new LocalStorageContentResource(rv, name, root);
    }
    makeNewObjectResource(rv, name) {
        let root = this.rootResource ? this.rootResource : this;
        return new LocalStorageResource(rv, name, root);
    }
}
class LocalStorageContentResource extends ObjectContentResource {
    constructor(obj, name, root) {
        super(obj, name);
        this.rootResource = root;
    }
    importContent(func, callback) {
        let self = this;
        super.importContent(func, function () {
            self.rootResource.storeLocalStorage();
            callback();
        });
    }
}
class DOMContentWriter {
    constructor() {
        this.externalResources = {};
    }
    escapeHTML(html) {
        let text = document.createTextNode(html);
        let p = document.createElement('p');
        p.appendChild(text);
        return p.innerHTML;
    }
    patchWindowObjects() {
        let self = this;
        if (window['__myevents']) {
            for (let i = 0; i < window['__myevents'].length; i++) {
                let v = window['__myevents'][i];
                window.removeEventListener(v.event, v.func, v.cap);
            }
        }
        window['__myevents'] = [];
        if (!window['orig_addEventListener']) {
            window['orig_addEventListener'] = window.addEventListener;
            window.addEventListener = function (a, b, c) {
                window['__myevents'].push({
                    event: a,
                    func: b,
                    cap: c
                });
                window['orig_addEventListener'](a, b, c);
            };
        }
        if (!window['_customElements_orig_define']) {
            if (window['customElements']) {
                window['_customElements_orig_define'] = CustomElementRegistry.prototype.define;
                window.customElements.define = function (a, b, c) {
                    if (!window.customElements.get(a)) {
                        window['_customElements_orig_define'].call(this, a, b, c);
                    }
                };
            }
        }
        if (!window['XMLHttpRequest']['_prototype_orig_open']) {
            window['XMLHttpRequest']['_prototype_orig_open'] = window['XMLHttpRequest'].prototype.open;
            window['XMLHttpRequest'].prototype.open = function (method, path) {
                if (method.toUpperCase() === 'POST' && path.indexOf('#') !== -1) {
                    this.__localpath = path.substr(path.indexOf('#') + 1);
                }
                else {
                    window['XMLHttpRequest']['_prototype_orig_open'].call(this, method, path);
                }
            };
            window['XMLHttpRequest']['_prototype_orig_send'] = window['XMLHttpRequest'].prototype.send;
            window['XMLHttpRequest'].prototype.send = function (data) {
                if (this.__localpath) {
                    let info = self.requestHandler.parseFormData(this.__localpath, data);
                    self.requestHandler.handleStore(info.formPath, info.formData);
                }
                else {
                    window['XMLHttpRequest']['_prototype_orig_send'].call(this, data);
                }
            };
        }
    }
    attachListeners() {
        let requestHandler = this.requestHandler;
        document.body.addEventListener('submit', function (evt) {
            evt.preventDefault();
            try {
                let target = evt.target;
                let action = target.getAttribute('action');
                let info = requestHandler.parseFormElement(target, evt.submitter);
                let forward = info.formData[':forward'];
                if (forward && forward.indexOf('#')) {
                    info.formData[':forward'] = forward.substr(forward.indexOf('#') + 1);
                }
                if (target.method.toUpperCase() === 'POST') {
                    setTimeout(function () {
                        requestHandler.handleStore(info.formPath, info.formData);
                    });
                }
                else {
                    let q = [];
                    for (let k in info.formData) {
                        let v = info.formData[k];
                        q.push(k + '=' + escape(v));
                    }
                    if (action.indexOf('#'))
                        action = action.substr(action.indexOf('#') + 1);
                    if (q.length)
                        action += '?' + q.join('&');
                    setTimeout(function () {
                        requestHandler.forwardRequest(action);
                        requestHandler.handleEnd();
                    });
                }
            }
            catch (ex) {
                console.log(ex);
            }
        });
        document.body.addEventListener('change', function (evt) {
            let el = evt.target;
            if (el['type'] == 'color') {
                el['checked'] = true;
            }
        });
    }
    evaluateScripts() {
        let scripts = document.querySelectorAll('script');
        for (var i = 0; i < scripts.length; i++) {
            let script = scripts[i];
            let code = script.innerText;
            if (code && !script.src) {
                try {
                    window.eval(code);
                }
                catch (ex) {
                    console.log(code);
                    console.log(ex);
                }
            }
        }
    }
    loadExternal() {
        let scripts = document.querySelectorAll('script');
        let links = document.querySelectorAll('link');
        let processing = 0;
        let trigger_done = function () {
            if (processing !== 0)
                return;
            setTimeout(function () {
                let evt = document.createEvent('MutationEvents');
                evt.initMutationEvent('DOMContentLoaded', true, true, document, '', '', '', 0);
                document.dispatchEvent(evt);
                let evt1 = document.createEvent('Event');
                evt1.initEvent('load', false, false);
                window.dispatchEvent(evt1);
            });
            processing = -1;
        };
        for (let i = 0; i < scripts.length; i++) {
            let script = scripts[i];
            let el = document.createElement('script');
            if (script.src) {
                processing++;
                el.src = script.src;
                script.parentElement.replaceChild(el, script);
                el.onload = el.onerror = function () {
                    processing--;
                    trigger_done();
                };
            }
        }
        trigger_done();
    }
    updateDocument(content) {
        let self = this;
        this.patchWindowObjects();
        document.documentElement.innerHTML = content;
        self.requestHandler.dispatchAllEvents('start', this);
        let done_loading = function () {
            self.evaluateScripts();
            self.loadExternal();
            self.attachListeners();
            self.requestHandler.dispatchAllEvents('end', this);
        };
        window.requestAnimationFrame(function () {
            done_loading();
        });
    }
    setRequestHandler(requestHandler) {
        this.requestHandler = requestHandler;
    }
    start(ctype) {
        if (ctype && ctype.indexOf('text/') == 0) {
            this.htmldata = [];
        }
        else if (ctype && ctype == 'application/json') {
            this.htmldata = [];
            this.htmldata.push('<pre>');
        }
        else {
            this.exttype = ctype;
            this.extdata = [];
        }
    }
    write(content) {
        if (this.htmldata)
            this.htmldata.push(content);
        else if (this.extdata)
            this.extdata.push(content);
    }
    error(error) {
        console.log(error);
    }
    end() {
        if (this.htmldata) {
            this.updateDocument(this.htmldata.join(''));
        }
        else if ('object/javascript' == this.exttype) {
            let d = JSON.stringify(this.extdata[0]);
            this.updateDocument('<pre>' + d + '</pre>');
        }
        else if (this.extdata && this.extdata.length) {
            let blob = new Blob(this.extdata, { type: this.exttype });
            let uri = window.URL.createObjectURL(blob);
            this.requestHandler.dispatchAllEvents('end', this);
            window.location.replace(uri);
        }
        this.htmldata = null;
        this.extdata = null;
        this.exttype = null;
        this.requestHandler.handleEnd();
    }
}
class ClientRequestHandler extends ResourceRequestHandler {
    constructor(resourceResolver, templateResolver, contentWriter) {
        let writer = contentWriter ? contentWriter : new DOMContentWriter();
        super(resourceResolver, templateResolver, writer);
        writer.setRequestHandler(this);
        this.initHandlers();
    }
    initHandlers() {
        window.addEventListener('hashchange', function (evt) {
            window.location.reload();
        });
    }
    sendStatus(code) {
        console.log('status:' + code);
    }
    handleEnd() {
        if (this.pendingForward) {
            let p = this.pendingForward;
            if (p.indexOf('http://') === 0 || p.indexOf('https://') === 0) {
            }
            else {
                p = window.location.protocol + '//' + window.location.host + window.location.pathname + '#' + this.pendingForward;
            }
            if (p == window.location.toString()) {
                window.location.reload();
            }
            else {
                window.location.replace(p);
            }
        }
    }
    handleRequest(rpath) {
        var path = rpath;
        var x = rpath.indexOf('?');
        var p = {};
        if (x > 0) {
            var q = rpath.substr(x + 1);
            path = rpath.substr(0, x);
            var a = q.split('&');
            for (var i = 0; i < a.length; i++) {
                var c = a[i].indexOf('=');
                if (c > 0) {
                    var n = a[i].substr(0, c);
                    var v = a[i].substr(c + 1);
                    p[unescape(n)] = unescape(v);
                }
            }
        }
        this.queryProperties = p;
        this.renderRequest(path);
    }
    renderRequest(rpath) {
        this.refererPath = sessionStorage['__LAST_REQUEST_PATH'];
        this.currentPath = rpath;
        super.renderRequest(rpath);
        if (window.parent == window) {
            sessionStorage['__LAST_REQUEST_PATH'] = rpath;
        }
    }
    parseFormData(action, data) {
        let rv = {};
        let it = data.entries();
        let result = it.next();
        while (!result.done) {
            rv[result.value[0]] = result.value[1];
            result = it.next();
        }
        rv = this.expandValues(rv, rv);
        rv = this.transformValues(rv);
        let path = this.expandValue(action, rv);
        let info = new ClientFormInfo();
        info.formData = rv;
        info.formPath = path;
        return info;
    }
    parseFormElement(formElement, submitter) {
        let action = formElement.getAttribute('action');
        let rv = {};
        if (action.indexOf('#')) {
            action = action.substr(action.indexOf('#') + 1);
        }
        for (let i = 0; i < formElement.elements.length; i++) {
            let p = formElement.elements[i];
            let type = p.type.toLowerCase();
            let name = p.name;
            let value = p.value;
            if (!name)
                continue;
            if (type === 'file') {
                value = p.files[0];
                if (!value)
                    continue;
                let pref = '';
                let ct = value.type;
                if (name.lastIndexOf('/') > 0)
                    pref = name.substr(0, name.lastIndexOf('/') + 1);
                let mime = Utils.filename_mime(value.name);
                if (mime === 'application/octet-stream' && ct)
                    mime = ct;
                rv[name] = value.name;
                rv[pref + '_ct'] = mime;
                rv[pref + Resource.STORE_CONTENT_PROPERTY] = function (writer, callback) {
                    let reader = new FileReader();
                    reader.onload = function (e) {
                        writer.write(reader.result);
                        writer.end(callback);
                    };
                    writer.start(value.type);
                    reader.readAsArrayBuffer(value);
                };
            }
            else if (type === 'submit') {
                if (p == submitter && name) {
                    rv[name] = value;
                }
            }
            else if (type === 'checkbox') {
                if (p.checked)
                    rv[name] = value;
                else
                    rv[name] = '';
            }
            else if (type === 'color') {
                if (p['checked'])
                    rv[name] = p.value;
            }
            else {
                rv[name] = value;
            }
        }
        rv = this.expandValues(rv, rv);
        rv = this.transformValues(rv);
        let path = this.expandValue(action, rv);
        let info = new ClientFormInfo();
        info.formData = rv;
        info.formPath = path;
        return info;
    }
}
class SPARequestHandler extends ClientRequestHandler {
    constructor(resourceResolver, templateResolver, contentWriter) {
        super(resourceResolver, templateResolver, contentWriter);
    }
    initHandlers() {
        let self = this;
        window.addEventListener('hashchange', function (evt) {
            let path = window.location.hash.substr(1);
            self.handleRequest(path);
        });
    }
    handleEnd() {
        if (this.pendingForward) {
            let p = window.location.protocol + '//' + window.location.host + window.location.pathname + '#' + this.pendingForward;
            if (p == window.location.toString()) {
                let self = this;
                let p = this.pendingForward;
                setTimeout(function () {
                    self.handleRequest(p);
                }, 10);
            }
            else {
                window.location.replace(p);
            }
        }
    }
    renderRequest(rpath) {
        this.refererPath = sessionStorage['__LAST_REQUEST_PATH'];
        this.currentPath = rpath;
        super.renderRequest(rpath);
        sessionStorage['__LAST_REQUEST_PATH'] = rpath;
    }
}
class ResponseContentWriter {
    constructor(res) {
        this.respose = res;
    }
    setRequestHandler(requestHandler) {
        this.requestHandler = requestHandler;
    }
    start(ctype) {
        if (this.closed)
            return;
        let c = ctype ? ctype : 'application/octet-stream';
        if (c === 'object/javascript') {
            c = 'application/json';
            this.transform = 'json';
        }
        this.respose.setHeader('content-type', c);
    }
    write(content) {
        if (this.closed)
            return;
        if (this.transform === 'json') {
            this.respose.write(JSON.stringify(content));
        }
        else if (typeof content === 'string') {
            this.respose.write(content);
        }
        else {
            this.respose.write(content, 'binary');
        }
    }
    error(error) {
        console.log(error);
    }
    end() {
        this.respose.end();
        this.requestHandler = null;
        this.respose = null;
        this.closed = true;
    }
    redirect(rpath) {
        this.closed = true;
        this.respose.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        this.respose.redirect(301, rpath);
    }
    sendStatus(code) {
        this.closed = true;
        this.respose.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        this.respose.sendStatus(code);
    }
}
class ServerRequestHandler extends ResourceRequestHandler {
    constructor(resourceResolver, templateResolver, res) {
        let writer = new ResponseContentWriter(res);
        super(resourceResolver, templateResolver, writer);
        this.resposeContentWriter = writer;
        this.resposeContentWriter.setRequestHandler(this);
    }
    handleGetRequest(req) {
        let URL = require('url').URL;
        let rpath = unescape(req.path);
        let referer = req.headers.referrer || req.headers.referer;
        if (referer) {
            let r = new URL(referer);
            this.refererPath = r.pathname;
        }
        this.queryProperties = req.query;
        super.handleRequest(rpath);
    }
    handlePostRequest(req) {
        let URL = require('url').URL;
        let self = this;
        let rpath = unescape(req.path);
        let multiparty = require('multiparty');
        let querystring = require('querystring');
        let referer = req.headers.referrer || req.headers.referer;
        let first_val = function (val) {
            for (let i = 0; i < val.length; i++) {
                if (val[i])
                    return val[i];
            }
            return val[val.length - 1];
        };
        if (referer) {
            let r = new URL(referer);
            this.refererPath = r.pathname;
        }
        this.queryProperties = req.query;
        let ct = req.headers['content-type'];
        if (ct && ct.indexOf('multipart/form-data') == 0) {
            let form = new multiparty.Form({
                maxFieldsSize: 1024 * 1024 * 500
            });
            form.parse(req, function (err, fields, files) {
                let data = {};
                for (let file in files) {
                    let v = files[file][0];
                    let f = v['originalFilename'];
                    let n = v['fieldName'];
                    let ct = v['headers']['content-type'];
                    let path = v['path'];
                    let pref = '';
                    let mime = Utils.filename_mime(n);
                    if (mime === 'application/octet-stream' && ct)
                        mime = ct;
                    if (n.lastIndexOf('/') > 0)
                        pref = n.substr(0, n.lastIndexOf('/') + 1);
                    data[n] = f;
                    data[pref + '_ct'] = mime;
                    data[pref + Resource.STORE_CONTENT_PROPERTY] = function (writer, callback) {
                        let fs = require('fs');
                        let fd = fs.openSync(path, 'r');
                        writer.start(mime);
                        let pos = 0;
                        let sz = 0;
                        while (true) {
                            let buff = new Buffer(1024 * 1000);
                            sz = fs.readSync(fd, buff, 0, buff.length, pos);
                            if (!sz)
                                break;
                            pos += sz;
                            if (sz < buff.length) {
                                writer.write(buff.slice(0, sz));
                            }
                            else {
                                writer.write(buff);
                            }
                        }
                        fs.closeSync(fd);
                        fs.unlinkSync(path);
                        writer.end(function () {
                            if (callback)
                                callback();
                        });
                    };
                    break;
                }
                for (var k in fields) {
                    var v = first_val(fields[k]);
                    data[k] = v;
                }
                data = self.transformValues(data);
                rpath = self.expandValue(rpath, data);
                self.handleStore(rpath, data);
            });
        }
        else {
            let body = '';
            req.on('data', function (data) {
                body += data;
                if (body.length > (1024 * 1000))
                    req.connection.destroy();
            });
            req.on('end', function () {
                let data = {};
                let fields = querystring.parse(body);
                for (var k in fields) {
                    var v = fields[k];
                    if (Array.isArray(v))
                        data[k] = first_val(v);
                    else
                        data[k] = v;
                }
                data = self.transformValues(data);
                rpath = self.expandValue(rpath, data);
                self.handleStore(rpath, data);
            });
        }
    }
    forwardRequest(rpath) {
        this.resposeContentWriter.redirect(rpath);
    }
    sendStatus(code) {
        this.resposeContentWriter.sendStatus(code);
    }
}
class FileResourceContentWriter {
    constructor(filePath) {
        this.fs = require('fs-extra');
        this.filePath = filePath;
    }
    start(ctype) {
        if (ctype && ctype.indexOf('base64:') === 0)
            this.isbase64 = true;
        this.fd = this.fs.openSync(this.filePath, 'w');
    }
    write(data) {
        if (this.isbase64) {
            this.fs.writeSync(this.fd, new Buffer(data, 'base64'));
        }
        else {
            this.fs.writeSync(this.fd, data);
        }
    }
    error(error) {
        console.log(error);
    }
    end(callback) {
        this.fs.closeSync(this.fd);
        if (callback)
            callback();
    }
}
class FileResource extends StoredResource {
    constructor(name, base) {
        super(name, base);
        this.fs = require('fs-extra');
    }
    makeNewResource(name) {
        let path = this.getStoragePath();
        return new FileResource(name, path);
    }
    getType() {
        if (!this.isDirectory)
            return 'resource/content';
        else
            return 'resource/node';
    }
    storeChildrenNames(callback) {
        callback(true);
    }
    ensurePathExists(path, callback) {
        this.fs.mkdirs(path, function (err) {
            if (!err) {
                callback(true);
            }
            else if (err.code == 'EEXIST') {
                callback(true);
            }
            else {
                callback(false);
            }
        });
    }
    loadChildrenNames(callback) {
        let path = this.getStoragePath();
        this.fs.readdir(path, function (err, items) {
            let ls = [];
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    let it = items[i];
                    if (it.charAt(0) === '.')
                        continue;
                    ls.push(it);
                }
            }
            callback(ls);
        });
    }
    storeProperties(callback) {
        let self = this;
        let path = this.getMetadataPath();
        self.fs.writeFile(path, JSON.stringify(this.values), 'utf8', function () {
            callback(true);
        });
    }
    loadProperties(callback) {
        let self = this;
        let path = this.getStoragePath();
        let loadMetadata = function (path, callback) {
            self.fs.readFile(path, 'utf8', function (err, data) {
                if (data) {
                    let rv = JSON.parse(data);
                    self.values = rv ? rv : {};
                }
                else {
                    self.values = {};
                }
                callback();
            });
        };
        self.fs.stat(path, function (err, stats) {
            if (err)
                callback(false);
            else {
                self.isDirectory = stats.isDirectory();
                self.contentSize = stats.size;
                loadMetadata(self.getMetadataPath(), function () {
                    callback(true);
                });
            }
        });
    }
    removeChildResource(name, callback) {
        let self = this;
        let path = this.getStoragePath(name);
        super.removeChildResource(name, function () {
            if (path === '' || path === '/') {
                console.log('invalid path');
                callback(null);
            }
            else {
                let mpath = self.getMetadataPath(name);
                self.fs.remove(mpath, function (err) { });
                self.fs.remove(path, function (err) {
                    if (err)
                        console.log(err);
                    callback(true);
                });
            }
        });
    }
    getWriter() {
        let path = this.getStoragePath();
        if (this.isDirectory) {
            this.fs.removeSync(path);
            this.isDirectory = false;
        }
        this.loaded = false;
        return new FileResourceContentWriter(path);
    }
    read(writer, callback) {
        if (this.isDirectory) {
            writer.end(callback);
        }
        else {
            writer.start(this.getContentType());
            let path = this.getStoragePath();
            let fd = this.fs.openSync(path, 'r');
            let pos = 0;
            let sz = 0;
            while (true) {
                let buff = new Buffer(1024 * 500);
                sz = this.fs.readSync(fd, buff, 0, buff.length, pos);
                if (!sz)
                    break;
                pos += sz;
                if (sz < buff.length) {
                    writer.write(buff.slice(0, sz));
                }
                else {
                    writer.write(buff);
                }
            }
            this.fs.closeSync(fd);
            writer.end(callback);
        }
    }
}
class PouchDBResourceContentWriter {
    constructor(db, id) {
        this.buffer = [];
        this.db = db;
        this.id = id;
    }
    start(ctype) {
        this.ctype = ctype;
    }
    write(data) {
        this.buffer.push(data);
    }
    error(error) {
        console.log(error);
    }
    end(callback) {
        let self = this;
        let blob = null;
        if (typeof window !== 'undefined') {
            blob = new Blob(self.buffer, {
                type: self.ctype
            });
        }
        else {
            if (typeof this.buffer[0] === 'string')
                blob = new Buffer(this.buffer.join(''));
            else if (this.buffer[0] instanceof Buffer)
                blob = Buffer.concat(this.buffer);
            else
                blob = new Buffer('');
        }
        let update_doc = function (doc) {
            self.db.put(doc)
                .then(function (rv) {
                update_data({ _id: rv.id, _rev: rv.rev });
            })
                .catch(function (err) {
                console.log('X ' + doc._id);
                console.log(err);
                if (callback)
                    callback();
            });
        };
        let update_data = function (doc) {
            self.db.putAttachment(doc._id, 'content', doc._rev, blob, self.ctype)
                .then(function () {
                if (callback)
                    callback();
            })
                .catch(function (err) {
                console.log('A ' + doc._id);
                console.log(err);
                if (callback)
                    callback();
            });
        };
        self.db.get(this.id)
            .then(function (doc) {
            update_data(doc);
        })
            .catch(function (err) {
            if (err.status === 404) {
                update_doc({ _id: self.id });
            }
            else {
                console.log(err);
                if (callback)
                    callback();
            }
        });
    }
}
class PouchDBResource extends StoredResource {
    constructor(db, base, name) {
        super(name ? name : '', base ? base : '');
        this.contentType = null;
        this.db = db;
    }
    escape_name(n) {
        return n.replace('_', '%5F');
    }
    unescape_name(n) {
        return n.replace('%5F', '_');
    }
    escape_path(n) {
        return n.replace(/\//g, '!');
    }
    unescape_path(n) {
        return n.replace(/!/g, '/');
    }
    make_key(path) {
        if (path) {
            let level = path.split('/').length;
            if (level > 1000)
                level = 999;
            else if (level < 9)
                level = '00' + level;
            else if (level < 99)
                level = '0' + level;
            return this.escape_path('p:' + level + path);
        }
        else {
            return this.escape_path('p:001/');
        }
    }
    ensurePathExists(path, callback) {
        let self = this;
        let p = path.split('/');
        let b = [];
        if (p.length > 2) {
            b.push(p.shift());
            let update_node = function (id, cb) {
                self.db.put({ _id: id })
                    .then(function () {
                    cb();
                })
                    .catch(function (err) {
                    cb();
                });
            };
            let get_node = function () {
                if (p.length > 0) {
                    b.push(p.shift());
                    let bp = b.join('/');
                    let id = self.make_key(bp);
                    self.db.get(id)
                        .then(function () {
                        get_node();
                    })
                        .catch(function (err) {
                        update_node(id, get_node);
                    });
                }
                else {
                    callback(true);
                }
            };
            get_node();
        }
        else {
            callback(true);
        }
    }
    storeChildrenNames(callback) {
        callback();
    }
    storeProperties(callback) {
        let self = this;
        let path = this.getStoragePath();
        let id = this.make_key(path);
        let update_doc = function (doc) {
            for (let key in self.values) {
                let v = self.values[key];
                key = key.trim();
                if (v && key)
                    doc[self.escape_name(key)] = v;
            }
            self.db.put(doc)
                .then(function () {
                callback(true);
            })
                .catch(function (err) {
                console.log(err);
                callback(false);
            });
        };
        self.db.get(id)
            .then(function (doc) {
            for (let key in doc) {
                if (key.charAt(0) === '_')
                    continue;
                if (!self.values[key])
                    delete doc[key];
            }
            update_doc(doc);
        })
            .catch(function (err) {
            if (err.status === 404) {
                let doc = { _id: id };
                update_doc(doc);
            }
            else {
                console.log(err);
                callback(false);
            }
        });
    }
    loadProperties(callback) {
        let self = this;
        let path = this.getStoragePath();
        let id = this.make_key(path);
        self.db.get(id)
            .then(function (doc) {
            for (let key in doc) {
                let v = doc[key];
                if (key.charAt(0) === '_')
                    continue;
                if (v)
                    self.values[self.unescape_name(key)] = v;
            }
            if (doc._attachments) {
                self.contentSize = doc._attachments.content.length;
                self.isDirectory = false;
            }
            else {
                self.contentSize = 0;
            }
            callback(true);
        })
            .catch(function (err) {
            if (err.status === 404 && path === '') {
                callback(true);
            }
            else {
                callback(false);
            }
        });
    }
    makeNewResource(name) {
        let path = this.getStoragePath();
        return new PouchDBResource(this.db, path, name);
    }
    removeChildResource(name, callback) {
        let self = this;
        let path = this.getStoragePath(name);
        let id = this.make_key(path);
        super.removeChildResource(name, function () {
            let remove_attachment = function (doc) {
                self.db.removeAttachment(doc._id, 'content', doc._rev)
                    .then(function () {
                    console.log('done');
                })
                    .catch(function (err) {
                    console.log('4');
                    console.log(err);
                });
            };
            let remove_docs = function (todelete) {
                self.db.bulkDocs(todelete)
                    .then(function () {
                    callback();
                })
                    .catch(function (err) {
                    console.log('2');
                    console.log(err);
                    callback();
                });
            };
            self.db.allDocs({
                include_docs: true,
                attachments: false
            })
                .then(function (rv) {
                let todelete = [];
                for (var i = 0; i < rv.rows.length; i++) {
                    var it = rv.rows[i];
                    var key = self.unescape_path(it.id.substr(5));
                    if (key.indexOf(path) === 0) {
                        it.doc._deleted = true;
                        todelete.push(it.doc);
                        console.log('D:' + key);
                    }
                }
                remove_docs(todelete);
            })
                .catch(function (err) {
                console.log('1');
                console.log(err);
                callback();
            });
        });
    }
    loadChildrenNames(callback) {
        let self = this;
        let path = this.getStoragePath() + '/';
        let id = this.make_key(path);
        this.db.allDocs({
            include_docs: false,
            attachments: false,
            startkey: id,
            endkey: id + '\ufff0'
        })
            .then(function (result) {
            let rv = [];
            for (var i = 0; i < result.rows.length; i++) {
                let it = result.rows[i];
                rv.push(Utils.filename(self.unescape_path(it.id)));
            }
            callback(rv);
        })
            .catch(function (err) {
            callback([]);
            console.log(err);
        });
    }
    getWriter() {
        let path = this.getStoragePath();
        let id = this.make_key(path);
        this.loaded = false;
        return new PouchDBResourceContentWriter(this.db, id);
    }
    read(writer, callback) {
        let path = this.getStoragePath();
        let id = this.make_key(path);
        let self = this;
        self.db.get(id).then(function (doc) {
            self.db.getAttachment(doc._id, 'content', {
                rev: doc._rev
            }).then(function (data) {
                writer.start(data.type);
                writer.write(data);
                writer.end(callback);
            })
                .catch(function (err) {
                console.log(err);
                writer.end(callback);
            });
        })
            .catch(function (err) {
            console.log(err);
            writer.end(callback);
        });
    }
}
class DropBoxResourceContentWriter {
    constructor(dbx, filePath) {
        this.buffer = [];
        this.dbx = dbx;
        this.filePath = filePath;
    }
    start(ctype) { }
    write(data) {
        this.buffer.push(data);
    }
    error(error) {
        console.log(error);
    }
    end(callback) {
        let self = this;
        let offset = 0;
        let fileid = null;
        if (typeof this.buffer[0] === 'string') {
            this.buffer = [Buffer.from(this.buffer.join(''))];
        }
        let finish = function () {
            self.dbx.filesUploadSessionFinish({
                cursor: {
                    session_id: fileid.session_id,
                    offset: offset
                },
                commit: {
                    path: self.filePath,
                    mode: 'overwrite'
                }
            })
                .then(function (response) {
                if (callback)
                    callback();
            })
                .catch(function (err) {
                console.log(err);
                if (callback)
                    callback();
            });
        };
        let store_chunk_continue = function (data) {
            self.dbx.filesUploadSessionAppend({
                contents: data,
                offset: offset,
                session_id: fileid.session_id
            })
                .then(function (response) {
                if (data.length)
                    offset += data.length;
                else if (data.byteLength)
                    offset += data.byteLength;
                if (self.buffer.length > 0)
                    store_chunk_continue(self.buffer.shift());
                else
                    finish();
            })
                .catch(function (err) {
                console.log(err);
                if (callback)
                    callback();
            });
        };
        let store_chunk = function (data) {
            let close = false;
            if (data === null)
                close = true;
            self.dbx.filesUploadSessionStart({
                contents: data,
                close: close
            })
                .then(function (response) {
                fileid = response;
                if (data.length)
                    offset += data.length;
                else if (data.byteLength)
                    offset += data.byteLength;
                if (self.buffer.length > 0)
                    store_chunk_continue(self.buffer.shift());
                else
                    finish();
            })
                .catch(function (err) {
                console.log(err);
                if (callback)
                    callback();
            });
        };
        store_chunk(self.buffer.shift());
    }
}
class DropBoxResource extends StoredResource {
    constructor(dbx, name, base) {
        super(name ? name : '', base ? base : '');
        this.dbx = dbx;
    }
    makeNewResource(name) {
        let path = this.getStoragePath();
        return new DropBoxResource(this.dbx, name, path);
    }
    storeProperties(callback) {
        let self = this;
        let path = this.getMetadataPath();
        this.dbx.filesUpload({
            contents: JSON.stringify(self.values),
            path: path,
            mute: true,
            mode: 'overwrite'
        })
            .then(function (response) {
            callback();
        })
            .catch(function (error) {
            callback(null);
        });
    }
    loadProperties(callback) {
        let path = this.getStoragePath();
        let self = this;
        let load_metadata = function (callback) {
            let metadata = self.getMetadataPath();
            self.dbx.filesDownload({
                path: metadata
            })
                .then(function (data) {
                if (data.fileBinary) {
                    let txt = data.fileBinary.toString();
                    try {
                        let a = JSON.parse(txt);
                        self.values = a;
                    }
                    catch (ignore) { }
                    ;
                    callback(true);
                }
                else {
                    let reader = new FileReader();
                    reader.onload = function (event) {
                        let txt = reader.result;
                        try {
                            let a = JSON.parse(txt);
                            self.values = a;
                        }
                        catch (ignore) { }
                        ;
                        callback(true);
                    };
                    reader.readAsText(data.fileBlob);
                }
            })
                .catch(function (error) {
                callback(true);
            });
        };
        if (path) {
            self.dbx.filesGetMetadata({
                path: path
            })
                .then(function (response) {
                if (response['.tag'] === 'file') {
                    self.isDirectory = false;
                    self.contentSize = response.size;
                    callback(true);
                }
                else {
                    self.contentSize = 0;
                    self.isDirectory = true;
                    load_metadata(callback);
                }
            })
                .catch(function (error) {
                callback(false);
            });
        }
        else {
            callback(true);
        }
    }
    removeChildResource(name, callback) {
        let self = this;
        let path = this.getStoragePath(name);
        super.removeChildResource(name, function () {
            self.dbx.filesDelete({
                path: path
            })
                .then(function (response) {
                callback();
            })
                .catch(function (error) {
                callback(null);
            });
        });
    }
    storeChildrenNames(callback) {
        callback();
    }
    ensurePathExists(path, callback) {
        if (path === '' || path === '/') {
            callback(true);
        }
        else {
            let self = this;
            self.dbx.filesCreateFolder({
                path: path
            })
                .then(function () {
                callback(true);
            })
                .catch(function (error) {
                if (error.status === 409)
                    callback(true);
                else
                    callback(false);
            });
        }
    }
    loadChildrenNames(callback) {
        let self = this;
        let path = this.getStoragePath();
        let rv = [];
        self.dbx.filesListFolder({
            path: path
        })
            .then(function (response) {
            for (let i = 0; i < response.entries.length; i++) {
                let item = response.entries[i];
                let name = item.name;
                if (name.charAt(0) === '.')
                    continue;
                rv.push(name);
            }
            callback(rv);
        })
            .catch(function (error) {
            callback([]);
        });
    }
    getWriter() {
        let path = this.getStoragePath();
        if (this.isDirectory) {
            this.isDirectory = false;
        }
        this.loaded = false;
        return new DropBoxResourceContentWriter(this.dbx, path);
    }
    read(writer, callback) {
        if (this.isDirectory) {
            writer.end(callback);
        }
        else {
            let path = this.getStoragePath();
            let ct = this.getContentType();
            this.dbx.filesDownload({
                path: path
            })
                .then(function (data) {
                if (typeof window !== 'undefined') {
                    let reader = new FileReader();
                    reader.onload = function (event) {
                        writer.start(ct);
                        writer.write(reader.result);
                        writer.end(callback);
                    };
                    reader.readAsArrayBuffer(data.fileBlob);
                }
                else {
                    writer.start(ct);
                    writer.write(data.fileBinary);
                    writer.end(callback);
                }
            })
                .catch(function (error) {
                writer.end(callback);
            });
        }
    }
}
class GitHubResourceContentWriter {
    constructor(repo, filePath) {
        this.buffer = [];
        this.repo = repo;
        this.filePath = filePath;
    }
    start(ctype) { }
    write(data) {
        this.buffer.push(data);
    }
    error(error) {
        console.log(error);
    }
    end(callback) {
        let self = this;
        let data = '';
        let opts = {
            encode: true
        };
        if (typeof Buffer !== 'undefined' && this.buffer[0] instanceof Buffer) {
            let b = Buffer.concat(this.buffer);
            data = b.toString('base64');
            opts.encode = false;
        }
        else if (typeof this.buffer[0] === 'string') {
            data = this.buffer.join('');
        }
        this.repo.writeFile('master', this.filePath, data, '', opts, function () {
            callback();
        });
    }
}
class GitHubResource extends StoredResource {
    constructor(repo, name, base) {
        super(name ? name : '', base ? base : '');
        this.resources = null;
        this.repo = repo;
    }
    makeNewResource(name) {
        let path = this.getStoragePath();
        let res = new GitHubResource(this.repo, name, path);
        return res;
    }
    getStoragePath(name) {
        let path = Utils.filename_path_append(this.basePath, this.baseName);
        if (name)
            path = Utils.filename_path_append(path, name);
        if (path.charAt(0) === '/')
            path = path.substr(1);
        return path;
    }
    storeProperties(callback) {
        let self = this;
        let path = this.getMetadataPath();
        let str = JSON.stringify(self.values);
        let opts = {
            encode: true
        };
        this.repo.writeFile('master', path, str, '', opts, function () {
            callback();
        });
    }
    loadProperties(callback) {
        let self = this;
        let storePath = this.getStoragePath();
        let load_metadata = function () {
            let metadata = self.getMetadataPath();
            self.repo.getContents('master', metadata, false)
                .then(function (response) {
                if (response.data.content) {
                    let str = Utils.base642ArrayBuffer(response.data.content);
                    if (str) {
                        self.values = JSON.parse(str.toString());
                    }
                }
                callback(true);
            })
                .catch(function (error) {
                if (error.response.status === 404)
                    callback(true);
                else
                    callback(false);
            });
        };
        if (storePath) {
            self.repo.getContents('master', storePath, false)
                .then(function (response) {
                if (response.data.type && response.data.type === 'file') {
                    self.isDirectory = false;
                    self.contentSize = response.data.size;
                    callback(true);
                }
                else {
                    self.contentSize = 0;
                    load_metadata();
                }
            })
                .catch(function (error) {
                callback(false);
            });
        }
        else {
            callback(true);
        }
    }
    loadChildrenNames(callback) {
        let self = this;
        let storePath = this.getStoragePath();
        self.repo.getContents('master', storePath, false)
            .then(function (response) {
            let rv = [];
            for (let i = 0; i < response.data.length; i++) {
                let item = response.data[i];
                let name = item.name;
                if (name.charAt(0) === '.')
                    continue;
                rv.push(name);
            }
            callback(rv);
        })
            .catch(function (error) {
            callback([]);
        });
    }
    storeChildrenNames(callback) {
        callback();
    }
    ensurePathExists(path, callback) {
        callback(true);
    }
    importContent(func, callback) {
        func(this.getWriter(), callback);
    }
    removeChildResource(name, callback) {
        let self = this;
        let todelete = [];
        let storePath = Utils.filename_dir(this.getStoragePath(name));
        let delete_paths = function (paths) {
            if (paths.length) {
                let path = paths.pop();
                self.repo.deleteFile('master', path, function () {
                    delete_paths(todelete);
                })
                    .catch(function () {
                    callback(null);
                });
            }
            else {
                callback();
            }
        };
        let cc = 0;
        let collect_all = function (path) {
            self.repo.getContents('master', path, false)
                .then(function (response) {
                cc++;
                for (let i = 0; i < response.data.length; i++) {
                    let item = response.data[i];
                    let np = Utils.filename_path_append(path, item.name);
                    if (item.type === 'dir') {
                        collect_all(np);
                    }
                    else {
                        todelete.push(np);
                    }
                }
                cc--;
                if (cc === 0) {
                    delete_paths(todelete);
                }
            })
                .catch(function (error) {
                callback(null);
            });
        };
        self.repo.getContents('master', storePath, false)
            .then(function (response) {
            for (let i = 0; i < response.data.length; i++) {
                let item = response.data[i];
                if (item.name === name) {
                    let path = name;
                    if (storePath)
                        path = Utils.filename_path_append(storePath, name);
                    if (item.type === 'dir') {
                        collect_all(path);
                        return;
                    }
                    else {
                        todelete.push(path);
                        delete_paths(todelete);
                        return;
                    }
                }
            }
            callback();
        })
            .catch(function (error) {
            callback(null);
        });
        if (this.childNames)
            this.childNames.splice(this.childNames.indexOf(name), 1);
        this.clearCachedResource(name);
    }
    getWriter() {
        let path = this.getStoragePath();
        if (this.isDirectory) {
            this.isDirectory = false;
        }
        this.loaded = false;
        return new GitHubResourceContentWriter(this.repo, path);
    }
    read(writer, callback) {
        if (this.isDirectory) {
            writer.end(callback);
        }
        else {
            let storePath = this.getStoragePath();
            let ct = this.getContentType();
            this.repo.getContents('master', storePath, false)
                .then(function (data) {
                let content = data.data.content;
                let encoding = data.data.encoding;
                writer.start(ct);
                writer.write(Utils.base642ArrayBuffer(content));
                writer.end(callback);
            })
                .catch(function (error) {
                writer.end(callback);
            });
        }
    }
}
class LunrIndexResource extends IndexResource {
    constructor(name, base, index) {
        super(name, base, index);
    }
    restoreIndex(elasticlunr, callback) {
        callback();
    }
    makeIndex(elasticlunr, callback) {
        elasticlunr.tokenizer.setSeperator(/[\W]+/);
        let index = elasticlunr(function () {
            this.setRef('id');
            this.addField('body');
            this.addField('path');
            this.addField('name');
            this.saveDocument(false);
        });
        callback(index);
    }
    initIndexEngine(callback) {
        let self = this;
        let elasticlunr = window['elasticlunr'];
        if (this.getIndexEngine()) {
            self.makeIndex(elasticlunr, callback);
        }
        else {
            self.restoreIndex(elasticlunr, function (index) {
                if (index) {
                    callback(index);
                }
                else {
                    self.makeIndex(elasticlunr, callback);
                }
            });
        }
    }
    searchResources(qry, callback) {
        let indx = this.getIndexEngine();
        let list = [];
        let opts = {
            expand: true,
            bool: "AND"
        };
        let rv = indx.search(qry, opts);
        for (let i = 0; i < rv.length; i++) {
            let doc = rv[i];
            let ref = doc['ref'];
            let score = doc['score'];
            if (score > 0) {
                let res = new ObjectResource({ 'reference': ref, 'score': doc['score'] }, ref);
                list.push(res);
            }
        }
        callback(list);
    }
    indexTextData(text, callback) {
        let name = this.baseName;
        let path = this.getStoragePath();
        let id = '/' + path;
        let indx = this.getIndexEngine();
        let doc = {
            id: id,
            name: name,
            path: path,
            body: text
        };
        indx.removeDoc(doc);
        indx.addDoc(doc);
        callback();
    }
    removeResourcesFromIndex(name, callback) {
        let path = this.getStoragePath(name);
        let id = '/' + path;
        let indx = this.getIndexEngine();
        indx.removeDoc({ id: id });
        callback();
    }
    saveIndexAsJSON() {
        let indx = this.getIndexEngine();
        return indx.toJSON();
    }
}
class HTMLParser {
    static parse(code) {
        if (typeof window !== 'undefined' && typeof window['jQuery'] !== 'undefined') {
            let parser = new DOMParser();
            let doc = parser.parseFromString(code, "text/html");
            let jq = function (sel) {
                return window['jQuery'](sel, doc);
            };
            jq['html'] = function () {
                let ser = new XMLSerializer();
                return ser.serializeToString(doc);
            };
            return jq;
        }
        else {
            let cheerio = require('cheerio');
            return cheerio.load(code);
        }
    }
}
if (typeof module !== 'undefined') {
    module.exports = {
        ServerRequestHandler: ServerRequestHandler,
        MultiResourceResolver: MultiResourceResolver,
        ResourceResolver: ResourceResolver,
        ObjectResource: ObjectResource,
        HBSRendererFactory: HBSRendererFactory,
        JSRendererFactory: JSRendererFactory,
        InterFuncRendererFactory: InterFuncRendererFactory,
        ResourceRequestHandler: ResourceRequestHandler,
        DropBoxResource: DropBoxResource,
        GitHubResource: GitHubResource,
        PouchDBResource: PouchDBResource,
        LunrIndexResource: LunrIndexResource,
        FileResource: FileResource,
        RootResource: RootResource,
        Utils: Utils
    };
}
