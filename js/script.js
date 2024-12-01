$(document).ready(function () {
  $(".enroll-button").click(function () {
    $("#overlay").fadeIn();
  });

  $("#overlay").click(function () {
    $(this).fadeOut();
  });
});
