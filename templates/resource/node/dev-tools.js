let el = document.createElement('div');
el.style.position = 'fixed';
el.style.top = '0';
el.style.right = '10px';
el.style.border = '1px solid black';
el.style.backgroundColor = 'gray';

let rbut = document.createElement('div');
rbut.innerHTML = 'E';
rbut.addEventListener('click', function() {
  let u = window.location.toString();
  window.open(u+'.@res-list');
});

let dbut = document.createElement('div');
dbut.innerHTML = 'D';
dbut.addEventListener('click', function() {
  let u = window.location.toString();
  window.open(u+'.@dump');
});

el.appendChild(dbut);
el.appendChild(rbut);

document.body.appendChild(el);
