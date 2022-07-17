$('.textNumberLineDot').keyup(function(e) {
    var rule = /[^a-zA-Z_.0-9\s]/;
    var target = $(this);
    check(target, rule);
});

$('.textNumberLine').keyup(function(e) {
    var rule = /[^a-zA-Z_0-9\s]/;
    var target = $(this);
    check(target, rule);     
});

$('.textNumberDash').keyup(function(e) {
    var rule = /[^a-zA-Z-0-9\s]/;
    var target = $(this);
    check(target, rule);     
});

$('.textNumber').keyup(function(e) {
    var rule = /[^a-zA-Z0-9\s]/;
    var target = $(this);
    check(target, rule);   
});

$('.smalltextNumberLine').keyup(function(e) {
    var rule = /[^a-z_0-9\s]/;
    var target = $(this);
    check(target, rule);    
});

$('.number').keyup(function(e) {
    var target = $(this);
    var rule = /[^0-9]/;
    check(target, rule);
});

$('.numberDot').keyup(function(e) {
    var rule = /[^.0-9]/;
    var target = $(this);
    check(target, rule);   
});

$('.numberDash').keyup(function(e) {
    var rule = /[^-0-9]/;
    var target = $(this);
    check(target, rule);   
});

$('.text').keyup(function(e) {
    var rule = /[^a-zA-Z\s]/;
    var target = $(this);
    check(target, rule); 
});

$('.chinese').keyup(function(){
    var target = $(this);
    var rule = /[^\u3400-\u4DBF\u3100-\u312F\u2E80-\u2FDF\u4E00-\u9FFF\uF900-\uFAFF\u02C9\u02CA\u02C7\u02CB\u02D9]/;
    check(target, rule);
});

$('.chineseTextNumber').keyup(function(){
    var target = $(this);
    var rule = /[^\u3400-\u4DBF\u3100-\u312F\u2E80-\u2FDF\u4E00-\u9FFF\uF900-\uFAFF\u02C9\u02CA\u02C7\u02CB\u02D9a-zA-Z0-9\s]/;
    check(target, rule);
});

$('.chineseTextNumberSymbol').keyup(function(){
    var target = $(this);
    var rule = /[^\u3400-\u4DBF\u3100-\u312F\u2E80-\u2FDF\u4E00-\u9FFF\uF900-\uFAFF\u02C9\u02CA\u02C7\u02CB\u02D9a-zA-Z0-9\s]/;
    check(target, rule);
});

$('.zeroOne').keyup(function(e) {
    var target = $(this);
    var rule = /[^0-1]/;
    check(target, rule);
});

function check(target, rule){
    if (!rule.test(target.val())) {
        target.next().text(target.val());
    } else {
        target.val(target.next().text());  
    }
}

$('.checkInput').click(function(){
    var allFill = true;

    $('.input_box').each(function() {
        //check if must fill input has value
        if ($(this).hasClass('must_fill') && $(this).children('input').val().trim() == '') {
            alert('必填！')
            $(this).children('input').focus();
            allFill = false;
            return false;
        }
    });

    if (allFill) {
        alert('all fill');
    }
})