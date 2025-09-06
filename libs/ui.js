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
      el.classList.remove('visible');
      document.body.classList.remove('mode_popup-visible');
      bg.removeEventListener('click', onclick);
      bg.remove();
      el.remove();
      if (evt) {
        evt.preventDefault();
        evt.stopPropagation();
      }
      if (el['popupCB']) {
        el.popupCB();
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
    if (val) Utils.flushResourceCache();
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

function clearMode(name) {
  sessionStorage.removeItem(`__LAST_MODE_${name}`);
}

function saveMode(name, any) {
  let i = $(`.mode_${name}`).attr('id');
  let l = window.location.toString();
  let v = {
    element:i,
    scroll:document.scrollingElement.scrollTop,
    height:document.scrollingElement.clientHeight,
    location:(any ? '*' : l)
  };

  sessionStorage.setItem(`__LAST_MODE_${name}`, JSON.stringify(v));
}

function restoreMode(name, reset) {
  if (parent != window) return;
  let cl = `mode_${name}`;
  let v = JSON.parse(sessionStorage.getItem(`__LAST_MODE_${name}`));
  let u = window.location.toString();

  if (!v) return;

  if (v.location == u || v.location == '*') {
    let $el = $('#'+v.element);
    if ($el.length) {
      $el.addClass(cl);
      document.body.classList.add(name);
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
      document.body.classList.add(cl);
      document.body.classList.add(name);
    }
  }

  if (reset) sessionStorage.removeItem(`__LAST_MODE_${name}`);
  window.dispatchEvent(new Event('resize'));
}

function saveCurrentContentPath() {
  let v = R3E.context.getCurrentResourcePath();
  sessionStorage.setItem('__CURRENT_CONTENT_PATH', v);
}

function storeDocumentHTML(ctx, doc, dest) {
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
        let el = evt.source.frameElement;
        if (el && el['popupCB']) {
          document.body.classList.remove('mode_popup-visible');
          el.popupCB(evt.data);
          delete el['popupCB'];
          el.remove();
        }
      },0);
    }
  });

/*
 * data-mode_sel="sel" data-mode="edit"
 */

  $(document).on('click', '.act_mode-toggle', function(evt) {
    let sv = evt.target.dataset['mode_save'];
    let nm = evt.target.dataset['mode_sel'];
    let cn = evt.target.dataset['mode'];
    let cl = 'mode_'+cn;
    let el = document.getElementById(nm);

    if (el) {
      if (el.classList.contains(cl)) {
        if (evt.target.tagName == 'TEXTAREA') return;

        el.classList.remove(cl);
        document.body.classList.remove(cn);
        clearMode(cn);
      }
      else {
        el.classList.add(cl);
        document.body.classList.add(cn);
        if (sv) saveMode(cn);
      }
    }
    else {
      if (document.body.classList.contains(cl)) {
        document.body.classList.remove(cl);
        document.body.classList.remove(cn);
        clearMode(cn);
      }
      else {
        document.body.classList.add(cl);
        document.body.classList.add(cn);
        if (sv) saveMode(cn);
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
    if (!item_ref && evt.target.form) {
      let data = handler.parseFormElement(evt.target.form);
      if (data) item_ref = data.formData;
    }

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
    let save = $el.data('mode_save');
    let $form = $el.parents('form');
    let $main = main?$(main):null;

    if (!path && href) path = href;

    popupPath(0, path, function(item) {
      if (!item) return;
      if (save) saveMode(save);
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
    let save = $el.data('mode_save');
    let $main = $(main);

    if (!$main || $main.length == 0) $main = $el.parents('form');
    if (!path && href) path = href;
    if (!path) path = $main.find("input[name=':forward']").val();

    if (save) saveMode(save);
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

  $(document).on('change', '.act_form-submit', function(evt) {
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
