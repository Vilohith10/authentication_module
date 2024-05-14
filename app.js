var createError = require('http-errors');
var express = require('express');
var path = require('path');
var cookieParser = require('cookie-parser');
var logger = require('morgan');
var cors = require('cors')
const bodyParser = require('body-parser');
require('dotenv').config();
const swaggerJSDoc = require('swagger-jsdoc');
const swaggerUi = require('swagger-ui-express');

var app = express();

const userInfoRouter = require('./routes/user');
var mangodb=require('./controller/mongo');

app.use('/userInfoRouter',userInfoRouter)

const swaggerDefinition = {
    openapi: '3.0.0',
    info: {
      title: 'TESTING DOCUMENTATION',
      version: '1.0.0',
    },
    servers: [
      {
        url: 'http://localhost:8000',
        description: 'development server',
      } 
   
    ]
  };

  const options = {
    swaggerDefinition,
    // Paths to files containing OpenAPI definitions
    apis: ['./routes/*.js'],
  };
  const swaggerSpec = swaggerJSDoc(options);
  app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

  app.listen(8000, function () {
    console.log('Example app listening on port ' + '8000' + '!')
  })

var app = express();