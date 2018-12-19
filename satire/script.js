$(document).ready(function() {
  $('.gif').each(function(){
    var $this = $(this);
    var src = $this.attr('src');
    $this.attr('src','');

    setTimeout(function(){
      $this.attr('src',src);
    }, 50)
    
  })
})


// toggle gif + button change
$('#toggle').on('click', function() {
  $('.gif').toggleClass('inv');
  $('.gif').toggleClass('vis');

  var btnsrc = $('.btn:not(.hide)').attr('src');
  var newsrc;
  if (btnsrc.includes('red')) newsrc = "blue";
  else newsrc = "red";

  if(btnsrc.includes('down')) newsrc += "_down";
  else newsrc += "_up";

  $('.btn:not(.hide)').addClass('hide');
  $('.btn[src="'+newsrc+'.png"]').removeClass('hide');

  console.log('.btn[src="'+newsrc+'.png"]');
});

// toggle button down
$('#toggle').on('mousedown', function() {
  var src = $('.btn:not(.hide)').attr('src').replace('_up','_down');
  $('.btn:not(.hide)').addClass('hide');
  $('.btn[src="'+src+'"]').removeClass('hide');
});

// toggle button up
$('body').on('mouseup mouseleave', function() {
  var src = $('.btn:not(.hide)').attr('src').replace('_down','_up');
  $('.btn:not(.hide)').addClass('hide');
  $('.btn[src="'+src+'"]').removeClass('hide');
});