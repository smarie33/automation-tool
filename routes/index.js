const express = require('express');
const bodyParser = require('body-parser');
const http = require('http');
const path = require('path');
const cors = require('cors');
const fs = require('fs');
const readline = require('readline');
const {google} = require('googleapis');
const axios = require('axios').default;
let formidable = require('formidable');
const qs = require('qs');
var createError = require('http-errors');
const BoxSDK = require('box-node-sdk');

const key = require('../data/keys.json');
let dbData = require('../data/db.json');
let enviornment = require('../data/enviornment.json');
const config = require('../data/config.json');
const functions = require('../functions/functions.js');

// Requiring module
const process = require('process');


const {getDates,getDedicateds,getContentAtDate,checkForZeros,getTitles,getTrelloInfo,getAllZips,getAllZipsNames,getThisZip,runCSVFunctions,getAllCsvNames,getThisCsv,getAllCsvs,firstDate,returnEnvnJson,checkTokenLife,checkIfLoggedIn} = require('../functions/interface.js');

const SCOPES = 'https://www.googleapis.com/auth/spreadsheets.readonly';
const SHEET = dbData.defaults.sheet;
const RANGE = dbData.defaults.tab+dbData.defaults.range;

let client;
var router = express.Router()

/* GET home page. */
router.get('/', (req, res) => {
  return res.sendStatus(200)
})

/* GET healthcheck */
router.get('/healthcheck', (req, res) => {
  return res.send('OK')
})

router.get('/how-to', function(req, res){
  res.sendFile(path.join(__dirname, '../public/how-to.html'));
})

router.get('/docs', function(req, res){
  res.sendFile(path.join(__dirname, '../public/docs/index.html'));
})

router.get('/grabtoken', (request, response) =>{
  const authenticationUrl = 'https://api.box.com/oauth2/token';
  let queryCode = request.query.code;

  let accessToken = axios.post(
    authenticationUrl,
    qs.stringify({
      grant_type: 'authorization_code',
      code: queryCode,
      client_id: enviornment.boxClientId,
      client_secret: enviornment.boxClientSeceret
    })
  )
  .then(function(res){
  //  console.log("grabtoken "+res.data.access_token);
    const token = {'token' : res.data.access_token};
    const {boxClientId, boxClientSeceret, redirect} = enviornment;
    const addAuth = {...enviornment, ...token};
    fs.writeFileSync(path.join(__dirname, '../data/enviornment.json'), JSON.stringify(addAuth));
    response.redirect('/');
  });
})

router.get(['/api','/api/:id', '/api/:id/:month','/api/:id/:month/:day','/api/:id/:month/:day/:year'],  async (request, response) =>{
  const skipapi = ['defaults','database'];
  if(skipapi.includes(request.params.id)){
    switch(request.params.id){
      case 'defaults':
        returns = dbData.defaults;
        break;
      case 'database':
        returns = dbData;
        break;
      default:
        returns = dbData;
        break;
    }

    response.send(returns);
    return;
  }

  try {
    const auth = new google.auth.GoogleAuth({
        keyFile: path.resolve(__dirname,'../data/keys.json'), //the key file
        //url to spreadsheets API
        scopes: SCOPES,
    });

    //Auth client Object
    const authClientObject = await auth.getClient();

    //Google sheets instance
    const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

    // spreadsheet id
    const spreadsheetId = SHEET;

    // Get metadata about spreadsheet
    const sheetInfo = await googleSheetsInstance.spreadsheets.get({
        auth,
        spreadsheetId,
    });

    let returns, onlyValues = [], removeTop = [];

    //console.log(dbData.defaults.tab);

    if(dbData.defaults.tab != ''){
      //Read from the spreadsheet
      const readData = await googleSheetsInstance.spreadsheets.values.get({
          auth, //auth object
          spreadsheetId, // spreadsheet id
          range: RANGE, //range of cells to read from.
      })

      if(readData.data.values != undefined){
        onlyValues = readData.data.values;
        removeTop = onlyValues.shift();
      }
    }

    if(request.params.id == 'sheetinfo'){
      returns = getTitles(sheetInfo.data.properties.title, sheetInfo.data.sheets);
      response.send(returns);
      return;
    }

    let times = 0;
    let month = '',day = '',year = '';
    if(request.params.month != undefined){
      month = checkForZeros(request.params.month);
      times++;
    }
    if(request.params.day != undefined){
      day = checkForZeros(request.params.day);
      times++;
    }
    if(request.params.year != undefined){
      year = checkForZeros(request.params.year);
      times++;
    }
    if(onlyValues.length > 0){
      switch (request.params.id){
        case 'titles':
          returns = removeTop;
          break;
        case 'dates':
          if(times > 0){
            returns = getContentAtDate(onlyValues,month,day,year)
          }else{
            returns = getDates(onlyValues)
          }
          break;
        case 'date':
          if(times > 0){
            returns = getContentAtDate(onlyValues,month,day,year)
          }else{
            returns = getDates(onlyValues)
          }
          break;
        case 'dedicateds':
          returns = getDedicateds(onlyValues);
          break;
        default:
          returns = removeTop.concat(onlyValues);
        }
      }

      if(returns == null || returns == undefined || returns.length < 1){
        returns = {'error':'requested information does not exist on this tab'}
      }

    response.send(returns);
  } catch(err) {
    let errors = [];
    if(err.errors == undefined){
      console.log(err);
      errors.push(err);
      errors.push('There is an issue with the api connection. Please check the server logs');
    }else{
      console.log(err.errors);
      errors = err.errors.map((error) => {
        return error.message
      })
    }
    response.send({error: errors});
  }

});

//get csv info
router.get(['/csvinfo','/csvinfo/:id/:type', '/csvinfo/:id/:type/:month','/csvinfo/:id/:type/:month/:day','/csvinfo/:id/:type/:month/:day/:year'],  async (request, response) =>{

  try {
    if(request.params.id == undefined){
      response.send(getAllCsvs());
    }else{
      let getCSVdata = runCSVFunctions(request.params.id);
      getCSVdata.then(function(result){
        let returns, onlyValues = [], removeTop = [];

          onlyValues = result;
          removeTop = result.shift();

        let times = 0;
        let month = '',day = '',year = '';
        if(request.params.month != undefined){
          month = checkForZeros(request.params.month);
          times++;
        }
        if(request.params.day != undefined){
          day = checkForZeros(request.params.day);
          times++;
        }
        if(request.params.year != undefined){
          year = checkForZeros(request.params.year);
          times++;
        }
        if(onlyValues.length > 0){
          switch (request.params.type){
            case 'titles':
              returns = removeTop;
              break;
            case 'dates':
              if(times > 0){
                returns = getContentAtDate(onlyValues,month,day,year)
              }else{
                returns = getDates(onlyValues)
              }
              break;
            case 'date':
              if(times > 0){
                returns = getContentAtDate(onlyValues,month,day,year)
              }else{
                returns = getDates(onlyValues)
              }
              break;
            case 'dedicateds':
              returns = getDedicateds(onlyValues);
              break;
            case 'firstdate':
              returns = firstDate(onlyValues);
              break;
            default:
              returns = removeTop.concat(onlyValues);
            }
          }

          if(returns == null || returns == undefined || returns.length < 1){
            returns = {'error':'requested information does not exist on this tab'}
          }

        response.send(returns);
      })
    }
  } catch(err) {
    let errors;
    if(err == undefined){
      errors = "Unedfined error";
    }else{
      errors = err.errors.map((error) => {
        return error.message
      })
    }
    response.send({error: errors});
  }

});

router.get(['/refresh','/refresh/:id'],  async (request, response) =>{
  try {
    if(request.params.id == undefined){
      response.send("please add a sheet id");
    }else{
      const auth = new google.auth.GoogleAuth({
          keyFile: path.resolve(__dirname,'../data/keys.json'), //the key file
          //url to spreadsheets API
          scopes: SCOPES,
      });

      //Auth client Object
      const authClientObject = await auth.getClient();

      //Google sheets instance
      const googleSheetsInstance = google.sheets({ version: "v4", auth: authClientObject });

      // spreadsheet id
      const spreadsheetId = request.params.id;

      // Get metadata about spreadsheet
      const sheetInfo = await googleSheetsInstance.spreadsheets.get({
          auth,
          spreadsheetId,
      });

      response.send(getTitles(sheetInfo.data.properties.title, sheetInfo.data.sheets));
    }
  } catch(err) {
    let errors;
    console.log(err);
    errors = err.errors.map((error) => {
      return error.message
    })
    response.send({error: errors});
  }

});

router.get(['/checkzips', '/checkzips/:id'],  async (request, response) =>{
  try {
    if(request.params.id == undefined){
      response.send(getAllZips());
    }else{
      //response.send(getTitles(sheetInfo.data.properties.title, sheetInfo.data.sheets));
    }
  } catch(err) {
    let errors;
    errors = err.errors.map((error) => {
      return error.message
    })
    response.send({error: errors});
  }

});

router.get(['/zipnames', '/zipnames/:id'],  async (request, response) =>{
  try {
    if(request.params.id == undefined){
      response.send(getAllZipsNames());
    }else{
      response.send(getThisZip(request.params.id));
    }
  } catch(err) {
    let errors;
    errors = err.errors.map((error) => {
      return error.message
    })
    response.send({error: errors});
  }
});


//get csv names
router.get(['/csvnames', '/csvnames/:id'],  async (request, response) =>{
  try {
    if(request.params.id == undefined){
      response.send(getAllCsvNames());
    }else{
      response.send(getThisCsv(request.params.id));
    }
  } catch(err) {
    let errors;
    if(err == undefined){
      errors = "Unedfined error";
    }else{
      errors = err.errors.map((error) => {
        return error.message
      })
    }
    response.send({error: errors});
  }
});

router.post('/function/:id', (request, response) =>{
  thisFunction = (request.params.id == null) ? {'error':'no function'} : functions[request.params.id](request.body);
  thisFunction.then((res) => response.send(res));
})

//process uploaded csv
router.post("/csv", (req, res) => {
  //Create an instance of the form object
  let form = new formidable.IncomingForm();

  //Process the file upload in Node
  form.parse(req, function (error, fields, file) {
    let filepath = file.fileupload.filepath;
    let newpath = path.join(__dirname, '../public/csv/');
    let sendFile = true;
    let msg;

    let checkFiles = fs.readdirSync(newpath);

    if(checkFiles != null){
      checkFiles.map(async img => {
        if(img.charAt(0) != '.'){
          if(img == file.fileupload.originalFilename){
            msg = {'error': "this file already exists"};
            sendFile = false;
          }
        }
      })
    }

    //Copy the uploaded file to a custom folder
    if(sendFile){
      newpath += file.fileupload.originalFilename;
      fs.renameSync(filepath, newpath);
      msg = {'success': file.fileupload.originalFilename+' uploaded'};
    }
    res.send(msg)
    res.end();

  });
});

router.get(['/zipname', '/zipname/:id'],  async (request, response) =>{
  try {
    if(request.params.id == undefined){
      response.send(getAllZipsNames());
    }else{
      response.send(getThisZip(request.params.id));
    }
  } catch(err) {
    let errors;
    errors = err.errors.map((error) => {
      return error.message
    })
    response.send({error: errors});
  }
});

router.get(['/enviornment', '/enviornment/:id'],  async (request, response) =>{
  try {
    if(request.params.id == undefined){
      response.send(returnEnvnJson());
    }
  } catch(err) {
    let errors;
    console.log(err);
    if(err != undefined && err != null){
      errors = err.errors.map((error) => {
        return error.message
      })
    }else{
      errors[0] = 'unknown error';
    }
    response.send({error: errors});
  }
});



router.get("/trello/:id", async (req, res) => {
  try {
    res.send(getTrelloInfo(req.params.id));
  } catch(err) {
    let errors;
    if(typeof errors == 'object'){
      errors = err.errors.map((error) => {
        return error.message
      })
    }else{
      errors = err;
    }
    res.send({error: errors});
  }
  res.end();
})

router.get("/checkauth", async (req, res) => {
  try {
    const env = JSON.parse(fs.readFileSync(path.join(__dirname, '../data/enviornment.json'), {encoding:'utf8', flag:'r'}));
    if(env.token == undefined){
      res.send({"success": "no auth token"});
      res.end();
    }else{
      let checkLive = checkTokenLife(env.token);
      checkLive.then(isit => {
        if(isit){
          res.send({"success": "live token"});
          res.end();
        }else{
          res.send({"success": "token expired"});
          res.end();
        }
      }).catch(error => {
        console.log(error);
        res.send({"success": "token expired"});
        res.end();
      })
    }
  } catch(err) {
    let errors;
    if(typeof errors == 'object'){
      errors = err.errors.map((error) => {
        return error.message
      })
    }else{
      errors = err;
    }
    res.send({error: errors});
    res.end();
  }
})


module.exports = router
