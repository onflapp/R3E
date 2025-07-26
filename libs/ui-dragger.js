function Dragger() {
  this.GHOST_CLASS = "ghost";
  this.INSERT_CLASS = "insert";
  this.SELECTED_CLASS = "selected";
  this.DRAGGING_CLASS = "dragging";
  this.RESIZING_CLASS = "resizing";
  this.FILLER_CLASS = "filler";

  this.TIMEOUT = 300;
  
  this.SOURCE = null;
  this.CONTAINER = null;
  this.GHOST = null;
  this.DESTINATION = null;
  this.DESTINATION_INSERT = null;

  this.INSERT_BEFORE = null;
  this.INSERT_AFTER = null;

  this.EVT_MOVE = "mousemove";
  this.EVT_DOWN = "mousedown";
  this.EVT_UP = "mouseup";

  this.IS_TRACKING = false;
  this.IS_TOUCH = false;
  this.IS_RESIZING = false;
  this.IS_SCROLLING = false;
  this.TRACK_TO = null;

  this.LOCK_VERTICAL = true;
  this.FREEHAND_MODE = false;
  this.USE_GHOST = true;

  this.ORIGIN_W = 0;
  this.ORIGIN_H = 0;

  this.ORIGIN_X = 0;
  this.ORIGIN_Y = 0;

  this.ORIGIN_DX = 0;
  this.ORIGIN_DY = 0;

  var that = this;

  this.create_ghost = function(el) {
    var d = that;

    if (d.USE_GHOST) {
      var p = document.createElement("div");
      var rect = el.getBoundingClientRect();

      p.classList.add(d.GHOST_CLASS);
      p.innerHTML = d.getDragContent(el);
      p.style.position = "absolute";
      p.style.top = rect.y + "px";
      p.style.left = rect.x + "px";
      p.style.width = rect.width + "px";
      p.style.height = rect.height + "px";
      p.style.overflow = "hidden";
      p.style.zIndex = 9999;
      p.style.pointerEvents = "none";
      
      document.body.appendChild(p);

      return p;
    }
    else {
      var rect = el.getBoundingClientRect();
      var p = el;

      p.classList.add(d.GHOST_CLASS);
      p.innerHTML = d.getDragContent(el);
      p.style.position = "absolute";
      p.style.top = rect.y + "px";
      p.style.left = rect.x + "px";
      p.style.width = rect.width + "px";
      p.style.height = rect.height + "px";
      p.style.overflow = "hidden";
      p.style.pointerEvents = "none";
  
      return el;
    }
  };

  this.getDragContent = function(el) {
    return el.outerHTML;
  };

  this.getDragDestination = function(target, dragger) {
    return target;
  };

  this.getDragSource = function(target, dragger) {
    return null;
  };

  this.getScrollableSource = function(target, dragger) { //XXX
    return null;
  };

  this.getResizableSource = function(target, dragger) {
    return null;
  };

  this._eventInfo = function(evt) {
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
  };

  this.drag_enter = function(evt) {
    var d = that;
    if (d.IS_TRACKING) return;

    d.IS_TRACKING = true;

    var ei = d._eventInfo(evt);

    d.SOURCE = null;

    d.ORIGIN_X = ei.pageX;
    d.ORIGIN_Y= ei.pageY;

    d.ORIGIN_DX = Math.round(ei.pageX);
    d.ORIGIN_DY = Math.round(ei.pageY);

    document.addEventListener('dragover', d.drag_over, false);
    document.addEventListener('drop', d.drop_external, false);
  };

  this.drag_leave = function(evt) {
    var d = that;
    var ei = d._eventInfo(evt);
    var r = d.CONTAINER.getBoundingClientRect();
    var outside = false;

    if      (ei.pageY < r.top) outside = true;
    else if (ei.pageY > r.top+r.height) outside = true;
    else if (ei.pageX < r.left) outside = true;
    else if (ei.pageX > r.left + r.width) outside = true;

    if (outside) {
      document.removeEventListener('dragover', d.drag_over);
      document.removeEventListener('drop', d.drop_external);
      d.cleanup();
    }
  };

  this.drop_external = function(evt) {
    var d = that;

    if (d.DESTINATION_INSERT && d.DESTINATION) {
      if (d.DESTINATION_INSERT == d.INSERT_BEFORE) d.droppedExternal(evt.dataTransfer, "before", d.DESTINATION);
      else                                         d.droppedExternal(evt.dataTransfer, "after",  d.DESTINATION);
    }
    d.cleanup();
    if (d.stop) d.stop(evt);

    document.removeEventListener('dragover', d.drag_over);
    document.removeEventListener('drop', d.drop_external);

    evt.stopPropagation();
    evt.preventDefault();
    return false;
  };

  this.drag_over = function(evt) {
    var d = that;
    d.mouse_move(evt);

    evt.stopPropagation();
    evt.preventDefault();
    return false;
  };

  this.mouse_down = function(evt) {
    if (evt.button > 0 || evt.ctrlKey) return;

    var t = evt.target;
    var d = that;
    var s = d.getDragSource(evt.target, d);
    var z = d.getResizableSource(evt.target, d);
    var p = d.getScrollableSource(evt.target, d);

    if (z &&  d.CONTAINER == evt.currentTarget) {
      d.IS_RESIZING = true;
    }
    else if (p && d.CONTAINER == evt.currentTarget) {
      d.IS_SCROLLING = true;
    }
    else {
      if (!s) return;
      if (evt.target == d.CONTAINER) return;
    }

    var ei = d._eventInfo(evt);

    document.addEventListener(d.EVT_UP, d.mouse_up, false);
    document.addEventListener(d.EVT_MOVE, d.mouse_move, false);
    document.addEventListener('touchcancel', d._touchcancel, false);

    if (d.IS_RESIZING) {
      d.IS_TRACKING = true;
      d.SOURCE = z;

      d.ORIGIN_W = z.clientWidth;
      d.ORIGIN_H = z.clientHeight;

      d.ORIGIN_X = ei.pageX;
      d.ORIGIN_Y= ei.pageY;
    }
    else if (d.IS_SCROLLING) {
      d.IS_TRACKING = true;
      d.SOURCE = p;

      d.ORIGIN_W = p.scrollLeft;
      d.ORIGIN_H = p.scrollTop;

      d.ORIGIN_X = ei.pageX;
      d.ORIGIN_Y= ei.pageY;
    }
    else {
      clearTimeout(d.TRACK_TO);
      d.TRACK_TO = setTimeout(function() {

        t = document.elementFromPoint(ei.pageX, ei.pageY);
        var s = d.getDragSource(t, d);
        if (!s) return;

        d.SOURCE = s;
        d.IS_TRACKING = false;

        d.ORIGIN_X = ei.pageX;
        d.ORIGIN_Y= ei.pageY;

        var off = $(s).offset();
        d.ORIGIN_DX = Math.round(ei.pageX - off.left);
        d.ORIGIN_DY = Math.round(ei.pageY - off.top);

        if (d.SOURCE != null) {
          if (!d.IS_TRACKING) d.start_tracking();
        }
      },d.TIMEOUT);
    }

    if (!d.IS_TOUCH) {
      evt.stopPropagation();
      evt.preventDefault();
      return false;
    }
  };

  this.start_tracking = function() {
    var d = that;

    d.IS_TRACKING = true;
    d.GHOST = d.create_ghost(d.SOURCE);
    d.SOURCE.classList.add(d.SELECTED_CLASS);

    document.body.classList.add(d.DRAGGING_CLASS);

    d.SOURCE.addEventListener('touchmove', d._ignoreEvent);

    if (d.start) d.start();
  };
  
  this._touchcancel = function(evt) {
    var d = that;
    d.cleanup();
  };
  
  this._ignoreEvent = function(evt) {
    evt.preventDefault();
    return false;
  };

  this._isChild = function(el, src) {
    var p = el;
    while (p) {
      if (p == src) return true;
      p = p.parentElement;
    }
    return false;
  };

  this.mouse_move = function(evt) {
    var d = that;

    if (!d.IS_TRACKING) {
      d.cleanup();
      return;
    }
    
    if (d.IS_RESIZING)        d.mouse_move_resize(d, evt);
    else if (d.IS_SCROLLING)  d.mouse_move_scroll(d, evt);
    else if (d.FREEHAND_MODE) d.mouse_move_freehand(d, evt);
    else                      d.mouse_move_sortable(d, evt); 
  };

  this.mouse_move_scroll = function(d, evt) { //XXX
    var ei = d._eventInfo(evt);
    var posx = ei.pageX;
    var posy = ei.pageY;

    if (d._lastei && ei.pageX === d._lastei.pageX && ei.pageY === d._lastei.pageY) {
      return;
    }

    d._lastei = ei;

    if (d.IS_TRACKING) {
      if (d.SOURCE) {
        var dx = posx - d.ORIGIN_X;
        var dy = posy - d.ORIGIN_Y;
        d.SOURCE.scrollLeft = d.ORIGIN_W - dx;
        d.SOURCE.scrollTop = d.ORIGIN_H - dy;

        var pos = {};
        d.scrolling(d.SOURCE, pos);
      }
  
      evt.preventDefault();
      return false;
    }
  };

  this.mouse_move_resize = function(d, evt) { //XXX
    var ei = d._eventInfo(evt);
    var posx = ei.pageX;
    var posy = ei.pageY;

    if (d._lastei && ei.pageX === d._lastei.pageX && ei.pageY === d._lastei.pageY) {
      return;
    }

    d._lastei = ei;

    if (d.IS_TRACKING) {
      if (d.SOURCE) {
        var dx = posx - d.ORIGIN_X;
        var dy = posy - d.ORIGIN_Y;
        d.SOURCE.style.height = (d.ORIGIN_H + dy) + "px";
        d.SOURCE.style.width = (d.ORIGIN_W + dx) + "px";

        var sz = {width:d.SOURCE.clientWidth, height:d.SOURCE.clientHeight};
        d.resizing(d.SOURCE, sz);
      }
  
      evt.preventDefault();
      return false;
    }
  };

  this.resized = function(source) {
    //to be overridden
  };

  this.scrolling = function(source, pos) {
    //to be overridden
  };

  this.scrolled = function(source) {
    //to be overridden
  };

  this.resizing = function(source, size) {
    //to be overridden
  };

  this.mouse_move_freehand = function(d, evt) {
    var ei = d._eventInfo(evt);
    var posx = ei.pageX;
    var posy = ei.pageY;

    /*
    var r = d.CONTAINER.getBoundingClientRect();
    var outside = false;

    if      (ei.pageY < r.top) outside = true;
    else if (ei.pageY > r.top+r.height) outside = true;
    else if (ei.pageX < r.left) outside = true;
    else if (ei.pageX > r.left + r.width) outside = true;
    */

    if (d._lastei && ei.pageX === d._lastei.pageX && ei.pageY === d._lastei.pageY) {
      return;
    }

    d._lastei = ei;

    /*
    if (!d.IS_TRACKING) {
      var dx = Math.abs(posx - d.ORIGIN_X);
      var dy = Math.abs(posy - d.ORIGIN_Y);
      if (dy > 10) {
        d.start_tracking();

        evt.preventDefault();
        return false;
      }
    }
     */
    if (d.IS_TRACKING) {
      if (d.GHOST) {
        d.GHOST.style.top = (posy - d.ORIGIN_DY) + "px";
        d.GHOST.style.left = (posx - d.ORIGIN_DX) + "px";
      }
  
      evt.preventDefault();
      return false;
    }
  };

  this.mouse_move_sortable = function(d, evt) {
    var ei = d._eventInfo(evt);
    var posx = ei.pageX;
    var posy = ei.pageY;

    if (d._lastei && ei.pageX === d._lastei.pageX && ei.pageY === d._lastei.pageY) {
      return;
    }

    d._lastei = ei;

    /*
    if (!d.IS_TRACKING) {
      var dx = Math.abs(posx - d.ORIGIN_X);
      var dy = Math.abs(posy - d.ORIGIN_Y);
      if (dy > 10) {
        d.start_tracking();

        evt.preventDefault();
        return false;
      }
    }
     */
    if (d.IS_TRACKING) {
      if (d.GHOST) {
        d.GHOST.style.top = (posy - d.ORIGIN_DY) + "px";

        if (!d.LOCK_VERTICAL) {
          d.GHOST.style.left = (posx - d.ORIGIN_DX) + "px";
        }
      }
  
      var el = document.elementFromPoint(200, ei.pageY-window.pageYOffset);
      if (el != null && el.classList.contains("filler") && el != d.DESTINATION_INSERT) {
        d._clearel(d);

        var del = d.getDragDestination(el, d);

        if     (el == d.INSERT_BEFORE) el.classList.add("filler-over-before");
        else if (el == d.INSERT_AFTER) el.classList.add("filler-over-after");

        d.DESTINATION_INSERT = el;
      }
      else if (el != null && el != d.CONTAINER && !d._isChild(el, d.SOURCE)) {
        el = d.getDragDestination(el, d);

        if (el != null && el != d.SOURCE) {
          d._clearel(d);

          if (el != d.DESTINATION) {
            d.DESTINATION = el;
            if (!el.classList.contains("filler")) d.mk_filler(el);
          }
          else if (el != null) {
            d.DESTINATION_INSERT = null;
            el.classList.add('filler-over');
          }
        }
      }

      evt.preventDefault();
      return false;
    }
  };

  this.dropped = function(source, pos, destination) {
    //to be overridden
  };

  this.droppedExternal = function(source, pos, destination) {
    //to be overridden
  };

  this.mouse_up = function(evt) {
    var d = that;

    clearTimeout(d.TRACK_TO);
    //setTimeout(function() {
      if (d.IS_RESIZING) {
        d.resized(d.SOURCE);
      }
      else if (d.IS_SCROLLING) {
        d.scrolled(d.SOURCE);
      }
      else if (d.DESTINATION_INSERT && d.DESTINATION) {
        if (d.DESTINATION_INSERT == d.INSERT_BEFORE) d.dropped(d.SOURCE, "before", d.DESTINATION);
        else                                         d.dropped(d.SOURCE, "after",  d.DESTINATION);
      }
      else if (d.DESTINATION) {
        d.dropped(d.SOURCE, "over", d.DESTINATION);
      }
    //}, 100);

    d.cleanup();
    if (d.stop) d.stop(evt);
    evt.preventDefault();
    return false;
  };

  this.cleanup = function() {
    var d = that;

    d.rm_fillers();

    if (d.SOURCE) {
      d.SOURCE.removeEventListener('touchmove', d._ignoreEvent);
    }
    
    document.removeEventListener('touchcancel', d._touchcancel);
    document.removeEventListener(d.EVT_MOVE, d.mouse_move);
    document.removeEventListener(d.EVT_UP, d.mouse_up);
    
    if (d.SOURCE) {
      d.SOURCE.classList.remove(d.SELECTED_CLASS);
    }

    if (d.GHOST) {
      if (d.USE_GHOST) {
        d.GHOST.parentElement.removeChild(d.GHOST);
      }
      else {
        d.GHOST.classList.remove(d.GHOST_CLASS);
        d.GHOST.style.pointerEvents = '';
      }
    }

    d._lastei = null;
    d.GHOST = null;
    d.DESTINATION = null;
    d.SOURCE = null;
    d.IS_TRACKING = false;
    d.IS_RESIZING = false;
    
    clearTimeout(d.TRACK_TO);

    document.body.classList.remove(d.DRAGGING_CLASS);
    document.body.classList.remove(d.RESIZING_CLASS);
  };

  this._clearel = function(d) {
    if (d.DESTINATION_INSERT) {
      d.DESTINATION_INSERT.classList.remove("filler-over-before");
      d.DESTINATION_INSERT.classList.remove("filler-over-after");
    }
    if (d.DESTINATION) {
      d.DESTINATION.classList.remove("filler-over");
    }
  };

  this._mkfel = function(el, pos) {
    var rect = el.getBoundingClientRect();
    var h = 10;
    var ew = rect.width;
    var eh = rect.height;

    var fel;
    if (pos == -1 && this.SOURCE.nextElementSibling !== el) {
      fel = this.INSERT_BEFORE;
      if (fel == null) {
        fel = document.createElement("div");
        fel.style.position = "absolute";
        fel.classList.add(this.FILLER_CLASS);
        this.INSERT_BEFORE = fel;
        document.body.appendChild(fel);
      }
      else {
        fel.classList.remove("filler-over-before");
      }

      fel.style.top = (rect.y) + "px";
    }
    else if (pos == 1 && this.SOURCE.previousElementSibling !== el) {
      fel = this.INSERT_AFTER;
      if (fel == null) {
        fel = document.createElement("div");
        fel.style.position = "absolute";
        fel.classList.add(this.FILLER_CLASS);
        this.INSERT_AFTER = fel;
        document.body.appendChild(fel);
      }
      else {
        fel.classList.remove("filler-over-after");
      }

      fel.style.top = rect.y + (eh - h) + "px";
    }

    if (fel) {
      fel.style.left = rect.x + "px";
      fel.style.width = ew + "px";
      fel.style.height = h + "px";
    }
  };

  this.mk_filler = function(el) {
    if (this.ORIGIN_Y > this._lastei.pageY) {
      this._mkfel(el, -1);
    }
    else {
      this._mkfel(el, 1);
    }
  };

  this.rm_fillers = function() {
    var d = that;
    $("."+d.FILLER_CLASS).remove();
    d.INSERT_BEFORE = null;
    d.INSERT_AFTER = null;
    if (d.DESTINATION) d.DESTINATION.classList.remove('filler-over');
  },

  this.init_dragger = function(el) {
    var d = that;
    if ("ontouchstart" in window) {
      d.EVT_MOVE = "touchmove";
      d.EVT_DOWN = "touchstart";
      d.EVT_UP = "touchend";
      d.IS_TOUCH = true;
    }

    el.addEventListener(d.EVT_DOWN, d.mouse_down, false);
    el.addEventListener('dragenter', d.drag_enter, false);
    el.addEventListener('dragleave', d.drag_leave, false);

    d.CONTAINER = el;
    el.classList.add("ui_dragger");
  };

  this.destroy_dragger = function(el) {
    var d = that;

    document.removeEventListener(d.EVT_MOVE, d.mouse_move);
    document.removeEventListener(d.EVT_UP, d.mouse_up);

    d.removeEventListener(d.EVT_DOWN, d.mouse_down, false);
    d.cleanup();

    d.CONTAINER = null;
  };

  return this;
}

$.fn.dragger = function (options) {
  if (options == "destroy") {
    this.each(function(n,it) {
      $.destroy_dragger(it);
    });
  }
  else {
    this.each(function(n,it) {
      var d = new Dragger();
      $.extend(d, options);
      d.init_dragger(it);
    });
  }
};
