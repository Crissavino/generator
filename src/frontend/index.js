const express = require('express');
const session = require('express-session');
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
require('dotenv').config()

// DB config
const { dbConnection } = require("../database/config");
dbConnection();

// initializations
const app = express();

// settings
app.set('port', process.env.PORT || 4000);
app.set('views', path.join(__dirname, 'views'))
app.engine('.hbs', exphbs.engine({
    defaultLayout: 'main',
    layoutsDir: path.join(app.get('views'), 'layouts'),
    partialsDir: path.join(app.get('views'), 'partials'),
    extname: '.hbs',
    helpers: require('./lib/handlebars')
}));
app.set('view engine', '.hbs');

// middlewares
app.use(session({secret: 'secret!!',saveUninitialized: true, resave: true}));
app.use(morgan('dev'));
// para no enviar ni recibir imagenes
app.use(express.urlencoded({ extended: true }));
// para no enviar ni recibir imagenes
app.use(express.json());

// global variables
app.use((req, res, next) => {

    next();
})

// routes
app.use(require('./routes'));
app.use(require('./routes/nftCreation'));
app.use(require('./routes/authentication'));

// public files
app.use(express.static(path.join(__dirname, 'public')));


// starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});