window.__exec_id = {};

function is_parent_of_element(par, el) {
  let p = par;
  while (p) {
    if (el == p) return true;
    p = p.parentElement;
  }
  return false;
}

function exec_clear(name) {
  var id = window.__exec_id[name];
  clearInterval(id);
}

function exec_once(name, tout, func) {
  var id = window.__exec_id[name];
  clearInterval(id);
  
  if (func) {
    window.__exec_id[name] = setTimeout(function() {
      func();
      delete window.__exec_id.name;

    }, tout);
  }
}

function popupPath(type, path_ref, cb) {
  //saveFocus();

  let el = document.querySelector('#ui_popup');
  if (el) {
    console.log('ui_popup exists');
    return;
  }

  el = document.createElement('iframe');
  el.id = 'ui_popup';
  document.body.append(el);

  let bg = document.createElement('div');
  let onclick = function(evt) {
    if (document.body.classList.contains('mode_popup-visible')) {
      delete el.removeCB;
      clearEditMode();
      el.classList.remove('visible');
      document.body.classList.remove('mode_popup-visible');
      bg.removeEventListener('click', onclick);
      bg.remove();
      el.remove();
      if (evt) {
        evt.preventDefault();
        evt.stopPropagation();
      }
    }
  };

  bg.addEventListener('click', onclick);
  bg.id = 'ui_popup-background';
  document.body.append(bg);

  el.removeCB = onclick;

  el.src = path_ref;
  el.popupCB = function(val) {
    delete el.removeCB;
    bg.removeEventListener('click', onclick);
    bg.remove();
    Utils.flushResourceCache();
    cb(val);
  };

  setTimeout(function() {
    el.classList.add('visible');
    document.body.classList.add('mode_popup-visible');
  },50);
}

function cancelPopupPath() {
  let el = document.querySelector('#ui_popup');
  if (el && el.removeCB) {
    el.removeCB();
  }
}

function getDataProperty(el, name) {
  let val = $(el).data(name);
  if (val) return val;

  val = $(el).parents('[data-'+name+']').data(name);
  return val;
}

function submitFormAsync(form, cb) {
  let info = handler.parseFormElement(form);
  let data = info.formData;
  let path = info.formPath;

  if (path.indexOf('#') == -1) path = '#'+path; //force this to be local path

  delete data[':forward'];
  let xhr = new XMLHttpRequest();
  xhr.open('POST', path);
  xhr.onreadystatechange = function() {
    if (cb) cb(data);
  };
  xhr.send(data);
}

function submitDataAsync(data, url, cb) {
  let xhr = new XMLHttpRequest();
  xhr.open('POST', url);
  xhr.onreadystatechange = function (rv) {
    if (cb) {
      if (xhr.readyState == 4) cb(xhr.responseText);
    }
  };
  xhr.send(data);
}

function triggerAction(cl) {
  setTimeout(function() {
    var el = document.querySelector(cl);
    if (el) el.click();
  },100);
}

function toggleFilterMode(cl) {
  var ctx = handler.getRootContext();
  var path = '/config';
  ctx.resolveResource(path).then(function(res) {
    var m = '';
    if (res) m = res._['filter_mode'];
    if (!m) m = '';

    m = m.replace(new RegExp('\\b'+cl+'\\b'), '').trim();

    if (document.body.classList.contains(cl)) {
      document.body.classList.remove(cl);
    }
    else {
      document.body.classList.add(cl);
      m += ' '+cl;
    }
    ctx.storeResource(path, {filter_mode:m}).then(function() {
    });
  });
}

function clearHighlightMode() {
  sessionStorage.removeItem('__LAST_HIGHLIGHT_MODE');
}

function saveHighlightMode(list) {
  let ls = [];
  let items = document.querySelectorAll(list);
  for (let i = 0; i < items.length; i++) {
    let id = items[i].id;
    if (id) ls.push(id);
  }

  let v = {
    ids:ls,
    element:list,
    scroll:document.scrollingElement.scrollTop,
    height:document.scrollingElement.clientHeight,
    location:window.location.toString()
  };

  sessionStorage.setItem('__LAST_HIGHLIGHT_MODE', JSON.stringify(v));
}

function restoreHighlightMode() {
  if (parent != window) return;
  let v = JSON.parse(sessionStorage.getItem('__LAST_HIGHLIGHT_MODE'));
  let u = window.location.toString();

  if (!v) return;

  console.log(v);
  if (v.location == u && v.element) {
    let items = document.querySelectorAll(v.element);
    for (let i = 0; i < items.length; i++) {
      let el = items[i];
      let id = el.id;
      if (id) {
        if (v.ids.indexOf(id) == -1) {
          el.classList.add('highlighted');
          el.scrollIntoViewIfNeeded();
          setTimeout(function() {
            el.classList.remove('highlighted');
          }, 1000);
        }
      }
    }
  }

  sessionStorage.removeItem('__LAST_HIGHLIGHT_MODE');
  window.dispatchEvent(new Event('resize'));
}

function clearEditMode() {
  sessionStorage.removeItem('__LAST_EDIT_MODE');
}

function saveEditMode() {
  let i = $(".mode_edit.visible").attr('id');
  let v = {
    element:i,
    scroll:document.scrollingElement.scrollTop,
    height:document.scrollingElement.clientHeight,
    location:window.location.toString()
  };

  sessionStorage.setItem('__LAST_EDIT_MODE', JSON.stringify(v));
}

function restoreEditMode() {
  if (parent != window) return;
  let v = JSON.parse(sessionStorage.getItem('__LAST_EDIT_MODE'));
  let u = window.location.toString();

  if (!v) return;

  console.log(v);
  if (v.location == u) {
    let $el = $('#'+v.element);
    if ($el.length) {
      $el.addClass('mode_edit');
      $el.addClass('visible');
      document.body.classList.add('edit');
      //$el.get(0).scrollIntoViewIfNeeded();
      console.log($el.get(0));
      console.log('scroll into view');
      requestAnimationFrame(function() {
        if (document.scrollingElement.clientHeight == v.height) {
          document.scrollingElement.scrollTop = v.scroll;
          $el.get(0).scrollIntoViewIfNeeded();
        }
        else {
          $el.get(0).scrollIntoView();//{ behavior: "smooth"});
        }
      });
    }
    else {
      console.log('no element found ' + v.element);
    }
  }

  sessionStorage.removeItem('__LAST_EDIT_MODE');
  window.dispatchEvent(new Event('resize'));
}

function clearViewMode() {
  sessionStorage.removeItem('__LAST_VIEW_MODE');
}

function saveViewMode() {
  let i = $(".focused").attr('id');
  let v = {
    element:i,
    scroll:document.scrollingElement.scrollTop,
    height:0,/*document.scrollingElement.clientHeight,*/
    location:window.location.toString()
  };

  sessionStorage.setItem('__LAST_VIEW_MODE', JSON.stringify(v));
}

function restoreViewMode() {
  if (parent != window) return;
  let v = JSON.parse(sessionStorage.getItem('__LAST_VIEW_MODE'));
  let u = window.location.toString();

  if (v && v.location == u) {
    let el = document.getElementById(v.element);
    //if (el) el.scrollIntoViewIfNeeded();
    requestAnimationFrame(function() {
      if (el && document.scrollingElement.clientHeight == v.height) {
        document.scrollingElement.scrollTop = v.scroll;
        el.scrollIntoViewIfNeeded();
      }
      else if (el) {
        el.scrollIntoView();//{ behavior: "smooth"});
      }
    });
  }

  sessionStorage.removeItem('__LAST_VIEW_MODE');
}

function saveCurrentContentPath() {
  let v = R3E.context.getCurrentResourcePath();
  sessionStorage.setItem('__CURRENT_CONTENT_PATH', v);
}

function storeDocumentHTML(ctx, doc, dest) { //XXX
  return new Promise(function (resolve) {
    let $doc = $(doc);
    let process = 0;
    let done = function() {
      if (process == 0) {
        process = -1;
        resolve(doc.outerHTML);
      }
    };

    process++;
    $doc.find('img').each(function(n, it) {
      let src = it.src;

      process++;
      storeDocumentIMG(ctx, src, dest, function(nsrc) {
        it.setAttribute('src', escape(nsrc));

        process--;
        done();
      });
    });
    process--;

    done();
  });
}

function storeDocumentIMG(ctx, src, dest, cb) {
  let pref = config.DOC_PREFIX;
  if (src.startsWith(pref)) src = '/content'+unescape(src.substr(pref.length));

  let n = Utils.filename(src);
  ctx.copyResources([src], dest).then(function() {
    cb(n);
  });
}

$(function () {
  window.addEventListener('message', function(evt) {
    let path_ref = evt.source.location.toString();
    if (window.popupPathCB && window.popupPathCB[path_ref]) {
      Utils.flushResourceCache();
      document.body.classList.remove('mode_popup-visible');
      setTimeout(function() {
        window.popupPathCB[path_ref](evt.data);
        delete window.popupPathCB[path_ref];
        evt.source.close();
      },0);
    }
    else {
      setTimeout(function() {
        let el = $('[src="'+evt.source.location.toString()+'"]').get(0);
        if (el && el['popupCB']) {
          document.body.classList.remove('mode_popup-visible');
          el.popupCB(evt.data);
          delete el['popupCB'];
          el.remove();
        }
      },0);
    }
  });

/* data-mode_id or id
 * data-mode_sel="sel" data-mode="edit"
 */

  $(document).on('click', '.act_mode-toggle', function(evt) {
    let nm = evt.target.dataset['mode_sel'];
    let cn = evt.target.dataset['mode'];
    let cl = 'mode_'+cn;

    let el = document.querySelector(`[data-mode_id=${nm}`);
    if (!el) el = document.getElementById(nm);

    if (el) {
      if (el.classList.contains(cl)) {
        if (evt.target.tagName == 'TEXTAREA') return;

        el.classList.remove(cl);
        el.classList.remove('visible');
        document.body.classList.remove(cn);
      }
      else {
        /* XXX
        if (window.getSelection().type == 'Range') {
          evt.preventDefault();
          return;
        }
        */

        $('[data-mode_id].visible').each(function(x, it) {
          it.classList.remove('visible');
          let n = it.dataset['mode'];
          if (n) {
            document.body.classList.remove(n);
            delete it.dataset['mode'];
          }
        });

        el.classList.add(cl);
        el.classList.add('visible');
        el.dataset['mode'] = cn;
        document.body.classList.add(cn);
      }
    }
    else {
      if (document.body.classList.contains(cl)) {
        document.body.classList.remove(cl);
        document.body.classList.remove(cn);
      }
      else {
        document.body.classList.add(cl);
        document.body.classList.add(cn);
      }
    }

    setTimeout(function() {
      //el.scrollIntoView();//{ behavior: "smooth"});
      window.dispatchEvent(new Event('resize'));
    },1);

    evt.preventDefault();
  });

  $(document).on('click', '.act_popup-item-sel', function(evt) {
    let item_ref = $(evt.target).data('item_ref');
    if (!item_ref) item_ref = $(evt.target).parents('[data-item_ref]').data('item_ref');

    if (item_ref) {
      if (window.top != window) {
        window.top.postMessage(item_ref, window.location);
      }
      else if (window.opener != window) {
        window.opener.postMessage(item_ref, window.location);
      }
    }
    evt.preventDefault();
  });

  $(document).on('click', '.act_popup-show', function(evt) {
    evt.preventDefault();

    let $el = $(evt.target);
    let path = $el.data('path');
    let main = $el.data('form');
    let href = $el.attr('href');
    let name = $el.attr('name');
    let $form = $el.parents('form');
    let $main = main?$(main):null;

    if (!path && href) path = href;

    popupPath(0, path, function(item) {
      saveEditMode();
      Utils.flushResourceCache();
      $el.val(item);
      if ($main && $main.length) {
        submitFormAsync($main.get(0), function() {
          Utils.flushResourceCache();
          $form.trigger('submit');
        });
      }
      else {
        $form.trigger('submit');
      }
    });
  });

  /*
  <form id="save_selection" method="post" action="{{res_path "/session/selection"}}">
    <input type="hidden" name="_rt" value="resource/selection">
    <input type="hidden" name=":reset" value="{{res_path "/session/selection"}}">
    <input type="hidden" name=":forward" value="{{req_path "/session/selection" "res-delete"}}">
    <button type="submit" class="act_dialog-show">x</button>
  </form>
   */

  $(document).on('click', '.act_dialog-show', function(evt) {
    evt.preventDefault();

    let $el = $(evt.target);
    let path = $el.data('path');
    let main = $el.data('form');
    let href = $el.attr('href');
    let name = $el.attr('name');
    let $main = $(main);

    if (!$main || $main.length == 0) $main = $el.parents('form');
    if (!path && href) path = href;
    if (!path) path = $main.find("input[name=':forward']").val();

    saveEditMode();
    Utils.flushResourceCache();
    if ($main && $main.length) {
      submitFormAsync($main.get(0), function() {
        Utils.flushResourceCache();
        window.open(path, '_blank');
      });
    }
    else {
      window.open(path, '_blank');
    }
  });

  $(document).on('change', '.act_form-submit', function(evt) { //XXX
    evt.preventDefault();

    let $form = $(evt.target.form);
    $form.trigger('submit');
  });

});

$.post = function(url, data, cb) {
  let xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.onreadystatechange = function () {
    if (cb) cb();
  }
  xhr.send(data);
};

$.get = function(url, data, cb) {
};
