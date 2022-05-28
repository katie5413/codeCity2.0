document.addEventListener('DOMContentLoaded', function () {
    const colors = [
        { name: 'primary', color: '#25aae1' },
        { name: 'primary-light', color: '#d0f2f4' },
        { name: 'primary-dark', color: '#056399' },
        { name: 'secondary', color: '#ab4ff7' },
        { name: 'secondary-dark', color: '#6e20ae' },
        { name: 'success', color: '#67B8A0' },
        { name: 'success-light', color: '#cdf0df' },
        { name: 'success-dark', color: '#33935e' },
        { name: 'alert', color: '#fc5c81' },
        { name: 'alert-light', color: '#f7eae7' },
        { name: 'alert-dark', color: '#d5355a' },
        { name: 'black', color: '#333' },
        { name: 'grey1', color: '#666' },
        { name: 'grey2', color: '#909090' },
        { name: 'grey3', color: '#ccc' },
        { name: 'grey4', color: '#e9e9e9' },
        { name: 'grey5', color: '#f6f7f5' },
    ];
    // Handler when the DOM is fully loaded
    for (let i = 0; i < colors.length; i++) {
        $('#colorArea').append(
            generateColorItem({
                name: colors[i].name,
                color: colors[i].color,
            }),
        );
    }
});

function generateColorItem(props) {
    const colorItemTemplate = `<div class="colorItem">
    <div class="color" style="background-color:{{color}}"></div>
    <div class="text">
    <p>{{name}}</p>
<p class="small">{{color}}</p>
    </div>
</div>`;

    return generateHtml(colorItemTemplate, {
        ...props,
    });
}
