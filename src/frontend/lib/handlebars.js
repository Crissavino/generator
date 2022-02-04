const Handlebars = require('handlebars');

Handlebars.registerHelper('json', function (content) {
    return JSON.stringify(content);
});