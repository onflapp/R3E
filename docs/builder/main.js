function drawCanvas() {
  var list = [
    {
      id:'temp_box',
      top: 10,
      left: 10,
      width: 200,
      height: 300
    },
    {
      id:'temp_box',
      top: 20,
      left: 20,
      width: 200,
      height: 300
    }
  ];

  Builder.generateCanvas('x' ,list);
}

$(function() {
  $('#act_add').on('click', function(evt) {
    alert('xxx');
  });

  $('.ui_dragger-item').on('click', function(evt) {
    $('.selected').removeClass('selected');
    $(evt.target).addClass('selected');
  });

  $('#x').dragger({
    useHandle: true,
    onstart:function(el) {
      $('.selected').removeClass('selected');
      return true;
    },
    onresizing:function(el, sz) {
      console.log('resizing:' + sz.width + 'x' + sz.height);
      return true;
    },
    onresized:function() {
      console.log('resized');
      return true;
    },
    ondropped:function() {
      console.log('dropped');
      return true;
    },
    onmoved:function() {
      console.log('moved');
      return true;
    }
  });

  drawCanvas();
});
