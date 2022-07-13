// change position of sort icon at table's header
function sortPosition() {
    $('.table__container .dataTables_wrapper .dataTables_scroll thead th').each(function () {
        var xPos;
        if ($(this).css('text-align') == 'center') {
            xPos = $(this).width() / 2 + ($(this).text().split('').length / 2) * 14 + 6;
        } else {
            xPos = $(this).text().split('').length * 14 + 6;
        }
        $(this).css('background-position-x', xPos + 'px');
    });
}
