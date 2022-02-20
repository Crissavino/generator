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

// register a helper to know if an attribute exist in the document
Handlebars.registerHelper('hasAttr', function(attr, options) {
    if (this[attr]) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

// register a helper to know if an attribute not exist in the document
Handlebars.registerHelper('hasNotAttr', function(attr, options) {
    if (!this[attr]) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

// check if value is empty
Handlebars.registerHelper('isEmpty', function(value, options) {
    if (value === undefined || value === null || value === '') {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});

// check if value is not empty
Handlebars.registerHelper('isNotEmpty', function(value, options) {
    if (value !== undefined && value !== null && value !== '') {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});



// check if value not exist in document
Handlebars.registerHelper('hasNotValue', function(value, options) {
    if (!this[value]) {
        return options.fn(this);
    } else {
        return options.inverse(this);
    }
});
