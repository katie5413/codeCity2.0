$(document).on('click', '#classCodeArea .dropBox .option', function () {
    let classID = $(this).attr('value');
    sessionStorage.setItem('classID', classID);
});
