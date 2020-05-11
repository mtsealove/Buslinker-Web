$(function () {
  setMainHeight();
  //setBackgroundColor();
  $(window).resize(setMainHeight);
  /*
  if(isMobile()) {
    $('.nav-link').css('color', 'white');
  }*/

  $('.main').scroll(function (data) {
    var current = $(this).scrollTop();
    var height = $('#contents').height();
    var outer = $('.main').innerHeight();
    const total = height - outer;
    console.log(total);
    const percent = (current / total) * 100;
    $("#indicator").css('width', percent + '%');
    console.log(percent);
    //setBackgroundColor();
    
  })
  
  $('#nav-main').css('background-color', 'transparent');
  $('.nav-link').css('color', '#001f46');
  $('.logo-txt').css('color', 'white');
  // /setBackgroundColor();
});

function setMainHeight() {
  var height = $(window).height();
  // height -= 62;
  $('.main').css('height', height);
}

function isMobile() {
  var filter = "win16|win32|win64|mac|macintel";
  if (navigator.platform) {
    if (filter.indexOf(navigator.platform.toLowerCase()) < 0) {
      return true;
    }
    else {
      return false;
    }
  } else {
    return false;
  }

}

function rgba2hex(orig) {
  var a, isPercent,
    rgb = orig.replace(/\s/g, '').match(/^rgba?\((\d+),(\d+),(\d+),?([^,\s)]+)?/i),
    alpha = (rgb && rgb[4] || "").trim(),
    hex = rgb ?
      (rgb[1] | 1 << 8).toString(16).slice(1) +
      (rgb[2] | 1 << 8).toString(16).slice(1) +
      (rgb[3] | 1 << 8).toString(16).slice(1) : orig;

  if (alpha !== "") {
    a = alpha;
  } else {
    a = 01;
  }
  // multiply before convert to HEX
  a = ((a * 255) | 1 << 8).toString(16).slice(1)
  hex = hex + a;

  return hex;
}