console.log("JS loaded");

function validatePassword(pw) {
  if (pw.length < 8) return "Password must be at least 8 characters.";
  if (!/\d/.test(pw)) return "Password must include at least one number.";
  if (!/[^A-Za-z0-9]/.test(pw)) return "Password must include at least one special character.";
  return "";
}

$("form[name=signup_form]").submit(function(e) {
  e.preventDefault();
  var $form  = $(this);
  var $error = $form.find(".error");
  var data   = $form.serialize();

  var pw    = $form.find("input[name=password]").val();
  var pwMsg = validatePassword(pw);
  if (pwMsg) {
    $error.text(pwMsg).removeClass("error--hidden");
    return;
  }

  $.ajax({
    url:      "/user/signup",
    type:     "POST",
    data:     data,
    dataType: "json",
    success: function(resp) {
      window.location.href = "/dashboard/";
    },
    error: function(resp) {
      console.log("ERROR", resp);
      $error.text(resp.responseJSON.error).removeClass("error--hidden");
    }
  });
});

$("form[name=login_form]").submit(function(e) {
  e.preventDefault();
  var $form  = $(this);
  var $error = $form.find(".error");
  var data   = $form.serialize();

  $.ajax({
    url:      "/user/login",
    type:     "POST",
    data:     data,
    dataType: "json",
    success: function(resp) {
      window.location.href = "/dashboard/";
    },
    error: function(resp) {
      console.log("ERROR", resp);
      $error.text(resp.responseJSON.error).removeClass("error--hidden");
    }
  });
});