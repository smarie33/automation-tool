// MANIPULATE DATA FROM index.js, MAKE IT SIZEABLE CHUCKS THAT THE API CAN RETURN

const fs = require('fs');
const path = require('path');
const fileName = '../data/db.json';
const data = require(path.resolve(__dirname,fileName));
const CsvReadableStream = require('csv-reader');
const BoxSDK = require('box-node-sdk');

async function checkTokenLife(token){
  //link to file in dropbox account to make sure token is relative
  let sharedBoxFile = "https://sm01.box.com/s/tlpwtltoog4zeuj8e14xcd1f6vjki45j";
  let client = BoxSDK.getBasicClient(token);
  return new Promise((resolve, reject) => {
    client.sharedItems.get(
      sharedBoxFile,
      null,
      {fields: 'type,id,extension'},
    ).then(file => {
      resolve(true);
    }).catch(error => {
      reject(false);
    })
  }).catch(error => {
    console.log(error);
    return false;
  })
}

async function checkIfLoggedIn(enviornment){

  window.location.href = `https://account.box.com/api/oauth2/authorize?response_type=code&client_id=${enviornment.boxClientId}`;
  // client = BoxSDK.getBasicClient(token);
  // return new Promise((resolve, reject) => {
  //   client.users.get(client.CURRENT_USER_ID)
  //   .then(currentUser => { console.log(currentUser); resolve(true); })
  //   .catch(error => { console.log(error); reject('Token has expired. Cannot retrieve user'); });
  // })
}


function getDates(rows){
  let newDate = '';
  let dates = new Array();
  rows.map((row) => {
    if(row[1] !== newDate){
      dates.push(row[1]);
      newDate = row[1]
    }
  });
  return dates;
}

function getDedicateds(rows){
  let onlyded = new Array();
  rows.map((row) => {
    if(row[7] != undefined){
      if(!Number.isInteger(row[7])){
        if(row[7].toLowerCase() == 'all'){
          onlyded.push(row);
        }
      }
    }
  });
  return onlyded;
}

function firstDate(rows){
  let theseDates = new Array();
  let fd = '';
  rows.map((row) => {
    if(row[1] != undefined){
      if(fd != '' && row[1] != fd){
        return theseDates;
      }
      if(Number.isInteger(row[7])){
        if(fd == '' || fd == row[1]){
          theseDates.push(row);
          if(fd == ''){
            fd = row[1];
          }
        }
      }else if(row[7].toLowerCase() != 'all'){
        if(fd == '' || fd == row[1]){
          theseDates.push(row);
          if(fd == ''){
            fd = row[1];
          }
        }
      }
    }
  })
  return theseDates;
}

function getContentAtDate(rows, month, day, year){
  let theseDates = new Array();
  rows.map((row) => {
    if(row[1] != undefined && row[7] != undefined){
      let dates = row[1].split('/');
      if(month != '' && day != '' && year != ''){
        if(dates[0] == month && dates[1] == day && dates[2] == year){
        //  console.log(row);
          if(Number.isInteger(row[7])){
            theseDates.push(row);
          }else if(row[7].toLowerCase() != 'all'){
            theseDates.push(row);
          }
        }
      }else if(month != '' && day != ''){
        if(dates[0] == month && dates[1] == day){
          if(Number.isInteger(row[7])){
            theseDates.push(row);
          }else if(row[7].toLowerCase() != 'all'){
            theseDates.push(row);
          }
        }
      }else{
        if(dates[0] == month){
          if(Number.isInteger(row[7])){
            theseDates.push(row);
          }else if(row[7].toLowerCase() != 'all'){
            theseDates.push(row);
          }
        }
      }
    }
  });
  return theseDates;
}

function getTitles(title,rows){
  let tabs = new Array();
  rows.map((row) => {
    if('title' in row.properties){
      tabs.push(row.properties.title);
    }
  });
  return {'sheetTitle': title,'tabTitles': tabs};
}

function checkForZeros(number){
  return (number[0] == 0) ? number.slice(1) : number;
}

function getAllZips(){
  let arr = [];
  let files = fs.readdirSync(path.join(__dirname, `../public/${data.defaults.savedzips}/`));

  files.forEach(file => {
    if(file.charAt(0) != '.'){
      arr.push(file);
    }
  });
  return arr;
}

function getAllZipsNames(){
  let arr = [];
  let files = fs.readdirSync(path.join(__dirname, `../public/${data.defaults.savedzips}/`));

  files.forEach(file => {
    if(file.charAt(0) != '.'){
      let nameOnly = file.split('.')
      arr.push(nameOnly[0]);
    }
  });
  return arr;
}

function getThisZip(n){
  let files = fs.readdirSync(path.join(__dirname, `../public/${data.defaults.savedzips}/`));
  let aname = '';
  files.forEach(file => {
    if(file.charAt(0) != '.'){
      let nameOnly = file.split('.')
      if(n.toLowerCase() == nameOnly[0].toLowerCase()){
        aname = [nameOnly[0]];
      }
    }
  });

  return aname;
}

function getAllCsvNames(){
  let arr = [];
  let files = fs.readdirSync(path.join(__dirname, `../public/${data.defaults.storecsvs}/`));

  files.forEach(file => {
    if(file.charAt(0) != '.'){
      let nameOnly = file.split('.')
      arr.push(nameOnly[0]);
    }
  });
  return arr;
}

function getAllCsvs(){
  let arr = [];
  let files = fs.readdirSync(path.join(__dirname, `../public/${data.defaults.storecsvs}/`));

  files.forEach(file => {
    if(file.charAt(0) != '.'){
      arr.push(file);
    }
  });
  return arr;
}


function getThisCsv(n){
  let files = fs.readdirSync(path.join(__dirname, `../public/${data.defaults.storecsvs}/`));
  let aname = '';
  files.forEach(file => {
    if(file.charAt(0) != '.'){
      let nameOnly = file.split('.')
      if(n.toLowerCase() == nameOnly[0].toLowerCase()){
        aname = [nameOnly[0]];
      }
    }
  });

  return aname;
}

async function runCSVFunctions(name){
  return await new Promise(function(resolve, reject) {
    const AutoDetectDecoderStream = require('autodetect-decoder-stream');
    let allRows = [];
    let inputStream = fs.createReadStream(path.join(__dirname, `../public/${data.defaults.storecsvs}/${name}.csv`))
    .pipe(new AutoDetectDecoderStream({ defaultEncoding: 'utf8' })); // If failed to guess encoding, default to 1255

      inputStream
        .pipe(new CsvReadableStream({ parseNumbers: true, parseBooleans: true, trim: true }))
        .on('data', function (row) {
            allRows.push(row);
        }).on('end', function () {
          resolve(allRows);
        });
    });
}

function returnEnvnJson(){
  const data = fs.readFileSync(path.join(__dirname, `../data/enviornment.json`), {encoding:'utf8'});
  return JSON.parse(data);
}

function getTrelloInfo(name){
  //return 'NodeJS File Upload Success!';
  // return new Promise((resolve, reject) => {
  //   fs.readFileSync(`${process.cwd()}/trello/${name}.json`, 'utf8', (err, jsonString) => {
  //     if (err) {
  //       reject("Error reading file from disk:"+err);
  //     }
  //     //res.send(req.params.id);
  //     const obj = JSON.parse(jsonString);
  //     //res.send(obj);
  //     resolve('NodeJS File Upload Success!');
  //   })
  // })

  const data = fs.readFileSync(path.join(__dirname, `../public/trello/${name}.json`), {encoding:'utf8'});
  const parsed = JSON.parse(data);
  let lists = [];

  Object.entries(parsed.lists).forEach(([key, value]) => {
    let newObj = {
      id: value.id,
      name: value.name,
      cards: []
    }
    lists.push(newObj);
  })

  Object.entries(parsed.cards).forEach(([key, value]) => {
    Object.entries(lists).forEach(([xkey, xvalue]) => {
      if(value.idList == xvalue.id){
        xvalue.cards.push(value.name);
        if(value.desc != ''){
          xvalue.cards.push(value.desc);
        }
      }
    })
  })

  let allcards = '';

  lists.forEach(list => {
    allcards += '<h3>'+list.name+'</h3>';
    allcards += '<ul>';
    list.cards.forEach(card => {
      if(card.charAt(0) == '-'){
        allcards += '<ul style="list-style-type: none;">';
        let diffRows = card.split('\n');
        diffRows.forEach(row => {
          allcards += '<li>'+row+'</li>';
        })
        allcards += '</ul>';
      }else{
        allcards += '<li>'+card+'</li>';
      }
    })
    allcards += '</ul>';
  })

  return allcards;
}


module.exports = {
  getDates,
  getDedicateds,
  getContentAtDate,
  checkForZeros,
  getTitles,
  getAllZips,
  getAllZipsNames,
  getThisZip,
  getAllCsvNames,
  getAllCsvs,
  getThisCsv,
  runCSVFunctions,
  getTrelloInfo,
  firstDate,
  returnEnvnJson,
  checkTokenLife,
  checkIfLoggedIn
};
