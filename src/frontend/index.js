const express = require('express');
const redis   = require("redis");
const session = require('express-session');
let RedisStore = require("connect-redis")(session)
const morgan = require('morgan');
const exphbs = require('express-handlebars');
const path = require('path');
const basePath = process.cwd();
const publicPathForLayers = basePath + '/public';
const reactFrontendApp = basePath + '/frontend';

require('dotenv').config()

const app = express()

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
let redisClient = redis.createClient({ legacyMode: true })
redisClient.connect().catch(console.error)
app.use(session({
    secret: 'secret!!',
    // create new redis store.
    store: new RedisStore({ host: 'localhost', port: 6379, client: redisClient,ttl :  260}),
    saveUninitialized: true,
    resave: false
}));
// app.use(session({secret: 'secret!!',saveUninitialized: true, resave: true}));
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
app.use(require('./routes/user'));

// public files
app.use(express.static(path.join(__dirname, 'public')));
app.use(express.static(publicPathForLayers));
app.use(express.static(reactFrontendApp));
app.use(express.static(path.join(reactFrontendApp, 'build')));

// DB config
const { dbConnection } = require("../database/config");
const fs = require("fs");
dbConnection();

// starting the server
app.listen(app.get('port'), () => {
    console.log('Server on port', app.get('port'));
});
