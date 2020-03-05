const bodyParser = require('body-parser');
const morgan = require('morgan');
const express = require('express');
const fileUpload = require('express-fileupload');
const cors = require('cors');
const _ = require('lodash');

const app = express();

app.use(fileUpload({
    createParentPath: true
}));

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({extended: true}));

app.use(cors({
  origin:['http://localhost:8080', 'http://192.168.1.6:8080'],
  methods:['GET', 'PUT', 'POST', 'DELETE', 'OPTIONS'],
  credentials: true // enable set cookie
}));

app.use(require('./routes/gridfs'));

app.use(morgan('dev'));
 
app.get('/', (req, res) => {
    res.send('BACKEND BUCKET WORKS');
});

const port = process.env.PORT || 3000;
app.listen(port, () => 
  console.log(`App is listening on port http://localhost:${port}`)
);
