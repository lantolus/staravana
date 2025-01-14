$(window).scroll(function() {
    var scroll = $(window).scrollTop();
    if (scroll > 100) 
      $("#drop").addClass("active");
    else if (scroll < 80) 
      $("#drop").removeClass("active");
  });
  
  $("#drop, nav ~ ul li").click(function() {
    $("nav, #drop span").toggleClass("open");
    $("body").toggleClass("hidden");
    $(window).scrollTop(0); //cheating
  });