function Dragger(el) {
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

  this.timeout = 10;

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

  var self = this;

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
    else {
      return el.outerHTML;
    }
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
    return p;
  };

  this.mouse_down = function(evt) {
    if (evt.button > 0 || evt.ctrlKey) return;

    if (self.isFreehand && evt.target == self.CONTAINER) {
      self.isScrolling = true;
    }
    else {
      var it = self.getDragItem(evt.target);
      if (!it) {
        console.log('unable to get drag item!');
        return;
      }
    }

    var ei = self._eventInfo(evt);

    clearTimeout(self.TRACK_TO);
    self.TRACK_TO = setTimeout(function() {
      /*
      var el = document.elementFromPoint(ei.pageX, ei.pageY);
      var it = self.getDragItem(el);
      if (!it && !self.isScrolling) return;
      */

      self.startTracking(it, ei);
    },self.timeout);

    if (!self.isTouch) {
      evt.stopPropagation();
      evt.preventDefault();
      return false;
    }
  };

  this.mouse_up = function(evt) {
    if (self.DESTINATION) {
      self.DESTINATION.classList.remove(self.OVER_CLASS);
      if (self.DESTINATION != self.ITEM.parentElement) {
        if (self.ondropped(self.ITEM, 'over', self.DESTINATION)) {
          if (self._isCanvas(self.DESTINATION) && !self.isFreehand && self.GHOST) {
            var offx = window.pageXOffset;
            var offy = window.pageYOffset;
            var ra = self.GHOST.getBoundingClientRect();
            var rb = self.DESTINATION.getBoundingClientRect();

            self.ITEM.style.top = (ra.top - rb.top) + 'px';
            self.ITEM.style.left = (ra.left - rb.left) + 'px';
            self.DESTINATION.appendChild(self.ITEM);
          }
          else {
            self.DESTINATION.appendChild(self.ITEM);
          }
        }
      }
    }
    else if (self.AFTER) {
      if (self.ondropped(self.ITEM, 'after', self.AFTER)) {
        self.AFTER.parentElement.insertBefore(self.ITEM, self.AFTER.nextElementSibling);
      }
    }
    else if (self.isResizing) {
      self.ITEM.style.zIndex = null;
      self.onresized(self.ITEM);
    }
    else if (self.isScrolling) {
      self.onscrolled(self.CONTAINER);
    }
    else if (self.isFreehand) {
      self.ITEM.style.zIndex = null;
      self.onmoved(self.ITEM);
    }

    self.cleanup();
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
    var el = document.elementFromPoint(ei.pageX - offx, ei.pageY - 5 - offy);
    var it = this.getDragDestinationItem(el);
    var dest = this.getDragDestination(el);

    if (dest && dest.querySelector('.'+this.ITEM_CLASS) && !this._isCanvas(dest)) {
      dest = null;
    }

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

    if (dest) {
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
    if     (self.isScrolling) self.mouse_move_scroll(evt);
    else if (self.isResizing) self.mouse_move_resize(evt);
    else if (self.isFreehand) self.mouse_move_freehand(evt);
    else                      self.mouse_move_sortable(evt); 
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

    if (this.onscrolling(this.CONTAINER, sz)) {
      this.CONTAINER.scrollLeft = sz.x;
      this.CONTAINER.scrollTop = sz.y;
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

    if (this.onresizing(this.ITEM, sz)) {
      this.ITEM.style.height = sz.height + "px";
      this.ITEM.style.width = sz.width + "px";
    }
  
    evt.preventDefault();
    return false;
  };

  this.drag_enter = function(evt) {
    var ei = self._eventInfo(evt);

    self.ORIGIN_X = Math.round(ei.pageX);
    self.ORIGIN_Y= Math.round(ei.pageY);

    self.ORIGIN_DX = Math.round(ei.pageX);
    self.ORIGIN_DY = Math.round(ei.pageY);

    document.addEventListener('dragover', self.drag_over, false);
    document.addEventListener('drop', self.drop_external, false);
  };

  this.drag_leave = function(evt) {
    var ei = self._eventInfo(evt);
    var r = self.CONTAINER.getBoundingClientRect();
    var outside = false;

    if      (ei.pageY < r.top) outside = true;
    else if (ei.pageY > r.top+r.height) outside = true;
    else if (ei.pageX < r.left) outside = true;
    else if (ei.pageX > r.left + r.width) outside = true;

    if (outside) {
      document.removeEventListener('dragover', self.drag_over);
      document.removeEventListener('drop', self.drop_external);
      self.cleanup();
    }
  };

  this.drop_external = function(evt) {
    self.cleanup();

    document.removeEventListener('dragover', self.drag_over);
    document.removeEventListener('drop', self.drop_external);

    evt.stopPropagation();
    evt.preventDefault();
    return false;
  };

  this.drag_over = function(evt) {
    //self.mouse_move(evt);

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

    document.addEventListener(this.EVT_UP, this.mouse_up, false);
    document.addEventListener(this.EVT_MOVE, this.mouse_move, false);
    document.addEventListener('touchcancel', this._touchcancel, false);
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

  this._touchcancel = function(evt) {
    this.cleanup();
  };
  
  this._ignoreEvent = function(evt) {
    evt.preventDefault();
    return false;
  };

  this.cleanup = function() {
    clearTimeout(self.TRACK_TO);

    if (self.ITEM) {
      self.ITEM.removeEventListener('touchmove', self._ignoreEvent);
      self.ITEM.classList.remove(self.SELECTED_CLASS);
    }
    
    document.removeEventListener('touchcancel', self._touchcancel);
    document.removeEventListener(self.EVT_MOVE, self.mouse_move);
    document.removeEventListener(self.EVT_UP, self.mouse_up);
    
    if (self.GHOST) {
      self.GHOST.classList.remove(self.GHOST_CLASS);
      if (self.useGhost) {
        self.GHOST.parentElement.removeChild(self.GHOST);
      }
    }
    
    if (self.PLACEHOLDER) {
      self.PLACEHOLDER.parentElement.removeChild(self.PLACEHOLDER);
    }

    self.GHOST = null;
    self.ITEM = null;
    self.PLACEHOLDER = null;
    self.DESTINATION = null;
    self.AFTER = null;

    self.ORIGIN_DX = 0;
    self.ORIGIN_DY = 0;
    self.ORIGIN_X = 0;
    self.ORIGIN_Y = 0;
    self.ORIGIN_W = 0;
    self.ORIGIN_H = 0;

    self.isTouch = false;
    self.isTracking = false;
    self.isResizing = false;
    self.isScrolling = false;
    self.useHandle = false;

    document.body.classList.remove(self.DRAGGING_CLASS);
    document.body.classList.remove(self.RESIZING_CLASS);
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

  //over / after
  this.ondropped = function(source, pos, destination) {
    //to be overridden
    return true;
  };

  this.onmoved = function(source, pos) {
    //to be overridden
  };

  this.init = function(el) {
    if ("ontouchstart" in window) {
      this.EVT_MOVE = "touchmove";
      this.EVT_DOWN = "touchstart";
      this.EVT_UP = "touchend";

      this.isTouch = true;
    }

    el.addEventListener(this.EVT_DOWN, this.mouse_down, false);
    el.addEventListener('dragenter', this.drag_enter, false);
    el.addEventListener('dragleave', this.drag_leave, false);

    this.CONTAINER = el;
    el.classList.add('ui_dragger');

    if (el.classList.contains('ui_dragger-canvas')) {
      this.isFreehand = true;
      this.lockVertical = false;
      this.useGhost = false;
    }

    if (el.querySelector('.ui_dragger-item .ui_dragger-handle') != null) {
      this.useHandle = true;
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
      $.extend(d, options);
      d.init(it);
    });
  }
};
