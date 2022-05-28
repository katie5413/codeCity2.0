const CodeCityExtension = {
    heading: function (text, level) {
        switch (level) {
            case 1:
                return `<div class="markdown-h1">${text}</div>\n`;
            case 2:
                return `<div class="markdown-h2">${text}</div>\n`;
            case 3:
                return `<div class="markdown-h3">${text}</div>\n`;
            case 4:
                return `<div class="markdown-h4">${text}</div>\n`;
            default:
                return `<h${level}>${text}</h${level}>`;
        }
    },
    blockquote: function (quote) {
        return `<div class="introduction"><div class="introduction-content">${quote}</div></div>`;
    },
    image: function (href, title, text) {
        return (
            `<div class="content-img"><img src="${href}" />` +
            (text
                ? `<div class="content-img-content"><small>${text}</small></div>\n</div>\n`
                : '</div>\n')
        );
    },
    link: function (href, title, text) {
        return `<a href="${href}" target="_blank" title="${title}">${text}</a>`;
    },
    paragraph: function (text) {
        const excludeArr = ['<img'];

        for (let i = 0; i < excludeArr.length; ++i)
            if (text.indexOf(excludeArr[i]) !== -1) return text;

        if (text.substring(0, 4) === 'sum~') {
            return `<div class="summary"><div class="summary-text">總結</div>${text.substring(
                4,
            )}</div>`;
        }

        if (text.substring(0, 5) === 'hint~') {
            return `<div class="hint"><div class="hint-text">${text.substring(5)}</div></div>`;
        }
        return '<p>' + text + '</p>\n';
    },
};
