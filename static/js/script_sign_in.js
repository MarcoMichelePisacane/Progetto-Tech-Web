//We use Jquery to verify the event marked by the submit
$("form[name=signup_form]").submit(function(e){

    var $form = $(this);
    var $error = $form.find(".error");
    var data = $form.serialize();

    //Ajax request with which we activate the routine in the app. If it does not give an error you are redirected to the homepage otherwise the error message is shown
    $.ajax({
        url: "/sign_in",
        type: "POST",
        data: data,
        dataType: "json",
        success: function(resp){
            window.location.href = "/";
        },
        error: function(resp){
            $error.text(resp.responseJSON.error).removeClass("error--hidden");
        }
    })
    e.preventDefault();
});