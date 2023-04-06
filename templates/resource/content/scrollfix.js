function scroll_fix() {
  let h = window.visualViewport.height;
  document.body.style.height = h+'px';

  window.ontouchend = function(evt) {
    if (window.pageYOffset < 5) return;

    window.scrollTo(0, -1);
    setTimeout(function() {
      window.scrollTo(0, -1);
    },50);

    evt.preventDefault();
    evt.stopPropagation();
  };
}

function scroll_unfix() {
  window.scrollTo(0, -1);
  window.ontouchend = null;
  window.onscroll = null;
  document.body.style.height = null;
}

window.visualViewport.addEventListener('resize', function(evt) {
  if (window.visualViewport.height < 200) {
    document.body.classList.add('small');
  }
  else {
    document.body.classList.remove('small');
  }

  if (window.visualViewport.height < window.document.body.clientHeight) {
    window.scrollTo(0, -1);
    setTimeout(function() {
      scroll_fix();
    }, 300);
  }
  else {
    scroll_unfix();
  }

});
