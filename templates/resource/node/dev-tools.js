let el = document.createElement('div');
el.style.position = 'fixed';
el.style.top = '0';
el.style.right = '10px';
el.style.border = '1px solid black';
el.style.backgroundColor = 'gray';

let rbut = document.createElement('div');
rbut.innerHTML = 'R';
rbut.addEventListener('click', function() {
  let u = window.location.toString().replace(/.@.*$/, '');
  window.open(u+'.@res-list');
});

let tbut = document.createElement('div');
tbut.innerHTML = 'T';
tbut.addEventListener('click', function() {
  let u = window.location.toString().replace(/.@.*$/, '');
  window.open(u+'.@res-renderer');
});

let dbut = document.createElement('div');
dbut.innerHTML = 'D';
dbut.addEventListener('click', function() {
  let u = window.location.toString().replace(/.@.*$/, '');
  window.open(u+'.@dump');
});

let xbut = document.createElement('div');
xbut.innerHTML = 'X';
xbut.addEventListener('click', function() {
  showTraceMarkers(document.body.childNodes);
});

el.appendChild(rbut);
el.appendChild(tbut);
el.appendChild(dbut);
el.appendChild(xbut);

document.body.appendChild(el);

window.addEventListener("storage", function(evt) {
  if (evt.key == '_res_ui_content_change_') {
    setTimeout(function() {
      window.location.reload();
    }, 500);
  }
});

function showTraceMarkers(ls) {
  for (let i = 0; i < ls.length; i++) {
    let node = ls[i];
    if (node.nodeType == 8) {
      let val = node.nodeValue;
      let el = document.createElement('div');
      el.style.backgroundColor = 'yellow';
      el.innerHTML = val;
      node.parentNode.replaceChild(el, node);
    }
    else {
      showTraceMarkers(node.childNodes);
    }
  }
}
