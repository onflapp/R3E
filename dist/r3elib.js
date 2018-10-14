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
    Utils.listMoveItem = function (list, item, ref, offset) {
        var x = 0;
        var v = list.indexOf(item);
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
    };
    Utils.string2object = function (str, obj) {
        if (!str)
            return obj ? obj : null;
        var rv = JSON.parse(str);
        if (rv)
            return rv;
        else
            return obj ? obj : null;
    };
    Utils.filename_path_append = function (path, name) {
        if (!name)
            return path;
        var p = path;
        if (p.charAt(p.length - 1) != '/')
            p += '/';
        p += name;
        return p.replace(/\/+/g, '/');
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
    Utils.filename_mime = function (path) {
        if (!path)
            return null;
        var ext = Utils.filename_ext(path).toLowerCase();
        if (ext === 'jpg' || ext === 'jpeg')
            return 'image/jpeg';
        if (ext === 'png')
            return 'image/png';
        if (ext === 'gif')
            return 'image/gif';
        if (ext === 'txt')
            return 'text/plain';
        if (ext === 'html' || ext === 'htm')
            return 'text/html';
        if (ext === 'xml')
            return 'text/xml';
        return 'application/octet-stream';
    };
    Utils.Blob2Text = function (blob, callback) {
        var reader = new FileReader();
        reader.addEventListener('loadend', function (evt) {
            callback(reader.result);
        });
        reader.readAsText(blob);
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
var Data = (function () {
    function Data(obj) {
        this.values = obj ? obj : {};
    }
    Data.prototype.getProperties = function () {
        var map = {};
        var names = this.getPropertyNames();
        for (var i = 0; i < names.length; i++) {
            var n = names[i];
            map[n] = this.getProperty(n);
        }
        return map;
    };
    Data.prototype.getPropertyNames = function () {
        var rv = [];
        for (var k in this.values) {
            var v = this.values[k];
            if (typeof v === 'object' || typeof v === 'function' || k.charAt(0) === '_') {
            }
            else {
                rv.push(k);
            }
        }
        return rv;
    };
    Data.prototype.getProperty = function (name) {
        return this.values[name];
    };
    Data.prototype.getRenderTypes = function () {
        var rv = [];
        var rt = this.values['_rt'];
        if (rt)
            rv.push(rt);
        rv.push('any');
        return rv;
    };
    Data.prototype.wrap = function (wrapper) {
        for (var name_3 in wrapper) {
            var func = wrapper[name_3];
            if (typeof func === 'function') {
                this[name_3] = func;
            }
        }
        return this;
    };
    return Data;
}());
var Resource = (function (_super) {
    __extends(Resource, _super);
    function Resource(name) {
        var _this = _super.call(this, {}) || this;
        _this.resourceName = name ? name : '';
        return _this;
    }
    Resource.prototype.resolveItself = function (callback) {
        if (callback)
            callback(this);
    };
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
        var ct = this.getContentType();
        if (rt)
            rv.push(rt);
        if (ct)
            rv.push('mime/' + ct);
        rv.push(this.getType());
        if (st)
            rv.push(st);
        return rv;
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
        var ct = this.getContentType();
        var rv = {};
        for (var i = 0; i < names.length; i++) {
            var name_4 = names[i];
            var value = this.getProperty(name_4);
            if (value)
                rv[name_4] = value;
        }
        if (this.getRenderType()) {
            rv[Resource.STORE_RENDERTYPE_PROPERTY] = this.getRenderType();
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
    };
    Resource.prototype.exportChilrenResources = function (level, writer) {
        var self = this;
        var processing = 0;
        var done = function () {
            if (processing === 0) {
                writer.end(null);
                processing = -1;
            }
        };
        var export_children = function (path, name, res) {
            processing++;
            processing++;
            res.exportData(function (data) {
                if (name)
                    data.values[':name'] = name;
                if (path)
                    data.values[':path'] = path;
                writer.write(data);
                processing--;
                done();
            });
            res.listChildrenNames(function (names) {
                processing += names.length;
                var _loop_1 = function () {
                    var name_5 = names[i];
                    res.resolveChildResource(name_5, function (r) {
                        var rpath = Utils.filename_path_append(path, name_5);
                        export_children(rpath, name_5, r);
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
        writer.start('object/javascript');
        export_children('', this.getName(), this);
    };
    Resource.prototype.importData = function (data, callback) {
        var processing = 0;
        var ffunc = null;
        var ct = null;
        var done = function () {
            if (processing === 0 && callback)
                callback();
        };
        processing++;
        var props = {};
        var _loop_2 = function (k) {
            var v = data.values[k];
            if (k === Resource.STORE_CONTENT_PROPERTY && typeof v === 'function') {
                processing++;
                ffunc = v;
            }
            else if (k === Resource.STORE_CONTENT_PROPERTY && typeof v === 'string') {
                processing++;
                ct = data.values['_ct'];
                ffunc = function (writer, callback) {
                    writer.start(ct ? ct : 'text/plain');
                    writer.write(v);
                    writer.end(callback);
                };
            }
            else if (typeof v === 'function' || typeof v === 'object') {
                return "continue";
            }
            else if (k.charAt(0) === ':') {
                return "continue";
            }
            else {
                props[k] = v;
            }
        };
        for (var k in data.values) {
            _loop_2(k);
        }
        if (ffunc) {
            if (ct && ct.indexOf('base64:') === 0) {
                props['_ct'] = ct.substr(7);
            }
            this.importContent(ffunc, function () {
                processing--;
                done();
            });
        }
        this.importProperties(props, function () {
            processing--;
            done();
        });
    };
    Resource.prototype.listChildrenResources = function (callback) {
        var self = this;
        this.listChildrenNames(function (ls) {
            var rv = [];
            if (ls && ls.length > 0) {
                for (var i = 0; i < ls.length; i++) {
                    var name_6 = ls[i];
                    self.resolveChildResource(name_6, function (res) {
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
    Resource.prototype.getContentType = function () {
        return null;
    };
    Resource.prototype.getWriter = function () {
        return null;
    };
    Resource.prototype.read = function (writer, callback) {
        if (writer)
            writer.end(callback);
    };
    Resource.IO_TIMEOUT = 10000;
    Resource.STORE_CONTENT_PROPERTY = '_content';
    Resource.STORE_RENDERTYPE_PROPERTY = '_rt';
    return Resource;
}(Data));
var ResourceResolver = (function () {
    function ResourceResolver(resource) {
        this.resource = resource;
    }
    ResourceResolver.prototype.resolveResource = function (path, callback) {
        var self = this;
        if (path === '/' || path === '') {
            this.resource.resolveItself(callback);
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
    ResourceResolver.prototype.removeResource = function (fromPath, callback) {
        var dirname = Utils.filename_dir(fromPath);
        var name = Utils.filename(fromPath);
        var self = this;
        self.resolveResource(dirname, function (res) {
            res.removeChildResource(name, function () {
                callback();
            });
        });
    };
    ResourceResolver.prototype.moveResource = function (fromPath, toPath, callback) {
        var self = this;
        self.copyResource(fromPath, toPath, function () {
            self.removeResource(fromPath, function () {
                callback();
            });
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
        var ended = false;
        var done = function () {
            if (processing === 0 && ended) {
                callback(arguments);
            }
        };
        this.exportResources(fromPath, function (data) {
            if (data) {
                var path = Utils.filename_path_append(toPath, data.values[':path']);
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
    };
    return ResourceResolver;
}());
var ResourceRenderer = (function () {
    function ResourceRenderer(resolver) {
        this.rendererResolver = resolver;
        this.rendererFactories = new Map();
    }
    ResourceRenderer.prototype.makeRenderTypePaths = function (renderTypes, selectors) {
        var rv = [];
        var factories = this.rendererFactories;
        var _loop_3 = function (i) {
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
        };
        for (var i = 0; i < renderTypes.length; i++) {
            _loop_3(i);
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
            writer.write(error.message + '\n' + error.stack);
        writer.end(null);
    };
    ResourceRenderer.prototype.renderResource = function (res, sel, writer, context) {
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
        if (rtypes.length === 0)
            throw new Error('no render factories registered?');
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
var ResourceRequestContext = (function () {
    function ResourceRequestContext(pathInfo, handler) {
        this.pathInfo = pathInfo;
        this.resourceRequestHandler = handler;
    }
    ResourceRequestContext.prototype.getRequestProperties = function () {
        var p = {};
        p['PREFIX'] = this.pathInfo.prefix;
        p['SUFFIX'] = this.pathInfo.suffix;
        p['PATH'] = this.pathInfo.path;
        p['NAME'] = this.pathInfo.name;
        p['DIRNAME'] = this.pathInfo.dirname;
        p['DATA_PATH'] = this.pathInfo.dataPath;
        p['DATA_NAME'] = this.pathInfo.dataName;
        var pplus = this.pathInfo.path;
        if (pplus !== '/')
            pplus = pplus + '/';
        p['PATH_APPEND'] = pplus;
        var dpplus = this.pathInfo.dirname;
        if (dpplus !== '/')
            dpplus = dpplus + '/';
        p['DIRNAME_APPEND'] = dpplus;
        var dplus = this.pathInfo.dataPath ? this.pathInfo.dataPath : '';
        if (dplus !== '/')
            dplus = dplus + '/';
        p['DATA_PATH_APPEND'] = dplus;
        if (this.pathInfo.referer) {
            p['REF_PATH'] = this.pathInfo.referer.path;
            if (this.pathInfo.referer.suffix)
                p['REF_SUFFIX'] = this.pathInfo.referer.suffix;
        }
        return p;
    };
    ResourceRequestContext.prototype._setCurrentResourcePath = function (rpath) {
        this.pathInfo.resourcePath = rpath;
    };
    ResourceRequestContext.prototype.getCurrentSelector = function () {
        return this.pathInfo.selector;
    };
    ResourceRequestContext.prototype.getCurrentResourcePath = function () {
        return this.pathInfo.resourcePath;
    };
    ResourceRequestContext.prototype.renderResource = function (resourcePath, rstype, selector, context, callback) {
        this.resourceRequestHandler.renderResource(resourcePath, rstype, selector, context, callback);
    };
    ResourceRequestContext.prototype.getQueryProperties = function () {
        return this.pathInfo.query;
    };
    ResourceRequestContext.prototype.getConfigProperties = function () {
        return this.resourceRequestHandler.getConfigProperties();
    };
    ResourceRequestContext.prototype.getResourceResolver = function () {
        return this.resourceRequestHandler.getResourceResolver();
    };
    ResourceRequestContext.prototype.forwardRequest = function (rpath) {
        this.resourceRequestHandler.forwardRequest(rpath);
    };
    ResourceRequestContext.prototype.makeContextMap = function (res) {
        var map = {};
        if (res instanceof Resource) {
            map['renderType'] = res.getRenderType();
            map['renderTypes'] = res.getRenderTypes();
            map['superType'] = res.getSuperType();
            map['type'] = res.getType();
            map['name'] = res.getName();
            map['isContentResource'] = res.isContentResource();
            map['contentType'] = res.getContentType();
            map['path'] = this.pathInfo.resourcePath;
            map['_'] = res.getProperties();
        }
        map['R'] = this.getRequestProperties();
        map['Q'] = this.getQueryProperties();
        map['C'] = this.getConfigProperties();
        return map;
    };
    ResourceRequestContext.prototype.clone = function () {
        var ctx = new ResourceRequestContext(this.pathInfo.clone(), this.resourceRequestHandler);
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
        pi.referer = this.referer;
        pi.query = this.query;
        return pi;
    };
    return PathInfo;
}());
var ClientFormInfo = (function () {
    function ClientFormInfo() {
    }
    return ClientFormInfo;
}());
var ResourceRequestHandler = (function (_super) {
    __extends(ResourceRequestHandler, _super);
    function ResourceRequestHandler(resourceResolver, templateResolver, contentWriter) {
        var _this = _super.call(this) || this;
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
            if (key.indexOf(':') !== -1 && key.indexOf('|') !== -1) {
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
        return data;
    };
    ResourceRequestHandler.prototype.transformData = function (data, context, callback) {
        var rrend = this.resourceRenderer;
        var selectors = ['store'];
        var renderTypes = data.getRenderTypes();
        data.values = this.expandValues(data.values, data.values);
        rrend.resolveRenderer(renderTypes, selectors, function (rend, error) {
            if (rend) {
                rend(data, new ContentWriterAdapter('object', callback), context);
            }
            else {
                callback(data);
            }
        });
    };
    ResourceRequestHandler.prototype.makeContext = function (pathInfo) {
        pathInfo.referer = this.parsePath(this.refererPath);
        pathInfo.query = this.queryProperties;
        var context = new ResourceRequestContext(pathInfo, this);
        return context;
    };
    ResourceRequestHandler.prototype.expandDataAndImport = function (resourcePath, data, callback) {
        var rres = this.resourceResolver;
        var imp = data.values[Resource.STORE_CONTENT_PROPERTY];
        var processing = 0;
        var done = function () {
            if (processing === 0) {
                callback(arguments);
            }
        };
        var import_text = function (text) {
            var list = JSON.parse(text);
            if (list) {
                processing++;
                for (var i = 0; i < list.length; i++) {
                    var item = list[i];
                    var path = Utils.filename_path_append(resourcePath, item[':path']);
                    processing++;
                    rres.storeResource(path, item, function () {
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
    };
    ResourceRequestHandler.prototype.expandDataAndStore = function (resourcePath, data, callback) {
        var rres = this.resourceResolver;
        var datas = {};
        var count = 1;
        datas[resourcePath] = {};
        for (var key in data.values) {
            if (key.indexOf(':') !== -1)
                continue;
            var v = data.values[key];
            var x = key.indexOf('/');
            if (x != -1) {
                var p = resourcePath + '/' + key.substr(0, x);
                var n = key.substr(x + 1);
                var d = datas[p];
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
        for (var key in datas) {
            var v = datas[key];
            rres.storeResource(key, new Data(v), function () {
                count--;
                if (count === 0) {
                    callback();
                }
            });
        }
    };
    ResourceRequestHandler.prototype.parsePath = function (rpath) {
        if (!rpath)
            return null;
        var info = new PathInfo();
        var path = rpath.replace(/\/+/g, '/');
        var m = path.match(/^(\/.*?)(\.x([a-z,\-_]+))(\.([a-z0-9,\-\.]+))?(\/.*?)?$/);
        if (m) {
            info.dataPath = unescape(m[6] ? m[6] : null);
            info.selectorArgs = m[5] ? m[5] : null;
            info.path = unescape(Utils.absolute_path(m[1]));
            info.selector = m[3];
            info.suffix = m[2];
            info.dirname = Utils.filename_dir(info.path);
            info.name = Utils.filename(info.path);
            info.resourcePath = info.path;
            if (info.dataPath)
                info.dataPath = Utils.absolute_path(info.dataPath);
            info.dataName = Utils.filename(info.dataPath);
            return info;
        }
        else if (path.charAt(0) === '/') {
            info.path = unescape(Utils.absolute_path(path));
            info.selector = 'default';
            info.dirname = Utils.filename_dir(info.path);
            info.name = Utils.filename(info.path);
            info.resourcePath = info.path;
            return info;
        }
        else {
            return null;
        }
    };
    ResourceRequestHandler.prototype.getResourceResolver = function () {
        return this.resourceResolver;
    };
    ResourceRequestHandler.prototype.getConfigProperties = function () {
        return this.configProperties;
    };
    ResourceRequestHandler.prototype.setConfigProperties = function (cfg) {
        this.configProperties = cfg;
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
        var rres = this.resourceResolver;
        var rrend = this.resourceRenderer;
        if (!rres)
            throw new Error('no resource resolver');
        if (!rrend)
            throw new Error('no resource renderer');
        if (!this.contentWriter)
            throw new Error('no content writer');
        var info = this.parsePath(rpath);
        var context = this.makeContext(info);
        var out = this.contentWriter.makeNestedContentWriter();
        try {
            if (info) {
                rres.resolveResource(info.resourcePath, function (res) {
                    if (res)
                        rrend.renderResource(res, info.selector, out, context);
                    else {
                        var res_1 = new NotFoundResource(info.resourcePath);
                        rrend.renderResource(res_1, info.selector, out, context);
                    }
                });
            }
            else {
                rrend.renderResource(new ErrorResource('invalid path ' + rpath), 'default', out, context);
            }
        }
        catch (ex) {
            console.log(ex);
            rrend.renderResource(new ErrorResource(ex), 'default', out, context);
        }
    };
    ResourceRequestHandler.prototype.renderResource = function (resourcePath, rtype, selector, context, callback) {
        var out = new OrderedContentWriter(new BufferedContentWriter(callback));
        var rres = this.resourceResolver;
        var rrend = this.resourceRenderer;
        var ncontext = context.clone();
        ncontext._setCurrentResourcePath(resourcePath);
        try {
            if (resourcePath) {
                rres.resolveResource(resourcePath, function (res) {
                    if (res)
                        rrend.renderResource(res, selector, out, ncontext);
                    else {
                        var res_2 = new NotFoundResource(resourcePath);
                        rrend.renderResource(res_2, selector, out, ncontext);
                    }
                });
            }
            else {
                rrend.renderResource(new ErrorResource('invalid path ' + resourcePath), 'default', out, ncontext);
            }
        }
        catch (ex) {
            console.log(ex);
            rrend.renderResource(new ErrorResource(ex), 'default', out, ncontext);
        }
    };
    ResourceRequestHandler.prototype.handleStore = function (rpath, data) {
        var self = this;
        var rres = this.resourceResolver;
        var rrend = this.resourceRenderer;
        var info = this.parsePath(rpath);
        var context = this.makeContext(info);
        var render_error = function (err) {
            var out = this.contentWriter.makeNestedContentWriter();
            rrend.renderResource(err, 'default', out, context);
        };
        if (info.resourcePath) {
            self.transformData(data, context, function (data) {
                self.storeResource(info.resourcePath, data, function (error) {
                    if (!error) {
                        var forward = Utils.absolute_path(data.values[':forward']);
                        if (forward)
                            self.forwardRequest(forward);
                        else
                            self.renderRequest(rpath);
                    }
                    else {
                        render_error(error);
                    }
                });
            });
        }
        else {
            render_error(new ErrorResource('invalid path ' + rpath));
        }
    };
    ResourceRequestHandler.prototype.storeResource = function (resourcePath, data, callback) {
        var self = this;
        var rres = this.resourceResolver;
        try {
            var remove_1 = Utils.absolute_path(data.values[':delete']);
            var copyto = Utils.absolute_path(data.values[':copyto']);
            var moveto = Utils.absolute_path(data.values[':moveto']);
            var importto = Utils.absolute_path(data.values[':import']);
            if (copyto) {
                rres.copyResource(resourcePath, copyto, function () {
                    self.dispatchAllEventsAsync('stored', resourcePath, data);
                    callback();
                });
            }
            else if (moveto) {
                rres.moveResource(resourcePath, moveto, function () {
                    self.dispatchAllEventsAsync('stored', resourcePath, data);
                    callback();
                });
            }
            else if (remove_1) {
                rres.removeResource(resourcePath, function () {
                    self.dispatchAllEventsAsync('stored', remove_1, data);
                    callback();
                });
            }
            else if (importto) {
                self.expandDataAndImport(resourcePath, data, function () {
                    self.dispatchAllEventsAsync('stored', resourcePath, data);
                    callback();
                });
            }
            else {
                self.expandDataAndStore(resourcePath, data, function () {
                    self.dispatchAllEventsAsync('stored', resourcePath, data);
                    callback();
                });
            }
        }
        catch (ex) {
            callback(new ErrorResource(ex));
        }
    };
    return ResourceRequestHandler;
}(EventDispatcher));
var Tools = (function () {
    function Tools() {
    }
    Tools.reoderChildren = function (children, order) {
        children.sort(function (a, b) {
            var ai = order.indexOf(a.getName());
            var bi = order.indexOf(b.getName());
            return (ai - bi);
        });
    };
    Tools.visitAllChidren = function (res, walk, callback) {
        var processing = 0;
        var done = function () {
            if (processing === 0) {
                callback(null);
            }
        };
        var visit_children = function (path, name, res) {
            processing++;
            res.listChildrenNames(function (names) {
                processing--;
                processing += names.length;
                var _loop_4 = function () {
                    var name_7 = names[i];
                    res.resolveChildResource(name_7, function (r) {
                        var rpath = Utils.filename_path_append(path, name_7);
                        var skip = callback(rpath, r);
                        processing--;
                        if (!skip) {
                            visit_children(rpath, name_7, r);
                        }
                        done();
                    }, walk);
                };
                for (var i = 0; i < names.length; i++) {
                    _loop_4();
                }
                done();
            });
        };
        visit_children('', res.getName(), res);
    };
    return Tools;
}());
var ContentWriterAdapter = (function () {
    function ContentWriterAdapter(typ, callback) {
        this.data = [];
        this.callback = callback;
        this.conversion = typ;
    }
    ContentWriterAdapter.prototype.start = function (ctype) {
        this.ctype = ctype;
    };
    ContentWriterAdapter.prototype.write = function (data) {
        this.data.push(data);
    };
    ContentWriterAdapter.prototype.error = function (error) {
        console.log(error);
    };
    ContentWriterAdapter.prototype.end = function (cb) {
        if (this.conversion === 'utf8') {
            var v = this.data[0];
            var self_1 = this;
            if (!v) {
                this.callback('', this.ctype);
            }
            else if (typeof v === 'string') {
                this.callback(this.data.join(''), this.ctype);
            }
            else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(v)) {
                var b = Buffer.concat(this.data);
                this.callback(b.toString('utf8'), this.ctype);
            }
            else if (v instanceof Blob && typeof window !== 'undefined') {
                var reader_1 = new FileReader();
                reader_1.onload = function () {
                    self_1.callback(reader_1.result, self_1.ctype);
                };
                reader_1.readAsText(v);
            }
            else if (v instanceof ArrayBuffer && typeof window !== 'undefined') {
                var t = new window['TextDecoder']("utf-8").decode(v);
                this.callback(t, this.ctype);
            }
            else if (v) {
                this.callback(this.data, this.ctype);
            }
            else {
                this.callback(null, this.ctype);
            }
        }
        else {
            if (this.data.length === 1) {
                this.callback(this.data[0], this.ctype);
            }
            else {
                this.callback(this.data, this.ctype);
            }
        }
        if (cb)
            cb();
    };
    return ContentWriterAdapter;
}());
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
            delegate.end(null);
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
        else if (this.contentType && this.contentType.indexOf('text/') === 0) {
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
        if (!obj)
            throw new Error('no object for ObjectResource');
        _this.values = obj;
        return _this;
    }
    ObjectResource.prototype.getRenderType = function () {
        var rt = this.values['_rt'];
        return rt ? rt : null;
    };
    ObjectResource.prototype.resolveChildResource = function (name, callback, walking) {
        var rv = this.values[name];
        if (typeof rv === 'object') {
            if (rv['_content'] || rv['_content64'] || rv['_pt'] === 'resource/content')
                callback(new ObjectContentResource(name, rv));
            else
                callback(new ObjectResource(name, rv));
        }
        else {
            callback(null);
        }
    };
    ObjectResource.prototype.createChildResource = function (name, callback) {
        var rv = {};
        this.values[name] = rv;
        callback(new ObjectResource(name, rv));
    };
    ObjectResource.prototype.listChildrenNames = function (callback) {
        var rv = [];
        for (var k in this.values) {
            var v = this.values[k];
            if (typeof v === 'object' && k.charAt(0) !== '_') {
                rv.push(k);
            }
        }
        callback(rv);
    };
    ObjectResource.prototype.importProperties = function (data, callback) {
        for (var k in data) {
            var v = data[k];
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
    };
    ObjectResource.prototype.importContent = function (func, callback) {
        var res = new ObjectContentResource(this.resourceName, this.values);
        func(res.getWriter(), callback);
    };
    ObjectResource.prototype.removeChildResource = function (name, callback) {
        delete this.values[name];
        if (callback)
            callback();
    };
    return ObjectResource;
}(Resource));
var ObjectContentResourceWriter = (function () {
    function ObjectContentResourceWriter(obj) {
        this.values = obj;
    }
    ObjectContentResourceWriter.prototype.start = function (ctype) {
        if (ctype && ctype.indexOf('base64:') === 0) {
            this.values['_ct'] = ctype.substr(7);
            this.isbase64 = true;
        }
        else
            this.values['_ct'] = ctype;
        this.values['_pt'] = 'resource/content';
    };
    ObjectContentResourceWriter.prototype.write = function (data) {
        if (data instanceof ArrayBuffer) {
            this.values['_content64'] = Utils.ArrayBuffer2base64(data);
        }
        else if (this.isbase64) {
            this.values['_content64'] = data;
        }
        else {
            this.values['_content'] = data;
        }
    };
    ObjectContentResourceWriter.prototype.error = function (error) {
    };
    ObjectContentResourceWriter.prototype.end = function (callback) {
        if (callback)
            callback();
    };
    return ObjectContentResourceWriter;
}());
var ObjectContentResource = (function (_super) {
    __extends(ObjectContentResource, _super);
    function ObjectContentResource(name, obj) {
        return _super.call(this, name, obj) || this;
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
    ObjectContentResource.prototype.getContentType = function () {
        var contentType = this.values['_ct'];
        return contentType;
    };
    ObjectContentResource.prototype.getWriter = function () {
        return new ObjectContentResourceWriter(this.values);
    };
    ObjectContentResource.prototype.read = function (writer, callback) {
        var data = this.values;
        var contentType = this.getContentType();
        writer.start(contentType ? contentType : 'text/plain');
        if (data['_content'])
            writer.write(data['_content']);
        else if (data['_content64'])
            writer.write(Utils.base642ArrayBuffer(data['_content64']));
        else if (typeof data === 'string')
            writer.write(data);
        else
            writer.write(null);
        writer.end(callback);
    };
    return ObjectContentResource;
}(ObjectResource));
var RootResource = (function (_super) {
    __extends(RootResource, _super);
    function RootResource(opts) {
        return _super.call(this, '', opts) || this;
    }
    RootResource.prototype.getType = function () {
        return 'resource/root';
    };
    RootResource.prototype.getSuperType = function () {
        return 'resource/node';
    };
    RootResource.prototype.resolveChildResource = function (name, callback, walking) {
        var rv = this.values[name];
        if (rv && rv instanceof Resource) {
            rv.getName = function () {
                return name;
            };
            rv.resolveItself(function () {
                callback(rv);
            });
        }
        else
            callback(rv);
    };
    RootResource.prototype.createChildResource = function (name, callback) {
        callback(null);
    };
    RootResource.prototype.importProperties = function (data, callback) {
        callback();
    };
    return RootResource;
}(ObjectResource));
var InterFuncRendererFactory = (function () {
    function InterFuncRendererFactory() {
    }
    InterFuncRendererFactory.prototype.makeRenderer = function (resource, callback) {
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
    }
    TemplateRendererFactory.prototype.compileTemplate = function (template) {
        return function () {
            return template;
        };
    };
    TemplateRendererFactory.prototype.expadPath = function (path, context) {
        if (path === '.')
            return context.getCurrentResourcePath();
        else if (path.charAt(0) === '/')
            return path;
        else
            return Utils.filename_path_append(context.getCurrentResourcePath(), path);
    };
    TemplateRendererFactory.prototype.makeRenderer = function (resource, callback) {
        var self = this;
        resource.read(new ContentWriterAdapter('utf8', function (data) {
            if (data) {
                var tfunc_1 = TemplateRendererFactory.cache[data];
                if (!tfunc_1) {
                    try {
                        tfunc_1 = self.compileTemplate(data);
                    }
                    catch (ex) {
                        callback(null, ex);
                        return;
                    }
                }
                TemplateRendererFactory.cache[data] = tfunc_1;
                var session_1 = new TemplateRendererSession();
                callback(function (data, writer, context) {
                    var map = context.makeContextMap(data);
                    map['_session'] = session_1;
                    map['_context'] = context;
                    try {
                        var txt = tfunc_1(map);
                        session_1.replaceOutputPlaceholders(txt, function (txt) {
                            writer.start('text/html');
                            writer.write(txt);
                            writer.end(null);
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
        }), null);
    };
    TemplateRendererFactory.cache = {};
    return TemplateRendererFactory;
}());
var JSRendererFactory = (function () {
    function JSRendererFactory() {
    }
    JSRendererFactory.prototype.makeRenderer = function (resource, callback) {
        resource.read(new ContentWriterAdapter('utf8', function (data) {
            if (data) {
                try {
                    var func = eval(data);
                }
                catch (ex) {
                    console.log(data);
                    console.log(ex);
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
        }), null);
    };
    JSRendererFactory.cache = {};
    return JSRendererFactory;
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
        return 'resource/node';
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
var CachingResourceResolver = (function (_super) {
    __extends(CachingResourceResolver, _super);
    function CachingResourceResolver() {
        var _this = _super !== null && _super.apply(this, arguments) || this;
        _this.cache = {};
        return _this;
    }
    CachingResourceResolver.prototype.getCachedResource = function (path) {
        return this.cache[path];
    };
    CachingResourceResolver.prototype.setCachedResource = function (path, resource) {
        this.cache[path] = resource;
    };
    CachingResourceResolver.prototype.resolveResource = function (path, callback) {
        var self = this;
        var cres = this.getCachedResource(path);
        if (cres) {
            callback(cres);
        }
        else {
            _super.prototype.resolveResource.call(this, path, function (resource) {
                self.setCachedResource(path, resource);
                callback(resource);
            });
        }
    };
    return CachingResourceResolver;
}(ResourceResolver));
var DefaultRenderingTemplates = (function (_super) {
    __extends(DefaultRenderingTemplates, _super);
    function DefaultRenderingTemplates() {
        return _super.call(this, '', {
            'resource': {
                'error': {
                    'default': function (res, writer, context) {
                        res.read(writer, null);
                    }
                }
            },
            'any': {
                'default': function (res, writer, context) {
                    writer.start('text/plain');
                    writer.write('default renderer');
                    writer.end(null);
                }
            }
        }) || this;
    }
    return DefaultRenderingTemplates;
}(ObjectResource));
var HBSRendererFactory = (function (_super) {
    __extends(HBSRendererFactory, _super);
    function HBSRendererFactory() {
        var _this = _super.call(this) || this;
        _this.Handlebars = null;
        if (typeof window !== 'undefined' && window['Handlebars'])
            _this.Handlebars = window['Handlebars'];
        else
            _this.Handlebars = require('handlebars');
        var self = _this;
        _this.Handlebars.registerHelper('include', function (arg0, arg1) {
            var path = arg0;
            var block = arg1;
            var selector = null;
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
            if (!selector)
                selector = context.getCurrentSelector();
            if (!selector)
                selector = 'default';
            path = self.expadPath(path, context);
            var p = session.makeOutputPlaceholder();
            context.renderResource(path, rtype, selector, context, function (contentType, content) {
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
        _this.Handlebars.registerHelper('p', function (val, options) {
            if (typeof val === 'object') {
                return JSON.stringify(val);
            }
            else {
                return val;
            }
        });
        _this.Handlebars.registerHelper('or', function () {
            var args = arguments;
            for (var i in args) {
                if (args[i] !== null && args[i] !== undefined)
                    return args[i];
            }
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
var SimpleRemoteResource = (function (_super) {
    __extends(SimpleRemoteResource, _super);
    function SimpleRemoteResource(base, path) {
        var _this = _super.call(this, '/') || this;
        _this.baseURL = base;
        _this.path = path ? path : '';
        return _this;
    }
    SimpleRemoteResource.prototype.getPath = function () {
        return this.path;
    };
    SimpleRemoteResource.prototype.createChildResource = function (name, callback, walking) {
        callback(null);
    };
    SimpleRemoteResource.prototype.listChildrenNames = function (callback) {
        callback(null);
    };
    SimpleRemoteResource.prototype.importProperties = function (data, callback) {
        callback(null);
    };
    SimpleRemoteResource.prototype.importContent = function (func, callback) {
        callback(null);
    };
    SimpleRemoteResource.prototype.removeChildResource = function (name, callback) {
        callback(null);
    };
    SimpleRemoteResource.prototype.resolveChildResource = function (name, callback, walking) {
        if (walking) {
            var res = new SimpleRemoteResource(this.baseURL, Utils.filename_path_append(this.getPath(), name));
            callback(res);
        }
        else {
            var self_2 = this;
            var path_1 = this.baseURL + '/' + this.getPath() + '/' + name;
            path_1 = path_1.replace(/\/+/g, '/');
            if (SimpleRemoteResource.failedPaths[path_1]) {
                callback(null);
                return;
            }
            this.requestData(path_1, function (text) {
                if (text) {
                    callback(new ObjectContentResource(name, text));
                }
                else {
                    SimpleRemoteResource.failedPaths[path_1] = true;
                    callback(null);
                }
            });
        }
    };
    SimpleRemoteResource.prototype.requestData = function (path, callback) {
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
    SimpleRemoteResource.failedPaths = {};
    return SimpleRemoteResource;
}(Resource));
var DOMContentWriter = (function () {
    function DOMContentWriter() {
    }
    DOMContentWriter.prototype.attachListeners = function () {
        var requestHandler = this.requestHandler;
        document.body.addEventListener('submit', function (evt) {
            var target = evt.target;
            var info = requestHandler.parseFormElement(target);
            setTimeout(function () {
                requestHandler.handleStore(info.formPath, new Data(info.formData));
            });
            evt.preventDefault();
        });
        document.body.addEventListener('click', function (evt) {
            var target = evt.target;
            var href = target.getAttribute('href');
            if (href && href.charAt(0) === '/') {
                setTimeout(function () {
                    requestHandler.handleRequest(href);
                });
                evt.preventDefault();
            }
        });
    };
    DOMContentWriter.prototype.compareElements = function (lista, listb) {
        var rv = [];
        for (var i = 0; i < lista.length; i++) {
            var itema = lista[i];
            var found = false;
            for (var z = 0; z < listb.length; z++) {
                var itemb = listb[z];
                if (itemb.isEqualNode(itema)) {
                    found = true;
                    break;
                }
            }
            if (!found)
                rv.push(itema);
        }
        return rv;
    };
    DOMContentWriter.prototype.updateDocument = function (content) {
        var doc = document.implementation.createHTMLDocument('');
        doc.documentElement.innerHTML = content;
        var additions = this.compareElements(doc.head.children, document.head.children);
        var removals = this.compareElements(document.head.children, doc.head.children);
        for (var i = 0; i < additions.length; i++) {
            document.head.appendChild(additions[i]);
        }
        for (var i = 0; i < removals.length; i++) {
            document.head.removeChild(removals[i]);
        }
        document.body = doc.body;
    };
    DOMContentWriter.prototype.setRequestHandler = function (requestHandler) {
        this.requestHandler = requestHandler;
    };
    DOMContentWriter.prototype.start = function (ctype) {
        if (ctype === 'text/html')
            this.htmldata = [];
        else
            document.open(ctype);
    };
    DOMContentWriter.prototype.write = function (content) {
        if (this.htmldata)
            this.htmldata.push(content);
        else {
            if (typeof content != 'string')
                document.write(JSON.stringify(content));
            else
                document.write(content);
        }
    };
    DOMContentWriter.prototype.error = function (error) {
        console.log(error);
    };
    DOMContentWriter.prototype.end = function () {
        if (this.htmldata) {
            this.updateDocument(this.htmldata.join(''));
        }
        else {
            document.close();
        }
        this.attachListeners();
        this.htmldata = null;
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
        this.renderRequest(rpath);
    };
    ClientRequestHandler.prototype.handleRequest = function (rpath) {
        this.renderRequest(rpath);
    };
    ClientRequestHandler.prototype.renderRequest = function (rpath) {
        location.hash = rpath;
        _super.prototype.renderRequest.call(this, rpath);
    };
    ClientRequestHandler.prototype.parseFormElement = function (formElement) {
        var action = formElement.getAttribute('action');
        var rv = {};
        var _loop_5 = function (i) {
            var p = formElement.elements[i];
            var type = p.type.toLowerCase();
            if (type === 'submit' || type == 'button')
                return "continue";
            var name_8 = p.name;
            var value = p.value;
            if (type === 'file') {
                value = p.files[0];
                if (!value)
                    return "continue";
                var pref = '';
                var ct = value.type;
                if (name_8.lastIndexOf('/') > 0)
                    pref = name_8.substr(0, name_8.lastIndexOf('/') + 1);
                rv[name_8] = value.name;
                rv[pref + '_ct'] = ct;
                rv[pref + Resource.STORE_CONTENT_PROPERTY] = function (writer, callback) {
                    var reader = new FileReader();
                    reader.onload = function (e) {
                        writer.write(reader.result);
                        writer.end(callback);
                    };
                    writer.start(value.type);
                    reader.readAsArrayBuffer(value);
                };
            }
            else {
                rv[name_8] = value;
            }
        };
        for (var i = 0; i < formElement.elements.length; i++) {
            _loop_5(i);
        }
        rv = this.transformValues(rv);
        var path = this.expandValue(action, rv);
        var info = new ClientFormInfo();
        info.formData = rv;
        info.formPath = path;
        return info;
    };
    return ClientRequestHandler;
}(ResourceRequestHandler));
var ResponseContentWriter = (function () {
    function ResponseContentWriter(res) {
        this.respose = res;
    }
    ResponseContentWriter.prototype.setRequestHandler = function (requestHandler) {
        this.requestHandler = requestHandler;
    };
    ResponseContentWriter.prototype.start = function (ctype) {
        if (this.closed)
            return;
        var c = ctype ? ctype : 'application/octet-stream';
        if (c === 'object/javascript') {
            c = 'application/json';
            this.transform = 'json';
        }
        this.respose.setHeader('content-type', c);
    };
    ResponseContentWriter.prototype.write = function (content) {
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
    };
    ResponseContentWriter.prototype.error = function (error) {
        console.log(error);
    };
    ResponseContentWriter.prototype.end = function () {
        this.respose.end();
        this.requestHandler = null;
        this.respose = null;
        this.closed = true;
    };
    ResponseContentWriter.prototype.redirect = function (rpath) {
        this.closed = true;
        this.respose.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        this.respose.redirect(301, rpath);
    };
    return ResponseContentWriter;
}());
var ServerRequestHandler = (function (_super) {
    __extends(ServerRequestHandler, _super);
    function ServerRequestHandler(resourceResolver, templateResolver, res) {
        var _this = this;
        var writer = new ResponseContentWriter(res);
        _this = _super.call(this, resourceResolver, templateResolver, writer) || this;
        _this.resposeContentWriter = writer;
        _this.resposeContentWriter.setRequestHandler(_this);
        return _this;
    }
    ServerRequestHandler.prototype.handleGetRequest = function (req) {
        var URL = require('url').URL;
        var rpath = unescape(req.path);
        var referer = req.headers.referrer || req.headers.referer;
        if (referer) {
            var r = new URL(referer);
            this.refererPath = r.pathname;
        }
        this.queryProperties = req.query;
        _super.prototype.handleRequest.call(this, rpath);
    };
    ServerRequestHandler.prototype.handlePostRequest = function (req) {
        var URL = require('url').URL;
        var self = this;
        var rpath = unescape(req.path);
        var multiparty = require('multiparty');
        var querystring = require('querystring');
        var referer = req.headers.referrer || req.headers.referer;
        if (referer) {
            var r = new URL(referer);
            this.refererPath = r.pathname;
        }
        this.queryProperties = req.query;
        var ct = req.headers['content-type'];
        if (ct && ct.indexOf('multipart/form-data') == 0) {
            var form = new multiparty.Form({
                maxFieldsSize: 1024 * 1024 * 500
            });
            form.parse(req, function (err, fields, files) {
                var data = {};
                var _loop_6 = function (file) {
                    var v_1 = files[file][0];
                    var f = v_1['originalFilename'];
                    var n = v_1['fieldName'];
                    var ct_1 = v_1['headers']['content-type'];
                    var path = v_1['path'];
                    var pref = '';
                    if (n.lastIndexOf('/') > 0)
                        pref = n.substr(0, n.lastIndexOf('/') + 1);
                    data[n] = f;
                    data[pref + '_ct'] = ct_1;
                    data[pref + Resource.STORE_CONTENT_PROPERTY] = function (writer, callback) {
                        var fs = require('fs');
                        var fd = fs.openSync(path, 'r');
                        writer.start(ct_1);
                        var pos = 0;
                        var sz = 0;
                        while (true) {
                            var buff = new Buffer(1024 * 1000);
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
                        writer.end();
                        if (callback)
                            callback();
                    };
                    return "break";
                };
                for (var file in files) {
                    var state_1 = _loop_6(file);
                    if (state_1 === "break")
                        break;
                }
                for (var k in fields) {
                    var v = fields[k][0];
                    data[k] = v;
                }
                data = self.transformValues(data);
                rpath = self.expandValue(rpath, data);
                self.handleStore(rpath, new Data(data));
            });
        }
        else {
            var body_1 = '';
            req.on('data', function (data) {
                body_1 += data;
                if (body_1.length > (1024 * 1000))
                    req.connection.destroy();
            });
            req.on('end', function () {
                var data = {};
                var fields = querystring.parse(body_1);
                for (var k in fields) {
                    var v = fields[k];
                    if (Array.isArray(v))
                        data[k] = v[0];
                    else
                        data[k] = v;
                }
                data = self.transformValues(data);
                rpath = self.expandValue(rpath, data);
                self.handleStore(rpath, new Data(data));
            });
        }
    };
    ServerRequestHandler.prototype.forwardRequest = function (rpath) {
        this.resposeContentWriter.redirect(rpath);
    };
    return ServerRequestHandler;
}(ResourceRequestHandler));
var FileResourceContentWriter = (function () {
    function FileResourceContentWriter(filePath) {
        this.fs = require('fs-extra');
        this.filePath = filePath;
    }
    FileResourceContentWriter.prototype.start = function (ctype) {
        if (ctype && ctype.indexOf('base64:') === 0)
            this.isbase64 = true;
        this.fd = this.fs.openSync(this.filePath, 'w');
    };
    FileResourceContentWriter.prototype.write = function (data) {
        if (this.isbase64) {
            this.fs.writeSync(this.fd, new Buffer(data, 'base64'));
        }
        else {
            this.fs.writeSync(this.fd, data);
        }
    };
    FileResourceContentWriter.prototype.error = function (error) {
        console.log(error);
    };
    FileResourceContentWriter.prototype.end = function (callback) {
        this.fs.closeSync(this.fd);
        if (callback)
            callback();
    };
    return FileResourceContentWriter;
}());
var FileResource = (function (_super) {
    __extends(FileResource, _super);
    function FileResource(root, name) {
        var _this = _super.call(this, name) || this;
        _this.fs = require('fs-extra');
        _this.rootPath = root;
        if (name) {
            _this.filePath = Utils.filename_path_append(_this.rootPath, name);
        }
        else {
            _this.filePath = root;
        }
        return _this;
    }
    FileResource.prototype.getType = function () {
        if (this.isDirectory)
            return 'resource/node';
        else
            return 'resource/content';
    };
    FileResource.prototype.getSuperType = function () {
        if (this.getType() === 'resource/node')
            return null;
        else
            return 'resource/node';
    };
    FileResource.prototype.getRenderType = function () {
        return this.values['_rt'];
    };
    FileResource.prototype.makeMetadataPath = function (nm) {
        if (nm) {
            return this.filePath + '/.' + nm + '.metadata.json';
        }
        else if (this.isDirectory) {
            return Utils.filename_path_append(this.filePath, '.metadata.json');
        }
        else {
            var dirname = Utils.filename_dir(this.filePath);
            var name_9 = Utils.filename(this.filePath);
            return dirname + '/.' + name_9 + '.metadata.json';
        }
    };
    FileResource.prototype.createChildResource = function (name, callback, walking) {
        var path = Utils.filename_path_append(this.filePath, name);
        var mask = '0755';
        var res = new FileResource(this.filePath, name);
        this.fs.mkdir(path, mask, function (err) {
            if (!err) {
                res.isDirectory = true;
                callback(res);
            }
            else if (err.code == 'EEXIST') {
                if (walking)
                    callback(res);
                else
                    res.resolveItself(callback);
            }
            else {
                callback(null);
            }
        });
    };
    FileResource.prototype.importContent = function (func, callback) {
        func(this.getWriter(), callback);
    };
    FileResource.prototype.importProperties = function (data, callback) {
        var self = this;
        var path = this.makeMetadataPath();
        self.fs.readFile(path, 'utf8', function (err, mdata) {
            var content = null;
            var count = 0;
            if (mdata)
                content = JSON.parse(mdata);
            if (!content)
                content = {};
            for (var key in data) {
                var v = data[key];
                key = key.trim();
                if (key.length === 0)
                    continue;
                if (v)
                    content[key] = data[key];
                else
                    delete content[key];
                count++;
            }
            if (count > 0) {
                self.fs.writeFile(path, JSON.stringify(content), 'utf8', function () {
                    callback();
                });
            }
            else {
                callback();
            }
        });
    };
    FileResource.prototype.removeChildResource = function (name, callback) {
        var resolve = require('path').resolve;
        var path = Utils.filename_path_append(this.filePath, name);
        path = resolve(path);
        if (path === '' || path === '/') {
            console.log('invalid path');
            callback(null);
        }
        else {
            var mpath = this.makeMetadataPath(name);
            this.fs.remove(mpath, function (err) {
            });
            this.fs.remove(path, function (err) {
                if (err)
                    console.log(err);
                callback(null);
            });
        }
    };
    FileResource.prototype.readMetadata = function (callback) {
        var self = this;
        var path = this.makeMetadataPath();
        self.fs.readFile(path, 'utf8', function (err, data) {
            if (data) {
                var rv = JSON.parse(data);
                self.values = rv ? rv : {};
            }
            else {
                self.values = {};
            }
            callback();
        });
    };
    FileResource.prototype.checkExistence = function (callback) {
        var self = this;
        this.fs.stat(this.filePath, function (err, stat) {
            if (!stat) {
                callback(false);
            }
            else if (stat.isFile()) {
                self.isDirectory = false;
                callback(true);
            }
            else if (stat.isDirectory()) {
                self.isDirectory = true;
                callback(true);
            }
            else {
                callback(false);
            }
        });
    };
    FileResource.prototype.resolveItself = function (callback) {
        var self = this;
        this.checkExistence(function (stat) {
            if (stat) {
                self.readMetadata(function () {
                    callback(self);
                });
            }
            else {
                callback(null);
            }
        });
    };
    FileResource.prototype.resolveChildResource = function (name, callback, walking) {
        var res = new FileResource(this.filePath, name);
        if (walking) {
            res.checkExistence(function (stat) {
                if (stat) {
                    callback(res);
                }
                else {
                    callback(null);
                }
            });
        }
        else {
            res.resolveItself(callback);
        }
    };
    FileResource.prototype.listChildrenNames = function (callback) {
        this.fs.readdir(this.filePath, function (err, items) {
            var ls = [];
            if (items) {
                for (var i = 0; i < items.length; i++) {
                    var it = items[i];
                    if (it.charAt(0) === '.')
                        continue;
                    ls.push(it);
                }
            }
            callback(ls);
        });
    };
    FileResource.prototype.isContentResource = function () {
        return !this.isDirectory;
    };
    FileResource.prototype.getContentType = function () {
        if (this.isDirectory)
            return null;
        var contentType = this.values['_ct'];
        if (contentType)
            return contentType;
        var name = this.getName();
        var mime = require('mime-types');
        return mime.lookup(name) || null;
    };
    FileResource.prototype.getWriter = function () {
        if (this.isDirectory) {
            this.fs.removeSync(this.filePath);
            this.isDirectory = false;
        }
        return new FileResourceContentWriter(this.filePath);
    };
    FileResource.prototype.read = function (writer, callback) {
        if (this.isDirectory) {
            writer.end(callback);
        }
        else {
            writer.start(this.getContentType());
            var fd = this.fs.openSync(this.filePath, 'r');
            var pos = 0;
            var sz = 0;
            while (true) {
                var buff = new Buffer(1024 * 500);
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
    };
    return FileResource;
}(Resource));
var PouchDBResourceContentWriter = (function () {
    function PouchDBResourceContentWriter(db, id) {
        this.buffer = [];
        this.db = db;
        this.id = id;
    }
    PouchDBResourceContentWriter.prototype.start = function (ctype) {
        this.ctype = ctype;
    };
    PouchDBResourceContentWriter.prototype.write = function (data) {
        this.buffer.push(data);
    };
    PouchDBResourceContentWriter.prototype.error = function (error) {
        console.log(error);
    };
    PouchDBResourceContentWriter.prototype.end = function (callback) {
        var self = this;
        self.db.get(this.id).then(function (doc) {
            var blob = new Blob(self.buffer, { type: self.ctype });
            self.db.putAttachment(doc._id, 'content', doc._rev, blob, self.ctype).then(function () {
                if (callback)
                    callback();
            })
                .catch(function (err) {
                console.log(err);
                if (callback)
                    callback();
            });
        })
            .catch(function (err) {
            console.log(err);
            if (callback)
                callback();
        });
    };
    return PouchDBResourceContentWriter;
}());
var PouchDBResource = (function (_super) {
    __extends(PouchDBResource, _super);
    function PouchDBResource(db, path, name) {
        var _this = _super.call(this, name) || this;
        _this.nodePath = path ? path : '';
        _this.nodeName = name ? name : '';
        _this.contentType = null;
        _this.db = db;
        return _this;
    }
    PouchDBResource.prototype.escape_name = function (n) {
        return n.replace('_', '%5F');
    };
    PouchDBResource.prototype.unescape_name = function (n) {
        return n.replace('%5F', '_');
    };
    PouchDBResource.prototype.make_key = function (path) {
        if (path) {
            var level = path.split('/').length;
            return 'p:' + level + path;
        }
        else {
            return 'p:1/';
        }
    };
    PouchDBResource.prototype.getRenderType = function () {
        return this.values['_rt'];
    };
    PouchDBResource.prototype.getType = function () {
        if (this.contentType)
            return 'resource/content';
        else
            return 'resource/node';
    };
    PouchDBResource.prototype.getSuperType = function () {
        if (this.getType() === 'resource/node')
            return null;
        else
            return 'resource/node';
    };
    PouchDBResource.prototype.isContentResource = function () {
        if (this.contentType)
            return true;
        else
            return false;
    };
    PouchDBResource.prototype.getContentType = function () {
        return this.contentType;
    };
    PouchDBResource.prototype.storeNode = function (callback) {
        var self = this;
        var path = Utils.filename_path_append(this.nodePath, this.nodeName);
        var id = this.make_key(path);
        var item = {
            _id: id
        };
        this.db.put(item).then(function () {
            callback(self);
        })
            .catch(function (err) {
            console.log(err);
            callback();
        });
    };
    PouchDBResource.prototype.importContent = function (func, callback) {
        func(this.getWriter(), callback);
    };
    PouchDBResource.prototype.importProperties = function (data, callback) {
        var self = this;
        var path = Utils.filename_path_append(this.nodePath, this.nodeName);
        var id = this.make_key(path);
        self.db.get(id).then(function (doc) {
            for (var key in data) {
                var v = data[key];
                key = key.trim();
                if (key.length === 0)
                    continue;
                if (v)
                    doc[key] = data[key];
                else
                    delete doc[key];
            }
            self.db.put(doc).then(function () {
                callback();
            })
                .catch(function (err) {
                console.log(err);
                callback();
            });
        })
            .catch(function (err) {
            console.log(err);
            callback();
        });
    };
    PouchDBResource.prototype.resolveChildResource = function (name, callback, walking) {
        var self = this;
        var path = Utils.filename_path_append(this.nodePath, this.nodeName);
        if (walking) {
            var res = new PouchDBResource(self.db, path, name);
            callback(res);
        }
        else {
            var bpath = Utils.filename_path_append(path, name);
            var id = this.make_key(bpath);
            this.db.get(id).then(function (doc) {
                var res = new PouchDBResource(self.db, path, name);
                res.values = {};
                for (var key in doc) {
                    var val = doc[key];
                    if (key === '_attachments')
                        res.contentType = doc._attachments.content.content_type;
                    else if (key.charAt(0) !== '_')
                        res.values[key] = val;
                }
                callback(res);
            }).catch(function (err) {
                callback(null);
                console.log(err);
            });
        }
    };
    PouchDBResource.prototype.createChildResource = function (name, callback, walking) {
        var path = Utils.filename_path_append(this.nodePath, this.nodeName);
        var res = new PouchDBResource(this.db, path, name);
        if (walking)
            callback(res);
        else {
            res.storeNode(callback);
        }
    };
    PouchDBResource.prototype.removeChildResource = function (name, callback) {
        var self = this;
        var path = Utils.filename_path_append(this.nodePath, this.nodeName);
        path = Utils.filename_path_append(path, name);
        var id = this.make_key(path);
        self.db.get(id).then(function (doc) {
            self.db.remove(doc);
        })
            .then(function (result) {
            callback();
        })
            .catch(function (err) {
            callback();
            console.log(err);
        });
    };
    PouchDBResource.prototype.listChildrenNames = function (callback) {
        var path = Utils.filename_path_append(this.nodePath, this.nodeName) + '/';
        var id = this.make_key(path);
        this.db.allDocs({
            include_docs: false,
            attachments: false,
            startkey: id,
            endkey: id + '\ufff0'
        })
            .then(function (result) {
            var rv = [];
            for (var i = 0; i < result.rows.length; i++) {
                var it = result.rows[i];
                rv.push(Utils.filename(it.id));
            }
            callback(rv);
        })
            .catch(function (err) {
            callback(null);
            console.log(err);
        });
    };
    PouchDBResource.prototype.getWriter = function () {
        var path = Utils.filename_path_append(this.nodePath, this.nodeName);
        var id = this.make_key(path);
        return new PouchDBResourceContentWriter(this.db, id);
    };
    PouchDBResource.prototype.read = function (writer, callback) {
        var path = Utils.filename_path_append(this.nodePath, this.nodeName);
        var id = this.make_key(path);
        var self = this;
        self.db.get(id).then(function (doc) {
            self.db.getAttachment(doc._id, 'content', { rev: doc._rev }).then(function (data) {
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
    };
    return PouchDBResource;
}(Resource));
var DropBoxResourceContentWriter = (function () {
    function DropBoxResourceContentWriter(dbx, filePath) {
        this.buffer = [];
        this.dbx = dbx;
        this.filePath = filePath;
    }
    DropBoxResourceContentWriter.prototype.start = function (ctype) {
    };
    DropBoxResourceContentWriter.prototype.write = function (data) {
        this.buffer.push(data);
    };
    DropBoxResourceContentWriter.prototype.error = function (error) {
        console.log(error);
    };
    DropBoxResourceContentWriter.prototype.end = function (callback) {
        var self = this;
        var offset = 0;
        var fileid = null;
        var finish = function () {
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
        var store_chunk = function (data) {
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
                    store_chunk(self.buffer.shift());
                else
                    finish();
            })
                .catch(function (err) {
                console.log(err);
                if (callback)
                    callback();
            });
        };
        this.dbx.filesUploadSessionStart({
            contents: null,
            close: false
        })
            .then(function (response) {
            fileid = response;
            store_chunk(self.buffer.shift());
        })
            .catch(function (err) {
            console.log(err);
        });
    };
    return DropBoxResourceContentWriter;
}());
var DropBoxResource = (function (_super) {
    __extends(DropBoxResource, _super);
    function DropBoxResource(dbx, path, name) {
        var _this = _super.call(this, name) || this;
        _this.isDirectory = true;
        _this.resources = null;
        _this.dbx = dbx;
        _this.filePath = path ? path : '';
        return _this;
    }
    DropBoxResource.prototype.getType = function () {
        if (this.isDirectory)
            return 'resource/node';
        else
            return 'resource/content';
    };
    DropBoxResource.prototype.getSuperType = function () {
        if (this.getType() === 'resource/node')
            return null;
        else
            return 'resource/node';
    };
    DropBoxResource.prototype.getRenderType = function () {
        return this.values['_rt'];
    };
    DropBoxResource.prototype.makeMetadataPath = function (nm) {
        if (nm) {
            return this.filePath + '/.' + nm + '.metadata.json';
        }
        else if (this.isDirectory) {
            return Utils.filename_path_append(this.filePath, '.metadata.json');
        }
        else {
            var dirname = Utils.filename_dir(this.filePath);
            var name_10 = Utils.filename(this.filePath);
            return dirname + '/.' + name_10 + '.metadata.json';
        }
    };
    DropBoxResource.prototype.readResources = function (callback) {
        var self = this;
        if (self.resources) {
            callback(self.resources);
        }
        else if (self.isDirectory) {
            self.dbx.filesListFolder({ path: this.filePath })
                .then(function (response) {
                self.resources = {};
                for (var i = 0; i < response.entries.length; i++) {
                    var item = response.entries[i];
                    var name_11 = item.name;
                    if (name_11.charAt(0) === '.')
                        continue;
                    var path = Utils.filename_path_append(self.filePath, name_11);
                    var res = new DropBoxResource(self.dbx, path, name_11);
                    if (item['.tag'] === 'file')
                        res.isDirectory = false;
                    else
                        res.isDirectory = true;
                    self.resources[name_11] = res;
                }
                callback(self.resources);
            })
                .catch(function (error) {
                callback();
            });
        }
        else {
            callback();
        }
    };
    DropBoxResource.prototype.createChildResource = function (name, callback, walking) {
        var self = this;
        this.readResources(function (rls) {
            var path = Utils.filename_path_append(self.filePath, name);
            var res = new DropBoxResource(self.dbx, path, name);
            if (!self.resources)
                self.resources = {};
            self.resources[name] = res;
            callback(res);
        });
    };
    DropBoxResource.prototype.importContent = function (func, callback) {
        func(this.getWriter(), callback);
    };
    DropBoxResource.prototype.importProperties = function (data, callback) {
        var self = this;
        var path = this.makeMetadataPath();
        this.dbx.filesUpload({
            contents: 'xxx',
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
    };
    DropBoxResource.prototype.removeChildResource = function (name, callback) {
        this.resources = null;
        var path = Utils.filename_path_append(this.filePath, name);
        this.dbx.filesDelete({ path: path })
            .then(function (response) {
            callback();
        })
            .catch(function (error) {
            callback(null);
        });
    };
    DropBoxResource.prototype.resolveChildResource = function (name, callback, walking) {
        if (walking) {
            if (this.resources) {
                callback(this.resources[name]);
            }
            else {
                this.resources = {};
                var path = Utils.filename_path_append(this.filePath, name);
                var res = new DropBoxResource(this.dbx, path, name);
                this.resources[name] = res;
                callback(res);
            }
        }
        else {
            this.readResources(function (rls) {
                if (rls)
                    callback(rls[name]);
                else
                    callback(null);
            });
        }
    };
    DropBoxResource.prototype.listChildrenNames = function (callback) {
        this.readResources(function (rls) {
            if (!rls)
                callback([]);
            else {
                var ls = [];
                for (var name_12 in rls) {
                    ls.push(name_12);
                }
                callback(ls);
            }
        });
    };
    DropBoxResource.prototype.isContentResource = function () {
        return !this.isDirectory;
    };
    DropBoxResource.prototype.getContentType = function () {
        if (this.isDirectory)
            return null;
        var contentType = this.values['_ct'];
        if (contentType)
            return contentType;
        else
            return Utils.filename_mime(this.getName());
    };
    DropBoxResource.prototype.getWriter = function () {
        if (this.isDirectory) {
            this.isDirectory = false;
        }
        return new DropBoxResourceContentWriter(this.dbx, this.filePath);
    };
    DropBoxResource.prototype.read = function (writer, callback) {
        if (this.isDirectory) {
            writer.end(callback);
        }
        else {
            var path = this.filePath;
            var ct_2 = this.getContentType();
            this.dbx.filesDownload({ path: this.filePath })
                .then(function (data) {
                var reader = new FileReader();
                reader.onload = function (event) {
                    writer.start(ct_2);
                    writer.write(reader.result);
                    writer.end(callback);
                };
                reader.readAsArrayBuffer(data.fileBlob);
            })
                .catch(function (error) {
                writer.end(callback);
            });
        }
    };
    return DropBoxResource;
}(Resource));
if (typeof module !== 'undefined') {
    module.exports = {
        ServerRequestHandler: ServerRequestHandler,
        MultiResourceResolver: MultiResourceResolver,
        ResourceResolver: ResourceResolver,
        CachingResourceResolver: CachingResourceResolver,
        ObjectResource: ObjectResource,
        HBSRendererFactory: HBSRendererFactory,
        JSRendererFactory: JSRendererFactory,
        FileResource: FileResource,
        RootResource: RootResource,
        DefaultRenderingTemplates: DefaultRenderingTemplates,
        Utils: Utils
    };
}
