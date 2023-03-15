//FRONT END FUNCTIONS, RECIEVE DATA FROM functions.js

//CONSTANTS
const DEDICATEDS = [1,2,3,10];
const DAYPARTS = [3,5,8,9,10,11];
const DAYPARTCOLORS = ['gray','yellow','green','blue','purple'];

//GLOBALS
let isCSV = false;
let currentCSV = '';
let theCroppening;
let hasBeeninitialized = false;
let curCrop;
let enviornment = {};
let dbinfo = {};

// UTILITIES
  customAjax = (url, method, data) => {
  return new Promise(function(resolve, reject) {
    let request = new XMLHttpRequest();
    request.responseType = 'json';
    request.onreadystatechange = function() {
      if (request.readyState === XMLHttpRequest.DONE) {
        if (request.status === 200) {
          resolve(request.response);
        } else {
          reject(Error(request.status));
        }
      }
    };
    request.onerror = function() {
      reject(Error("Network Error"));
    };
    request.open(method, url, true);
    request.setRequestHeader('Content-Type', 'application/json;charset=UTF-8')
    request.send(JSON.stringify(data));
  });
}

function getEnviornment(){
  customAjax("/enviornment/", 'GET').then(function(results) {
    if(results.error == undefined){
      enviornment = results;
      //console.log(enviornment);
      checkBoxLogin();
    }else{
      message('error',results.error);
      removeLoading('body');
    }
  })
}


function htmlEntities(str) {
  var s1 = String(str).replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');
  return specialCharacters(s1);
}

function specialCharacters(s) {
  if(!specialCharacters.translate_re) specialCharacters.translate_re = /[ÅåÀàÁáÂâÃãÄäÇçÉéÈèÊêËëÏïÍíÌìÎîÑñÒòÓóÔôÕõÖöÙùÛûÜüÚúØø•–]/g;
  var translate = {
    "Å":"&Aring;",
    "å":"&aring;",
    "À":"&Agrave;",
    "à":"&agrave;",
    "Á":"&Aacute;",
    "á":"&aacute;",
    "Â":"&Acirc;",
    "â":"&circ;",
    "Ã":"&Atilde;",
    "ã":"&atilde;",
    "Ä":"&Auml;",
    "ä":"&auml;",
    "Ç":"&Ccedil;",
    "ç":"&ccedil;",
    "É":"&Eacute;",
    "é":"&eacute;",
    "È":"&Egrave;",
    "è":"&egrave;",
    "Ê":"&Ecirc;",
    "ê":"&ecirc;",
    "Ë":"&Euml;",
    "ë":"&euml;",
    "Ï":"&Iuml;",
    "ï":"&iuml;",
    "Í":"&Iacute;",
    "í":"&iacute;",
    "Ì":"&Igrave;",
    "ì":"&igrave;",
    "Î":"&Icirc;",
    "î":"&icirc;",
    "Ñ":"&Ntilde;",
    "ñ":"&ntilde;",
    "Ò":"&Ograve;",
    "ò":"&ograve;",
    "Ó":"&Oacute;",
    "ó":"&oacute;",
    "Ô":"&Ocirc;",
    "ô":"&ocirc;",
    "Õ":"&Otilde;",
    "õ":"&otilde;",
    "Ö":"&Ouml;",
    "ö":"&ouml;",
    "Ù":"&Ugrave;",
    "ù":"&ugrave;",
    "Û":"&Ucirc;",
    "û":"&ucirc;",
    "Ü":"&Uuml;",
    "ü":"&uuml;",
    "Ú":"&Uacute;",
    "ú":"&uacute;",
    "Ø":"&Oslash;",
    "ø":"&oslash;",
    "•":"&bull;",
    "–":"&ndash;"
  };
  return ( s.replace(specialCharacters.translate_re, function(match) {
    return translate[match];
  }) );
}

function inWords(num) {
  var a = ['','one ','two ','three ','four ', 'five ','six ','seven ','eight ','nine ','ten ','eleven ','twelve ','thirteen ','fourteen ','fifteen ','sixteen ','seventeen ','eighteen ','nineteen '];
  var b = ['', '', 'twenty','thirty','forty','fifty', 'sixty','seventy','eighty','ninety'];

    if ((num = num.toString()).length > 9) return 'overflow';
    n = ('000000000' + num).substr(-9).match(/^(\d{2})(\d{2})(\d{2})(\d{1})(\d{2})$/);
    if (!n) return; var str = '';
    str += (n[1] != 0) ? (a[Number(n[1])] || b[n[1][0]] + ' ' + a[n[1][1]]) + 'crore ' : '';
    str += (n[2] != 0) ? (a[Number(n[2])] || b[n[2][0]] + ' ' + a[n[2][1]]) + 'lakh ' : '';
    str += (n[3] != 0) ? (a[Number(n[3])] || b[n[3][0]] + ' ' + a[n[3][1]]) + 'thousand ' : '';
    str += (n[4] != 0) ? (a[Number(n[4])] || b[n[4][0]] + ' ' + a[n[4][1]]) + 'hundred ' : '';
    str += (n[5] != 0) ? ((str != '') ? 'and ' : '') + (a[Number(n[5])] || b[n[5][0]] + ' ' + a[n[5][1]]) : '';
    return str;
}

function div(text, id, classes, data){
  let fullid = '', fullclass = '',texts = '',datas = '';
  if(id != undefined && id.trim() != ''){
    fullid = ` id="${id}"`;
  }
  if(classes != undefined && classes.trim() != ''){
    fullclass = ` class="${classes}"`;
  }
  if(text != undefined && text.trim() != ''){
    texts = text;
  }
  if(typeof data === 'object'){
    datas = ` data-${data.type}="${data.value}"`;
  }
  return `<div${fullid}${fullclass}${datas}>${texts}<div>`;
}

function select(options, id, classes, datas){
  let fullid = '', fullclass = '',optionTags = '',data = '';
  if(id != undefined && id.trim() != ''){
    fullid = ` id="${id}"`;
  }
  if(classes != undefined && classes.trim() != ''){
    fullclass = ` class="${classes}"`;
  }
  if(text != undefined && text.trim() != ''){
    texts = text;
  }
  if(datas != undefined && text.trim() != ''){
    datas = data;
  }
  for (const option of options) {
    optionTags += `<option value="${option}">${option}</option>`;
  }
  return `<select${fullid}${fullclass}${datas}>${optionTags}<select>`;
}


function show(section, prev = false){
  if(prev){
    document.querySelector(section).previousSibling.previousSibling.classList.remove('hide');
  }else{
    document.querySelector(section).classList.remove('hide');
  }
}

function hide(section, prev = false){
  if(prev){
    document.querySelector(section).previousSibling.previousSibling.classList.add('hide');
  }else{
    document.querySelector(section).classList.add('hide');
  }
}

function remove(section){
  document.querySelector(section).remove();
}

function addLoading(section){
  const load = '<div class="loader"><img src="site-images/loader.gif" /></div>';
  document.querySelector(section).insertAdjacentHTML('beforeend',load);
}

function removeLoading(section){
  document.querySelector(section+" .loader").remove();
}

function message(type,msg = []){
  if(Array.isArray(msg)){
    msg.forEach((mg, i) => {
      if (typeof mg === 'object' && !Array.isArray(mg) && mg !== null){
        msg[i] = JSON.stringify(mg, null, 0);
      }
    });

  }

  let display = (Array.isArray(msg)) ? msg.join('<br><br>') : msg;
  document.querySelector('#msg').className = 'hide';
  document.querySelector('#msg').classList.add(type);
  document.querySelector('#msg span').innerHTML = "";
  document.querySelector('#msg span').innerHTML = display;
  show('#msg');
}

function todaysDate(){
  const d = new Date();
  let m = d.getMonth()+1;
  let dt = d.getDate();
  let fullm = (m.toString().length < 2) ? '0'+m.toString() : m;
  letfulld = (dt.toString().length < 2) ? '0'+dt.toString() : dt;
  return d.getFullYear()+'-'+fullm+'-'+d.getDate();
}

function grabTemplate(template, callback){
  var xhr = new XMLHttpRequest();
  xhr.open('GET', 'templates/'+template+'.html', true);
  xhr.onreadystatechange= function() {
    if (this.readyState!==4) return;
    if (this.status!==200) return; // or whatever error handling you want
    if (xhr.readyState == 4) {
      // defensive check
      if (typeof callback === "function") {
          // apply() sets the meaning of "this" in the callback
          callback.apply(xhr);
      }
    }
  };
  xhr.send();
}

const zeroPad = (num, places) => String(num).padStart(places, '0');

function cleanUpFolders(){
  customAjax("/function/cleanUpFolders", 'POST', {}).then(function(results) {
    if(results.success != undefined){
    //  console.log(results.success);
    }
  })
}

function outputDedicated(info){
  let temp = grabTemplate('dedicated',
  // this callback is invoked AFTER the response arrives
    function () {
      let d = info.Date;
      let changeDate = d.split('/');
      changeDate[0] = zeroPad(changeDate[0], 2);
      changeDate[1] = zeroPad(changeDate[1], 2);
      changeDate[2] = changeDate[2].substring(2);
      let newDate = changeDate.join('');
      let dashDate = changeDate.join('-');
      //
      let resp  = this.responseText;
      let a = resp.replace('[DATE DASH]',dashDate);
      let b = a.replace('[NAME 1]',info.Playlist);
      let c = b.replace('[NAME 2]',info.Playlist);
      let e = c.replace('[URI]',info.URI);
      let f = e.replace('[DATE]',newDate);

      let removeSymbols = info.Playlist.replace(/[^A-Za-z0-9$\s!?]/g, '');
      let nameNoSpace = removeSymbols.replace(/\s+/g, '');
      let folderName = 'HPTO_'+nameNoSpace+'_'+newDate;

      let dedName = {'name': folderName};
      let dedCode = {'code': specialCharacters(f)};
      let dedicatedInfo = {...dedName, ...dedCode};

      let code = '<iframe src="https://filtr.sonymusic.com/filtr/'+folderName+'/" width="800" height="235" frameborder="0" scrolling="no"></iframe>';
      let encodedStr = code.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
         return '&#'+i.charCodeAt(0)+';';
      });

      customAjax("/function/output_dedicated_file", 'POST', dedicatedInfo).then(function(results) {
        if(results.success != undefined){
          document.querySelector('.dedicated .dedicated_code .code').insertAdjacentHTML('afterbegin','<pre><code>'+specialCharacters(encodedStr)+'</code></pre>');
          document.querySelector('.dedicated .dedicated_code').classList.remove('hide');
        }
      })

    })
  }

  function checkBoxLogin(){
    if(enviornment.token != undefined){
      customAjax("checkauth/", 'GET').then(function(results) {
          if(results.success != undefined){
            if(results.success == "live token"){
              let newMsg = "Download Current Images";
              newMsg += '<span class="tooltiptext tooltip-top">You are loggedin to box and can bulk download images from a selected HPTO date</span>';
              document.querySelector('button[name="gather_images"]').classList.add("go");
              document.querySelector('button[name="gather_images"]').innerHTML = newMsg;
            }
          }else{
            console.log(results.error);
            if(results.error.code != undefined){
              if(results.error.code == "ENOENT"){
                message('error',"the enviornment file does not exist");
              }else{
                message('error',results.error.code);
              }
            }else{
              message('error',results.error);
            }
          }
        })
    }
  }

cleanUpFolders();
getEnviornment();


customAjax("/api/database/", 'GET').then(function(results) {
    if(results.error == undefined){
      populateDefaults(results);
    }else{
      message('error',results.error);
      removeLoading('body');
      show('.container.defaults');
    }
  })


// DISPLAY FUNCTIONS
function populateDefaults(info){
  dbinfo = info;
  populateSettings(info);
  populateHeader(info);
  updateSheetList(info);
  if(info.defaults.start_type == 'csv'){
    runDefaultCSV();
  }else{
    runDefaultSheet();
    customAjax("/api/titles", 'GET').then(function(results) {
      displayTitles('.dedicated .dcells', results, DEDICATEDS)
      displayTitles('.container.cells .cells', results, DAYPARTS)
    })
  }
  removeLoading('body');
  removeLoading('.choose_sheet');
  removeLoading('.delete_spreedsheet');
  removeLoading('.choose_tab');
  show('.container.defaults');
  show('.choose_tab');
  show('.choose_tab select');
  //show('.choose_tab button');
  show('.choose_sheet select');
  //show('.choose_sheet button');
  show('.delete_spreedsheet select');
  show('.delete_spreedsheet button');
  show('.container.images');
  doAFunction('sendToCropArea',{});
}

function runDefaultCSV(){
  isCSV = true;
  customAjax("/csvinfo/", 'GET').then(function(results) {
    if(results.error == undefined){
      let removeExt = results[0].split('.');
      customAjax("csvinfo/"+removeExt[0]+"/titles", 'GET').then(function(results) {
          displayTitles('.dedicated .dcells', results, DEDICATEDS)
          displayTitles('.container.cells .cells', results, DAYPARTS)
      })
      customAjax("/csvinfo/"+removeExt[0]+"/dates", 'GET').then(function(results) {
        if(results.error == undefined){
          currentCSV = removeExt[0];
          document.querySelector('.csv-checkbox').checked = true;
          show('.csv-info');
          hide('.container.defaults .sheet_info');
          document.querySelector('.container.cells .dates select').innerHTML = '';
          displayDaypartDates(results);
        }else{
          Object.entries(results).map(msg => message(msg[0], msg[1]));
        }
      })
      customAjax("/csvinfo/"+removeExt[0]+"/dedicateds", 'GET').then(function(results) {
        if(results.error == null){
          isCSV = true;
          let saveTitles = document.querySelector('.container.dedicated .dcells .titles').innerHTML;
          document.querySelector('.container.dedicated .dcells').innerHTML = '';
          document.querySelector('.container.dedicated .dcells').insertAdjacentHTML('afterbegin','<div class="titles">'+saveTitles+'</div>');
          displayDedicated(results, DEDICATEDS);
        }else{
          Object.entries(results).map(msg => message(msg[0], msg[1]));
        }
      })
    }else{
      Object.entries(results).map(msg => message(msg[0], msg[1]));
    }
  })
}

function runDefaultSheet(){
  customAjax("/api/dedicateds", 'GET').then(function(results) {
    displayDedicated(results, DEDICATEDS);
    show('.container.dedicated');
  })

  customAjax("/api/sheetinfo/", 'GET').then(function(results) {
    if(results.error == undefined){
      addSheetTabs('.choose_tab select',results.tabTitles);
    }else{
      message('error',results.error);
      removeLoading('body');
      show('.container.defaults');
    }
  })

  customAjax("/api/dates/", 'GET').then(function(results) {
    if(results.error == undefined){
      //displayDaypartDates calls displayDayparts immediately after
      displayDaypartDates(results);
    }else{
      message('error',results.error);
      removeLoading('body');
      show('.container.cells');
    }
  })
}

function populateSettings(info){
  document.querySelector('#popup-settings #'+info.defaults.start_type).checked = true;
  document.querySelector('#popup-settings input[name="sheet"]').value = info.defaults.sheet;
  document.querySelector('#popup-settings input[name="tab"]').value = info.defaults.tab;
  document.querySelector('#popup-settings input[name="range"]').value = info.defaults.range;
  document.querySelector('#popup-settings input[name="default_path"]').value = info.defaults.default_path;
  document.querySelector('#popup-settings input[name="storecsvs"]').value = info.defaults.storecsvs;
  document.querySelector('#popup-settings input[name="imagesfolder"]').value = info.defaults.imagesfolder;
  document.querySelector('#popup-settings input[name="savedzips"]').value = info.defaults.savedzips;
  document.querySelector('#popup-settings input[name="tempfolder"]').value = info.defaults.tempfolder;
  document.querySelector('#popup-settings input[name="newimagesfolder"]').value = info.defaults.newimagesfolder;
  document.querySelector('#popup-settings input[name="outputfiles"]').value = info.defaults.outputfiles;
}

function addSheetTabs(section, rows){
  document.querySelector(section).innerHTML = "";
  if(rows == undefined){
    option = `<option value="">This sheet has no tabs</option>`;
    document.querySelector(section).insertAdjacentHTML('beforeend', option);
  }else{
    rows.map((row) => {
      option = `<option value="${row}">${row}</option>`;
      document.querySelector(section).insertAdjacentHTML('beforeend', option);
    })
  }
}

function populateHeader(info){
  document.querySelector('.sheet_id span').innerHTML = info.defaults.sheet;
  document.querySelector('.sheet_name span').innerHTML = info.defaults.title;
  document.querySelector('.sheet_tab span').innerHTML = info.defaults.tab;
}

function displayTitles(section, row, fields){
  const dedicatedCells = document.querySelector(section);
  //dedicatedCells.insertAdjacentHTML('beforeend',loading);
  let titles = dedicatedCells.insertAdjacentHTML('afterbegin',div('','','titles'));
  fields.map((field) => {
      document.querySelector(section+" .titles").insertAdjacentHTML('beforeend',div(row[field],'',''));
  })
  const newlyCreated = document.querySelectorAll(section+" .titles div");
  for (const div of newlyCreated) {
	  if(div.innerHTML == ''){
      div.remove();
    }
	}
}

function displayDedicated(rows, fields){
  let dataTypes = [];
  customAjax("/api/titles", 'GET').then(function(results) {
    for (const ded of DEDICATEDS) {
      dataTypes.push(results[ded]);
    }
    const dedicatedCells = document.querySelector('.dedicated section.dcells');
    let indx = 0
    if(rows.length > 0){
      for (const dedicated of rows) {
        dedicatedCells.insertAdjacentHTML('beforeend',div('','dedicated_'+indx,'daypart'));
        document.querySelector('#dedicated_'+indx).addEventListener('click',createDedicated);

        let cnt = 1
        for(const field of fields){
          let data = {'type': 'type', 'value': dataTypes[cnt - 1]};
          document.querySelector('#dedicated_'+indx).insertAdjacentHTML('beforeend',div(dedicated[field],'','cell cell_'+cnt,data));
          cnt++;
        }
        indx++;
      }
    }

    const newlyCreated = document.querySelectorAll('.dedicated section.dcells .daypart div');
    for (const div of newlyCreated) {
      if(div.innerHTML == ''){
        div.remove();
      }
    }
    hide('.container.dedicated', true);
  })
}

function ddChangeEvent(evt){
  show('.container.cells .loader');
  document.querySelector('.container.dayparts section.dayparts').innerHTML = '';
  updateDateForm(evt.target.value);
  if(isCSV){
    customAjax("/csvinfo/"+currentCSV+"/date/"+evt.target.value, 'GET').then(function(results) {
      displayDayparts(results, DAYPARTS, DAYPARTCOLORS)
    })
  }else{
    customAjax("/api/date/"+evt.target.value, 'GET').then(function(results) {
      displayDayparts(results, DAYPARTS, DAYPARTCOLORS)
    })
  }
}

function displayDaypartDates(results){
  const selectTags = '.container.cells .dates select';
  const selectTag = document.querySelector(selectTags);
  selectTag.innerHTML = '';
  const optionTags = results.map(option  => `<option value="${option}">${option}</option>`);
  selectTag.insertAdjacentHTML('afterbegin', optionTags.join(''));
  selectTag.removeEventListener('change',ddChangeEvent);
  selectTag.addEventListener('change',ddChangeEvent);
  show(selectTags);
  let firstDate = document.querySelector(selectTags+' option:first-of-type').value;
  updateDateForm(firstDate);
  if(isCSV){
    customAjax("/csvinfo/"+currentCSV+"/firstdate/", 'GET').then(function(results) {
      displayDayparts(results, DAYPARTS, DAYPARTCOLORS)
    })
  }else{
    customAjax("/api/date/"+firstDate, 'GET').then(function(results) {
        displayDayparts(results, DAYPARTS, DAYPARTCOLORS);
    })
  }
}

function displayDayparts(results, fields, colors){
  const daypartCells = document.querySelector('.container.cells .cells');
  daypartCells.innerHTML = '';
  let alldayparts = '';
  let sortedDayparts = [], brokenUpDayparts = [];

  daypartCells.innerHTML = '';
  //console.log(results);

  if(results.error == undefined){
    let time = '';
    for (const part of results) {
      if(time != part[5]){
        if(brokenUpDayparts.length > 0){
          sortedDayparts.push(brokenUpDayparts);
        }
        brokenUpDayparts = [];
        time = part[5];
      }
      brokenUpDayparts.push(part);
    }
    sortedDayparts.push(brokenUpDayparts);
  //  console.log(sortedDayparts);
    let reducedDayparts = [];

    sortedDayparts.map((dayparts, indx) => {
      let reducedDaypart = []
      alldayparts += `<div class="dayparts ${colors[indx]}">`;
      dayparts.map((daypart) => {
        let reducedCells = []
        alldayparts += '<div class="daypart">';
        fields.map((field,indx) => {
          reducedCells.push(daypart[field]);
          alldayparts += `<div class="cell_${indx+1}">`;
          alldayparts += daypart[field];
          alldayparts += '</div>';
        })
        reducedDaypart.push(reducedCells);
        alldayparts += '</div>';
      })
      reducedDayparts.push(reducedDaypart);
      alldayparts += '</div>';
    })
    updateViewArea(reducedDayparts);
  }else{
    message('error',results.error+'. Please choose another date');
  }

  hide('.container.cells .loader');
  daypartCells.insertAdjacentHTML('beforeend',alldayparts);
  show('.container.cells');
}

function updateDateForm(lastdate){
  let parts = lastdate.split('/');
  parts.forEach(function(part, i){
    if(part.length == 1){
      parts[i] = '0'+part;
    }
  })
  document.querySelector('.final-date').value = parts.join('-');
}

function updateSheetList(info){
  document.querySelector('.choose_sheet select').innerHTML = '';
  document.querySelector('.delete_spreedsheet select').innerHTML = '';
  info.googlesheets.map((sheet) => {
    let select = (info.defaults.sheet == sheet.id) ? 'selected' : '';
    option = `<option value="${sheet.id}" ${select}>${sheet.id}</option>`;
    document.querySelector('.choose_sheet select').insertAdjacentHTML('beforeend', option);
    document.querySelector('.delete_spreedsheet select').insertAdjacentHTML('beforeend', option);
  })
  document.querySelector('.choose_tab select').value = info.defaults.tab;
}


// MATCHED BTN FUNCTIONS

let runFunctions = {};

runFunctions.run_sheet = function(info) {
  let encapsulate = {};
  encapsulate.defaults = info;
  populateDefaults(encapsulate);
  //populateHeader(encapsulate);
}

runFunctions.add_sheet = function(info){
  Object.entries(info).map(msg => message(msg[0], msg[1]));
  customAjax("/api/database/", 'GET').then(function(results) {
    if(results.error == undefined){
      document.querySelector('input[name="sheet_id"]').value = '';
      updateSheetList(results);
    }else{
      message('error',results.error);
    }
  })
}

runFunctions.delete_sheet = function(info){
  Object.entries(info).map(msg => message(msg[0], msg[1]));
  customAjax("/api/database/", 'GET').then(function(results) {
    if(results.error == undefined){
      updateSheetList(results);
    }else{
      message('error',results.error);
    }
  })
}

runFunctions.scrape_images = function(info){
  Object.entries(info).map(msg => message(msg[0], msg[1]));
  customAjax("/api/database/", 'GET').then(function(results) {
    if(results.error == undefined){
      updateSheetList(results);
    }else{
      message('error',results.error);
    }
  })
}


runFunctions.output_code = function(info){
  if(info.zip != undefined){
    let html ='<a href="'+info.zip+'" download="'+info.name+'">';
    html += '<button class="green output_txt" name="'+info.name+'">Download All HPTO files</button>';
    document.querySelector('.container.emailcode').insertAdjacentHTML('beforeend',html);
  }else{
    Object.entries(info).map(msg => message(msg[0], msg[1]));
    customAjax("/api/database/", 'GET').then(function(results) {
      if(results.error == undefined){
        updateSheetList(results);
      }else{
        message('error',results.error);
      }
    })
  }
}

runFunctions.reduce_images = function(info){
  let key = Object.keys(info)[0];
  setTimeout(() => {
    var timestamp = new Date().getTime();
    let allImgs = document.querySelectorAll('img.album-thumbnail');

    allImgs.forEach(function(slide){
      let link = slide.src+"?t=" + timestamp;
      slide.src = link;
    })
    message(key,info[key]);
  }, 1000);
}

runFunctions.sendToCropArea = function(info){
  // document.querySelectorAll(".crop .holder img").forEach(function(t){
  //   t.removeEventListener('click', (e) => {
  //     runCropStudio(e);
  //   })
  // })
  document.querySelector(".crop .holder").innerHTML = '';
  let inx = 1;
  info.forEach(function(image){
    let img = `<div class="img-holder"><img id="${inx}" src="${image}"><div class="number">cover ${inx}</div></div>`;
    //let img = '<img id="'+inx+'" src="'+image+'" />';
    document.querySelector(".crop .holder").insertAdjacentHTML('beforeend',img);
    inx++;
  })
  document.querySelectorAll(".crop .holder img").forEach(function(t){
//    console.log('sendToCropArea');
    t.addEventListener('click', (e) => {
    //  console.log(e.target);
      runCropStudio(e);
    })
  })
}

runFunctions.crop_image = function(info){
  if(theCroppening != null && theCroppening != undefined){
    theCroppening.destroy();
  }

  document.querySelector("#popup-crop").classList.add('hide');

  let timestamp = new Date().getTime();
  let el = document.getElementById(info.id);
  let queryString = "?t=" + timestamp;
  el.src = `/${dbinfo.defaults.newimagesfolder}/${info.img}${queryString}`;
}

runFunctions.update_images = function(info){
  update_current_images()
  document.querySelector('button[name="update_images"]').innerHTML = 'Images Updated';
  setTimeout(() => {
    document.querySelector('button[name="update_images"]').innerHTML = 'Update Images';
  }, 5000);

}

runFunctions.create_zip = function(info){
  Object.entries(info).map(msg => message(msg[0], msg[1]));
  document.querySelector('.current_imgs .do_zip input').value = '';
}

runFunctions.open_zip = function(info){
  if(info.files != null){update_current_images(info.files)};
  Object.entries(info).map((msg) => {
    if(msg[0] == 'error'){
      message(msg[0], msg[1]);
    }
  });
}

runFunctions.gather_images = function(info){
  if(info == 'error'){
    let newMsg = "Login to Gather Image";
    newMsg += '<span class="tooltiptext tooltip-top">Login to box to get access to download images</span>';
    document.querySelector('button[name="gather_images"]').classList.remove("go");
    document.querySelector('button[name="gather_images"]').innerHTML = newMsg;
    return;
  }
  if(info.success != null && info.success != undefined){
    let holder = document.querySelector('.current_imgs .crop .holder');
    setTimeout(() => {
      holder.innerHTML = '';
      info.success.forEach(function(link){
        let breakUp = link.split('cover');
        let num = breakUp[1].split('.')[0];
        console.log(num+" "+link);

        let timestamp = new Date().getTime();
        let url = link+"?t=" + timestamp;
        let html = `<div class="img-holder"><div class="number">cover ${num}</div><img id="${num}" src="/${dbinfo.defaults.newimagesfolder}/${url}"></div>`;
        holder.insertAdjacentHTML('beforeend',html);
      })
      document.querySelectorAll(".crop .holder img").forEach(function(t){
        t.addEventListener('click', (e) => {
          runCropStudio(e);
        })
      })
    }, "8000")
  }
}

runFunctions.output_txt = function(info){
  if(info.txt == undefined){
    Object.entries(info).map(msg => message(msg[0], msg[1]));
  }else{
    let oldbtn = document.querySelector('.blue.output_txt');
    oldbtn.parentElement.removeChild(oldbtn);
    let html ='<a href="'+info.txt+'" download="'+info.name+'">';
    html += '<button class="green output_txt" name="'+info.name+'">Download Text File</button>';
    document.querySelector('.container.emailcode').insertAdjacentHTML('beforeend',html);
  }
}


runFunctions.delete_zip = function(info){
  if(info.success != null){
    //console.log(info.success);
    document.querySelector("#"+info.success).parentElement.remove();
  }
  Object.entries(info).map((msg) => {
    if(msg[0] == 'error'){
      message(msg[0], msg[1]);
    }
  });
}

runFunctions.delete_csv = function(info){
  if(info.success != null){
    //console.log(info.success);
    document.querySelector("#"+info.success).parentElement.remove();
  }
  Object.entries(info).map((msg) => {
    if(msg[0] == 'error'){
      message(msg[0], msg[1]);
    }
  });
}


function update_current_images(imgs = []){
  if(imgs.length > 0){
    let images = document.querySelector(".crop .holder");
    images.innerHTML = '';
    let html = '';
    imgs.forEach(function(img,indx){
      indx++;
      let timestamp = new Date().getTime();
      let queryString = "?t=" + timestamp;
      html += `<div class="img-holder"><div class="number">cover ${inx}</div><img id="${inx}" src="/${idbinfo.defaults.newimagesfolder}/${img+queryString}"></div>`;
      //html += '<img id="'+indx+'" src="/'+dbinfo.defaults.newimagesfolder+'/'+img+queryString+'" />';
    })
    images.insertAdjacentHTML('beforeend',html);
    document.querySelectorAll(".crop .holder img").forEach(function(t){
      t.addEventListener('click', (e) => {
      //  console.log(e.target);
        runCropStudio(e);
      })
    })
  }else{
    let images = document.querySelectorAll(".crop .holder img");
    images.forEach(function(image){
      let timestamp = new Date().getTime();
      let el = image;
      let imgURL = el.src;
      let pieces = imgURL.split('/');
      let name = pieces.pop();
      let namePieces = name.split('?');
      let queryString = "?t=" + timestamp;
      el.src = `/${dbinfo.defaults.newimagesfolder}/${namePieces[0]}${queryString}`;
    })
  }
}

// CLICK FUNCTIONS

Object.entries(document.getElementsByTagName("button")).map(( object ) => {
  object[1].addEventListener("click", () => {
    const action = object[1].name;
    const atr = object[1].getAttribute('data');
    let data = (atr == undefined) ? {} : JSON.parse(object[1].getAttribute('data'));
    const t = document.querySelector(`button[name="${action}"]`);

    if(action == 'run_sheet'){
      let sht = document.querySelector('.choose_sheet select').value;
      let ttl = document.querySelector('.choose_sheet select').getAttribute('datatitle');
      let tb = document.querySelector('.choose_tab select').value;
      let rng = document.querySelector('#popup-settings input[name="range"]').value;
      let pth = document.querySelector('#popup-settings input[name="default_path"]').value;
      data = {"sheet": sht, "title": ttl,"tab": tb, "range": rng, "default_path":pth};
    }

    if(action == 'add_sheet'){
      let sht = document.querySelector('input[name="sheet_id"]').value;
      if(sht.trim() == ''){
        message('error',['Please fill out box to add a sheet']);
        return;
      }else{
        data = {'id': sht, 'added': todaysDate()};
      }
    }

    if(action == 'delete_sheet'){
      data = {'id': document.querySelector('.delete_spreedsheet select[name="sheet_id"]').value};
    }

    if(action == 'options_toggle'){
      const options = '.container.options';
      if(document.querySelector(options).classList.contains('hide')){
        show(options);
        t.innerText = "Hide Sheet Options";
      }else{
        hide(options);
        t.innerText = "Show Sheet Options";
      }
      return;
    }

    if(action == 'scrape_images'){
      let images = document.querySelectorAll('.container.cells .dayparts .daypart .cell_4');
      data = Array.from(images).map(img => img.innerText);
      let outputThis = data.join(',');
      copyToClipboard(outputThis);
      window.location.href = 'downloadfromDropBox://com.apple.automator.downloadfromDropBox';
    }

    if(action == 'gather_images'){
      if(document.querySelector('button[name="gather_images"]').classList.contains("go")){
        let images = document.querySelectorAll('.container.cells .dayparts .daypart .cell_4');
        data = Array.from(images).map(img => img.innerText);
        let outputThis = data.join(',');
        data = {
          'links' : outputThis
        }
        let holder = document.querySelector('.current_imgs .crop .holder');
        //theCroppening.destroy();
        document.querySelectorAll(".crop .holder img").forEach(function(t){
          t.removeEventListener('click', (e) => {
            runCropStudio(e);
          })
        })
        holder.innerHTML = '';
        let loading = '<div class="imgs-loading">loading...</div>';
        holder.insertAdjacentHTML('beforeend',loading);
      }else{
        window.location.href = `https://account.box.com/api/oauth2/authorize?response_type=code&client_id=${enviornment.boxClientId}&redirect_uri=${enviornment.redirect}`;
        return;
      }
      // let images = document.querySelectorAll('.container.cells .dayparts .daypart .cell_4');
      // url = Array.from(images).map(img => img.innerText);
      // let urls = url.join(',');
      // data = {
      //   'urls' : urls
      // }
    }

    if(action == 'output_code'){
      outputFullTemplate();
      return;
    }

    if(action == 'output_txt'){
      data = {
        'name' : document.querySelector('.container.emailcode').getAttribute('data-title'),
        'info': document.querySelector('.container.emailcode .iframe').innerHTML
      }
    }

    // if(action == 'crop_image'){
    //   let cropper = document.querySelector("#popup-crop .image-holder .window");
    //   let toCrop = document.querySelector("#popup-crop .image-holder img");
    //   let cropHere;
    //
    //   if(toCrop.classList[0] == 'noCrop'){
    //     return;
    //   }
    //
    //   if(toCrop.classList[0] == 'landscape'){
    //     cropHere = parseInt(cropper.style.left, 10) - parseInt(toCrop.style.left, 10);
    //   }
    //
    //   if(toCrop.classList[0] == 'portrait'){
    //     cropHere = parseInt(cropper.style.top, 10) - parseInt(toCrop.style.top, 10);
    //   }
    //
    //   data = {
    //     'width': toCrop.offsetWidth,
    //     'height': toCrop.offsetHeight,
    //     'type': toCrop.classList[0],
    //     'id': toCrop.getAttribute('data-id'),
    //     'img': toCrop.getAttribute('data-img'),
    //     'crop': cropHere
    //   }
    // }

    if(action == 'create_zip'){
      data = {'name' : document.querySelector('.zip_name').value};
    }

    doAFunction(action,data);

    // customAjax(`/function/${action}`, 'POST', data).then(function(results) {
    //   if(results.error == undefined){
    //     runFunctions[action](results);
    //   }else{
    //     message('error',results.error);
    //   }
    // })

  }) //end of click listener
}) //end of button objects

document.querySelector('.see_zips').addEventListener('click', () => {
  customAjax("/zipnames", 'GET').then(function(results) {
    document.querySelector("#popup-zips .zips-holder").innerHTML = '';
    results.map((zip, indx) => {
      zipHTML = '<div class="zip-holder">';
        zipHTML += '<div id="open-'+indx+'" class="zip" data-name="'+zip+'">Open: '+zip+'</div>';
        zipHTML += '<div id="delete-'+indx+'" class="zip-delete" data-name="'+zip+'">delete</div>';
      zipHTML += '</div>';
      document.querySelector("#popup-zips .zips-holder").insertAdjacentHTML('beforeend',zipHTML);
      document.querySelector(".zip-holder #open-"+indx).addEventListener('click', (e) => {
        doAFunction('open_zip',{'name': e.target.dataset.name});
      })
      document.querySelector(".zip-holder #delete-"+indx).addEventListener('click', (e) => {
        doAFunction('delete_zip',{'name': e.target.dataset.name, 'deleteid': e.target.id});
      })
    })
    show('#popup-zips');
  })
})
document.querySelector('.open_dedicated').addEventListener('click', (e) => {
  let select = '.dedicated .dcells';
  e.preventDefault();
  if(document.querySelector(select).classList.contains('hide')){
    show(select);
    e.target.innerText = 'close';
  }else{
    hide(select);
    e.target.innerText = 'open';
  }
})
document.querySelector('.see_csvs').addEventListener('click', () => {
  customAjax("/csvnames", 'GET').then(function(results) {
    document.querySelector("#popup-csv .csvs-holder").innerHTML = '';
    results.map((csv, indx) => {
      csvHTML = '<div class="csv-holder">';
        csvHTML += '<div id="open-'+indx+'" class="csv" data-name="'+csv+'">Open: '+csv+'</div>';
        csvHTML += '<div id="delete-'+indx+'" class="csv-delete" data-name="'+csv+'">delete</div>';
      csvHTML += '</div>';
      document.querySelector("#popup-csv .csvs-holder").insertAdjacentHTML('beforeend',csvHTML);
      document.querySelector(".csv-holder #open-"+indx).addEventListener('click', (e) => {
        // customAjax("/csvinfo/"+e.target.dataset.name+"/firstdate", 'GET').then(function(results) {
        //   if(results.error == null){
        //     isCSV = true;
        //     currentCSV = e.target.dataset.name;
        //     document.querySelector('.container.cells .cells').innerHTML = '';
        //     displayDayparts(results, DAYPARTS, DAYPARTCOLORS);
        //     hide('#popup-csv');
        //   }else{
        //     Object.entries(results).map(msg => message(msg[0], msg[1]));
        //     hide('#popup-csv');
        //   }
        // })
        customAjax("/csvinfo/"+e.target.dataset.name+"/dedicateds", 'GET').then(function(results) {
          if(results.error == null){
            isCSV = true;
            let saveTitles = document.querySelector('.container.dedicated .dcells .titles').innerHTML;
            document.querySelector('.container.dedicated .dcells').innerHTML = '';
            document.querySelector('.container.dedicated .dcells').insertAdjacentHTML('afterbegin','<div class="titles">'+saveTitles+'</div>');
            displayDedicated(results, DEDICATEDS);
          }else{
            Object.entries(results).map(msg => message(msg[0], msg[1]));
          }
        })
        customAjax("/csvinfo/"+e.target.dataset.name+"/dates", 'GET').then(function(results) {
          if(results.error == null){
            isCSV = true;
            currentCSV = e.target.dataset.name;
            document.querySelector('.container.cells .dates select').innerHTML = '';
            displayDaypartDates(results);
            hide('#popup-csv');
          }else{
            Object.entries(results).map(msg => message(msg[0], msg[1]));
            hide('#popup-csv');
          }
        })

      })

      document.querySelector(".csv-holder #delete-"+indx).addEventListener('click', (e) => {
        doAFunction('delete_cvs',{'name': e.target.dataset.name, 'deleteid': e.target.id});
      })
    })
    show('#popup-csv');
  })
})


document.querySelector('#msg .close').addEventListener('click', () => {
  hide('#msg');
})

document.querySelector('#popup-csv .close').addEventListener('click', () => {
  hide('#popup-csv');
})


document.querySelector('#popup-settings .close').addEventListener('click', () => {
  hide('#popup-settings');
})

document.querySelector('.settings').addEventListener('click', () => {
  show('#popup-settings');
})

document.querySelector('#popup-crop .close').addEventListener('click', () => {
  hide('#popup-crop');
  if(theCroppening != null && theCroppening != undefined){
    theCroppening.destroy();
  }
})
document.querySelector('#popup-zips .close').addEventListener('click', () => {
  hide('#popup-zips');
})

document.querySelector('.current_imgs .do_zip input').addEventListener('keyup', (e) => {
  let rawVal = document.querySelector('.current_imgs .do_zip input').value;
  let val = rawVal.trim();
  customAjax("/zipnames/"+val, 'GET').then(function(results) {
      if(results == null){
        document.querySelector('button[name="create_zip"]').removeAttribute('disabled');
      }else{
        if(val != ''){
          message('error',['This zip already exists']);
        }
        document.querySelector('button[name="create_zip"]').setAttribute('disabled', '');
      }
  })
})


function outputFullTemplate(){
  if(document.querySelector('.final-date').value == ''){
    alert('Please add a date');
    return;
  }

  if(document.querySelector('.iteration').value == ''){
    alert('Please add an iteration');
    return;
  }

  let itr = document.querySelector('.iteration').value;

  let html = '';
  document.querySelector('.container.output .content code').innerHTML = '';

  const allSlides = document.querySelectorAll('section.dayparts .daypart-preview .slide');
  allSlides.forEach(function(slide){
    let slideInfo = slide.outerHTML;
    let brushup = slideInfo.replaceAll(/ style=".*"/gim,'');
    html += brushup;
  })
  let cleanFirst = html.replaceAll(/undefined/gim,'');
  let cleanSecond = cleanFirst.replaceAll('http://localhost/','');
  let clean = cleanSecond.replaceAll(/\?(.*?)\"/gim,'"');

  let iterator = itr.toUpperCase();
  let place = getInterator(iterator);
  if(place == 1){place = ''};

  let temp = grabTemplate('final',
  // ...however, this callback is invoked AFTER the response arrives
  function () {
    let d = document.querySelector('.final-date').value;
    let resp  = this.responseText;
    let q = resp.replace('[date]',d);
    let r = q.replace('[slides]',specialCharacters(clean));
    let encodedStr = r.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
       return '&#'+i.charCodeAt(0)+';';
    });

    let changeDate = d.split('-');
    let newDate = changeDate.join('');

    const c1 = '<pre><code>';
    const c2 = '</code></pre>';
    let code = '';
    let da = document.querySelector('.final-date').value;
    let pos = document.querySelector('.final-date').value;
    let getdatepieces = da.split('-');
    let fileDate = getdatepieces.join('');
    let displaydate = getdatepieces[0]+'/'+getdatepieces[1]+' dayparts';
    const amt = 5;
    let url = 'https://filtr.sonymusic.com/filtr/HPTO_'+fileDate+'_FV';
    let iframe = '<iframe src="'+url+place+'/" width="800" height="235" frameborder="0" scrolling="no"></iframe>';
    let encodedStrEmail = iframe.replace(/[\u00A0-\u9999<>\&]/gim, function(i) {
       return '&#'+i.charCodeAt(0)+';';
    });
    //06-07-2022_dayparts.txt
    code += c1+displaydate+c2;
    code += '<pre><code class="iframe">'+encodedStrEmail+c2;
    code += c1+displaydate+c2;
    for(let i = 1; i <= amt; i++){
      code += c1+url+'_'+iterator+i+'/'+c2;
    }

    document.querySelector('.container.emailcode').setAttribute('data-title', getdatepieces[0]+'-'+getdatepieces[1]+'-'+getdatepieces[2]+'_dayparts');

    document.querySelector('.container.emailcode .code').insertAdjacentHTML('afterbegin',code );
    show('.container.emailcode');

    document.querySelector('.container.output .content code').insertAdjacentHTML('afterbegin',specialCharacters(encodedStr));
    show('.container.output');

    data = {
      'name':'HPTO_'+fileDate+'_FV',
      'iterator':document.querySelector('.iteration').value,
      'code':r
    };

    doAFunction('output_code',data);

  })
}

function doAFunction(action,data){
  customAjax(`/function/${action}`, 'POST', data).then(function(results) {
    //console.log('results',results);
    if(results != null){
      if("error" in results){
        if(Object.keys(results.error).length === 0){
          message('error','There is an error, but it is undefined');
        }else{
          message('error',results.error);
        }
        console.log(results.error);
        //let text = results.error.map((e, i) => e+": "+i);
        if(results.error == 'Your token has expired'){
          runFunctions['gather_images']('error');
        }
      }else{
        runFunctions[action](results);
      }
    }
  })
}

function getInterator(itr){
  const alpha = Array.from(Array(26)).map((e, i) => i + 65);
  const alphabet = alpha.map((x) => String.fromCharCode(x));
  let r = 0;
  alphabet.forEach(function(a, i){
    if(a == itr){
      r = i + 1;
      return;
    }
  })
  return r;
}

function createDedicated(e){
  let dedicated;
  let info = {};
  if(e.target.classList.contains('daypart')){
    e.target.classList.add('clicked');
    dedicated = e.target;
  }
  if(e.target.classList.contains('cell')){
    e.target.parentNode.classList.add('clicked');
    dedicated = e.target.parentNode;
  }

  let cells = dedicated.childNodes;

  for (let i = 0; i < cells.length; i++) {
    let type = cells[i].getAttribute('data-type');
    let txt = cells[i].textContent;
    let newinfo = {};
    newinfo[type] = txt;
    info = { ...info, ...newinfo };
  }
  outputDedicated(info)
}

function save_defaults(){
  let formData = new FormData(document.querySelector('.settings-form'));
  let creatArr = Array.from(formData.entries());
  let creatObj = Object.fromEntries(creatArr);
  customAjax('/function/add_default', 'POST', creatObj).then(function(results) {
    Object.entries(results).map(msg => message(msg[0], msg[1]));
    if(results.success){
       hide('#popup-settings');
    }
  })
}

formElem.onsubmit = async (e) => {
  e.preventDefault();
    let t = new FormData(formElem);
    for(let [name, value] of t) {
      console.log(`${name} = ${value}`); // key1 = value1, then key2 = value2
      console.log(value);
    }
//console.log(new FormData(formElem));
  let response = await fetch('/csv', {
    method: 'POST',
    body: new FormData(formElem),
  });

  let result = await response.json();

  Object.entries(result).map(msg => message(msg[0], msg[1]));
  //message(Object.entries(result)[0],[Object.entries(result)[1]]);
};

// async function upload_csv() {
//   let formData = new FormData();
//   console.log(fileupload.files[0]);
//
//   formData.append("fileupload", fileupload.files[0]);
//   formData.append('_method', 'PATCH');
//   doAFunction("upload_csv",fileupload.files[0]);
//   doAFunction("upload_csv",formData);
//   // for(let [name, value] of formData) {
//   //   console.log(`${name} = ${value}`); // key1 = value1, then key2 = value2
//   //   console.log(value);
//   // }
// //  console.log(formData);
//   //   await fetch('/function/upload_csv', {
//   //   method: "POST",
//   //   data: {"u":"testu"}
//   // });
// }

function updateViewArea(dayparts){
  document.querySelector('.container.dayparts section.dayparts').innerHTML = '';
  let html = '';
  let templates;

  dayparts.forEach(function (day, indx) {
    indx++;
    let headline = ''
    // let headline = day.querySelector('.headline').innerHTML;
    // headline = headline.trim();
    const part = day;
    // if(part.length == 1){
    //   templates = [
    //     ['single-imgs', 'Single Image','singleimgs'],
    //     ['empty-link', 'Link Only, No Image','emptylink']
    //   ];
    // }else if(part.length == 3){
    //   templates = [['three-up', 'Header with Three Images','threeup']];
    // }else if((headline == 'Headline: N/A' || headline == '' || headline == 'Headline: ' || headline == 'Headline:') && part.length !== 1){
    //   headline = '';
    //   templates = [
    //     ['no-lines-larger-imgs', 'No header with Full Text','nolineslargerimgs'],
    //     ['animated-imgs', 'No header with Full Text, Animated','animatedimgs'],
    //   ];
    // }else{
    //   templates = [
    //     ['','Original','original'],
    //     ['one-line-lrg-images','Large Images No Text','onelinelrgimages'],
    //     ['slightly-larger-center-imgs', 'Header with Full Text', 'slightlylargercenterimgs'],
    //   ];
    // }
    templates = [
      ['hover-text-no-headline','Hover Text No Headline','hover-text-no-headline'],
      ['hover-text', 'Hover Text','hover-text'],
      ['animated-imgs', 'No header with Full Text, Animated','animatedimgs'],
      ['no-lines-larger-imgs', 'No header with Full Text','nolineslargerimgs'],
      ['slider', 'Slider','slider']
    ];
    buildDaypart(part, templates, headline, indx);
  })

  show('.container.dayparts');
}

function buildDaypart(daypart, templates, headline, slideNum){
  let html = '';
  console.log('made it in buildDaypart');
  let temp = grabTemplate(templates[0][2],
  // ...however, this callback is invoked AFTER the response arrives
  function () {
    console.log('made it in function');
    let resp  = this.responseText;

    resp = useTemplate(resp, daypart, slideNum, headline);
    console.log('made it after useTemplate');
    //depending on when item comes back it may be inserted at the incorrect place
    const parentContainer = document.querySelector('.container.dayparts section.dayparts');

    const checkArray = [1,2,3,4];
    let inThere = [];
    checkArray.forEach(function(pos){
      const selector = document.querySelector('.daypart-preview.'+inWords(pos));
      if(parentContainer.contains(selector)){
        inThere.push(pos);
      }
    })

    inThere.push(slideNum);
    inThere.sort(function(a, b){return a - b});
    console.log('made it after sort');

    let posit = inThere.indexOf(slideNum);
    let prevNum = posit - 1;
    if(prevNum < 0) prevNum = 0;
  //  if(prevNum < 0){
      html += '<div class="daypart-preview '+inWords(slideNum)+'">'+resp+'</div>';
//  if()
      parentContainer.insertAdjacentHTML('beforeend',html);
      if(templates.length > 1){
        let area = document.querySelector('.container.dayparts section.dayparts .daypart-preview.'+inWords(slideNum));
        let opts = createSelect(templates, inWords(slideNum)+"change-template", '', {'data-pos':slideNum});

        area.prepend(opts);
        opts.addEventListener('change', (e) => {
          const dNum = e.target.getAttribute('data-pos');
          const daypart = document.querySelectorAll('.container.cells .cells .dayparts')[dNum-1];
          let headline = '';
          area = document.querySelector('.container.dayparts section.dayparts .daypart-preview.'+inWords(dNum));
          if(e.target.value == 'slider'){
            let origInfo = document.querySelector('.container.cells .cells .dayparts:nth-of-type('+dNum+')');
            let imgLngth = origInfo.childElementCount;
            let startImgHere = 0;
            if(dNum == 1){
              startImgHere = 1;
            }else{
              startImgHere = (imgLngth * (dNum - 1)) + 1;
            }
            let temp = grabTemplate('album-container',
              function () {
                let respF = "";
                let resp  = this.responseText;
                for (let r = 1; r <= imgLngth; r++){
                  let daypart = [];
                  let info = document.querySelector('.container.cells .cells .dayparts:nth-of-type('+dNum+') .daypart:nth-of-type('+r+')');
                  for (let s = 1; s <= info.childElementCount; s++){
                    let cell = document.querySelector('.container.cells .cells .dayparts:nth-of-type('+dNum+') .daypart:nth-of-type('+r+') .cell_'+s);
                    daypart.push(cell.innerText);
                  }
                  console.log('made it');
                  respF += midTemplate(resp, daypart, startImgHere);
                  startImgHere++;
                }

                let fullTemp = grabTemplate('slider',
                function () {
                  let respC  = this.responseText;
                  area.querySelector('.slide').remove();
                  addfullTemp = dumpAlbumSet(respC, respF, dNum, document.querySelector('.container.cells .cells .dayparts:nth-of-type('+dNum+') .daypart:nth-of-type(1) .cell_6').innerText);
                  area.insertAdjacentHTML('beforeend',addfullTemp);
                  sliderFuncSet(inWords(dNum));

                })
              }
            )
          }else{
            let temp = grabTemplate(e.target.value,
              function () {
                let resp  = this.responseText;
                //console.log(resp);
                parts = [];
                let selection = daypart.querySelectorAll('.daypart');
                for (var i = 0; i < selection.length; i++){
                  let piece = selection[i].querySelectorAll('div');
                  part = [];
                  for (var y = 0; y < piece.length; y++){
                    part.push(piece[y].textContent);
                  }
                  parts.push(part);
                }
                area.querySelector('.slide').remove();
                console.log('made it');
                resp = useTemplate(resp, parts, dNum, headline);
                area.insertAdjacentHTML('beforeend',resp);
              }
            )
          }
        })
      }
    // }else{
    //   html += '<div class="daypart-preview '+inWords(slideNum)+'">'+resp+'</div>';
    //   let area = document.querySelector('.container.dayparts section.dayparts .daypart-preview.'+inWords(inThere[prevNum]));
    //   area.insertAdjacentHTML('afterend',html);
    //   if(templates.length > 1){
    //     const curArea = document.querySelector('.container.dayparts section.dayparts .daypart-preview.'+inWords(inThere[posit]));
    //     let opts = createSelect(templates, inWords(slideNum)+"change-template", '', {'data-pos':slideNum});
    //     curArea.prepend(opts);
    //     opts.addEventListener('change', (e) => {
    //       const dNum = e.target.getAttribute('data-pos');
    //       const daypart = document.querySelectorAll('.container.cells .cells .dayparts')[dNum-1];
    //       let headline = '';
    //       area = document.querySelector('.container.dayparts section.dayparts .daypart-preview.'+inWords(dNum));
    //
    //       let temp = grabTemplate(e.target.value,
    //         function () {
    //           let resp  = this.responseText;
    //           parts = [];
    //           let selection = daypart.querySelectorAll('.daypart');
    //           for (var i = 0; i < selection.length; i++) {
    //             let piece = selection[i].querySelectorAll('div');
    //             part = [];
    //             for (var y = 0; y < piece.length; y++) {
    //               part.push(piece[y].textContent);
    //              }
    //             parts.push(part);
    //           }
    //           area.querySelector('.slide').remove();
    //           resp = useTemplate(resp, parts, dNum, headline);
    //           area.insertAdjacentHTML('beforeend',resp);
    //         }
    //       )
    //     })
    //   }
    // }
  });
}

function createSelect(options, classes = '', id = '', attributes = {}){
  let select = document.createElement("SELECT");
  if(id != undefined && id != ''){
     select.id = id;
  }
  if(classes != undefined && classes != ''){
    select.className = classes;
  }
  for (var i = 0; i < options.length; i++) {
    var option = document.createElement("OPTION");
    option.value = options[i][2];
    option.text = options[i][1];
    select.appendChild(option);
  }
  if(attributes != undefined && attributes != ''){
    for (let [key, value] of Object.entries(attributes)) {
      select.setAttribute(key, value);
    }
  }
  return select;
}

function midTemplate(resp, day, img){
  resp = resp.replace("[PLAYLIST URI]", day[4]);
  resp = resp.replace("[PLAYLIST NAME]", day[0]);
  resp = resp.replace("[IMAGE]", 'images/cover'+img+'.jpg');
  let wordCheck = day[2];
  if(wordCheck != ''){
    let copy = wordCheck.split('Copy:');
    let words = copy[1].split('||');
    resp = resp.replace("[TEXT LINE 1]", htmlEntities(words[0].trim()));
    if(words[1] != undefined){
      let wdck = htmlEntities(words[1].trim());
      let addBk = addCharBack(wdck);
      resp = resp.replace("[TEXT LINE 2]", addBk);
    }else{
      resp = resp.replace("[TEXT LINE 2]", '&nbsp;');
    }
    if(words[2] != undefined){
      resp = resp.replace("[TEXT LINE 3]", htmlEntities(words[2].trim()));
    }else{
      resp = resp.replace("[TEXT LINE 3]", '&nbsp;');
    }
  }

  return resp;
}

function dumpAlbumSet(newTemplate, templatedData, dNum, uri){
  resp = newTemplate.replace("[PLAYLIST URI]", uri);
  resp = resp.replace("[SLIDE NUMBER]", inWords(dNum));
  resp = resp.replace("[SLIDES]", templatedData);
  return resp;
}

function useTemplate(resp, daypart, slideNum, headline){
  console.log('made into useTemplate');
  slideNum = parseInt(slideNum);
  let img;
  switch(slideNum) {
    case 1:
      img = 1;
      break;
    case 2:
      img = 5;
      break;
    case 3:
      img = 9;
      break;
    case 4:
      img = 13;
      break;
    case 5:
      img = 17;
      break;
    default:
      img = 1;
  }

  resp = resp.replace("[SLIDE NUMBER]", inWords(slideNum));
  if(headline == '' || headline == 'Headline: N/A' || headline == 'Headline: ' || headline == 'Headline:'){
    headline = '';
    // if(){
    //   headline = '&nbsp;';
    // }
    resp = resp.replace("[HEADLINE]", headline);
  }else{
    resp = resp.replace("[HEADLINE]", headline);
  }
  resp = resp.replace("[PLAYLIST URI MAIN]", daypart[0][5]);

  daypart.forEach(function (day, indx) {
    // console.log(img);
    // let test = img;
    // if(test.toString().includes('/')){
    //   let imgParts = test.split('/');
    //   let urlEnd = imgParts[imgParts.length - 1].split('?t=');
    //   console.log(urlEnd[0]);
    // }
    indx++;
    resp = resp.replace("[PLAYLIST URI "+indx+"]", day[4]);

    let addchrbk = addCharBack(day[0]);
    resp = resp.replace("[PLAYLIST NAME "+indx+"]", addchrbk);
    resp = resp.replace("[IMAGE "+indx+"]", 'images/cover'+img+'.jpg');
    let wordCheck = day[2];
    if(wordCheck != ''){
      let copy = wordCheck.split('Copy:');
      let words = copy[1].split('||');
      resp = resp.replace("[TEXT LINE 1 "+indx+"]", htmlEntities(words[0].trim()));
      if(words[1] != undefined){
        let wdck = htmlEntities(words[1].trim());
        let addBk = addCharBack(wdck);
        resp = resp.replace("[TEXT LINE 2 "+indx+"]", addBk);
        console.log('[TEXT LINE 2] '+resp);
      }else{
        resp = resp.replace("[TEXT LINE 2 "+indx+"]", '&nbsp;');
      }
      if(words[2] != undefined){
        resp = resp.replace("[TEXT LINE 3 "+indx+"]", htmlEntities(words[2].trim()));
      }else{
        resp = resp.replace("[TEXT LINE 3 "+indx+"]", '&nbsp;');
      }
    }
    img++;
  })
  return resp;
}

function addCharBack(str){
  let wrds = str.split(' ');
  let runThru = wrds.map(function(wrd){
    return wrd.includes('$$') ? wrd+'$' : wrd;
  });
  return runThru.join(' ');
}

function runCropStudio(img){
  document.querySelector('#popup-crop .image-holder').innerHTML = '';
  let getImg = img.target.src;
  let imsplt = getImg.split('/');
  let imgName = imsplt[imsplt.length - 1];
  let toInitialize = false;
  if(img.target.id == curCrop){toInitialize = true;}

  curCrop = img.target.id;

  show('#popup-crop');

  // if(document.querySelector('.image-holder').classList.contains('croppie-container')){
  //   theCroppening.destroy();
  // }


//if(!toInitialize){
  theCroppening = new Croppie(document.querySelector('#popup-crop .image-holder'), {
    showZoomer: true,
    viewport: {
      width: 250,
      height: 250,
      type: 'square'
    },
    enableResize: false,
    boundary: { width: 600, height: 600 },
  });

  console.log('croppie initialized '+curCrop);
//}

  theCroppening.bind({
    url: getImg,
    point: [0,0,0,0]
  });

  document.querySelector('.crop_image').addEventListener('click', function (ev) {
    if(curCrop == img.target.id){
  //    console.log(curCrop+' '+img.target.id);
			theCroppening.result({
				type: 'base64',
        format: 'jpeg',
			}).then(function (blob) {
        console.log(`${blob} bytes`);
        sendImg = {
          'img' : imgName,
          'imgNew' : blob,
          'replace': img.target.id
        }
				doAFunction('crop_image',sendImg);
			});
    }
  },{ once: true });
}

function copyToClipboard(text) {
    if (window.clipboardData && window.clipboardData.setData) {
        // Internet Explorer-specific code path to prevent textarea being shown while dialog is visible.
        return window.clipboardData.setData("Text", text);

    }
    else if (document.queryCommandSupported && document.queryCommandSupported("copy")) {
        var textarea = document.createElement("textarea");
        textarea.textContent = text;
        textarea.style.position = "fixed";  // Prevent scrolling to bottom of page in Microsoft Edge.
        document.body.appendChild(textarea);
        textarea.select();
        try {
            return document.execCommand("copy");  // Security exception may be thrown by some browsers.
        }
        catch (ex) {
            console.warn("Copy to clipboard failed.", ex);
            return false;
        }
        finally {
            document.body.removeChild(textarea);
        }
    }
}

document.querySelector('.csv-checkbox').addEventListener('change', (e) => {
  if(e.target.checked == true){
    show('.csv-info');
  }else{
    hide('.csv-info');
  }
})



document.querySelector('.choose_sheet select').addEventListener('change', () => {
  let t = document.querySelector('.choose_sheet select');
  customAjax("/refresh/"+t.value, 'GET').then(function(results) {
    addSheetTabs('.choose_tab select',results.tabTitles);
  })
});

/////////////////////////////// SLIDER ACTIONS /////////////////////////////////////////


var slideOnThisOne, slideOnThisTwo, slideOnThisThree, slideOnThisFour, slideOnThisFive;
const intervals = {one:slideOnThisOne,two:slideOnThisTwo, three:slideOnThisThree, four:slideOnThisFour, five:slideOnThisFive};

function sliderFuncSet(slideNUm){
  moveSlider(slideNUm);

  document.querySelector('.container .slider.'+slideNUm).addEventListener('mouseover', function(){
    clearInterval(intervals[slideNUm]);
  })

  document.querySelector('.container .slider.'+slideNUm).addEventListener('mouseleave', function(){
    startAfterPause(slideNUm);
  })

}

function startAfterPause(num) {
  setTimeout(num => {
    moveSlider(num);
    intervals[num] = setInterval(
      () => moveSlider(num),
      5000
    );
  },500,num)
}

  function moveSlider(slideNUm){
    var unit = document.querySelector('.slider.'+slideNUm+' .album-container').offsetWidth;

    var elem = document.querySelector('.slider.'+slideNUm+' .content');
    var left = '-170px'; //getPropertyVal(elem,'left');
    var width = getPropertyVal(elem,'width');
    var newLeft = -360; //(parseInt(left) - unit) - 10;
    var newWidth = (parseInt(width) - unit) - 10;
    elem.style.left = newLeft+'.px';
    elem.style.transitionDuration = '';
    //transition duration 0.8s set in css
    setTimeout(() => {
      elem.style.transitionDuration = '0s';
      var moveLast = document.querySelector('.slider.'+slideNUm+' .album-container:first-of-type').innerHTML;
      document.querySelector('.slider.'+slideNUm+' .album-container:first-of-type').remove();
      document.querySelector('.slider.'+slideNUm+' .album-set').insertAdjacentHTML('beforeend', '<div class="album-container">'+moveLast+'</div>');
      elem.style.left = left;
    },800);

  }

  function getPropertyVal(elem,property){
    return window.getComputedStyle(elem,null).getPropertyValue(property);
  }
