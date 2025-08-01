class Utils {
  public static setObjectAtPath(obj, path, val) {
    let paths = path.split('/');
    let o = obj;
    for (let i = 0; i < paths.length; i++) {
      let n = paths[i];
      let v = o[n];

      if (i == paths.length - 1) {
        o[n] = val;
      }
      else {
        if (!v) {
          v = {};
          o[n] = v;
        }
        o = v;
      }
    }
  }

  public static expandValue(val, data) {
    if (typeof val !== 'string') return val;

    var rv = val;
    for (var key in data) {
      var v = data[key];
      if (typeof v !== 'string') continue;

      var p = '{' + key + '}';

      rv = rv.split(p).join(v);
    }

    return rv;
  }

  public static expandValues(values, data) {
    let rv1 = {};

    for (let key in values) {
      let v = values[key];
      rv1[key] = Utils.expandValue(v, data);
    }

    let rv2 = {};
    for (let key in rv1) {
      let val = rv1[key];

      if (key.indexOf('{:') !== -1) {
        for (let xkey in rv1) {
          if (xkey.charAt(0) === ':' && key.indexOf(xkey) > 0) {
            key = key.split('{'+xkey+'}').join(rv1[xkey]);
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

  public static makeUUID(): string {
    let d = new Date().getTime();
    let uuid = 'xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx'.replace(/[xy]/g, function (c) {
      let r = (d + Math.random() * 16) % 16 | 0;
      d = Math.floor(d / 16);
      return (c == 'x' ? r : (r & 0x7 | 0x8)).toString(16);
    });
    return uuid;
  }

  public static makeHash(str): number {
    let h = 0, l = str.length, i = 0;
    if (l > 0) {
      while (i < l) {
        h = (h << 5) - h + str.charCodeAt(i++) | 0;
      }
    }
    return h;
  }

  public static makeRank(prev, next): string {
    let fbyte = function(ch){
      return ch.charCodeAt(0);
    };

    let MIN_CHAR = fbyte('0');
    let MAX_CHAR = fbyte('z');

    let getChar = function(str, i, defaultChar){
      if (i >= str.length) {
        return defaultChar;
      }
      return fbyte(str.charAt(i));
    };

    let string = function(b) {
      return String.fromCharCode(b);
    };

    let mid = function(prev, next) {
      return Math.floor((prev + next) / 2);
    };

    let insert = function(prev, next) {
      if (prev === '' || !prev) {
        prev = string(MIN_CHAR);
      }
      if (next === '' || !next) {
        next = string(MAX_CHAR);
      }

      let rank = '';
      let i = 0;

      while (true) {
        let prevChar = getChar(prev, i, MIN_CHAR);
        let nextChar = getChar(next, i, MAX_CHAR);

        if (prevChar === nextChar) {
          rank += string(prevChar);
          i++;
          continue;
        }

        let midChar = mid(prevChar, nextChar);
        if (midChar === prevChar || midChar === nextChar) {
          rank += string(prevChar);
          i++;
          continue;
        }

        rank += string(midChar);
        break;
      }

      if (rank >= next) {
        return [prev, false];
      }
      return [rank, true];
    };

    return insert(prev, next)[0];
  }

  public static listSortByNames(list, names) {
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
      if (!done[list[i]]) rv.push(list[i]);
    }

    return rv;
  }

  public static listRemoveNames(list, names) {
    let rv = [];
    for (let i = 0; i < list.length; i++) {
      if (names.indexOf(list[i]) === -1) {
        rv.push(list[i]);
      }
    }
    return rv;
  }

  public static listMoveItem(list, item, ref, offset) {
    let x = 0;
    let v = list.indexOf(item);
    if (item === ref) {
      x = v + offset;
      if (x >= 0) {
        if (v >= 0) list.splice(v, 1);
        list.splice(x, 0, item);
      }
    }
    else {
      if (v >= 0) list.splice(v, 1);
      if (ref) {
        x = list.indexOf(ref);
        if (x >= 0) {
          if (offset > 0) x += offset;
          else x += offset + 1;
        }
        else x = list.length;
      }

      list.splice(x, 0, item);
    }
  }

  public static compareNames(a, b) {
    let xa = a.lastIndexOf('_');
    let xb = b.lastIndexOf('_');
    if (xa > 0 && xb > 0) {
      let na = Number.parseInt(a.substr(xa+1));
      let nb = Number.parseInt(b.substr(xb+1));
      if (Number.isNaN(na) || Number.isNaN(nb)) {
        return a.localeCompare(b);
      }
      else {
        return (na - nb);
      }
    }
    else {
      return a.localeCompare(b);
    }
  }

  public static unescape(str: string): string {
    if (!str) return str;
    else return unescape(str);
  }

  public static string2object(str: string, obj ? : object): object {
    if (!str) return obj ? obj : null;

    let rv = JSON.parse(str);
    if (rv) return rv;
    else return obj ? obj : null;
  }

  public static filename_path_append(path: string, name: string): string {
    if (!name) return path;

    let p = path;
    if (p.charAt(p.length - 1) != '/') p += '/';
    p += name;

    return p.replace(/\/+/g, '/');
  }

  public static filename(path: string): string {
    if (!path) return path;

    let i = path.lastIndexOf('/');
    if (i == -1) return path;
    else {
      let name = path.substr(i + 1);
      return name;
    }
  }

  public static filename_dir(path: string): string {
    if (!path) return path;

    let i = path.lastIndexOf('/');
    if (i == -1) return '';
    else {
      let name = path.substr(0, i);
      return name;
    }
  }

  public static filename_ext(path: string): string {
    let i = path.lastIndexOf('.');
    if (i == -1) return '';
    else {
      let ext = path.substr(i + 1);
      return ext;
    }
  }

  public static absolute_path(path:string, cpath?:string) {
    if (!path) return null;

    if (path.charAt(0) !== '/' && cpath) {
      path = cpath+'/'+path;
    }
    else if (path === '.' && cpath) {
      path = cpath;
    }
    else if (path.indexOf('./') == 0 && cpath) {
      path = cpath+path.substr(1);
    }

    let stack = path.split('/');
    let rv = [];

    for (var i = 0; i < stack.length; i++) {
      let it = stack[i];

      if (it === '.') continue;
      if (it === '') continue;
      if (it === '..') rv.pop();
      else rv.push(it);
    }

    let s = rv.join('/');
    if (s.charAt(0) === '/') return s;
    else return '/' + s;
  }

  public static split_path(path: string): Array < string > {
    if (path === '' || path === '/') return [];

    let ls = path.split('/');
    let names = [];

    for (var i = 0; i < ls.length; i++) {
      if (ls[i] != '') {
        names.push(ls[i]);
      }
    }

    return names;
  }

  public static is_texttype(mime: string): boolean {
    if (!mime) return false;

    let texttypes = ['application/json', 'application/javascript'];
    if (mime.indexOf('text/') === 0 || texttypes.indexOf(mime) >= 0) return true;
    else return false;
  }

  public static filename_mime(path: string): string {
    if (!path) return null;

    let ext = Utils.filename_ext(path).toLowerCase();
    if (ext === 'jpg' || ext === 'jpeg') return 'image/jpeg';
    if (ext === 'png') return 'image/png';
    if (ext === 'gif') return 'image/gif';
    if (ext === 'txt') return 'text/plain';
    if (ext === 'pdf') return 'application/pdf';
    if (ext === 'html' || ext === 'htm') return 'text/html';
    if (ext === 'xml') return 'text/xml';
    if (ext === 'svg') return 'image/svg+xml';
    if (ext === 'js') return 'text/javascript';
    if (ext === 'css') return 'text/css';
    if (ext === 'json') return 'text/plain';
    if (ext === 'md') return 'text/x-markdown';
    if (ext === 'hbs') return 'text/plain';

    return 'application/octet-stream';
  }

  public static Blob2Text(blob, callback) {
    let reader = new FileReader();
    reader.addEventListener('loadend', function (evt) {
      callback(reader.result);
    });
    reader.readAsText(blob);
  }

  // Converts an ArrayBuffer directly to base64, without any intermediate 'convert to string then
  // use window.btoa' step. According to my tests, this appears to be a faster approach:
  // http://jsperf.com/encoding-xhr-image-data/5

  /*
  MIT LICENSE
  Copyright 2011 Jon Leighton
  Permission is hereby granted, free of charge, to any person obtaining a copy of this software and associated documentation files (the "Software"), to deal in the Software without restriction, including without limitation the rights to use, copy, modify, merge, publish, distribute, sublicense, and/or sell copies of the Software, and to permit persons to whom the Software is furnished to do so, subject to the following conditions:
  The above copyright notice and this permission notice shall be included in all copies or substantial portions of the Software.
  THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND, EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY, WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR OTHER DEALINGS IN THE SOFTWARE.
  */

  public static ArrayBuffer2base64(arrayBuffer: ArrayBuffer): string {
    var base64 = ''
    var encodings = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'

    var bytes = new Uint8Array(arrayBuffer)
    var byteLength = bytes.byteLength
    var byteRemainder = byteLength % 3
    var mainLength = byteLength - byteRemainder

    var a, b, c, d
    var chunk

    // Main loop deals with bytes in chunks of 3
    for (var i = 0; i < mainLength; i = i + 3) {
      // Combine the three bytes into a single integer
      chunk = (bytes[i] << 16) | (bytes[i + 1] << 8) | bytes[i + 2]

      // Use bitmasks to extract 6-bit segments from the triplet
      a = (chunk & 16515072) >> 18 // 16515072 = (2^6 - 1) << 18
      b = (chunk & 258048) >> 12 // 258048   = (2^6 - 1) << 12
      c = (chunk & 4032) >> 6 // 4032     = (2^6 - 1) << 6
      d = chunk & 63 // 63       = 2^6 - 1

      // Convert the raw binary segments to the appropriate ASCII encoding
      base64 += encodings[a] + encodings[b] + encodings[c] + encodings[d]
    }

    // Deal with the remaining bytes and padding
    if (byteRemainder == 1) {
      chunk = bytes[mainLength]

      a = (chunk & 252) >> 2 // 252 = (2^6 - 1) << 2

      // Set the 4 least significant bits to zero
      b = (chunk & 3) << 4 // 3   = 2^2 - 1

      base64 += encodings[a] + encodings[b] + '=='
    }
    else if (byteRemainder == 2) {
      chunk = (bytes[mainLength] << 8) | bytes[mainLength + 1]

      a = (chunk & 64512) >> 10 // 64512 = (2^6 - 1) << 10
      b = (chunk & 1008) >> 4 // 1008  = (2^6 - 1) << 4

      // Set the 2 least significant bits to zero
      c = (chunk & 15) << 2 // 15    = 2^4 - 1

      base64 += encodings[a] + encodings[b] + encodings[c] + '='
    }

    return base64
  }

  static base642ArrayBuffer(base64: string): ArrayBuffer {
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

  static ENABLE_TRACE_LOG: boolean = false;
  static EXPORT_RENDER_CONTEXT: boolean = false;

  static log_trace(typ, msg) {
    if (Utils.ENABLE_TRACE_LOG) {
      console.log(typ+':'+msg);
    }
  }

  static log_trace_resolve(typ, path) {
    if (Utils.ENABLE_TRACE_LOG) {
      console.log(typ+'resolve:'+path);
    }
  }

  static set_trace_path(obj, path) {
    obj['__trace_context_path'] = path;
  }

  static copy_trace_path(src, dest) {
    if (src && dest) {
      let v = src['__trace_context_path'];
      if (v) dest['__trace_context_path'] = v;
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

  static RegExpFilter(rx): any {
    return function(p) {
      if (!p || !rx) return false;
      else if (p.match(rx)) return true;
      else return false;
    };
  }

  static GlobFilter(rx): any {
    return function(p) {
      if (!p || !rx) return false;
      else if (Utils.glob_match(p, rx)) return true;
      else return false;
    };
  }

}
