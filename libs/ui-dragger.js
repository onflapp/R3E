function Dragger() {
  this.GHOST_CLASS = "ui_dragger-ghost";
  this.CONTAINER_CLASS = 'ui_dragger-container';
  this.ITEM_CLASS = 'ui_dragger-item';
  this.HANDLE_CLASS = 'ui_dragger-handle';
  this.RESIZER_CLASS = 'ui_dragger-resizer';
  this.PLACEHOLDER_CLASS = 'ui_dragger-placeholder';
  this.SELECTED_CLASS = "selected";
  this.OVER_CLASS = "over";
  this.DRAGGING_CLASS = "dragging";
  this.RESIZING_CLASS = "resizing";

  this.EVT_MOVE = "mousemove";
  this.EVT_DOWN = "mousedown";
  this.EVT_UP = "mouseup";

  this.CONTAINER = null;
  this.DESTINATION = null;
  this.AFTER= null;
  this.ITEM = null;
  this.GHOST = null;
  this.PLACEHOLDER = null;
  this.TRACK_TO = null;

  this.timeout = 250;
  this.actions = 0;

  this.ORIGIN_DX = 0;
  this.ORIGIN_DY = 0;
  this.ORIGIN_X = 0;
  this.ORIGIN_Y = 0;
  this.ORIGIN_W = 0;
  this.ORIGIN_H = 0;

  this.isTouch = false;
  this.isTracking = false;
  this.isFreehand = false;
  this.isResizing = false;
  this.isScrolling = false;
  this.useGhost = true;
  this.useHandle = false;
  this.lockVertical = false;

  this.makePlaceholder = function(el) {
    if (this.isScrolling) return;
    if (this.isResizing) return;
    if (this.isFreehand) return;

    if (!el) {
      if (this.PLACEHOLDER) this.PLACEHOLDER.style.display = 'none';
      return;
    }

    var rect = el.getBoundingClientRect();

    var fel = this.PLACEHOLDER;
    if (!fel) {
      fel = document.createElement("div");
      fel.style.position = "absolute";
      fel.style.height = 3 + "px";
      fel.style.overflow = "hidden";
      fel.style.zIndex = 9998;
      fel.style.pointerEvents = "none";

      fel.classList.add(this.PLACEHOLDER_CLASS);
      document.body.appendChild(fel);

      this.PLACEHOLDER = fel;
    }

    var offx = window.pageXOffset;
    var offy = window.pageYOffset;

    fel.style.top = offy + rect.y + rect.height + "px";
    fel.style.left = offx + rect.left - 2 + "px";
    fel.style.width = rect.width + 4 + "px";
    fel.style.display = 'block';
  };

  this.makeGhost = function(el) {
    if (this.useGhost) {
      var p = document.createElement("div");
      var rect = el.getBoundingClientRect();
      var offx = window.pageXOffset;
      var offy = window.pageYOffset;

      p.classList.add(this.GHOST_CLASS);
      p.innerHTML = this.getDragItemContent(el);
      p.style.position = "absolute";
      p.style.top = rect.y + offy + "px";
      p.style.left = rect.x + offx + "px";
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

      p.classList.add(this.GHOST_CLASS);
      
      return el;
    }
  };

  this.getDragItemContent = function(el) {
    if (el.tagName == 'TR') {
      return '<table>'+el.outerHTML+'</table>';
    }
    else if (el.tagName == 'LI') {
      var t = el.parentElement.tagName;
      return '<'+t+' style="margin-top:0;margin-bottom:0">'+el.outerHTML+'</'+t+'>';
    }
    else {
      return el.outerHTML;
    }
  };

  this.getScrollableItem = function(el) {
    if (this.isFreehand && el == this.CONTAINER) return el;
    else return null;
  };

  this.getDragItem = function(el) {
    var p = el;
    var handle = 0;
    this.isResizing = false;

    while (p) {
      if (p.classList.contains(this.RESIZER_CLASS)) {
        this.isResizing = true;
      }
      p = p.parentElement;
    }

    p = el;
    while (p) {
      if (p.classList.contains(this.HANDLE_CLASS)) handle++;
      if (p.classList.contains(this.ITEM_CLASS)) {
        if (this.useHandle && handle == 0 && this.isResizing == false) return null;
        else return p;
      }
      p = p.parentElement;
    }

    return null;
  };

  this.getDragDestinationItem = function(el) {
    var p = el;

    while (p) {
      if (p.classList.contains(this.ITEM_CLASS)) return p;
      p = p.parentElement;
    }

    return null;
  };

  this.getDragDestination = function(el) {
    var p = el;
    while (p) {
      if (p.classList.contains(this.CONTAINER_CLASS)) {
        return p;
      }
      p = p.parentElement;
    }
    return null;
  };

  this.mouse_down = function(evt) {
    if (evt.button > 0 || evt.ctrlKey) return;

    var sit = this.getScrollableItem(evt.target);
    if (sit) {
      this.isScrolling = true;
      this.CONTAINER = sit;
    }
    else {
      var it = this.getDragItem(evt.target);
      if (!it) {
        console.log('unable to get drag item!');
        return;
      }
    }

    var ei = this._eventInfo(evt);

    if (this.timeout == 0 || this.isResizing || this.isFreehand) {
      if (this._delegate('onstart', it)) {
        this.startTracking(it, ei);
      }
      else {
        this.cleanup();
      }
    }
    else {
      var self = this;
      var check_up = function(evt) {
        document.removeEventListener(self.EVT_UP, check_up);

        var ee = self._eventInfo(evt);
        var dx = ei.pageX - ee.pageX;
        var dy = ei.pageY - ee.pageY;
        var dt = ee.timestamp - ei.timestamp;
        clearTimeout(self.TRACK_TO);
      };

      this.TRACK_TO = setTimeout(function() {
        document.removeEventListener(self.EVT_UP, check_up);
        if (self._delegate('onstart', it)) {
          self.startTracking(it, ei);
        }
        else {
          self.cleanup();
        }
      }, this.timeout);

      document.addEventListener(this.EVT_UP, check_up, false);
    };

    evt.stopPropagation();
    evt.preventDefault();
    return false;
  };

  this.mouse_up = function(evt) {
    var success = false;
    try {
      if (this.DESTINATION) {
        this.DESTINATION.classList.remove(this.OVER_CLASS);
        var id = this.getDragDestination(this.ITEM.parentElement);
        if (this.DESTINATION == id) {
          if (this._delegate('ondropped', this.ITEM, 'over', this.DESTINATION)) {
            this.ITEM.parentElement.insertBefore(this.ITEM, this.ITEM.parentElement.firstChild);
            success= true;
          }
        }
        else {
          if (this._delegate('ondropped', this.ITEM, 'over', this.DESTINATION)) {
            if (this._isCanvas(this.DESTINATION) && !this.isFreehand && this.GHOST) {
              var offx = window.pageXOffset;
              var offy = window.pageYOffset;
              var ra = this.GHOST.getBoundingClientRect();
              var rb = this.DESTINATION.getBoundingClientRect();

              this.ITEM.style.top = (ra.top - rb.top) + 'px';
              this.ITEM.style.left = (ra.left - rb.left) + 'px';
              this._appendChild(this.DESTINATION, this.ITEM);
              success= true;
            }
            else {
              this._appendChild(this.DESTINATION, this.ITEM);
              success= true;
            }
          }
        }
      }
      else if (this.AFTER) {
        if (this._delegate('ondropped', this.ITEM, 'after', this.AFTER)) {
          this.AFTER.parentElement.insertBefore(this.ITEM, this.AFTER.nextElementSibling);
          success= true;
        }
      }
      else if (this.isResizing) {
        this.ITEM.style.zIndex = null;
        if (this.actions > 0) {
          this._delegate('onresized', this.ITEM);
          success = true;
        }
      }
      else if (this.isScrolling) {
        if (this.actions > 0) {
          this._delegate('onscrolled', this.CONTAINER);
          success = true;
        }
      }
      else if (this.isFreehand) {
        this.ITEM.style.zIndex = null;
        if (this.actions > 0) {
          this._delegate('onmoved',this.ITEM);
          success = true;
        }
      }
    }
    catch(ex) {
      success = false;
    }

    var el = evt.target;
    var cancel_click = function(evt) {
      el.removeEventListener('click', cancel_click);
      evt.preventDefault();
      evt.stopPropagation();
      return false;
    };

    setTimeout(function() { //make sure we don't miss to remove the event!
      el.removeEventListener('click', cancel_click);
    },50);

    el.addEventListener('click', cancel_click);

    this._delegate('onfinish', success);
    this.cleanup();
    evt.preventDefault();
    return false;
  };

  this.mouse_move_freehand = function(evt) {
    var ei = this._eventInfo(evt);
    var posx = ei.pageX;
    var posy = ei.pageY;
    var offx = window.pageXOffset;
    var offy = window.pageYOffset;

    var rect = this.CONTAINER.getBoundingClientRect();

    this.GHOST.style.top = (posy - this.ORIGIN_DY - rect.top - offy) + "px";
    this.GHOST.style.left = (posx - this.ORIGIN_DX - rect.left - offx) + "px"; 
    this.actions++;

    evt.preventDefault();
    return false;
  };

  this.mouse_move_sortable = function(evt) {
    var ei = this._eventInfo(evt);
    var posx = ei.pageX;
    var posy = ei.pageY;
    var offx = 0;
    var offy = 0;

    this.GHOST.style.top = (posy - this.ORIGIN_DY - offy) + "px";

    if (!this.lockVertical) {
      this.GHOST.style.left = (posx - this.ORIGIN_DX - offx) + "px";
    }
  
    offx = window.pageXOffset;
    offy = window.pageYOffset;
    var el = document.elementFromPoint(ei.pageX - offx, ei.pageY - 3 - offy);
    var it = this.getDragDestinationItem(el);
    var dest = this.getDragDestination(el);
    var isc = false;//this._isChildOf(it, dest);

    if (isc) it = null;

    if (it) {
      var ra = it.getBoundingClientRect();
      var rb = this.GHOST.getBoundingClientRect();
      if (ra.y > rb.y) it = null;
      if (it == this.ITEM) it = null;
      if (it == this.ITEM.previousElementSibling) it = null;
      if (this._isCanvas(it)) it = null;
    }

    this.makePlaceholder(it);

    if (it) {
      if (this.DESTINATION) this.DESTINATION.classList.remove(this.OVER_CLASS);
      this.DESTINATION = null;
      this.AFTER = it;
      dest = null;
    }
    else {
      this.AFTER = null;
    }

    if (dest && dest != this.ITEM && !isc) {
      if (this.DESTINATION && this.DESTINATION != dest) this.DESTINATION.classList.remove(this.OVER_CLASS);
      if (dest != this.CONTAINER) dest.classList.add(this.OVER_CLASS);

      this.DESTINATION = dest;
      this.AFTER = null;
    }
    else {
      if (this.DESTINATION) this.DESTINATION.classList.remove(this.OVER_CLASS);
      this.DESTINATION = null;
    }

    evt.preventDefault();
    return false;
  };

  this.mouse_move = function(evt) {
    if     (this.isScrolling) this.mouse_move_scroll(evt);
    else if (this.isResizing) this.mouse_move_resize(evt);
    else if (this.isFreehand) this.mouse_move_freehand(evt);
    else                      this.mouse_move_sortable(evt); 
  };

  this.mouse_move_scroll = function(evt) {
    var ei = this._eventInfo(evt);
    var posx = ei.pageX;
    var posy = ei.pageY;

    var dx = posx - this.ORIGIN_X;
    var dy = posy - this.ORIGIN_Y;
    var sz = {};
    sz.x = this.ORIGIN_W - dx;
    sz.y = this.ORIGIN_H - dy;

    if (this._delegate('onscrolling', this.CONTAINER, sz)) {
      this.CONTAINER.scrollLeft = sz.x;
      this.CONTAINER.scrollTop = sz.y;
      this.actions++;
    }

    evt.preventDefault();
    return false;
  };

  this.mouse_move_resize = function(evt) {
    var ei = this._eventInfo(evt);
    var posx = ei.pageX;
    var posy = ei.pageY;

    var dx = posx - this.ORIGIN_X;
    var dy = posy - this.ORIGIN_Y;
    var sz = {};
    sz.height = (this.ORIGIN_H + dy);
    sz.width = (this.ORIGIN_W + dx);

    if (this._delegate('onresizing', this.ITEM, sz)) {
      this.ITEM.style.height = sz.height + "px";
      this.ITEM.style.width = sz.width + "px";
      this.actions++;
    }
  
    evt.preventDefault();
    return false;
  };

  this.drag_enter = function(evt) {
    var ei = this._eventInfo(evt);

    this.ORIGIN_X = Math.round(ei.pageX);
    this.ORIGIN_Y= Math.round(ei.pageY);

    this.ORIGIN_DX = Math.round(ei.pageX);
    this.ORIGIN_DY = Math.round(ei.pageY);

    this._drag_over_evt = this.drag_over.bind(this);
    this._drop_external_evt = this.drop_external.bind(this);

    document.addEventListener('dragover', this._drag_over_evt, false);
    document.addEventListener('drop', this._drop_external_evt, false);
  };

  this.drag_leave = function(evt) {
    var ei = this._eventInfo(evt);
    var r = this.CONTAINER.getBoundingClientRect();
    var outside = false;

    if      (ei.pageY < r.top) outside = true;
    else if (ei.pageY > r.top+r.height) outside = true;
    else if (ei.pageX < r.left) outside = true;
    else if (ei.pageX > r.left + r.width) outside = true;

    if (outside) {
      document.removeEventListener('dragover', this._drag_over_evt);
      document.removeEventListener('drop', this._drop_external_evt);
      this.cleanup();
    }
  };

  this.drop_external = function(evt) {
    this.cleanup();

    document.removeEventListener('dragover', this._drag_over_evt);
    document.removeEventListener('drop', this._drop_external_evt);

    evt.stopPropagation();
    evt.preventDefault();
    return false;
  };

  this.drag_over = function(evt) {
    //this.mouse_move(evt);

    evt.stopPropagation();
    evt.preventDefault();
    return false;
  };

  this.startTracking = function(el, ei) {
    this.isTracking = true;

    if (this.isResizing) {
      this.ORIGIN_W = el.clientWidth;
      this.ORIGIN_H = el.clientHeight;
    }
    
    if (this.isScrolling) {
      this.ORIGIN_W = this.CONTAINER.scrollLeft;
      this.ORIGIN_H = this.CONTAINER.scrollTop;

      this.ORIGIN_X = ei.pageX;
      this.ORIGIN_Y= ei.pageY;
    }

    if (el) {
      this.ITEM = el;
      this.ORIGIN_X = Math.round(ei.pageX);
      this.ORIGIN_Y = Math.round(ei.pageY);

      var off = $(el).offset();
      this.ORIGIN_DX = Math.round(ei.pageX - off.left);
      this.ORIGIN_DY = Math.round(ei.pageY - off.top);

      if (!this.isResizing) {
        this.GHOST = this.makeGhost(el);
      }

      if (this.isFreehand) {
        this.ITEM.style.zIndex = 1;
      }

      this.ITEM.classList.add(this.SELECTED_CLASS);
      this.ITEM.addEventListener('touchmove', this._ignoreEvent);
    }

    document.body.classList.add(this.DRAGGING_CLASS);

    this._mouse_up_evt = this.mouse_up.bind(this);
    this._mouse_move_evt = this.mouse_move.bind(this);

    document.addEventListener(this.EVT_UP, this._mouse_up_evt, false);
    document.addEventListener(this.EVT_MOVE, this._mouse_move_evt, false);
    document.addEventListener('touchcancel', this._touchcancel, false);
  };

  this._appendChild = function(dest, src) {
    if (src.tagName == 'LI' && dest.tagName == 'LI') {
      var t = dest.parentElement.tagName;
      var l = dest.querySelector(t);
      if (l == null) {
        l = document.createElement(t);
        dest.appendChild(l);
      }
      l.appendChild(src);
    }
    else {
      dest.appendChild(src);
    }
  };

  this._isChildOf = function(it, dest) {
    if (!it) return false;
    if (!dest) return false;

    var p = it;
    while (p) {
      if (p == dest) {
        console.log(p);
        return true;
      }
      p = p.parentElement;
    }

    return false;
  };

  this._isCanvas = function(el) {
    var p = el;
    while (p) {
      if (p.classList.contains('ui_dragger-canvas')) {
        return true;
      }
      p = p.parentElement;
    }
    return false;
  };

  this._eventInfo = function(evt) {
    if (evt.targetTouches) {
      var t = evt.targetTouches[0];
      return {
        timestamp:evt.timeStamp,
        pageX:t.pageX,
        pageY:t.pageY
      };
    }
    else {
      return {
        timestamp:evt.timeStamp,
        pageX:evt.pageX,
        pageY:evt.pageY
      };
    }
  };

  this._touchcancel = function(evt) {
    this.cleanup();
  };
  
  this._ignoreEvent = function(evt) {
    evt.preventDefault();
    return false;
  };

  this._delegate = function(n, a, b, c, d) {
    return this[n](a, b, c, d);
  };
  
  this.onscrolling = function(source, pos) {
    //to be overridden
    return true;
  };

  this.onscrolled = function(source) {
    //to be overridden
  };
  
  this.onresizing = function(source, size) {
    //to be overridden
    return true;
  };
  
  this.onresized = function(source) {
    //to be overridden
  };
  
  this.ondropped = function(source, pos, destination) {
    //over / after
    //to be overridden
    return true;
  };
  
  this.onmoved = function(source, pos) {
    //to be overridden
  };

  this.onstart = function(item) {
    //to be overridden
    return true;
  };

  this.onfinish = function(success) {
    //to be overridden
    return true;
  };

  this.cleanup = function() {
    clearTimeout(this.TRACK_TO);
    this.actions = 0;

    if (this.ITEM) {
      this.ITEM.removeEventListener('touchmove', this._ignoreEvent);
      this.ITEM.classList.remove(this.SELECTED_CLASS);
    }
    
    document.removeEventListener('touchcancel', this._touchcancel);
    document.removeEventListener(this.EVT_MOVE, this._mouse_move_evt);
    document.removeEventListener(this.EVT_UP, this._mouse_up_evt);
    
    if (this.GHOST) {
      this.GHOST.classList.remove(this.GHOST_CLASS);
      if (this.useGhost) {
        this.GHOST.parentElement.removeChild(this.GHOST);
      }
    }
    
    if (this.PLACEHOLDER) {
      this.PLACEHOLDER.parentElement.removeChild(this.PLACEHOLDER);
    }

    this.GHOST = null;
    this.ITEM = null;
    this.PLACEHOLDER = null;
    this.DESTINATION = null;
    this.AFTER = null;

    this.ORIGIN_DX = 0;
    this.ORIGIN_DY = 0;
    this.ORIGIN_X = 0;
    this.ORIGIN_Y = 0;
    this.ORIGIN_W = 0;
    this.ORIGIN_H = 0;

    this.isTouch = false;
    this.isTracking = false;
    this.isResizing = false;
    this.isScrolling = false;

    document.body.classList.remove(this.DRAGGING_CLASS);
    document.body.classList.remove(this.RESIZING_CLASS);
  };

  this.init = function(el, opts) {
    if ("ontouchstart" in window) {
      this.EVT_MOVE = "touchmove";
      this.EVT_DOWN = "touchstart";
      this.EVT_UP = "touchend";

      this.isTouch = true;
    }

    if (opts) {
      for (var k in opts) {
        this[k] = opts[k];
      }
    }

    this._mouse_down_evt = this.mouse_down.bind(this);
    this._drag_enter_evt = this.drag_enter.bind(this);
    this._drag_leave_evt = this.drag_leave.bind(this);

    el.addEventListener(this.EVT_DOWN, this._mouse_down_evt, false);
    el.addEventListener('dragenter', this._drag_enter_evt, false);
    el.addEventListener('dragleave', this._drag_leave_evt, false);

    this.CONTAINER = el;
    el.classList.add('ui_dragger');

    if (el.classList.contains('ui_dragger-canvas')) {
      this.isFreehand = true;
      this.lockVertical = false;
      this.useGhost = false;
    }
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
      d.init(it, options);
    });
  }
};
