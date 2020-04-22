$(function(){
    var agent=navigator.userAgent;
    const height=$(window).height();
    
    if(height>=768&&agent.indexOf('iPhone')!=-1) {
        
    } else {
        $('#tab-container').css('bottom', '15px');
        $("#tab-bottom").height(15);
    }
});