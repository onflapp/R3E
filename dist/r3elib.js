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
    Utils.listSortByNames = function (list, names) {
        var rv = [];
        var done = {};
        for (var i = 0; i < names.length; i++) {
            var x = list.indexOf(names[i]);
            if (x != -1) {
                rv.push(list[x]);
                done[names[i]] = 'y';
            }
        }
        for (var i = 0; i < list.length; i++) {
            if (!done[list[i]])
                rv.push(list[i]);
        }
        return rv;
    };
    Utils.listRemoveNames = function (list, names) {
        var rv = [];
        for (var i = 0; i < list.length; i++) {
            if (names.indexOf(list[i]) === -1) {
                rv.push(list[i]);
            }
        }
        return rv;
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
    Utils.unescape = function (str) {
        if (!str)
            return str;
        else
            return unescape(str);
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
    Utils.is_texttype = function (mime) {
        if (!mime)
            return false;
        var texttypes = ['application/json', 'application/javascript'];
        if (mime.indexOf('text/') === 0 || texttypes.indexOf(mime) >= 0)
            return true;
        else
            return false;
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
        if (ext === 'pdf')
            return 'application/pdf';
        if (ext === 'html' || ext === 'htm')
            return 'text/html';
        if (ext === 'xml')
            return 'text/xml';
        if (ext === 'js')
            return 'text/plain';
        if (ext === 'json')
            return 'text/plain';
        if (ext === 'md')
            return 'text/x-markdown';
        if (ext === 'hbs')
            return 'text/plain';
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
    Data.prototype.importProperties = function (data, callback) {
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
            if (typeof v === 'object' || typeof v === 'function' || k.charAt(0) === '_') { }
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
        return this.getSuperType();
    };
    Resource.prototype.getSuperType = function () {
        return 'resource/node';
    };
    Resource.prototype.getName = function () {
        return this.resourceName;
    };
    Resource.prototype.getRenderType = function () {
        return null;
    };
    Resource.prototype.getRenderSuperType = function () {
        return null;
    };
    Resource.prototype.getRenderTypes = function () {
        var rv = [];
        var rt = this.getRenderType();
        var st = this.getRenderSuperType();
        var nt = this.getSuperType();
        var ct = this.getContentType();
        var pt = this.getType();
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
    };
    Resource.prototype.resolveOrAllocateChildResource = function (name, callback, walking) {
        var self = this;
        this.resolveChildResource(name, function (res) {
            if (res) {
                callback(res);
            }
            else {
                self.allocateChildResource(name, callback);
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
    };
    Resource.prototype.exportChilrenResources = function (level, writer, incSource) {
        var self = this;
        var processingc = 0;
        var processingd = 0;
        var processingn = 0;
        var done = function () {
            if (processingc === 0 && processingd === 0 && processingn === 0) {
                writer.end(null);
            }
        };
        var export_children = function (path, name, res) {
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
                var _loop_1 = function () {
                    var name_5 = names[i];
                    res.resolveChildResource(name_5, function (r) {
                        var rpath = Utils.filename_path_append(path, name_5);
                        export_children(rpath, name_5, r);
                        processingn--;
                        done();
                    });
                };
                for (var i = 0; i < names.length; i++) {
                    _loop_1();
                }
                processingc--;
                done();
            });
        };
        writer.start('object/javascript');
        export_children(incSource ? this.getName() : '', this.getName(), this);
    };
    Resource.prototype.importData = function (data, callback) {
        var processingf = 0;
        var processingp = 0;
        var ffunc = null;
        var ct = null;
        var self = this;
        var mime = Utils.filename_mime(this.getName());
        var done = function () {
            if (processingf === 0 && processingp === 0 && callback)
                callback();
        };
        var props = {};
        var _loop_2 = function (k) {
            var v = data.values[k];
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
    };
    Resource.prototype.listChildrenResources = function (callback) {
        var self = this;
        this.listChildrenNames(function (ls) {
            var rv = [];
            var sz = 0;
            if (ls && ls.length > 0) {
                for (var i = 0; i < ls.length; i++) {
                    var name_6 = ls[i];
                    self.resolveChildResource(name_6, function (res) {
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
    };
    Resource.prototype.isContentResource = function () {
        return false;
    };
    Resource.prototype.getContentType = function () {
        return null;
    };
    Resource.prototype.getContentSize = function () {
        return -1;
    };
    Resource.prototype.getWriter = function () {
        return null;
    };
    Resource.prototype.read = function (writer, callback) {
        if (writer)
            writer.end(callback);
    };
    Resource.IO_TIMEOUT = 10000000;
    Resource.STORE_CONTENT_PROPERTY = '_content';
    Resource.STORE_RENDERTYPE_PROPERTY = '_rt';
    Resource.STORE_RENDERSUPERTYPE_PROPERTY = '_st';
    Resource.STORE_RESOURCETYPE_PROPERTY = '_pt';
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
                res.resolveOrAllocateChildResource(name, function (rv) {
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
        this.makeRenderTypePatterns = function (factoryType, renderType, name, sel) {
            var rv = [];
            var p = renderType + '/' + name + '.' + sel;
            if (sel === 'default') {
                rv.push(renderType + '/' + name + '.' + factoryType);
            }
            rv.push(p + '.' + factoryType);
            p = renderType + '/' + sel;
            rv.push(p + '.' + factoryType);
            return rv;
        };
    }
    ResourceRenderer.prototype.makeRenderTypePaths = function (renderTypes, selectors) {
        var rv = [];
        var factories = this.rendererFactories;
        var self = this;
        var _loop_3 = function (i) {
            factories.forEach(function (val, key, map) {
                if (key == '')
                    return;
                var name = Utils.filename(renderTypes[i]);
                for (var z = 0; z < selectors.length; z++) {
                    var rt = renderTypes[i];
                    var sel = selectors[z];
                    rv = rv.concat(self.makeRenderTypePatterns(key, rt, name, sel));
                }
            });
        };
        for (var i = 0; i < renderTypes.length; i++) {
            _loop_3(i);
        }
        return rv;
    };
    ResourceRenderer.prototype.makeRenderingFunction = function (resource, callback) {
        var ext = Utils.filename_ext(resource.getName());
        var fact = this.rendererFactories.get(ext);
        fact.makeRenderer(resource, callback);
    };
    ResourceRenderer.prototype.registerMakeRenderTypePatterns = function (func) {
        if (func) {
            this.makeRenderTypePatterns = func;
        }
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
        if (context.getCurrentRenderResourceType()) {
            renderTypes = [context.getCurrentRenderResourceType()];
        }
        else {
            renderTypes.push('any');
        }
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
        if (this.pathInfo.refererURL) {
            p['REF_URL'] = this.pathInfo.refererURL;
            p['REF_PATH'] = this.pathInfo.referer.path;
            if (this.pathInfo.referer.suffix)
                p['REF_SUFFIX'] = this.pathInfo.referer.suffix;
        }
        return p;
    };
    ResourceRequestContext.prototype.__overrideCurrentResourcePath = function (resourcePath) {
        this.pathInfo.resourcePath = resourcePath;
    };
    ResourceRequestContext.prototype.__overrideCurrentSelector = function (selector) {
        this.pathInfo.selector = selector;
    };
    ResourceRequestContext.prototype.__overrideCurrentRenderResourceType = function (rstype) {
        this.renderResourceType = rstype;
    };
    ResourceRequestContext.prototype.getCurrentSelector = function () {
        return this.pathInfo.selector;
    };
    ResourceRequestContext.prototype.getCurrentResourcePath = function () {
        return this.pathInfo.resourcePath;
    };
    ResourceRequestContext.prototype.getCurrentRequestPath = function () {
        return this.pathInfo.path;
    };
    ResourceRequestContext.prototype.getCurrentDataPath = function () {
        return this.pathInfo.dataPath;
    };
    ResourceRequestContext.prototype.getCurrentRenderResourceType = function () {
        return this.renderResourceType;
    };
    ResourceRequestContext.prototype.renderResource = function (resourcePath, rstype, selector, callback) {
        this.resourceRequestHandler.renderResource(resourcePath, rstype, selector, this, callback);
    };
    ResourceRequestContext.prototype.resolveResource = function (resourcePath, callback) {
        var rres = this.getResourceResolver();
        rres.resolveResource(resourcePath, callback);
    };
    ResourceRequestContext.prototype.resolveTemplateResource = function (resourcePath, callback) {
        var trres = this.getTemplateResourceResolver();
        trres.resolveResource(resourcePath, callback);
    };
    ResourceRequestContext.prototype.getQueryProperties = function () {
        return this.pathInfo.query;
    };
    ResourceRequestContext.prototype.getQueryProperty = function (name) {
        if (this.pathInfo.query)
            return this.pathInfo.query[name];
        else
            return null;
    };
    ResourceRequestContext.prototype.getConfigProperties = function () {
        return this.resourceRequestHandler.getConfigProperties();
    };
    ResourceRequestContext.prototype.getConfigProperty = function (name) {
        var p = this.resourceRequestHandler.getConfigProperties();
        if (p)
            return p[name];
        else
            null;
    };
    ResourceRequestContext.prototype.getResourceResolver = function () {
        return this.resourceRequestHandler.getResourceResolver();
    };
    ResourceRequestContext.prototype.getTemplateResourceResolver = function () {
        return this.resourceRequestHandler.getTemplateResourceResolver();
    };
    ResourceRequestContext.prototype.forwardRequest = function (rpath) {
        this.resourceRequestHandler.forwardRequest(rpath);
    };
    ResourceRequestContext.prototype.sendStatus = function (code) {
        this.resourceRequestHandler.sendStatus(code);
    };
    ResourceRequestContext.prototype.storeResource = function (resourcePath, data, callback) {
        this.resourceRequestHandler.storeResource(resourcePath, data, callback);
    };
    ResourceRequestContext.prototype.storeAndResolveResource = function (resourcePath, data, callback) {
        var rres = this.getResourceResolver();
        this.resourceRequestHandler.storeResource(resourcePath, data, function () {
            rres.resolveResource(resourcePath, callback);
        });
    };
    ResourceRequestContext.prototype.makeContextMap = function (res) {
        var map = {};
        if (res instanceof Resource) {
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
            var ctype = res.getContentType();
            if (ctype) {
                map['isTextContentResource'] = Utils.is_texttype(ctype);
                map['contentType'] = ctype;
                map['contentSize'] = res.getContentSize();
            }
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
        pi.refererURL = this.refererURL;
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
        _this.pathParserRegexp = new RegExp(/^(\/.*?)(\.x-([a-z,\-_]+))(\.([a-z0-9,\-\.]+))?(\/.*?)?$/);
        _this.configProperties = {
            'X': '.x-'
        };
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
        for (var key in data) {
            var val = data[key];
            if (key.indexOf('@') !== -1) {
                var i_1 = key.indexOf('@');
                var k = key.substr(0, i_1);
                var n = key.substr(i_1 + 1);
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
    };
    ResourceRequestHandler.prototype.transformObject = function (object, rstype, selector, context, callback) {
        var data = new Data(object).wrap({
            getRenderTypes: function () {
                return [rstype];
            }
        });
        this.transformResource(data, selector, context, callback);
    };
    ResourceRequestHandler.prototype.transformResource = function (data, selector, context, callback) {
        var rrend = this.resourceRenderer;
        var selectors = [selector];
        var renderTypes = data.getRenderTypes();
        renderTypes.push('any');
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
        if (!pathInfo)
            return null;
        pathInfo.refererURL = this.refererPath;
        pathInfo.referer = this.parsePath(this.refererPath);
        pathInfo.query = this.queryProperties;
        var context = new ResourceRequestContext(pathInfo, this);
        return context;
    };
    ResourceRequestHandler.prototype.expandDataAndImport = function (resourcePath, data, callback) {
        var rres = this.resourceResolver;
        var imp = data[Resource.STORE_CONTENT_PROPERTY];
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
    };
    ResourceRequestHandler.prototype.expandDataAndStore = function (resourcePath, data, callback) {
        var rres = this.resourceResolver;
        var datas = {};
        var count = 1;
        datas[resourcePath] = {};
        for (var key in data) {
            if (key.indexOf(':') !== -1)
                continue;
            var v = data[key];
            var x = key.lastIndexOf('/');
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
            var p = Utils.absolute_path(key);
            rres.storeResource(p, new Data(v), function () {
                count--;
                if (count === 0) {
                    callback();
                }
            });
        }
    };
    ResourceRequestHandler.prototype.setPathParserPattern = function (pattern) {
        this.pathParserRegexp = new RegExp(pattern);
    };
    ResourceRequestHandler.prototype.setPathContext = function (pref) {
        this.pathContext = pref;
    };
    ResourceRequestHandler.prototype.parsePath = function (rpath) {
        if (!rpath)
            return null;
        var info = new PathInfo();
        var path = rpath.replace(/\/+/g, '/');
        if (this.pathContext)
            path = path.substr(this.pathContext.length);
        var m = path.match(this.pathParserRegexp);
        if (m) {
            info.dataPath = Utils.unescape(m[6] ? m[6] : null);
            info.selectorArgs = m[5] ? m[5] : null;
            info.path = Utils.unescape(Utils.absolute_path(m[1]));
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
            info.path = Utils.unescape(Utils.absolute_path(path));
            info.selector = null;
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
    ResourceRequestHandler.prototype.getTemplateResourceResolver = function () {
        return this.templateResolver;
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
    ResourceRequestHandler.prototype.registerMakeRenderTypePatterns = function (func) {
        this.resourceRenderer.registerMakeRenderTypePatterns(func);
    };
    ResourceRequestHandler.prototype.handleRequest = function (rpath) {
        this.renderRequest(rpath);
    };
    ResourceRequestHandler.prototype.forwardRequest = function (rpath) {
        this.renderRequest(rpath);
    };
    ResourceRequestHandler.prototype.sendStatus = function (code) {
    };
    ResourceRequestHandler.prototype.renderRequest = function (rpath) {
        var rres = this.resourceResolver;
        var rrend = this.resourceRenderer;
        var self = this;
        if (!rres)
            throw new Error('no resource resolver');
        if (!rrend)
            throw new Error('no resource renderer');
        if (!this.contentWriter)
            throw new Error('no content writer');
        var info = this.parsePath(rpath);
        var context = this.makeContext(info);
        var out = this.contentWriter.makeNestedContentWriter();
        var sel = info.selector ? info.selector : 'default';
        try {
            if (info) {
                rres.resolveResource(info.resourcePath, function (res) {
                    if (!res) {
                        res = new NotFoundResource(info.resourcePath);
                    }
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
    };
    ResourceRequestHandler.prototype.renderResource = function (resourcePath, rstype, selector, context, callback) {
        var out = new OrderedContentWriter(new BufferedContentWriter(callback));
        var rres = this.resourceResolver;
        var rrend = this.resourceRenderer;
        var ncontext = context.clone();
        var sel = selector ? selector : 'default';
        ncontext.__overrideCurrentResourcePath(resourcePath);
        ncontext.__overrideCurrentRenderResourceType(rstype);
        ncontext.__overrideCurrentSelector(selector);
        try {
            if (resourcePath) {
                rres.resolveResource(resourcePath, function (res) {
                    if (res)
                        rrend.renderResource(res, sel, out, ncontext);
                    else {
                        var res_1 = new NotFoundResource(resourcePath);
                        rrend.renderResource(res_1, sel, out, ncontext);
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
            console.log(err);
            var out = self.contentWriter.makeNestedContentWriter();
            rrend.renderResource(err, 'default', out, context);
            out.end(null);
        };
        if (context && info && info.resourcePath) {
            var tdata = new Data(data);
            tdata.values = this.expandValues(tdata.values, tdata.values);
            self.transformResource(tdata, 'pre-store', context, function (ddata) {
                var storeto = Utils.absolute_path(ddata.values[':storeto']);
                if (!storeto)
                    storeto = info.resourcePath;
                if (info.selector && ddata.values[':forward']) {
                    var forward_1 = Utils.absolute_path(ddata.values[':forward']);
                    self.renderResource(info.resourcePath, null, info.selector, context, function (ctype, content) {
                        self.forwardRequest(forward_1);
                    });
                }
                else {
                    self.storeResource(storeto, ddata.values, function (error) {
                        if (!error) {
                            var forward = Utils.absolute_path(ddata.values[':forward']);
                            if (forward)
                                self.forwardRequest(forward);
                            else
                                self.renderRequest(rpath);
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
    };
    ResourceRequestHandler.prototype.storeResource = function (resourcePath, data, callback) {
        var self = this;
        var rres = this.resourceResolver;
        var storedata = function (path) {
            self.expandDataAndStore(path, data, function () {
                self.dispatchAllEventsAsync('stored', path, data);
                callback();
            });
        };
        try {
            var remove_1 = Utils.absolute_path(data[':delete']);
            var copyto_1 = Utils.absolute_path(data[':copyto']);
            var copyfrom = Utils.absolute_path(data[':copyfrom']);
            var moveto_1 = Utils.absolute_path(data[':moveto']);
            var importto = Utils.absolute_path(data[':import']);
            if (copyto_1) {
                rres.copyResource(resourcePath, copyto_1, function () {
                    self.dispatchAllEventsAsync('stored', copyto_1, data);
                    storedata(copyto_1);
                });
            }
            else if (copyfrom) {
                rres.copyResource(copyfrom, resourcePath, function () {
                    self.dispatchAllEventsAsync('stored', resourcePath, data);
                    storedata(resourcePath);
                });
            }
            else if (moveto_1) {
                rres.moveResource(resourcePath, moveto_1, function () {
                    self.dispatchAllEventsAsync('stored', moveto_1, data);
                    storedata(moveto_1);
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
                    storedata(resourcePath);
                });
            }
            else {
                storedata(resourcePath);
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
    Tools.visitAllChidren = function (res, resolve, callback) {
        var processing = 0;
        var done = function () {
            if (processing === 0) {
                callback(null);
                processing = -1;
            }
            else if (processing === -1) {
                console.log('something is wrong, we should be finished by now!');
            }
        };
        var visit_children = function (path, name, res) {
            processing++;
            res.listChildrenNames(function (names) {
                processing += names.length;
                var _loop_4 = function () {
                    var name_7 = names[i];
                    res.resolveChildResource(name_7, function (r) {
                        var rpath = Utils.filename_path_append(path, name_7);
                        var skip = callback(rpath, r);
                        if (!skip) {
                            visit_children(rpath, name_7, r);
                        }
                        processing--;
                        done();
                    }, !resolve);
                };
                for (var i = 0; i < names.length; i++) {
                    _loop_4();
                }
                processing--;
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
    ContentWriterAdapter.prototype.__cleanup = function () {
        this.callback = null;
        this.data = null;
    };
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
                self_1.__cleanup();
            }
            else if (typeof v === 'string') {
                this.callback(this.data.join(''), this.ctype);
                self_1.__cleanup();
            }
            else if (typeof Buffer !== 'undefined' && Buffer.isBuffer(v)) {
                var b = Buffer.concat(this.data);
                this.callback(b.toString('utf8'), this.ctype);
                self_1.__cleanup();
            }
            else if (v instanceof Blob && typeof window !== 'undefined') {
                var reader_1 = new FileReader();
                reader_1.onload = function () {
                    self_1.callback(reader_1.result, self_1.ctype);
                    self_1.__cleanup();
                };
                reader_1.readAsText(v);
            }
            else if (v instanceof ArrayBuffer && typeof window !== 'undefined') {
                var t = new window['TextDecoder']('utf-8').decode(v);
                this.callback(t, this.ctype);
                self_1.__cleanup();
            }
            else if (v) {
                this.callback(this.data, this.ctype);
                self_1.__cleanup();
            }
            else {
                this.callback(null, this.ctype);
                self_1.__cleanup();
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
        if (p.instances > 0) {
            p.instances--;
        }
        else if (p.instances == 0) {
            p.endAll();
            this.contentQueue = null;
            this.parentWriter = null;
            this.delegateWriter = null;
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
            writer.contentType = null;
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
    };
    return BufferedContentWriter;
}());
var ObjectResource = (function (_super) {
    __extends(ObjectResource, _super);
    function ObjectResource(obj, name) {
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
    ObjectResource.prototype.getRenderSuperType = function () {
        var st = this.values['_st'];
        return st ? st : null;
    };
    ObjectResource.prototype.getType = function () {
        var st = this.values['_pt'];
        return st ? st : 'resource/node';
    };
    ObjectResource.prototype.resolveChildResource = function (name, callback, walking) {
        var rv = this.values[name];
        if (typeof rv === 'object') {
            if (rv['_content'] || rv['_content64'] || rv['_pt'] === 'resource/content')
                callback(new ObjectContentResource(rv, name));
            else
                callback(new ObjectResource(rv, name));
        }
        else if (typeof rv === 'function') {
            callback(new ObjectContentResource(rv, name));
        }
        else {
            callback(null);
        }
    };
    ObjectResource.prototype.allocateChildResource = function (name, callback) {
        var rv = {};
        this.values[name] = rv;
        callback(new ObjectResource(rv, name));
    };
    ObjectResource.prototype.listChildrenNames = function (callback) {
        var rv = [];
        for (var k in this.values) {
            var v = this.values[k];
            if (typeof v === 'object' && k.charAt(0) !== '.') {
                rv.push(k);
            }
        }
        callback(rv);
    };
    ObjectResource.prototype.importContent = function (func, callback) {
        var res = new ObjectContentResource(this.values, this.resourceName);
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
        this.buffer = [];
        this.values = obj;
    }
    ObjectContentResourceWriter.prototype.start = function (ctype) {
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
    };
    ObjectContentResourceWriter.prototype.write = function (data) {
        this.buffer.push(data);
    };
    ObjectContentResourceWriter.prototype.error = function (error) { };
    ObjectContentResourceWriter.prototype.end = function (callback) {
        var data = this.buffer[0];
        if (data instanceof ArrayBuffer) {
            if (this.istext && typeof window !== 'undefined')
                this.values['_content'] = new window['TextDecoder']('utf-8').decode(data);
            else
                this.values['_content64'] = Utils.ArrayBuffer2base64(data);
        }
        else if (typeof Buffer !== 'undefined' && data instanceof Buffer) {
            data = Buffer.concat(this.buffer);
            if (this.istext) {
                var t_1 = data.toString('utf8');
                this.values['_content'] = t_1;
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
    };
    return ObjectContentResourceWriter;
}());
var ObjectContentResource = (function (_super) {
    __extends(ObjectContentResource, _super);
    function ObjectContentResource(obj, name) {
        return _super.call(this, obj, name) || this;
    }
    ObjectContentResource.prototype.getType = function () {
        return 'resource/content';
    };
    ObjectContentResource.prototype.isContentResource = function () {
        return true;
    };
    ObjectContentResource.prototype.getContentType = function () {
        var contentType = this.values['_ct'];
        if (contentType)
            return contentType;
        else
            return Utils.filename_mime(this.getName());
    };
    ObjectContentResource.prototype.getContentSize = function () {
        var t = this.values['_content'];
        var z = this.values['_content64sz'];
        if (z)
            return z;
        else if (t)
            return t.length;
        else
            return 0;
    };
    ObjectContentResource.prototype.getWriter = function () {
        delete this.values['_content64sz'];
        delete this.values['_content64'];
        delete this.values['_content'];
        return new ObjectContentResourceWriter(this.values);
    };
    ObjectContentResource.prototype.read = function (writer, callback) {
        var data = this.values;
        var contentType = this.getContentType();
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
    };
    return ObjectContentResource;
}(ObjectResource));
var RootResource = (function (_super) {
    __extends(RootResource, _super);
    function RootResource(opts) {
        return _super.call(this, opts, '') || this;
    }
    RootResource.prototype.getType = function () {
        return 'resource/root';
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
            _super.prototype.resolveChildResource.call(this, name, callback, walking);
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
        else if (this.pending < 0) {
            console.log('pending not in sync ' + this.pending);
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
        else if (path.charAt(0) === '/') {
            return Utils.absolute_path(path);
        }
        else {
            var p = Utils.filename_path_append(context.getCurrentResourcePath(), path);
            return Utils.absolute_path(p);
        }
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
                    var render_ouput = function (txt) {
                        session_1.replaceOutputPlaceholders(txt, function (txt) {
                            writer.start('text/html');
                            writer.write(txt);
                            writer.end(null);
                        });
                    };
                    if (typeof tfunc_1 === 'function') {
                        try {
                            var txt = tfunc_1(map);
                            render_ouput(txt);
                        }
                        catch (ex) {
                            callback(null, ex);
                        }
                    }
                    else if (typeof tfunc_1.callback === 'function') {
                        tfunc_1.callback(map, function (txt, error) {
                            if (txt)
                                render_ouput(txt);
                            else
                                callback(null, error);
                        });
                    }
                    else {
                        console.log(tfunc_1);
                        callback(null, new Error('invlid renderer function'));
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
        _this = _super.call(this, err, '/') || this;
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
        return _super.call(this, {}, name) || this;
    }
    NotFoundResource.prototype.getType = function () {
        return 'resource/notfound';
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
    };
    return MultiResourceResolver;
}(ResourceResolver));
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
        var include = function (arg0, arg1) {
            var path = arg0;
            var block = arg1;
            var selector = null;
            var rtype = null;
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
            var safe = (block.name === 'include-safe') ? true : false;
            var session = block.data.root._session;
            var context = block.data.root._context;
            var res = block.data.root._resource;
            if (!selector)
                selector = context.getCurrentSelector();
            if (!selector)
                selector = 'default';
            var render = function (contentType, content) {
                if (contentType === 'object/javascript') {
                    var out = '';
                    if (Array.isArray(content)) {
                        for (var i = 0; i < content.length; i++) {
                            var it = content[i];
                            if (typeof block.fn === 'function')
                                out += block.fn(it);
                            else
                                out += JSON.stringify(it);
                        }
                    }
                    else {
                        var it = content;
                        if (typeof block.fn === 'function')
                            out += block.fn(it);
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
            var p = session.makeOutputPlaceholder();
            if (typeof path === 'string') {
                path = self.expadPath(path, context);
                context.renderResource(path, rtype, selector, render);
            }
            else {
                render('object/javascript', path);
            }
            return p.placeholder;
        };
        _this.Handlebars.registerHelper('include', include);
        _this.Handlebars.registerHelper('include-safe', include);
        _this.Handlebars.registerHelper('dump', function (block) {
            var rv = {};
            var context = block['data'] ? block.data.root : block;
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
var StoredResource = (function (_super) {
    __extends(StoredResource, _super);
    function StoredResource(name, base) {
        var _this = _super.call(this, name) || this;
        _this.isDirectory = true;
        _this.contentSize = -1;
        _this.resourceCache = {};
        _this.loaded = false;
        if (typeof base !== 'undefined') {
            _this.baseName = name;
            _this.basePath = base;
        }
        else {
            _this.baseName = '';
            _this.basePath = name;
        }
        return _this;
    }
    StoredResource.prototype.getCachedResource = function (name) {
        var res = this.resourceCache[name];
        return res;
    };
    StoredResource.prototype.setCachedResource = function (name, res) {
        if (res) {
            this.resourceCache[name] = res;
        }
        return res;
    };
    StoredResource.prototype.clearCachedResource = function (name) {
        if (name)
            delete this.resourceCache[name];
        else
            this.resourceCache = {};
    };
    StoredResource.prototype.flushResourceCache = function () {
        this.resourceCache = {};
        this.childNames = null;
        this.loaded = false;
    };
    StoredResource.prototype.getStoragePath = function (name) {
        var path = Utils.filename_path_append(this.basePath, this.baseName);
        if (name)
            path = Utils.filename_path_append(path, name);
        return path;
    };
    StoredResource.prototype.getMetadataPath = function (nm) {
        if (nm) {
            return this.basePath + '/.' + nm + '.metadata.json';
        }
        else {
            return this.getStoragePath('.metadata.json');
        }
    };
    StoredResource.prototype.getType = function () {
        if (this.isDirectory)
            return 'resource/node';
        else
            return 'resource/content';
    };
    StoredResource.prototype.getRenderType = function () {
        return this.values['_rt'];
    };
    StoredResource.prototype.getRenderSuperType = function () {
        return this.values['_st'];
    };
    StoredResource.prototype.isContentResource = function () {
        return !this.isDirectory;
    };
    StoredResource.prototype.getContentType = function () {
        if (this.isDirectory)
            return null;
        var contentType = this.values['_ct'];
        if (contentType)
            return contentType;
        else
            return Utils.filename_mime(this.getName());
    };
    StoredResource.prototype.getContentSize = function () {
        if (this.isDirectory)
            return 0;
        else
            return this.contentSize;
    };
    StoredResource.prototype.resolveItself = function (callback) {
        var self = this;
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
    };
    StoredResource.prototype.resolveChildResource = function (name, callback, walking) {
        var res = this.getCachedResource(name);
        var self = this;
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
    };
    StoredResource.prototype.listChildrenNames = function (callback) {
        var self = this;
        if (self.childNames) {
            callback(self.childNames);
        }
        else {
            this.loadChildrenNames(function (ls) {
                self.childNames = ls;
                callback(ls);
            });
        }
    };
    StoredResource.prototype.allocateChildResource = function (name, callback) {
        var res = this.setCachedResource(name, this.makeNewResource(name));
        this.childNames = null;
        callback(res);
    };
    StoredResource.prototype.importProperties = function (data, callback) {
        if (!this.isDirectory) {
            callback();
            return;
        }
        var self = this;
        var path = this.getStoragePath();
        if (!this.isDirectory) {
            path = this.basePath;
        }
        _super.prototype.importProperties.call(this, data, function () {
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
    };
    StoredResource.prototype.importContent = function (func, callback) {
        var self = this;
        var path = this.basePath;
        this.isDirectory = false;
        this.ensurePathExists(path, function (rv) {
            if (rv) {
                func(self.getWriter(), callback);
            }
            else {
                callback();
            }
        });
    };
    StoredResource.prototype.removeChildResource = function (name, callback) {
        this.clearCachedResource(name);
        if (this.childNames) {
            this.childNames.splice(this.childNames.indexOf(name), 1);
        }
        this.storeChildrenNames(function () {
            callback();
        });
    };
    return StoredResource;
}(Resource));
var RemoteResourceContentWriter = (function () {
    function RemoteResourceContentWriter(filePath) {
        this.buffer = [];
        this.filePath = filePath;
    }
    RemoteResourceContentWriter.prototype.start = function (ctype) {
        this.contentType = ctype;
    };
    RemoteResourceContentWriter.prototype.write = function (data) {
        this.buffer.push(data);
    };
    RemoteResourceContentWriter.prototype.error = function (error) {
        console.log(error);
    };
    RemoteResourceContentWriter.prototype.end = function (callback) {
        var xhr = new XMLHttpRequest();
        var self = this;
        var data = this.buffer[0];
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
    };
    return RemoteResourceContentWriter;
}());
var RemoteResource = (function (_super) {
    __extends(RemoteResource, _super);
    function RemoteResource(name, base) {
        return _super.call(this, name, base) || this;
    }
    RemoteResource.prototype.makeNewResource = function (name) {
        var path = this.getStoragePath();
        var res = new RemoteResource(name, path);
        return res;
    };
    RemoteResource.prototype.ensurePathExists = function (path, callback) {
        callback(true);
    };
    RemoteResource.prototype.storeChildrenNames = function (callback) {
        callback();
    };
    RemoteResource.prototype.removeChildResource = function (name, callback) {
        var url = this.getStoragePath(name);
        var self = this;
        var val = {
            ':delete': url
        };
        url += '/.metadata.json';
        _super.prototype.removeChildResource.call(this, name, function () {
            self.remotePOST(url, val, function () {
                callback();
            });
        });
    };
    RemoteResource.prototype.loadChildrenNames = function (callback) {
        if (this.isDirectory) {
            var url = this.getStoragePath('.children.json');
            this.remoteGET(url, true, function (values) {
                callback(values ? values : []);
            });
        }
        else {
            callback([]);
        }
    };
    RemoteResource.prototype.storeProperties = function (callback) {
        var url = this.getStoragePath('.metadata.json');
        this.remotePOST(url, this.values, function () {
            callback();
        });
    };
    RemoteResource.prototype.loadProperties = function (callback) {
        var url = this.getMetadataPath();
        var self = this;
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
                callback(false);
            }
        });
    };
    RemoteResource.prototype.getWriter = function () {
        var path = this.getStoragePath();
        if (this.isDirectory) {
            this.isDirectory = false;
        }
        this.loaded = false;
        return new RemoteResourceContentWriter(path);
    };
    RemoteResource.prototype.read = function (writer, callback) {
        if (this.isDirectory) {
            writer.end(callback);
        }
        else {
            var url = this.getStoragePath();
            var ct_1 = this.getContentType();
            this.remoteGET(url, false, function (data) {
                writer.start(ct_1);
                writer.write(data);
                writer.end(callback);
            });
        }
    };
    RemoteResource.prototype.remotePOST = function (url, values, callback) {
        var xhr = new XMLHttpRequest();
        var self = this;
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
        var data = JSON.stringify(values);
        xhr.send(data);
    };
    RemoteResource.prototype.remoteGET = function (url, json, callback) {
        var xhr = new XMLHttpRequest();
        if (!json)
            xhr.responseType = 'arraybuffer';
        xhr.open('GET', url, true);
        xhr.onreadystatechange = function () {
            var DONE = 4;
            var OK = 200;
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    if (json) {
                        var data = xhr.responseText;
                        var val = null;
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
    };
    return RemoteResource;
}(StoredResource));
var CachedRemoteTemplateResource = (function (_super) {
    __extends(CachedRemoteTemplateResource, _super);
    function CachedRemoteTemplateResource(obj, base, path, name) {
        var _this = _super.call(this, obj, name) || this;
        _this.baseURL = base;
        _this.path = path ? path : '';
        return _this;
    }
    CachedRemoteTemplateResource.prototype.getPath = function () {
        return this.path;
    };
    CachedRemoteTemplateResource.prototype.resolveChildResource = function (name, callback, walking) {
        var rv = this.values[name];
        if (typeof rv === 'object') {
            if (rv['_content'] || rv['_content64'] || rv['_pt'] === 'resource/content')
                callback(new ObjectContentResource(rv, name));
            else {
                var path = Utils.filename_path_append(this.getPath(), name);
                callback(new CachedRemoteTemplateResource(rv, this.baseURL, path, name));
            }
        }
        else if (typeof rv === 'function') {
            callback(new ObjectContentResource(rv, name));
        }
        else if (walking) {
            var path = Utils.filename_path_append(this.getPath(), name);
            rv = {};
            this.values[name] = rv;
            callback(new CachedRemoteTemplateResource(rv, this.baseURL, path, name));
        }
        else if (rv && rv === 'NA') {
            callback(null);
        }
        else {
            var self_2 = this;
            var path = this.baseURL + '/' + this.getPath() + '/' + name;
            path = path.replace(/\/+/g, '/');
            this.requestData(path, function (ctype, text) {
                if (text) {
                    rv = {
                        _ct: ctype,
                        _content: text,
                    };
                    self_2.values[name] = rv;
                    callback(new ObjectContentResource(rv, name));
                }
                else {
                    self_2.values[name] = 'NA';
                    callback(null);
                }
            });
        }
    };
    CachedRemoteTemplateResource.prototype.requestData = function (path, callback) {
        var xhr = new XMLHttpRequest();
        xhr.open('GET', path, true);
        xhr.onreadystatechange = function () {
            var DONE = 4;
            var OK = 200;
            if (xhr.readyState === DONE) {
                if (xhr.status === OK) {
                    var ct = xhr.getResponseHeader('content-type');
                    callback(ct, xhr.responseText);
                }
                else {
                    callback(null);
                }
            }
        };
        xhr.send(null);
    };
    return CachedRemoteTemplateResource;
}(ObjectResource));
var DOMContentWriter = (function () {
    function DOMContentWriter() {
        this.externalResources = {};
    }
    DOMContentWriter.prototype.escapeHTML = function (html) {
        var text = document.createTextNode(html);
        var p = document.createElement('p');
        p.appendChild(text);
        return p.innerHTML;
    };
    DOMContentWriter.prototype.patchWindowObjects = function () {
        var self = this;
        if (window['__myevents']) {
            for (var i = 0; i < window['__myevents'].length; i++) {
                var v = window['__myevents'][i];
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
        if (!window['XMLHttpRequest'].prototype.orig_open) {
            window['XMLHttpRequest'].prototype.orig_open = window['XMLHttpRequest'].prototype.open;
            window['XMLHttpRequest'].prototype.open = function (method, path, a) {
                if (method.toUpperCase() === 'POST' && path.indexOf('#') !== -1) {
                    this.__localpath = path.substr(path.indexOf('#') + 1);
                }
                else {
                    window['XMLHttpRequest'].prototype.orig_open.call(this, method, path, a);
                }
            };
            window['XMLHttpRequest'].prototype.orig_send = window['XMLHttpRequest'].prototype.send;
            window['XMLHttpRequest'].prototype.send = function (data) {
                if (this.__localpath) {
                    var info = self.requestHandler.parseFormData(this.__localpath, data);
                    self.requestHandler.handleStore(info.formPath, info.formData);
                }
                else {
                    window['XMLHttpRequest'].prototype.orig_send.call(this, data);
                }
            };
        }
    };
    DOMContentWriter.prototype.attachListeners = function () {
        var requestHandler = this.requestHandler;
        document.body.addEventListener('submit', function (evt) {
            var target = evt.target;
            var info = requestHandler.parseFormElement(target);
            evt.preventDefault();
            setTimeout(function () {
                requestHandler.handleStore(info.formPath, info.formData);
            });
        });
        document.body.addEventListener('click', function (evt) {
            var target = evt.target;
            var href = target.getAttribute('href');
            var tar = target.getAttribute('target');
            if (!href)
                href = target.parentElement.getAttribute('href');
            if (href && href.charAt(0) === '/' && evt.button === 0 && !evt.ctrlKey && !evt.altKey && !evt.shiftKey) {
                evt.preventDefault();
                setTimeout(function () {
                    requestHandler.handleRequest(href);
                }, 10);
            }
        });
    };
    DOMContentWriter.prototype.evaluateScripts = function () {
        var scripts = document.querySelectorAll('script');
        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i];
            var code = script.innerText;
            if (code && !script.src) {
                try {
                    eval(code);
                }
                catch (ex) {
                    console.log(ex);
                }
            }
        }
    };
    DOMContentWriter.prototype.loadExternal = function () {
        var scripts = document.querySelectorAll('script');
        var links = document.querySelectorAll('link');
        var processing = 0;
        var trigger_done = function () {
            if (processing !== 0)
                return;
            setTimeout(function () {
                var evt = document.createEvent('MutationEvents');
                evt.initMutationEvent('DOMContentLoaded', true, true, document, '', '', '', 0);
                document.dispatchEvent(evt);
                var evt1 = document.createEvent('Event');
                evt1.initEvent('load', false, false);
                window.dispatchEvent(evt1);
            });
            processing = -1;
        };
        for (var i = 0; i < scripts.length; i++) {
            var script = scripts[i];
            var el = document.createElement('script');
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
    };
    DOMContentWriter.prototype.updateDocument = function (content) {
        var self = this;
        this.patchWindowObjects();
        document.documentElement.innerHTML = content;
        var done_loading = function () {
            self.evaluateScripts();
            self.loadExternal();
            self.attachListeners();
        };
        window.requestAnimationFrame(function () {
            done_loading();
        });
    };
    DOMContentWriter.prototype.setRequestHandler = function (requestHandler) {
        this.requestHandler = requestHandler;
    };
    DOMContentWriter.prototype.start = function (ctype) {
        if (ctype === 'text/html')
            this.htmldata = [];
        else {
            this.extdata = window.open('about:blank');
            if (this.extdata) {
                this.extdata.document.open(ctype);
                this.extdata.document.write('<pre>\n');
            }
        }
    };
    DOMContentWriter.prototype.write = function (content) {
        if (this.htmldata)
            this.htmldata.push(content);
        else if (this.extdata) {
            if (typeof content != 'string') {
                this.extdata.document.write(JSON.stringify(content));
            }
            else {
                var val = this.escapeHTML(content);
                this.extdata.document.write(val);
            }
        }
    };
    DOMContentWriter.prototype.error = function (error) {
        console.log(error);
    };
    DOMContentWriter.prototype.end = function () {
        if (this.htmldata) {
            this.updateDocument(this.htmldata.join(''));
        }
        else if (this.extdata) {
            this.extdata.document.write('</pre>');
            this.extdata.document.close();
        }
        this.htmldata = null;
        this.extdata = null;
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
        var self = _this;
        window.addEventListener('hashchange', function (evt) {
            if (self.deferHashChange) {
                self.deferHashChange = false;
                return;
            }
            var path = window.location.hash.substr(1);
            if (path !== self.currentPath) {
                self.handleRequest(path);
            }
        });
        return _this;
    }
    ClientRequestHandler.prototype.setLocationHash = function (path) {
        var self = this;
        this.deferHashChange = true;
        location.hash = path;
        setTimeout(function () {
            self.deferHashChange = false;
        }, 10);
    };
    ClientRequestHandler.prototype.forwardRequest = function (rpath) {
        this.handleRequest(rpath);
    };
    ClientRequestHandler.prototype.sendStatus = function (code) {
        console.log('status:' + code);
    };
    ClientRequestHandler.prototype.handleRequest = function (rpath) {
        var path = rpath;
        var x = rpath.indexOf('?');
        if (x > 0) {
            var q = rpath.substr(x + 1);
            var p = {};
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
            this.queryProperties = p;
        }
        this.renderRequest(path);
    };
    ClientRequestHandler.prototype.renderRequest = function (rpath) {
        if (rpath != this.currentPath) {
            this.refererPath = this.currentPath;
        }
        this.currentPath = rpath;
        this.setLocationHash(rpath);
        _super.prototype.renderRequest.call(this, rpath);
    };
    ClientRequestHandler.prototype.parseFormData = function (action, data) {
        var rv = {};
        var it = data.entries();
        var result = it.next();
        while (!result.done) {
            rv[result.value[0]] = result.value[1];
            result = it.next();
        }
        rv = this.transformValues(rv);
        var path = this.expandValue(action, rv);
        var info = new ClientFormInfo();
        info.formData = rv;
        info.formPath = path;
        return info;
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
                var mime = Utils.filename_mime(value.name);
                if (mime === 'application/octet-stream' && ct)
                    mime = ct;
                rv[name_8] = value.name;
                rv[pref + '_ct'] = mime;
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
    ResponseContentWriter.prototype.sendStatus = function (code) {
        this.closed = true;
        this.respose.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, post-check=0, pre-check=0');
        this.respose.sendStatus(code);
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
        var first_val = function (val) {
            for (var i = 0; i < val.length; i++) {
                if (val[i])
                    return val[i];
            }
            return val[val.length - 1];
        };
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
                    var ct_2 = v_1['headers']['content-type'];
                    var path = v_1['path'];
                    var pref = '';
                    var mime = Utils.filename_mime(n);
                    if (mime === 'application/octet-stream' && ct_2)
                        mime = ct_2;
                    if (n.lastIndexOf('/') > 0)
                        pref = n.substr(0, n.lastIndexOf('/') + 1);
                    data[n] = f;
                    data[pref + '_ct'] = mime;
                    data[pref + Resource.STORE_CONTENT_PROPERTY] = function (writer, callback) {
                        var fs = require('fs');
                        var fd = fs.openSync(path, 'r');
                        writer.start(mime);
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
                        writer.end(function () {
                            if (callback)
                                callback();
                        });
                    };
                    return "break";
                };
                for (var file in files) {
                    var state_1 = _loop_6(file);
                    if (state_1 === "break")
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
                        data[k] = first_val(v);
                    else
                        data[k] = v;
                }
                data = self.transformValues(data);
                rpath = self.expandValue(rpath, data);
                self.handleStore(rpath, data);
            });
        }
    };
    ServerRequestHandler.prototype.forwardRequest = function (rpath) {
        this.resposeContentWriter.redirect(rpath);
    };
    ServerRequestHandler.prototype.sendStatus = function (code) {
        this.resposeContentWriter.sendStatus(code);
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
    function FileResource(name, base) {
        var _this = _super.call(this, name, base) || this;
        _this.fs = require('fs-extra');
        return _this;
    }
    FileResource.prototype.makeNewResource = function (name) {
        var path = this.getStoragePath();
        return new FileResource(name, path);
    };
    FileResource.prototype.getType = function () {
        if (!this.isDirectory)
            return 'resource/content';
        else
            return 'resource/node';
    };
    FileResource.prototype.storeChildrenNames = function (callback) {
        callback(true);
    };
    FileResource.prototype.ensurePathExists = function (path, callback) {
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
    };
    FileResource.prototype.loadChildrenNames = function (callback) {
        var path = this.getStoragePath();
        this.fs.readdir(path, function (err, items) {
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
    FileResource.prototype.storeProperties = function (callback) {
        var self = this;
        var path = this.getMetadataPath();
        self.fs.writeFile(path, JSON.stringify(this.values), 'utf8', function () {
            callback(true);
        });
    };
    FileResource.prototype.loadProperties = function (callback) {
        var self = this;
        var path = this.getStoragePath();
        var loadMetadata = function (path, callback) {
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
    };
    FileResource.prototype.removeChildResource = function (name, callback) {
        var self = this;
        var path = this.getStoragePath(name);
        _super.prototype.removeChildResource.call(this, name, function () {
            if (path === '' || path === '/') {
                console.log('invalid path');
                callback(null);
            }
            else {
                var mpath = self.getMetadataPath(name);
                self.fs.remove(mpath, function (err) { });
                self.fs.remove(path, function (err) {
                    if (err)
                        console.log(err);
                    callback(true);
                });
            }
        });
    };
    FileResource.prototype.getWriter = function () {
        var path = this.getStoragePath();
        if (this.isDirectory) {
            this.fs.removeSync(path);
            this.isDirectory = false;
        }
        this.loaded = false;
        return new FileResourceContentWriter(path);
    };
    FileResource.prototype.read = function (writer, callback) {
        if (this.isDirectory) {
            writer.end(callback);
        }
        else {
            writer.start(this.getContentType());
            var path = this.getStoragePath();
            var fd = this.fs.openSync(path, 'r');
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
}(StoredResource));
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
        var blob = null;
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
        var update_doc = function (doc) {
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
        var update_data = function (doc) {
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
    };
    return PouchDBResourceContentWriter;
}());
var PouchDBResource = (function (_super) {
    __extends(PouchDBResource, _super);
    function PouchDBResource(db, base, name) {
        var _this = _super.call(this, name ? name : '', base ? base : '') || this;
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
    PouchDBResource.prototype.escape_path = function (n) {
        return n.replace(/\//g, '!');
    };
    PouchDBResource.prototype.unescape_path = function (n) {
        return n.replace(/!/g, '/');
    };
    PouchDBResource.prototype.make_key = function (path) {
        if (path) {
            var level = path.split('/').length;
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
    };
    PouchDBResource.prototype.ensurePathExists = function (path, callback) {
        var self = this;
        var p = path.split('/');
        var b = [];
        if (p.length > 2) {
            b.push(p.shift());
            var update_node_1 = function (id, cb) {
                self.db.put({ _id: id })
                    .then(function () {
                    cb();
                })
                    .catch(function (err) {
                    cb();
                });
            };
            var get_node_1 = function () {
                if (p.length > 0) {
                    b.push(p.shift());
                    var bp = b.join('/');
                    var id_1 = self.make_key(bp);
                    self.db.get(id_1)
                        .then(function () {
                        get_node_1();
                    })
                        .catch(function (err) {
                        update_node_1(id_1, get_node_1);
                    });
                }
                else {
                    callback(true);
                }
            };
            get_node_1();
        }
        else {
            callback(true);
        }
    };
    PouchDBResource.prototype.storeChildrenNames = function (callback) {
        callback();
    };
    PouchDBResource.prototype.storeProperties = function (callback) {
        var self = this;
        var path = this.getStoragePath();
        var id = this.make_key(path);
        var update_doc = function (doc) {
            for (var key in self.values) {
                var v = self.values[key];
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
            for (var key in doc) {
                if (key.charAt(0) === '_')
                    continue;
                if (!self.values[key])
                    delete doc[key];
            }
            update_doc(doc);
        })
            .catch(function (err) {
            if (err.status === 404) {
                var doc = { _id: id };
                update_doc(doc);
            }
            else {
                console.log(err);
                callback(false);
            }
        });
    };
    PouchDBResource.prototype.loadProperties = function (callback) {
        var self = this;
        var path = this.getStoragePath();
        var id = this.make_key(path);
        self.db.get(id)
            .then(function (doc) {
            for (var key in doc) {
                var v = doc[key];
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
    };
    PouchDBResource.prototype.makeNewResource = function (name) {
        var path = this.getStoragePath();
        return new PouchDBResource(this.db, path, name);
    };
    PouchDBResource.prototype.removeChildResource = function (name, callback) {
        var self = this;
        var path = this.getStoragePath(name);
        var id = this.make_key(path);
        _super.prototype.removeChildResource.call(this, name, function () {
            var remove_attachment = function (doc) {
                self.db.removeAttachment(doc._id, 'content', doc._rev)
                    .then(function () {
                    console.log('done');
                })
                    .catch(function (err) {
                    console.log('4');
                    console.log(err);
                });
            };
            var remove_docs = function (todelete) {
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
                var todelete = [];
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
    };
    PouchDBResource.prototype.loadChildrenNames = function (callback) {
        var self = this;
        var path = this.getStoragePath() + '/';
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
                rv.push(Utils.filename(self.unescape_path(it.id)));
            }
            callback(rv);
        })
            .catch(function (err) {
            callback([]);
            console.log(err);
        });
    };
    PouchDBResource.prototype.getWriter = function () {
        var path = this.getStoragePath();
        var id = this.make_key(path);
        this.loaded = false;
        return new PouchDBResourceContentWriter(this.db, id);
    };
    PouchDBResource.prototype.read = function (writer, callback) {
        var path = this.getStoragePath();
        var id = this.make_key(path);
        var self = this;
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
    };
    return PouchDBResource;
}(StoredResource));
var DropBoxResourceContentWriter = (function () {
    function DropBoxResourceContentWriter(dbx, filePath) {
        this.buffer = [];
        this.dbx = dbx;
        this.filePath = filePath;
    }
    DropBoxResourceContentWriter.prototype.start = function (ctype) { };
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
        if (typeof this.buffer[0] === 'string') {
            this.buffer = [Buffer.from(this.buffer.join(''))];
        }
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
        var store_chunk_continue = function (data) {
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
        var store_chunk = function (data) {
            var close = false;
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
    };
    return DropBoxResourceContentWriter;
}());
var DropBoxResource = (function (_super) {
    __extends(DropBoxResource, _super);
    function DropBoxResource(dbx, name, base) {
        var _this = _super.call(this, name ? name : '', base ? base : '') || this;
        _this.dbx = dbx;
        return _this;
    }
    DropBoxResource.prototype.makeNewResource = function (name) {
        var path = this.getStoragePath();
        return new DropBoxResource(this.dbx, name, path);
    };
    DropBoxResource.prototype.storeProperties = function (callback) {
        var self = this;
        var path = this.getMetadataPath();
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
    };
    DropBoxResource.prototype.loadProperties = function (callback) {
        var path = this.getStoragePath();
        var self = this;
        var load_metadata = function (callback) {
            var metadata = self.getMetadataPath();
            self.dbx.filesDownload({
                path: metadata
            })
                .then(function (data) {
                if (data.fileBinary) {
                    var txt = data.fileBinary.toString();
                    try {
                        self.values = JSON.parse(txt);
                    }
                    catch (ignore) { }
                    ;
                    callback(true);
                }
                else {
                    var reader_2 = new FileReader();
                    reader_2.onload = function (event) {
                        var txt = reader_2.result;
                        try {
                            self.values = JSON.parse(txt);
                        }
                        catch (ignore) { }
                        ;
                        callback(true);
                    };
                    reader_2.readAsText(data.fileBlob);
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
    };
    DropBoxResource.prototype.removeChildResource = function (name, callback) {
        var self = this;
        var path = this.getStoragePath(name);
        _super.prototype.removeChildResource.call(this, name, function () {
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
    };
    DropBoxResource.prototype.storeChildrenNames = function (callback) {
        callback();
    };
    DropBoxResource.prototype.ensurePathExists = function (path, callback) {
        if (path === '' || path === '/') {
            callback(true);
        }
        else {
            var self_3 = this;
            self_3.dbx.filesCreateFolder({
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
    };
    DropBoxResource.prototype.loadChildrenNames = function (callback) {
        var self = this;
        var path = this.getStoragePath();
        var rv = [];
        self.dbx.filesListFolder({
            path: path
        })
            .then(function (response) {
            for (var i = 0; i < response.entries.length; i++) {
                var item = response.entries[i];
                var name_9 = item.name;
                if (name_9.charAt(0) === '.')
                    continue;
                rv.push(name_9);
            }
            callback(rv);
        })
            .catch(function (error) {
            callback([]);
        });
    };
    DropBoxResource.prototype.getWriter = function () {
        var path = this.getStoragePath();
        if (this.isDirectory) {
            this.isDirectory = false;
        }
        this.loaded = false;
        return new DropBoxResourceContentWriter(this.dbx, path);
    };
    DropBoxResource.prototype.read = function (writer, callback) {
        if (this.isDirectory) {
            writer.end(callback);
        }
        else {
            var path = this.getStoragePath();
            var ct_3 = this.getContentType();
            this.dbx.filesDownload({
                path: path
            })
                .then(function (data) {
                if (typeof window !== 'undefined') {
                    var reader_3 = new FileReader();
                    reader_3.onload = function (event) {
                        writer.start(ct_3);
                        writer.write(reader_3.result);
                        writer.end(callback);
                    };
                    reader_3.readAsArrayBuffer(data.fileBlob);
                }
                else {
                    writer.start(ct_3);
                    writer.write(data.fileBinary);
                    writer.end(callback);
                }
            })
                .catch(function (error) {
                writer.end(callback);
            });
        }
    };
    return DropBoxResource;
}(StoredResource));
var GitHubResourceContentWriter = (function () {
    function GitHubResourceContentWriter(repo, filePath) {
        this.buffer = [];
        this.repo = repo;
        this.filePath = filePath;
    }
    GitHubResourceContentWriter.prototype.start = function (ctype) { };
    GitHubResourceContentWriter.prototype.write = function (data) {
        this.buffer.push(data);
    };
    GitHubResourceContentWriter.prototype.error = function (error) {
        console.log(error);
    };
    GitHubResourceContentWriter.prototype.end = function (callback) {
        var self = this;
        var data = '';
        var opts = {
            encode: true
        };
        if (typeof Buffer !== 'undefined' && this.buffer[0] instanceof Buffer) {
            var b = Buffer.concat(this.buffer);
            data = b.toString('base64');
            opts.encode = false;
        }
        else if (typeof this.buffer[0] === 'string') {
            data = this.buffer.join('');
        }
        this.repo.writeFile('master', this.filePath, data, '', opts, function () {
            callback();
        });
    };
    return GitHubResourceContentWriter;
}());
var GitHubResource = (function (_super) {
    __extends(GitHubResource, _super);
    function GitHubResource(repo, name, base) {
        var _this = _super.call(this, name ? name : '', base ? base : '') || this;
        _this.resources = null;
        _this.repo = repo;
        return _this;
    }
    GitHubResource.prototype.makeNewResource = function (name) {
        var path = this.getStoragePath();
        var res = new GitHubResource(this.repo, name, path);
        return res;
    };
    GitHubResource.prototype.getStoragePath = function (name) {
        var path = Utils.filename_path_append(this.basePath, this.baseName);
        if (name)
            path = Utils.filename_path_append(path, name);
        if (path.charAt(0) === '/')
            path = path.substr(1);
        return path;
    };
    GitHubResource.prototype.storeProperties = function (callback) {
        var self = this;
        var path = this.getMetadataPath();
        var str = JSON.stringify(self.values);
        var opts = {
            encode: true
        };
        this.repo.writeFile('master', path, str, '', opts, function () {
            callback();
        });
    };
    GitHubResource.prototype.loadProperties = function (callback) {
        var self = this;
        var storePath = this.getStoragePath();
        var load_metadata = function () {
            var metadata = self.getMetadataPath();
            self.repo.getContents('master', metadata, false)
                .then(function (response) {
                if (response.data.content) {
                    var str = Utils.base642ArrayBuffer(response.data.content);
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
    };
    GitHubResource.prototype.loadChildrenNames = function (callback) {
        var self = this;
        var storePath = this.getStoragePath();
        self.repo.getContents('master', storePath, false)
            .then(function (response) {
            var rv = [];
            for (var i = 0; i < response.data.length; i++) {
                var item = response.data[i];
                var name_10 = item.name;
                if (name_10.charAt(0) === '.')
                    continue;
                rv.push(name_10);
            }
            callback(rv);
        })
            .catch(function (error) {
            callback([]);
        });
    };
    GitHubResource.prototype.storeChildrenNames = function (callback) {
        callback();
    };
    GitHubResource.prototype.ensurePathExists = function (path, callback) {
        callback(true);
    };
    GitHubResource.prototype.importContent = function (func, callback) {
        func(this.getWriter(), callback);
    };
    GitHubResource.prototype.removeChildResource = function (name, callback) {
        var self = this;
        var todelete = [];
        var storePath = Utils.filename_dir(this.getStoragePath(name));
        var delete_paths = function (paths) {
            if (paths.length) {
                var path = paths.pop();
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
        var cc = 0;
        var collect_all = function (path) {
            self.repo.getContents('master', path, false)
                .then(function (response) {
                cc++;
                for (var i = 0; i < response.data.length; i++) {
                    var item = response.data[i];
                    var np = Utils.filename_path_append(path, item.name);
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
            for (var i = 0; i < response.data.length; i++) {
                var item = response.data[i];
                if (item.name === name) {
                    var path = name;
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
    };
    GitHubResource.prototype.getWriter = function () {
        var path = this.getStoragePath();
        if (this.isDirectory) {
            this.isDirectory = false;
        }
        this.loaded = false;
        return new GitHubResourceContentWriter(this.repo, path);
    };
    GitHubResource.prototype.read = function (writer, callback) {
        if (this.isDirectory) {
            writer.end(callback);
        }
        else {
            var storePath = this.getStoragePath();
            var ct_4 = this.getContentType();
            this.repo.getContents('master', storePath, false)
                .then(function (data) {
                var content = data.data.content;
                var encoding = data.data.encoding;
                writer.start(ct_4);
                writer.write(Utils.base642ArrayBuffer(content));
                writer.end(callback);
            })
                .catch(function (error) {
                writer.end(callback);
            });
        }
    };
    return GitHubResource;
}(StoredResource));
var HTMLParser = (function () {
    function HTMLParser() {
    }
    HTMLParser.parse = function (code) {
        if (typeof window !== 'undefined' && typeof window['jQuery'] !== 'undefined') {
            var parser = new DOMParser();
            var doc_1 = parser.parseFromString(code, "text/html");
            var jq = function (sel) {
                return window['jQuery'](sel, doc_1);
            };
            jq['html'] = function () {
                var ser = new XMLSerializer();
                return ser.serializeToString(doc_1);
            };
            return jq;
        }
        else {
            var cheerio = require('cheerio');
            return cheerio.load(code);
        }
    };
    return HTMLParser;
}());
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
        FileResource: FileResource,
        RootResource: RootResource,
        Utils: Utils
    };
}
