var __extends = (this && this.__extends) || (function () {
    var extendStatics = Object.setPrototypeOf ||
        ({ __proto__: [] } instanceof Array && function (d, b) { d.__proto__ = b; }) ||
        function (d, b) { for (var p in b) if (b.hasOwnProperty(p)) d[p] = b[p]; };
    return function (d, b) {
        extendStatics(d, b);
        function __() { this.constructor = d; }
        d.prototype = b === null ? Object.create(b) : (__.prototype = b.prototype, new __());
    };
})();
var Utils = (function () {
    function Utils() {
    }
    Utils.makeUUID = function () {
        var d = new Date().getTime();
        var uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
            var r = (d + Math.random() * 16) % 16 | 0;
            d = Math.floor(d / 16);
            return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
        });
        return uuid;
    };
    Utils.filename_path_append = function (path, name) {
        if (!name)
            return path;
        var p = path;
        if (p.charAt(p.length - 1) != '/')
            p += '/';
        p += name;
        return p;
    };
    Utils.filename = function (path) {
        if (!path)
            return path;
        var i = path.lastIndexOf('/');
        if (i == -1)
            return path;
        else {
            var name_1 = path.substr(i + 1);
            return name_1;
        }
    };
    Utils.filename_dir = function (path) {
        if (!path)
            return path;
        var i = path.lastIndexOf('/');
        if (i == -1)
            return '';
        else {
            var name_2 = path.substr(0, i);
            return name_2;
        }
    };
    Utils.filename_ext = function (path) {
        var i = path.lastIndexOf('.');
        if (i == -1)
            return '';
        else {
            var ext = path.substr(i + 1);
            return ext;
        }
    };
    Utils.absolute_path = function (path) {
        if (!path)
            return null;
        var stack = path.split('/');
        var rv = [];
        for (var i = 0; i < stack.length; i++) {
            var it = stack[i];
            if (it === '.')
                continue;
            if (it === '')
                continue;
            if (it === '..')
                rv.pop();
            else
                rv.push(it);
        }
        var s = rv.join('/');
        if (s.charAt(0) === '/')
            return s;
        else
            return '/' + s;
    };
    Utils.split_path = function (path) {
        if (path === '' || path === '/')
            return [];
        var ls = path.split('/');
        var names = [];
        for (var i = 0; i < ls.length; i++) {
            if (ls[i] != '') {
                names.push(ls[i]);
            }
        }
        return names;
    };
    Utils.ArrayBuffer2base64 = function (arrayBuffer) {
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
    };
    Utils.base642ArrayBuffer = function (base64) {
        var binary_string = window.atob(base64);
        var len = binary_string.length;
        var bytes = new Uint8Array(len);
        for (var i = 0; i < len; i++) {
            bytes[i] = binary_string.charCodeAt(i);
        }
        return bytes.buffer;
    };
    return Utils;
}());
var EventDispatcher = (function () {
    function EventDispatcher() {
        this._eventHandlers = {};
    }
    EventDispatcher.prototype.addEventListener = function (evt, handler) {
        this._eventHandlers[evt] = this._eventHandlers[evt] || [];
        this._eventHandlers[evt].push(handler);
    };
    EventDispatcher.prototype.removeEventListener = function (evt, handler) {
        var handlers = this._eventHandlers[evt];
        if (handlers) {
            for (var i = 0; i < handlers.length; i += 1) {
                if (handlers[i] === handler)
                    handlers.splice(i, 1);
            }
        }
    };
    EventDispatcher.prototype.removeEventListeners = function (evt) {
        delete this._eventHandlers[evt];
    };
    EventDispatcher.prototype.dispatchAllEvents = function (evt) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var handlers = this._eventHandlers[evt];
        if (handlers) {
            for (var i = 0; i < handlers.length; i += 1) {
                handlers[i](args);
            }
        }
    };
    EventDispatcher.prototype.dispatchAllEventsAsync = function (evt) {
        var args = [];
        for (var _i = 1; _i < arguments.length; _i++) {
            args[_i - 1] = arguments[_i];
        }
        var self = this;
        setTimeout(function () {
            self.dispatchAllEvents.apply(self, [evt].concat(args));
        }, 0);
    };
    return EventDispatcher;
}());
var Resource = (function () {
    function Resource(name) {
        this.resourceName = name;
    }
    Resource.prototype.getType = function () {
        return 'resource/node';
    };
    Resource.prototype.getSuperType = function () {
        return null;
    };
    Resource.prototype.getName = function () {
        return this.resourceName;
    };
    Resource.prototype.getRenderType = function () {
        return null;
    };
    Resource.prototype.getRenderTypes = function () {
        var rv = [];
        var rt = this.getRenderType();
        var st = this.getSuperType();
        if (rt)
            rv.push(rt);
        rv.push(this.getType());
        if (st)
            rv.push(st);
        return rv;
    };
    Resource.prototype.getPropertyNames = function () {
        return [];
    };
    Resource.prototype.getProperties = function () {
        var map = {};
        var names = this.getPropertyNames();
        for (var i = 0; i < names.length; i++) {
            var n = names[i];
            map[n] = this.getProperty(n);
        }
        return map;
    };
    Resource.prototype.resolveOrCreateChildResource = function (name, callback, walking) {
        var self = this;
        this.resolveChildResource(name, function (res) {
            if (res) {
                callback(res);
            }
            else {
                self.createChildResource(name, callback);
            }
        }, walking);
    };
    Resource.prototype.exportData = function (callback) {
        var self = this;
        var names = this.getPropertyNames();
        var rv = {};
        for (var i = 0; i < names.length; i++) {
            var name_3 = names[i];
            var value = this.getProperty(name_3);
            if (value)
                rv[name_3] = value;
        }
        if (this.getRenderType()) {
            rv[Resource.STORE_RENDERTYPE_PROPERTY] = this.getRenderType();
        }
        if (this.isContentResource()) {
            rv[Resource.STORE_CONTENT_PROPERTY] = function (res, callback) {
                self.read(res);
                callback();
            };
        }
        callback(rv);
    };
    Resource.prototype.exportChilrenResources = function (level, writer) {
        var self = this;
        var processing = 0;
        var done = function () {
            if (processing === 0) {
                writer.end();
                processing = -1;
            }
        };
        var export_children = function (path, name, res) {
            processing++;
            processing++;
            res.exportData(function (data) {
                if (name)
                    data[':name'] = name;
                if (path)
                    data[':path'] = path;
                writer.write(data);
                processing--;
                done();
            });
            res.listChildrenNames(function (names) {
                processing += names.length;
                var _loop_1 = function () {
                    var name_4 = names[i];
                    res.resolveChildResource(name_4, function (r) {
                        var rpath = Utils.filename_path_append(path, name_4);
                        export_children(rpath, name_4, r);
                        processing--;
                    });
                };
                for (var i = 0; i < names.length; i++) {
                    _loop_1();
                }
                processing--;
                done();
            });
        };
        writer.start('object');
        export_children('', this.getName(), this);
    };
    Resource.prototype.listChildrenResources = function (callback) {
        var self = this;
        this.listChildrenNames(function (ls) {
            var rv = [];
            if (ls.length > 0) {
                for (var i = 0; i < ls.length; i++) {
                    var name_5 = ls[i];
                    self.resolveChildResource(name_5, function (res) {
                        rv.push(res);
                        if (rv.length === ls.length) {
                            callback(rv);
                        }
                    });
                }
            }
            else {
                callback([]);
            }
        });
    };
    Resource.prototype.isContentResource = function () {
        return false;
    };
    Resource.prototype.start = function (ctype) {
    };
    Resource.prototype.write = function (data) {
    };
    Resource.prototype.error = function (error) {
    };
    Resource.prototype.end = function () {
    };
    Resource.prototype.read = function (writer) {
        writer.end();
    };
    Resource.IO_TIMEOUT = 2000;
    Resource.STORE_CONTENT_PROPERTY = '_content';
    Resource.STORE_RENDERTYPE_PROPERTY = '_rt';
    return Resource;
}());
var ResourceResolver = (function () {
    function ResourceResolver(resource) {
        this.resource = resource;
    }
    ResourceResolver.prototype.resolveResource = function (path, callback) {
        if (path === '/' || path === '') {
            callback(this.resource);
        }
        else {
            var paths_1 = Utils.split_path(path);
            var p = paths_1.shift();
            var resolve_path_1 = function (res, name) {
                var walking = false;
                if (paths_1.length > 0)
                    walking = true;
                res.resolveChildResource(name, function (rv) {
                    if (!rv) {
                        callback(null);
                    }
                    else if (paths_1.length == 0) {
                        callback(rv);
                    }
                    else {
                        var p_1 = paths_1.shift();
                        resolve_path_1(rv, p_1);
                    }
                }, walking);
            };
            resolve_path_1(this.resource, p);
        }
    };
    ResourceResolver.prototype.storeResource = function (path, data, callback) {
        var self = this;
        if (path === '/' || path === '') {
            this.resource.importData(data, callback);
        }
        else {
            var paths_2 = Utils.split_path(path);
            var p = paths_2.shift();
            var resolve_path_2 = function (res, name) {
                var walking = false;
                if (paths_2.length > 0)
                    walking = true;
                res.resolveOrCreateChildResource(name, function (rv) {
                    if (!rv) {
                        callback(null);
                    }
                    else if (paths_2.length == 0) {
                        rv.importData(data, callback);
                    }
                    else {
                        var p_2 = paths_2.shift();
                        resolve_path_2(rv, p_2);
                    }
                }, walking);
            };
            resolve_path_2(this.resource, p);
        }
    };
    ResourceResolver.prototype.exportResources = function (path, callback) {
        this.resolveResource(path, function (res) {
            if (res) {
                res.exportChilrenResources(0, {
                    start: function (ctype) {
                    },
                    write: function (data) {
                        callback(data);
                    },
                    error: function (err) {
                    },
                    end: function () {
                        callback(null);
                    }
                });
            }
            else {
                callback(null);
            }
        });
    };
    ResourceResolver.prototype.copyResource = function (fromPath, toPath, callback) {
        if (fromPath === '/' || fromPath === '') {
            callback();
            return;
        }
        if (fromPath === toPath) {
            callback();
            return;
        }
        var self = this;
        var processing = 0;
        var done = function () {
            if (processing === 0) {
                processing = -1;
                callback(arguments);
            }
        };
        this.exportResources(fromPath, function (data) {
            if (data) {
                var path = Utils.filename_path_append(toPath, data[':path']);
                processing++;
                self.storeResource(path, data, function () {
                    processing--;
                    done();
                });
            }
            else {
                done();
            }
        });
    };
    ResourceResolver.prototype.moveResource = function (path, callback) {
        callback();
    };
    return ResourceResolver;
}());
var ContentWriterAdapter = (function () {
    function ContentWriterAdapter(callback) {
        this.callback = callback;
    }
    ContentWriterAdapter.prototype.start = function (ctype) {
        this.ctype = ctype;
    };
    ContentWriterAdapter.prototype.write = function (data) {
        this.data = data;
    };
    ContentWriterAdapter.prototype.error = function (error) {
        console.log(error);
    };
    ContentWriterAdapter.prototype.end = function () {
        this.callback(this.data, this.ctype);
    };
    return ContentWriterAdapter;
}());
var ResourceRenderer = (function () {
    function ResourceRenderer(resolver) {
        this.rendererResolver = resolver;
        this.rendererFactories = new Map();
    }
    ResourceRenderer.prototype.makeRenderTypePaths = function (renderTypes, selectors) {
        var rv = [];
        var factories = this.rendererFactories;
        for (var i = 0; i < renderTypes.length; i++) {
            factories.forEach(function (val, key, map) {
                if (key == '')
                    return;
                var f = Utils.filename(renderTypes[i]);
                for (var z = 0; z < selectors.length; z++) {
                    var sel = selectors[z];
                    var p = renderTypes[i] + '/' + sel;
                    rv.push(p);
                    rv.push(p + '.' + key);
                    p = renderTypes[i] + '/' + f + '.' + sel;
                    rv.push(p);
                    rv.push(p + '.' + key);
                }
            });
        }
        return rv;
    };
    ResourceRenderer.prototype.makeRenderingFunction = function (path, resource, callback) {
        var ext = Utils.filename_ext(path);
        var fact = this.rendererFactories.get(ext);
        fact.makeRenderer(resource, callback);
    };
    ResourceRenderer.prototype.registerFactory = function (typ, factory) {
        this.rendererFactories.set(typ, factory);
    };
    ResourceRenderer.prototype.renderError = function (message, resource, error, writer) {
        writer.start('text/plain');
        writer.write(message + '\n');
        writer.write('resource ' + resource.getName() + ':' + resource.getType() + '\n');
        if (error)
            writer.write(error.message);
        writer.end();
    };
    ResourceRenderer.prototype.renderResource = function (res, rtype, sel, writer, context) {
        var self = this;
        var selectors = [sel];
        var renderTypes = res.getRenderTypes();
        renderTypes.push('any');
        this.resolveRenderer(renderTypes, selectors, function (rend, error) {
            if (rend) {
                rend(res, writer, context);
            }
            else {
                self.renderError('unable to render selector ' + sel, res, error, writer);
            }
        });
    };
    ResourceRenderer.prototype.resolveRenderer = function (renderTypes, selectors, callback) {
        var rtypes = this.makeRenderTypePaths(renderTypes, selectors);
        var plist = rtypes.slice();
        var p = rtypes.shift();
        var self = this;
        var resolve_renderer = function (p) {
            console.log('try:' + p);
            self.rendererResolver.resolveResource(p, function (rend) {
                if (rend) {
                    if (rend.isContentResource()) {
                        self.makeRenderingFunction(p, rend, callback);
                    }
                    else {
                        callback(null, new Error('no ContentResource at path :' + p));
                    }
                }
                else if (rtypes.length > 0) {
                    var p_3 = rtypes.shift();
                    resolve_renderer(p_3);
                }
                else {
                    callback(null, new Error('paths:' + plist.join('\n')));
                }
            });
        };
        resolve_renderer(p);
    };
    return ResourceRenderer;
}());
var ClientFormInfo = (function () {
    function ClientFormInfo() {
    }
    return ClientFormInfo;
}());
var ResourceRequestContext = (function () {
    function ResourceRequestContext() {
    }
    ResourceRequestContext.prototype.getPathProperties = function () {
        var p = {};
        p['PREFIX'] = this.pathInfo.prefix;
        p['SUFFIX'] = this.pathInfo.suffix;
        p['PATH'] = this.pathInfo.path;
        p['NAME'] = this.pathInfo.name;
        p['DATA_PATH'] = this.pathInfo.dataPath;
        p['DATA_NAME'] = this.pathInfo.dataName;
        var pplus = this.pathInfo.path;
        if (pplus !== '/')
            pplus = pplus + '/';
        p['PATH_APPEND'] = pplus;
        var dplus = this.pathInfo.dataPath ? this.pathInfo.dataPath : '';
        if (dplus !== '/')
            dplus = dplus + '/';
        p['DATA_PATH_APPEND'] = dplus;
        return p;
    };
    ResourceRequestContext.prototype.getEnvironmentProperties = function () {
        return this.resourceRequestHandler._environmentProperties;
    };
    ResourceRequestContext.prototype.makeContextMap = function (res) {
        var map = {};
        var ctx = this.getPathProperties();
        if (res) {
            map['renderType'] = res.getRenderType();
            map['type'] = res.getType();
            map['name'] = res.getName();
            map['superType'] = res.getSuperType();
            map['isContentResource'] = res.isContentResource();
            map['_'] = res.getProperties();
        }
        map['R'] = ctx;
        map['E'] = this.getEnvironmentProperties();
        return map;
    };
    ResourceRequestContext.prototype.clone = function () {
        var ctx = new ResourceRequestContext();
        ctx.pathInfo = this.pathInfo.clone();
        ctx.resourceRequestHandler = this.resourceRequestHandler;
        return ctx;
    };
    return ResourceRequestContext;
}());
var PathInfo = (function () {
    function PathInfo() {
    }
    PathInfo.prototype.clone = function () {
        var pi = new PathInfo();
        pi.parameters = this.parameters;
        pi.path = this.path;
        pi.name = this.name;
        pi.dirname = this.dirname;
        pi.dirnames = this.dirnames;
        pi.selector = this.selector;
        pi.selectorArgs = this.selectorArgs;
        pi.prefix = this.prefix;
        pi.suffix = this.suffix;
        pi.dataPath = this.dataPath;
        pi.dataName = this.dataName;
        pi.resourcePath = this.resourcePath;
        return pi;
    };
    return PathInfo;
}());
var ResourceRequestHandler = (function (_super) {
    __extends(ResourceRequestHandler, _super);
    function ResourceRequestHandler(resourceResolver, templateResolver, contentWriter) {
        var _this = _super.call(this) || this;
        _this._environmentProperties = new Map();
        _this.resourceResolver = resourceResolver;
        _this.templateResolver = templateResolver;
        _this.contentWriter = new OrderedContentWriter(contentWriter);
        _this.resourceRenderer = new ResourceRenderer(_this.templateResolver);
        return _this;
    }
    ResourceRequestHandler.prototype.expandValue = function (val, data) {
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
    };
    ResourceRequestHandler.prototype.expandValues = function (values, data) {
        var rv1 = {};
        for (var key in values) {
            var v = values[key];
            rv1[key] = this.expandValue(v, data);
        }
        var rv2 = {};
        for (var key in rv1) {
            var val = rv1[key];
            if (key.indexOf('{:') === 0) {
                var nkey = rv1[key.substr(1, key.length - 2)];
                if (nkey)
                    rv2[nkey] = val;
            }
            else {
                rv2[key] = val;
            }
        }
        return rv2;
    };
    ResourceRequestHandler.prototype.transformValues = function (data) {
        for (var key in data) {
            var val = data[key];
            if (key.charAt(0) === ':' && key.indexOf('|') !== -1) {
                var a = key.split('|');
                for (var i = 1; i < a.length; i++) {
                    var t = a[i];
                    if (t === 'newUUID' && !val) {
                        val = Utils.makeUUID();
                    }
                    else if (!val) {
                        val = data[t];
                    }
                    data[a[0]] = val;
                }
            }
        }
    };
    ResourceRequestHandler.prototype.setEnvironment = function (name, val) {
        this._environmentProperties[name] = val;
    };
    ResourceRequestHandler.prototype.parsePath = function (rpath) {
        var info = new PathInfo();
        var path = rpath.replace(/\/+/g, '/');
        var m = path.match(/^(\/.*?)(\.x([a-z,\-_]+))(\.([a-z0-9,\-\.]+))?(\/.*?)?$/);
        if (!m)
            return null;
        info.dataPath = m[6] ? m[6] : null;
        info.selectorArgs = m[5] ? m[5] : null;
        info.path = Utils.absolute_path(m[1]);
        info.selector = m[3];
        info.suffix = m[2];
        info.dirname = Utils.filename_dir(info.path);
        info.name = Utils.filename(info.path);
        info.resourcePath = info.path;
        if (info.dataPath)
            info.dataPath = Utils.absolute_path(info.dataPath);
        info.dataName = Utils.filename(info.dataPath);
        return info;
    };
    ResourceRequestHandler.prototype.makeContext = function (pathInfo) {
        var context = new ResourceRequestContext();
        context.pathInfo = pathInfo;
        context.resourceRequestHandler = this;
        return context;
    };
    ResourceRequestHandler.prototype.registerFactory = function (typ, factory) {
        this.resourceRenderer.registerFactory(typ, factory);
    };
    ResourceRequestHandler.prototype.handleRequest = function (rpath) {
        this.renderRequest(rpath);
    };
    ResourceRequestHandler.prototype.forwardRequest = function (rpath) {
        this.renderRequest(rpath);
    };
    ResourceRequestHandler.prototype.renderRequest = function (rpath) {
        var out = this.contentWriter.makeNestedContentWriter();
        var info = this.parsePath(rpath);
        var rres = this.resourceResolver;
        var rrend = this.resourceRenderer;
        var context = this.makeContext(info);
        try {
            if (info) {
                rres.resolveResource(info.resourcePath, function (res) {
                    if (res)
                        rrend.renderResource(res, res.getType(), info.selector, out, context);
                    else {
                        var res_1 = new NotFoundResource(info.resourcePath);
                        rrend.renderResource(res_1, res_1.getType(), info.selector, out, context);
                    }
                });
            }
            else {
                rrend.renderResource(new ErrorResource('invalid path ' + rpath), null, 'default', out, context);
            }
        }
        catch (ex) {
            console.log(ex);
            rrend.renderResource(new ErrorResource(ex), null, 'default', out, context);
        }
    };
    ResourceRequestHandler.prototype.renderResource = function (resourcePath, rtype, selector, context, callback) {
        var out = new OrderedContentWriter(new BufferedContentWriter(callback));
        var rres = this.resourceResolver;
        var rrend = this.resourceRenderer;
        var ncontext = context.clone();
        ncontext.pathInfo.resourcePath = resourcePath;
        try {
            if (resourcePath) {
                rres.resolveResource(resourcePath, function (res) {
                    if (res)
                        rrend.renderResource(res, rtype, selector, out, ncontext);
                    else {
                        var res_2 = new NotFoundResource(resourcePath);
                        rrend.renderResource(res_2, res_2.getType(), selector, out, ncontext);
                    }
                });
            }
            else {
                rrend.renderResource(new ErrorResource('invalid path ' + resourcePath), null, 'default', out, ncontext);
            }
        }
        catch (ex) {
            console.log(ex);
            rrend.renderResource(new ErrorResource(ex), null, 'default', out, ncontext);
        }
    };
    ResourceRequestHandler.prototype.handleStore = function (rpath, data) {
        var self = this;
        var info = this.parsePath(rpath);
        var context = this.makeContext(info);
        var rrend = this.resourceRenderer;
        var rres = this.resourceResolver;
        try {
            data = this.expandValues(data, data);
            var forward_1 = Utils.absolute_path(data[':forward']);
            var remove_1 = Utils.absolute_path(data[':delete']);
            var copyto = Utils.absolute_path(data[':copyto']);
            if (info) {
                if (copyto) {
                    rres.copyResource(info.resourcePath, copyto, function () {
                        self.dispatchAllEventsAsync('stored', info.resourcePath, data);
                        if (forward_1)
                            self.forwardRequest(forward_1);
                        else
                            self.renderRequest(rpath);
                    });
                }
                else if (remove_1) {
                    var dirname = Utils.filename_dir(remove_1);
                    var name_6 = Utils.filename(remove_1);
                    rres.resolveResource(dirname, function (res) {
                        res.removeChildResource(name_6, function () {
                            self.dispatchAllEventsAsync('stored', remove_1, data);
                            if (forward_1)
                                self.forwardRequest(forward_1);
                            else
                                self.renderRequest(rpath);
                        });
                    });
                }
                else {
                    rres.storeResource(info.resourcePath, data, function () {
                        self.dispatchAllEventsAsync('stored', info.resourcePath, data);
                        if (forward_1)
                            self.forwardRequest(forward_1);
                        else
                            self.renderRequest(rpath);
                    });
                }
            }
            else {
                var out = this.contentWriter.makeNestedContentWriter();
                rrend.renderResource(new ErrorResource('invalid path ' + rpath), null, 'default', out, context);
            }
        }
        catch (ex) {
            console.log(ex);
            var out = this.contentWriter.makeNestedContentWriter();
            rrend.renderResource(new ErrorResource(ex), null, 'default', out, context);
        }
    };
    return ResourceRequestHandler;
}(EventDispatcher));
var OrderedContentWriter = (function () {
    function OrderedContentWriter(delegate) {
        this.instances = 0;
        this.contentQueue = new Array();
        this.delegateWriter = delegate;
    }
    OrderedContentWriter.prototype.makeNestedContentWriter = function () {
        var p = this.parentWriter ? this.parentWriter : this;
        var w = new OrderedContentWriter(null);
        w.parentWriter = p;
        this.contentQueue.push(w);
        p.instances++;
        return w;
    };
    OrderedContentWriter.prototype.write = function (content) {
        this.contentQueue.push(content);
    };
    OrderedContentWriter.prototype.start = function (contentType) {
        var p = this.parentWriter ? this.parentWriter : this;
        if (contentType && !p.contentType)
            p.contentType = contentType;
    };
    OrderedContentWriter.prototype.error = function (err) {
        console.log(err);
    };
    OrderedContentWriter.prototype.end = function () {
        var p = this.parentWriter ? this.parentWriter : this;
        if (p.instances > 0)
            p.instances--;
        if (p.instances == 0) {
            p.endAll();
        }
    };
    OrderedContentWriter.prototype.endAll = function () {
        var delegate = this.delegateWriter;
        if (!delegate)
            return;
        var writeOutQueue = function (writer) {
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
        };
        delegate.start(this.contentType);
        writeOutQueue(this);
        setTimeout(function () {
            delegate.end();
        });
    };
    return OrderedContentWriter;
}());
var BufferedContentWriter = (function () {
    function BufferedContentWriter(callback) {
        this.content = [];
        this.callback = callback;
    }
    BufferedContentWriter.prototype.start = function (ctype) {
        this.contentType = ctype;
    };
    BufferedContentWriter.prototype.write = function (data) {
        this.content.push(data);
    };
    BufferedContentWriter.prototype.error = function (err) {
        console.log(err);
    };
    BufferedContentWriter.prototype.end = function () {
        if (this.content.length === 0) {
            this.callback(this.contentType, null);
        }
        else if (this.contentType.indexOf('text/') === 0) {
            this.callback(this.contentType, this.content.join(''));
        }
        else {
            this.callback(this.contentType, this.content[0]);
        }
    };
    return BufferedContentWriter;
}());
var ObjectResource = (function (_super) {
    __extends(ObjectResource, _super);
    function ObjectResource(name, obj) {
        var _this = _super.call(this, name) || this;
        _this.rootObject = obj;
        return _this;
    }
    ObjectResource.prototype.getRenderType = function () {
        var rt = this.rootObject['_rt'];
        return rt ? rt : null;
    };
    ObjectResource.prototype.resolveChildResource = function (name, callback, walking) {
        var rv = this.rootObject[name];
        if (!rv) {
            callback(null);
        }
        else {
            if (rv['_content'] || rv['_content64'] || rv['_rt'] === 'resource/content')
                callback(new ObjectContentResource(name, rv));
            else
                callback(new ObjectResource(name, rv));
        }
    };
    ObjectResource.prototype.createChildResource = function (name, callback) {
        var rv = {};
        this.rootObject[name] = rv;
        callback(new ObjectResource(name, rv));
    };
    ObjectResource.prototype.getPropertyNames = function () {
        var rv = [];
        for (var k in this.rootObject) {
            var v = this.rootObject[k];
            if (typeof v === 'object' || typeof v === 'function' || k.charAt(0) === '_') {
            }
            else {
                rv.push(k);
            }
        }
        return rv;
    };
    ObjectResource.prototype.getProperty = function (name) {
        return this.rootObject[name];
    };
    ObjectResource.prototype.listChildrenNames = function (callback) {
        var rv = [];
        for (var k in this.rootObject) {
            var v = this.rootObject[k];
            if (typeof v === 'object' && k.charAt(0) !== '_') {
                rv.push(k);
            }
        }
        callback(rv);
    };
    ObjectResource.prototype.importData = function (data, callback) {
        var processing = 0;
        var done = function () {
            if (processing === 0 && callback)
                callback();
        };
        for (var k in data) {
            var v = data[k];
            if (k.charAt(0) === ':') {
                continue;
            }
            else if (k === Resource.STORE_CONTENT_PROPERTY && typeof v === 'function') {
                var res = new ObjectContentResource(this.resourceName, this.rootObject);
                processing++;
                v(res, function () {
                    processing--;
                    done();
                });
            }
            else {
                if (v)
                    this.rootObject[k] = v;
                else
                    delete this.rootObject[k];
            }
        }
        done();
    };
    ObjectResource.prototype.removeChildResource = function (name, callback) {
        delete this.rootObject[name];
        if (callback)
            callback();
    };
    return ObjectResource;
}(Resource));
var ObjectContentResource = (function (_super) {
    __extends(ObjectContentResource, _super);
    function ObjectContentResource(name, obj) {
        var _this = _super.call(this, name) || this;
        _this.rootObject = obj;
        return _this;
    }
    ObjectContentResource.prototype.getType = function () {
        return 'resource/content';
    };
    ObjectContentResource.prototype.getSuperType = function () {
        return 'resource/node';
    };
    ObjectContentResource.prototype.isContentResource = function () {
        return true;
    };
    ObjectContentResource.prototype.read = function (writer) {
        var data = this.rootObject;
        var contentType = data['contentType'];
        writer.start(contentType ? contentType : 'text/plain');
        if (data['_content'])
            writer.write(data['_content']);
        else if (data['_content64'])
            writer.write(Utils.base642ArrayBuffer(data['_content64']));
        else if (typeof data === 'string')
            writer.write(data);
        else
            writer.write(null);
        writer.end();
    };
    ObjectContentResource.prototype.start = function (ctype) {
        this.rootObject['contentType'] = ctype;
    };
    ObjectContentResource.prototype.write = function (data) {
        if (data instanceof ArrayBuffer) {
            this.rootObject['_content64'] = Utils.ArrayBuffer2base64(data);
        }
        else {
            this.rootObject['_content'] = data;
        }
    };
    ObjectContentResource.prototype.error = function (error) {
    };
    ObjectContentResource.prototype.end = function () {
    };
    return ObjectContentResource;
}(ObjectResource));
var RootResource = (function (_super) {
    __extends(RootResource, _super);
    function RootResource() {
        var _this = _super.call(this, '') || this;
        _this.resources = {};
        return _this;
    }
    RootResource.prototype.getType = function () {
        return 'resource/root';
    };
    RootResource.prototype.getSuperType = function () {
        return _super.prototype.getType.call(this);
    };
    RootResource.prototype.resolveChildResource = function (name, callback, walking) {
        var rv = this.resources[name];
        callback(rv);
    };
    RootResource.prototype.createChildResource = function (name, callback) {
        callback(null);
    };
    RootResource.prototype.getPropertyNames = function () {
        return [];
    };
    RootResource.prototype.getProperty = function (name) {
        return null;
    };
    RootResource.prototype.listChildrenNames = function (callback) {
        var rv = [];
        for (var k in this.resources) {
            var v = this.resources[k];
            rv.push(v.getName());
        }
        callback(rv);
    };
    RootResource.prototype.importData = function (data, callback) {
        for (var k in data) {
            var v = data[k];
            if (v instanceof Resource) {
                this.resources[v.getName()] = v;
            }
        }
        if (callback)
            callback();
    };
    RootResource.prototype.removeChildResource = function (name, callback) {
        delete this.resources[name];
        if (callback)
            callback();
    };
    return RootResource;
}(Resource));
var JSRendererFactory = (function () {
    function JSRendererFactory() {
    }
    JSRendererFactory.prototype.makeRenderer = function (resource, callback) {
        resource.read(new ContentWriterAdapter(function (data) {
            if (data) {
                try {
                    var func = eval(data);
                }
                catch (ex) {
                    callback(null, ex);
                }
                if (typeof func === 'function') {
                    callback(func);
                }
                else {
                    callback(null, new Error('not a function'));
                }
            }
            else {
                callback(null, new Error('unable to get data for JS'));
            }
        }));
    };
    return JSRendererFactory;
}());
var InterFuncRendererFactory = (function () {
    function InterFuncRendererFactory() {
    }
    InterFuncRendererFactory.prototype.makeRenderer = function (resource, callback) {
        resource.read(new ContentWriterAdapter(function (func) {
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
        }));
    };
    return InterFuncRendererFactory;
}());
var TemplateOutputPlaceholder = (function () {
    function TemplateOutputPlaceholder(id, session) {
        this.buffer = [];
        this.closed = false;
        var self = this;
        this.id = id;
        this.placeholder = '[[' + id + ']]';
        this.session = session;
        setTimeout(function () {
            if (!self.closed) {
                self.buffer = ['write timeout'];
                self.end();
            }
        }, Resource.IO_TIMEOUT);
    }
    TemplateOutputPlaceholder.prototype.write = function (str) {
        if (!this.closed) {
            this.buffer.push(str);
        }
        else {
            console.log('error: write to closed stream');
        }
    };
    TemplateOutputPlaceholder.prototype.end = function () {
        this.session.processPendingReplacements();
        this.closed = true;
    };
    TemplateOutputPlaceholder.prototype.toString = function () {
        return this.buffer.join('');
    };
    return TemplateOutputPlaceholder;
}());
var TemplateRendererSession = (function () {
    function TemplateRendererSession() {
        this.outputPlaceholderID = 1;
        this.placeholders = [];
        this.pending = 0;
    }
    TemplateRendererSession.prototype.makeOutputPlaceholder = function () {
        var self = this;
        var p = new TemplateOutputPlaceholder(this.outputPlaceholderID++, this);
        this.placeholders.push(p);
        this.pending++;
        return p;
    };
    TemplateRendererSession.prototype.replaceOutputPlaceholders = function (text, callback) {
        var self = this;
        var replaceFunc = function () {
            var ls = self.placeholders.sort(function (a, b) {
                return +(a.id > b.id) - +(a.id < b.id);
            });
            for (var i = 0; i < ls.length; i++) {
                var it = ls[i];
                text = text.replace(it.placeholder, it.toString());
            }
            callback(text);
            self.close();
        };
        if (this.pending === 0)
            replaceFunc();
        else
            this.deferredReplaceFunc = replaceFunc;
    };
    TemplateRendererSession.prototype.processPendingReplacements = function () {
        this.pending--;
        if (this.pending === 0 && this.deferredReplaceFunc) {
            this.deferredReplaceFunc();
        }
    };
    TemplateRendererSession.prototype.close = function () {
        this.pending = 0;
        this.deferredReplaceFunc = null;
        this.placeholders = null;
    };
    return TemplateRendererSession;
}());
var TemplateRendererFactory = (function () {
    function TemplateRendererFactory() {
        this.cache = {};
    }
    TemplateRendererFactory.prototype.compileTemplate = function (template) {
        return function () {
            return template;
        };
    };
    TemplateRendererFactory.prototype.expadPath = function (path, context) {
        if (path === '.')
            return context.pathInfo.path;
        else
            return path;
    };
    TemplateRendererFactory.prototype.makeRenderer = function (resource, callback) {
        var self = this;
        resource.read(new ContentWriterAdapter(function (data) {
            if (data) {
                var tfunc_1 = self.cache[data];
                if (!tfunc_1) {
                    try {
                        tfunc_1 = self.compileTemplate(data);
                    }
                    catch (ex) {
                        callback(null, ex);
                        return;
                    }
                }
                self.cache[data] = tfunc_1;
                var session_1 = new TemplateRendererSession();
                callback(function (res, writer, context) {
                    var map = context.makeContextMap(res);
                    map['_session'] = session_1;
                    map['_context'] = context;
                    map['_resource'] = res;
                    try {
                        var txt = tfunc_1(map);
                        session_1.replaceOutputPlaceholders(txt, function (txt) {
                            writer.start('text/html');
                            writer.write(txt);
                            writer.end();
                        });
                    }
                    catch (ex) {
                        callback(null, ex);
                    }
                });
            }
            else {
                callback(null, new Error('unable to read utf8 from resource'));
            }
        }));
    };
    return TemplateRendererFactory;
}());
var ErrorResource = (function (_super) {
    __extends(ErrorResource, _super);
    function ErrorResource(obj) {
        var _this = this;
        var err = obj;
        if (typeof err === 'string')
            err = obj;
        else
            err = '' + err;
        _this = _super.call(this, '/', err) || this;
        return _this;
    }
    ErrorResource.prototype.getType = function () {
        return 'resource/error';
    };
    ErrorResource.prototype.getSuperType = function () {
        return null;
    };
    return ErrorResource;
}(ObjectResource));
var NotFoundResource = (function (_super) {
    __extends(NotFoundResource, _super);
    function NotFoundResource(name) {
        return _super.call(this, name, {}) || this;
    }
    NotFoundResource.prototype.getType = function () {
        return 'resource/notfound';
    };
    NotFoundResource.prototype.getSuperType = function () {
        return null;
    };
    return NotFoundResource;
}(ObjectResource));
var MultiResourceResolver = (function (_super) {
    __extends(MultiResourceResolver, _super);
    function MultiResourceResolver(list) {
        var _this = _super.call(this, null) || this;
        _this.resolvers = [];
        for (var i = 0; i < list.length; i++) {
            var it = list[i];
            if (it instanceof Resource) {
                _this.resolvers.push(new ResourceResolver(it));
            }
            else {
                _this.resolvers.push(it);
            }
        }
        return _this;
    }
    MultiResourceResolver.prototype.resolveResource = function (path, callback) {
        var i = 0;
        var resolvers = this.resolvers;
        var try_resolve = function () {
            if (i < resolvers.length) {
                var resolver = resolvers[i++];
                resolver.resolveResource(path, function (resource) {
                    if (resource)
                        callback(resource);
                    else
                        try_resolve();
                });
            }
            else {
                callback(null);
            }
        };
        try_resolve();
    };
    return MultiResourceResolver;
}(ResourceResolver));
var DefaultRenderingTemplates = (function (_super) {
    __extends(DefaultRenderingTemplates, _super);
    function DefaultRenderingTemplates() {
        var _this = _super.call(this, '') || this;
        _this.rootObject = {
            resource: {
                error: {
                    default: function (res, writer, context) {
                        res.read(writer);
                    }
                }
            }
        };
        return _this;
    }
    return DefaultRenderingTemplates;
}(ObjectResource));
var HBSRendererFactory = (function (_super) {
    __extends(HBSRendererFactory, _super);
    function HBSRendererFactory() {
        var _this = _super.call(this) || this;
        _this.Handlebars = null;
        if (window && window['Handlebars'])
            _this.Handlebars = window['Handlebars'];
        else
            _this.Handlebars = require('handlebars');
        var self = _this;
        _this.Handlebars.registerHelper('include', function (arg0, arg1) {
            var path = arg0;
            var block = arg1;
            var selector = 'default';
            var rtype = null;
            if (arguments.length == 3) {
                selector = arguments[1];
                block = arguments[2];
            }
            else if (arguments.length == 4) {
                rtype = arguments[1];
                selector = arguments[2];
                block = arguments[3];
            }
            var session = block.data.root._session;
            var context = block.data.root._context;
            var res = block.data.root._resource;
            var handler = context.resourceRequestHandler;
            path = self.expadPath(path, context);
            var p = session.makeOutputPlaceholder();
            handler.renderResource(path, rtype, selector, context, function (contentType, content) {
                if (contentType === 'object/javascript') {
                    var out = '';
                    if (Array.isArray(content)) {
                        for (var i = 0; i < content.length; i++) {
                            var it = content[i];
                            out += block.fn(it);
                        }
                    }
                    else {
                        var it = content;
                        out = block.fn(it);
                    }
                    p.write(out);
                    p.end();
                }
                else {
                    p.write(content);
                    p.end();
                }
            });
            return p.placeholder;
        });
        _this.Handlebars.registerHelper('match', function (lvalue, operator, rvalue, options) {
            var operators = null;
            var result = null;
            if (arguments.length < 3) {
                throw new Error("Handlerbars Helper 'compare' needs 2 parameters");
            }
            if (options === undefined) {
                options = rvalue;
                rvalue = operator;
                operator = "===";
            }
            operators = {
                '==': function (l, r) { return l == r; },
                '===': function (l, r) { return l === r; },
                '!=': function (l, r) { return l != r; },
                '!==': function (l, r) { return l !== r; },
                '<': function (l, r) { return l < r; },
                '>': function (l, r) { return l > r; },
                '<=': function (l, r) { return l <= r; },
                '>=': function (l, r) { return l >= r; },
                'startsWith': function (l, r) {
                    if (l && l.indexOf(r) === 0)
                        return true;
                    else
                        return false;
                },
                'typeof': function (l, r) { return typeof l == r; }
            };
            if (!operators[operator]) {
                throw new Error("Handlerbars Helper 'compare' doesn't know the operator " + operator);
            }
            result = operators[operator](lvalue, rvalue);
            if (result)
                options.data.root._match_rval = true;
            if (result)
                return options.fn(this);
            else
                return options.inverse(this);
        });
        _this.Handlebars.registerHelper('default', function (options) {
            var result = false;
            if (options.data.root._match_rval)
                result = true;
            delete options.data.root._match_rval;
            if (!result)
                return options.fn(this);
            else
                return options.inverse(this);
        });
        _this.Handlebars.registerHelper('dump', function (block) {
            var rv = {};
            var context = block.data.root;
            for (var key in context) {
                var val = context[key];
                if (key === '_') {
                    rv[key] = val;
                }
                else if (typeof val !== 'object') {
                    rv[key] = val;
                }
            }
            return JSON.stringify(rv);
        });
        return _this;
    }
    HBSRendererFactory.prototype.compileTemplate = function (template) {
        return this.Handlebars.compile(template);
    };
    return HBSRendererFactory;
}(TemplateRendererFactory));
var EJSRendererFactory = (function (_super) {
    __extends(EJSRendererFactory, _super);
    function EJSRendererFactory() {
        var _this = _super.call(this) || this;
        _this.EJS = null;
        if (window && window['ejs'])
            _this.EJS = window['ejs'];
        else
            _this.EJS = require('ejs');
        return _this;
    }
    EJSRendererFactory.prototype.compileTemplate = function (template) {
        return this.EJS.compile(template);
    };
    return EJSRendererFactory;
}(TemplateRendererFactory));
var AJAXResource = (function (_super) {
    __extends(AJAXResource, _super);
    function AJAXResource(base, path) {
        var _this = _super.call(this, '/') || this;
        _this.baseURL = base;
        _this.path = path ? path : '';
        return _this;
    }
    AJAXResource.prototype.getPath = function () {
        return this.path;
    };
    AJAXResource.prototype.createChildResource = function (name, callback, walking) {
        callback(null);
    };
    AJAXResource.prototype.listChildrenNames = function (callback) {
        callback(null);
    };
    AJAXResource.prototype.importData = function (data, callback) {
        callback(null);
    };
    AJAXResource.prototype.removeChildResource = function (name, callback) {
        callback(null);
    };
    AJAXResource.prototype.resolveChildResource = function (name, callback, walking) {
        if (walking) {
            callback(new AJAXResource(this.baseURL, Utils.filename_path_append(this.getPath(), name)));
        }
        else {
            var path = this.baseURL + '/' + this.getPath() + '/' + name;
            path = path.replace(/\/+/g, '/');
            this.requestData(path, function (text) {
                if (text) {
                    callback(new ObjectContentResource(name, text));
                }
                else {
                    callback(null);
                }
            });
        }
    };
    AJAXResource.prototype.getPropertyNames = function () {
        return null;
    };
    AJAXResource.prototype.getProperty = function (name) {
        return null;
    };
    AJAXResource.prototype.isContentResource = function () {
        return false;
    };
    AJAXResource.prototype.requestData = function (path, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path);
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
        xhr.send(null);
    };
    return AJAXResource;
}(Resource));
var DOMContentWriter = (function () {
    function DOMContentWriter() {
    }
    DOMContentWriter.prototype.setRequestHandler = function (requestHandler) {
        this.requestHandler = requestHandler;
    };
    DOMContentWriter.prototype.start = function (ctype) {
        document.open();
    };
    DOMContentWriter.prototype.write = function (content) {
        if (typeof content != 'string')
            document.write(JSON.stringify(content));
        else
            document.write(content);
    };
    DOMContentWriter.prototype.error = function (error) {
        console.log(error);
    };
    DOMContentWriter.prototype.end = function () {
        var self = this;
        document.addEventListener('readystatechange', function () {
            if (document.readyState === 'complete') {
                var requestHandler_1 = self.requestHandler;
                document.body.addEventListener('submit', function (evt) {
                    var target = evt.target;
                    var info = requestHandler_1.parseFormElement(target);
                    requestHandler_1.handleStore(info.formPath, info.formData);
                    evt.preventDefault();
                });
                document.body.addEventListener('click', function (evt) {
                    var target = evt.target;
                    var href = target.getAttribute('href');
                    if (href && href.charAt(0) === '/') {
                        requestHandler_1.handleRequest(href);
                        evt.preventDefault();
                    }
                });
            }
        });
        document.close();
    };
    return DOMContentWriter;
}());
var ClientRequestHandler = (function (_super) {
    __extends(ClientRequestHandler, _super);
    function ClientRequestHandler(resourceResolver, templateResolver, contentWriter) {
        var _this = this;
        var writer = contentWriter ? contentWriter : new DOMContentWriter();
        _this = _super.call(this, resourceResolver, templateResolver, writer) || this;
        writer.setRequestHandler(_this);
        return _this;
    }
    ClientRequestHandler.prototype.forwardRequest = function (rpath) {
        location.hash = rpath;
        _super.prototype.renderRequest.call(this, rpath);
    };
    ClientRequestHandler.prototype.renderRequest = function (rpath) {
        location.hash = rpath;
        _super.prototype.renderRequest.call(this, rpath);
    };
    ClientRequestHandler.prototype.parseFormElement = function (formElement) {
        var action = formElement.getAttribute('action');
        var rv = {};
        var _loop_2 = function (i) {
            var p = formElement.elements[i];
            var type = p.type.toLowerCase();
            if (type === 'submit' || type == 'button')
                return "continue";
            var name_7 = p.name;
            var value = p.value;
            if (type === 'file') {
                value = p.files[0];
                rv[name_7] = value.name;
                rv[Resource.STORE_CONTENT_PROPERTY] = function (writer, callback) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        writer.write(reader.result);
                        writer.end();
                        callback();
                    };
                    writer.start(value.type);
                    reader.readAsArrayBuffer(value);
                };
            }
            else {
                rv[name_7] = value;
            }
        };
        for (var i = 0; i < formElement.elements.length; i++) {
            _loop_2(i);
        }
        this.transformValues(rv);
        var path = this.expandValue(action, rv);
        var info = new ClientFormInfo();
        info.formData = rv;
        info.formPath = path;
        return info;
    };
    return ClientRequestHandler;
}(ResourceRequestHandler));
