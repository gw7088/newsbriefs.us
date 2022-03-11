/**
 * Event handelers that call certain methods when certain assets
 * are clicked or certain events are complete
 */
function initHandlers(){

    socket
        .on('user registered',userRegistered)
    ;

    // What happens when submit is clicked.
    $('.submit').click(onSubmitClicked);
    // Updates timer on page. Time till next day.
    updateTime();
}

/**
 * Function for counting down time on page
 */
function updateTime(){
    // Set the date we're counting down to
    var today = new Date();
    var countDownDate = new Date(today);
    countDownDate.setDate(countDownDate.getDate() + 1);
    countDownDate.setHours(0,0,0,0,);

    // Update the count down every 1 second
    var x = setInterval(function() {

        // Get today's date and time
        var now = new Date().getTime();
        
        // Find the distance between now and the count down date
        var distance = countDownDate - now;
        
        // Time calculations for days, hours, minutes and seconds
        // var days = Math.floor(distance / (1000 * 60 * 60 * 24));
        var hours = Math.floor((distance % (1000 * 60 * 60 * 24)) / (1000 * 60 * 60));
        var minutes = Math.floor((distance % (1000 * 60 * 60)) / (1000 * 60));
        var seconds = Math.floor((distance % (1000 * 60)) / 1000);
        
        // Output the result in an element with id="time"
        //- document.getElementById("time").innerHTML = days + "d  " + hours + "h  "
        //- + minutes + "m  " + seconds + "s  ";
        document.getElementById("time").innerHTML = hours + "h  "
        + minutes + "m  " + seconds + "s  ";

        
        // If the count down is over, write some text 
        if (distance < 0) {
        clearInterval(x);
        document.getElementById("time").innerHTML = "EXPIRED";
        }
        if(!$(".timeBox").is(":visible")) $('.timeBox').show();
        // Conditionally remove element if it exists..
        if($('.sp-brand-link').length) $('.sp-brand-link').html('');
        if($('.sp-show').length)
            on();
        else
            off();
    }, 1000);
}


/**
 * Logic depending on action of registering user
 */
function userRegistered(data){
    // console.log('user registered');
    // console.log(data);

    if(data.success){
        return showToastAlert('Successfully Registered');
    }
    else{
        var msg = data.message
        return showToastError(msg);
    }
}


/**
 * Logic what to do once submit is clicked
 */
function onSubmitClicked(){
    // -----> Fill data with user information
    var data = {
        email:$('.emailField').val(),
        phone:$('.phoneField').val(),
        valid:false
    }
    $('.form-enter .agreeCheckbox').each( function(){
        var isChecked = $(this).prop('checked');
        var parameter = $(this).attr('data-parameter');
        // console.log('isChecked');
        // console.log(isChecked);
        // console.log('parameter');
        // console.log(parameter);
        if(!parameter) return; // Throw error
        data[parameter] = isChecked;
    });


    // -----> Check for Valid Email...
    if(!validateEmail(data.email)) return showToastError('Invalid Email');
    // -----> Check for Valid Phone
    // if(data.phone == '') return showToastError('Invalid Phone');
    // -----> Check for Checked checkbox
    if(!data.valid) return showToastError('Answer : Are you 18+ ?');

    // console.log(data);
    socket.emit('register user',data);
}

/**
 * Validates email with regex
 * @param {*} input 
 */
function validateEmail(input) {
    var validRegex = /^[a-zA-Z0-9.!#$%&'*+/=?^_`{|}~-]+@[a-zA-Z0-9-]+(?:\.[a-zA-Z0-9-]+)*$/;
    if(input.match(validRegex)) 
        return true;
    else
        return false;
  }


/**
 * All the page requirements that need to be loaded from the start
 */
function init(){
    initHandlers();
}

/**
 * Setup everything on page loaded
 */
$(document).ready(function(){
     init();
});