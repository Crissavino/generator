const Handlebars = require('handlebars');

Handlebars.registerHelper('json', function (content) {
    return JSON.stringify(content);
});

Handlebars.registerHelper('isEqual', function(arg1, arg2, options) {
    return (arg1 === arg2) ? options.fn(this) : options.inverse(this);
});

Handlebars.registerHelper('isNotEqual', function(arg1, arg2, options) {
    return (arg1 !== arg2) ? options.fn(this) : options.inverse(this);
});