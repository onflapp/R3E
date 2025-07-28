ImageCropper = {
  CROP_EVT_MOVE:"mousemove",
  CROP_EVT_DOWN:"mousedown",
  CROP_EVT_UP:"mouseup",

  crop_event: {},
  crop_image: null,
  crop_frame: null,
  callback: null,

  getEventInfo:function(evt) {
    if (evt.targetTouches) {
      var t = evt.targetTouches[0];
      return {
        pageX:t.pageX,
        pageY:t.pageY
      };
    }
    else {
      return {
        pageX:evt.pageX,
        pageY:evt.pageY
      };
    }
  },

  unlockBody:function () {
    document.body.classList.add('cropping');
    document.body.style.height = "";
    document.body.style.width = "";
  },

  lockBody:function () {
    var h = $(document.body).height();
    var w = $(document.body).width();
    document.body.style.height = h+"px";
    document.body.style.width = w+"px";
    document.body.classList.remove('cropping');
  },

  resetFrame:function(img) {
    var target = img;
    target.style["marginLeft"] = null;
    target.style["marginTop"] = null;
    target.removeAttribute('width');
  },

  onCancel:function(evt) {
    if (evt.target.tagName == 'IMG' && evt.target.parentElement.classList.contains('ui_cropframe')) return;
    if (evt.target.classList.contains('ui_cropframe')) return;
    if (evt.target.classList.contains('ui_cropframe-handle')) return;

    ImageCropper.rmCropFrame();

    evt.preventDefault();
    evt.stopPropagation();
    return false;
  },

  onMoveContent:function(evt) {
    var ei = ImageCropper.getEventInfo(evt);
    var c = ImageCropper;

    if (c.crop_event.img && (evt.shiftKey || evt.altKey || evt.metaKey || evt.ctrlKey)) {
      var target = c.crop_event.img;
      var dx = (ei.pageX - c.crop_event.x) + (ei.pageY - c.crop_event.y);
      var w = (c.crop_event.iw + dx);
      if (w > 100) target.setAttribute('width', w+'px');
    }
    else if (c.crop_event.img) {
      var target = c.crop_event.img;
      var dx = ei.pageX - c.crop_event.x;
      var dy = ei.pageY - c.crop_event.y;
      var l = c.crop_event.l + dx;
      var t = c.crop_event.t + dy;
      var w = c.crop_event.w;
      var h = c.crop_event.h;

      if (l > 1) l = 0;
        //if ((target.clientWidth + l) < w) l = w - target.clientWidth;
        
      if (t > 1) t = 0;
        //if ((target.clientHeight + t) < h) t = h- target.clientHeight;

      target.style["marginLeft"] = l + "px";
      target.style["marginTop"] = t + "px";
    }
    else if (c.crop_event.resize) {
      var target = c.crop_event.resize;
      var dx = ei.pageX - c.crop_event.x;
      var dy = ei.pageY - c.crop_event.y;
      var w = c.crop_event.w + dx;
      var h = c.crop_event.h + dy;

      var mw = c.max_width;
      var mh = c.max_height;

      if (!mw) mw = 2000;
      if (!mh) mh = 2000;

      if (w > 50 && w <= mw) {
        target.style["width"] = w + "px";
      }
      if (h > 50 && h <= mh) {
        target.style["height"] = h + "px";
      }
    }

    evt.preventDefault();
    evt.stopPropagation();
    return false;
  },

  onDragOver:function(evt) {
    evt.preventDefault();
    evt.stopPropagation();
  },

  onDrop:function(evt) {
    var url = evt.dataTransfer.getData('text/uri-list');
    var img = evt.currentTarget.querySelector('img');
    if (img && evt.dataTransfer.files.length > 0) {
      var fl = evt.dataTransfer.files[0];
      if (fl.type.indexOf('image/') === 0) {
        ImageCropper.resetFrame(img);
        var reader  = new FileReader();
        reader.onload = function(evt) {
          img.src = reader.result;
        };
        reader.readAsDataURL(fl);
      }
    }
    else if (img && url) {
      if (url.match('(\.jpg|\.png|\.svg)$')) {
        ImageCropper.resetFrame();
        img.src = url;
      }
    }

    evt.preventDefault();
    evt.stopPropagation();
  },

  onMoveEnd:function(evt) {
    var c = ImageCropper;
    c.unlockBody();

    c.crop_event.img = null;
    c.crop_event.resize = null;

    document.removeEventListener(c.CROP_EVT_MOVE, c.onMoveContent, false);
    document.removeEventListener(c.CROP_EVT_UP, c.onMoveEnd, false);

    document.addEventListener(ImageCropper.CROP_EVT_DOWN, ImageCropper.onCancel, false);

    evt.preventDefault();
    evt.stopPropagation();
    return false;
  },

  onMoveStart:function(evt) {
    ImageCropper.crop_event.img = evt.target;
    ImageCropper.start(evt);

    document.removeEventListener(ImageCropper.CROP_EVT_DOWN, ImageCropper.onCancel, false);

    evt.preventDefault();
    return false;
  },

  onResizeStart:function(evt) {
    ImageCropper.lockBody();
    ImageCropper.crop_event.resize = evt.target.__cropframe;
    ImageCropper.start(evt);

    evt.preventDefault();
    evt.stopPropagation();
    return false;
  },

  start:function(evt) {
    var c = ImageCropper;
    var ei = c.getEventInfo(evt);

    c.crop_event.x = ei.pageX;
    c.crop_event.y = ei.pageY;
    c.crop_event.w = evt.target.parentElement.clientWidth;
    c.crop_event.h = evt.target.parentElement.clientHeight;
    c.crop_event.iw = evt.target.width;
    c.crop_event.ih = evt.target.height;

    var l = evt.target.style.marginLeft;
    var t = evt.target.style.marginTop;

    if (l == "") l = 0;
    else l = parseInt(l.substr(0, l.length-2));
    
    if (t == "") t = 0;
    else t = parseInt(t.substr(0, t.length-2));

    c.crop_event.l = l;
    c.crop_event.t = t;

    document.addEventListener(c.CROP_EVT_MOVE, c.onMoveContent, false);
    document.addEventListener(c.CROP_EVT_UP, c.onMoveEnd, false);
    document.addEventListener(c.CROP_EVT_DOWN, c.onCancel, false);
  },

  findCropFrame: function (img, frameclass) {
    var p = img.parentElement;
    while (p) {
      if (p.classList.contains(frameclass)) {
        ImageCropper.crop_frame = p;
        break;
      }
      p = p.parentElement;
    }

    p = img.parentElement;
    var w = p.style.width;
    var h = p.style.height;

    if (w == '') w = img.width + 'px';
    if (h == '') h = img.height + 'px';

    p.style.width = '';
    p.style.height = '';

    var el = document.createElement("div");
    el.classList.add('ui_cropframe');
    el.style.overflow = "hidden";
    el.style.width = w;
    el.style.height = h;
    el.style.position = "relative";
    img.parentElement.replaceChild(el, img);
    el.appendChild(img);
    
    return el;
  },

  mkCropFrame: function (img, settings) {
    var c = ImageCropper;
    var frame = this.findCropFrame(img, settings.frame);

    if (!img.__resizehandle) {
      var handle = document.createElement("div");
      handle.classList.add("ui_cropframe-handle");
      handle.style.position = "absolute";
      handle.style.bottom = "0px";
      handle.style.right = "0px";
      handle.style.zIndex = 90;
      frame.appendChild(handle);
      frame.classList.add('selected');

      img.addEventListener(c.CROP_EVT_DOWN, c.onMoveStart, false);
      handle.addEventListener(c.CROP_EVT_DOWN, c.onResizeStart, false);

      img.__resizehandle = handle;
      img.__cropframe = frame;
      handle.__cropframe = frame;

      if (settings.frame_width) frame.style.width = settings.frame_width;
      if (settings.frame_height) frame.style.height = settings.frame_height;
      if (settings.image_x) img.style.marginLeft = settings.image_x;
      if (settings.image_y) img.style.marginTop = settings.image_y;
      if (settings.image_width) img.setAttribute('width', settings.image_width);

      frame.addEventListener('dragover', c.onDragOver, false);
      frame.addEventListener('dragenter', c.onDragOver, false);
      frame.addEventListener('dragleave', c.onDragOver, false);
      frame.addEventListener('drop', c.onDrop, false);
    }

    c.max_width = settings.max_width;
    c.max_height = settings.max_width;
    c.crop_image = img;
    c.callback = settings.callback;

    document.addEventListener(c.CROP_EVT_DOWN, c.onCancel, false);
  },
  
  rmCropFrame: function () {
    var c = ImageCropper;
    var img = ImageCropper.crop_image;
    c.unlockBody();

    document.removeEventListener(ImageCropper.CROP_EVT_DOWN, ImageCropper.onCancel, false);

    if (!img) return;

    var rv = {};

    img.removeEventListener(c.CROP_EVT_DOWN, c.onMoveStart, false);
    if (img.__resizehandle) {
      img.__resizehandle.removeEventListener(c.CROP_EVT_DOWN, c.onResizeStart, false);
      img.__resizehandle.parentElement.removeChild(img.__resizehandle);
    }

    if (img.__cropframe) {
      rv.frame_width = img.__cropframe.style.width;
      rv.frame_height = img.__cropframe.style.height;
      rv.image_width = img.getAttribute('width');

      rv.image_x = img.style.marginLeft;
      rv.image_y = img.style.marginTop;

      img.__cropframe.removeEventListener('dragover', c.onDragOver, false);
      img.__cropframe.removeEventListener('dragleave', c.onDragOver, false);
      img.__cropframe.removeEventListener('dragenter', c.onDragOver, false);
      img.__cropframe.removeEventListener('drop', c.onDrop, false);
    }

    img.removeAttribute('style');
    img.removeAttribute('width');

    if (img.__cropframe && img.__cropframe.classList.contains('ui_cropframe')) {
      var f = img.__cropframe;
      var ip = f.parentElement;
      f.parentElement.replaceChild(img, f);
    }

    if (c.crop_frame) {
      if (rv.image_x) c.crop_image.style.marginLeft = rv.image_x;
      else delete rv.image_x;

      if (rv.image_y) c.crop_image.style.marginTop = rv.image_y;
      else delete rv.image_y;

      if (rv.image_width) c.crop_image.setAttribute('width', rv.image_width);
      else delete rv.image_width;

      if (rv.frame_width && rv.frame_width != img.width+'px') c.crop_frame.style.width = rv.frame_width;
      else delete rv.frame_width;

      if (rv.frame_height && rv.frame_height != img.height+'px') c.crop_frame.style.height = rv.frame_height;
      else delete rv.frame_height;
    }

    delete img.__resizehandle;
    delete img.__cropframe;

    if (c.callback) c.callback(rv);

    c.crop_image = null;
    c.crop_frame = null;
    c.callback = null;
  }
};

$.fn.renderToCanvas = function (options) {
  var gv = function(v) {
    if (!v) return 0;
    else return Number.parseInt(v.substr(0, v.length-2));
  };

  this.each(function(n,it) {
    var f = it.width / it.naturalWidth;
    let img_x = gv(it.style.marginLeft);
    let img_y = gv(it.style.marginTop);
    let img_w = it.width;
    let img_h = it.height;

    var src_x = 0 - img_x;
    var src_y = 0 - img_y;
    var src_w = it.parentElement.clientWidth;
    var src_h = it.parentElement.clientHeight;

    var gap_x = img_w - (src_x + src_w);
    var gap_y = img_h - (src_y + src_h);
  
    src_x = Math.ceil(src_x / f);
    src_y = Math.ceil(src_y / f);
    src_w = Math.ceil(src_w / f);
    src_h = Math.ceil(src_h / f);
    
    var dest_x = 0;
    var dest_y = 0;
    var dest_w = it.parentElement.clientWidth;
    var dest_h = it.parentElement.clientHeight

    var canvas = document.createElement('canvas');
    canvas.width = dest_w;
    canvas.height = dest_h;

    var context = canvas.getContext('2d');

    if (f != 1) {
      if (gap_x < 0) dest_w += (gap_x / f);
      if (gap_y < 0) dest_h += (gap_y / f);
    }

    //console.log(`${src_x},${src_y},${src_w},${src_h} => ${dest_x},${dest_y},${dest_w},${dest_h}`);

    context.drawImage(it, src_x, src_y, src_w, src_h, dest_x, dest_y, dest_w, dest_h);
    if (options && options.callback) {
      options.callback(canvas, it);
    }
  });
};

$.fn.crop = function (options) {
  var c = ImageCropper;
  if ("ontouchstart" in window) {
    c.CROP_EVT_MOVE = "touchmove";
    c.CROP_EVT_DOWN = "touchstart";
    c.CROP_EVT_UP = "touchend";
  }

  if (options == 'destroy') {
    ImageCropper.rmCropFrame();
  }
  else {
    var settings = {
      frame:'item'
    };

    $.extend(settings, options);
    this.each(function(n,it) {
      if (ImageCropper.crop_image != it) {
        c.mkCropFrame(it, settings);
      }
    });
  }
};
