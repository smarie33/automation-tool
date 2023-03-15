// MANIPULATE DATA AND OUTPUT TO FRONTEND

const axios = require('axios').default;
const fs = require('fs');
const fsPromises = require('fs').promises;
const path = require('path');
const fileName = '../data/db.json';
const file = require(path.resolve(__dirname,fileName));
const FormData = require('form-data');
const sharp = require('sharp');
const ncp = require('ncp').ncp;
const AdmZip = require("adm-zip");
const formidable = require('formidable');
const BoxSDK = require('box-node-sdk');
const config = require(path.resolve(__dirname,'../data/config.json'));
const http = require('http')

let client;
//changing to push

function add_default(params){
  return axios
    .get(`http://localhost:8099/refresh/${params.sheet}`)
    .then(res => {
      params.title = res.data.sheetTitle;
      file.defaults = params;
      fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err) {
        if (err) return {'error': err};
      });
      return {'success': 'Defaults updated successfully'};
    })
    .catch(error => {
      return {'error':error};
    })
}

async function run_sheet(params){
  const fs = require('fs');
  const fileName = '../data/db.json';
  const file = require(path.resolve(__dirname,fileName));

  return axios
    .get(`http://localhost:8099/refresh/${params.sheet}`)
    .then(res => {
      if(res.data.error == undefined){
        params.title = res.data.sheetTitle;
        file.defaults = params;
        fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err) {
          if (err) return {'error': err};
        });
        return file.defaults;
      }else{
        return res.data;
      }
    })
    .catch(error => {
      return {'error':error};
    })

}

async function add_sheet(params){
  file['googlesheets'].push(params);
  fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err) {
    if (err) return {'error': err};
  });
  return {'success': 'New Sheet added successfully'};
}

async function delete_sheet(params){
  let shts = file['googlesheets'];
  for(let i = 0; i < shts.length; i++) {
    if(shts[i].id == params.id){
      shts.splice(i,1);
      break;
    }
  }
  file['googlesheets'] = shts;

  fs.writeFile(fileName, JSON.stringify(file), function writeJSON(err) {
    if (err) return {'error': err};
  });
  return {'success': 'Sheet deleted successfully'};
}

async function output_dedicated_file(data){
  let sendThis;
  let newURL = path.join(__dirname, `../public/${file.defaults.outputfiles}/${data.name}`);
  return new Promise(function(resolve, reject) {
    fs.mkdir(newURL, { recursive: true }, (err) => {
      if (err) reject({'error': err});

      fs.writeFile(newURL+'/index.html', data.code, (err) => {
          if (err) reject({'error': err});

          sendThis = {'success': 'Dedicated Created'};
          resolve(sendThis);
      });
    });
  });
}

var fn = function collectDirItems(item){
  if(item.charAt(0) != '.'){
    return new Promise(resolve => item);
  }
};

async function sendToCropArea(data){
  var arr = [], toSend;
  let url = file.defaults.newimagesfolder;
  var files = fs.readdirSync(path.join(__dirname, `../public/${file.defaults.newimagesfolder}/`));

  files.forEach(file => {
    if(file.charAt(0) != '.'){
      arr.push(`/${url}/${file}`);
    }
  });

  if(arr.length > 0){
    toSend = arr;
  }else{
    toSend = {'error':'Please upload some images for the dayparts'}
  }

  return toSend;
}


function moveImage(oldImg,newImg){
  fs.unlink(oldImg, (err) => {
    if (err) {
      console.error(err)
      return {'error': err};
    }
  })
  fs.rename(oldImg, `newImg`, function (err) {
    if (err) throw err
  })
}

async function crop_image(data){

  let coverName = data.img.split('.')[0];
  let ext = data.img.split('.')[1];

  if(ext != 'jpeg' || ext != 'jpg'){
    fs.unlink(path.join(__dirname, `../public/${file.defaults.newimagesfolder}/${data.img}`), err => {
      if (err) console.log(err);
    });
  }

  let base64Data = data.imgNew.split('base64,')[1];

  return new Promise((resolve, reject) => {
    fs.writeFile(path.join(__dirname, `../public/${file.defaults.newimagesfolder}/${coverName}.jpg`), base64Data, 'base64', function(err) {
      if(err == null){
        resolve({'id': data.replace, 'img': `${coverName}.jpg`});
      }else{
        reject({'error': err});
      }
    })
  })
}

async function moveCroppedFile(blob, newImg, oldImg){
  return new Promise((resolve, reject) => {
    fs.rename(`${__dirname}/${file.defaults.tempfolder}/${oldImg}`, `${__dirname}/${file.defaults.newimagesfolder}/${newImgfile}`, function (err) {
      if (err){
        reject({'error': err});
      }else{
        resolve('image moved');
      }
    })
  })
}

async function scrape_images(data){
  for (let i = 0; i < data.length; i++) {
    client.sharedItems.get(
      data[i],
      null,
      {fields: 'type,id,extension,created_by,shared_link,permissions'},
    ).then(file => {
      client.files.update(file.id, {
        shared_link: {
          access: client.accessLevels.OPEN,
          permissions: {
            can_download: true
          }
        }
      }).then(file => {
        console.log(file.shared_link);
      })
      .catch(error => console.log('An error happened! files.update', error));
    })
    .catch(error => console.log('An error happened! sharedItems.get', error));

  }

  return {'success': 'Images Scraped'};
}

async function delete_items_from_directory(directory){
  return new Promise((resolve, reject) => {
    fs.readdir(directory, (err, files) => {
      if (err){
        console.log(err);
        reject(`There was an issue retrieving images from the directory ${directory}`);
      }
      if(Array.isArray(files)){
        for (const file of files) {
          if(fs.lstatSync(directory+'/'+file).isDirectory()){
            fs.rm(directory+'/'+file, {recursive: true}, err => {console.log(err)});
          }else{
            fs.unlink(path.join(directory, file), err => {
              if (err){
                console.log(err);
                reject(`There was an issue deleting the file ${file}`);
              }
            })
          }
        }
      }
      console.log(`items from ${directory} deleted`);
      resolve(true);
    })
  })
}

async function reduce_images(data){
  return await Promise.all([delete_items_from_directory(path.join(__dirname, `../public/${file.defaults.imagesfolder}`))])
  .then(b => {
    return getFolderContents(file.defaults.newimagesfolder);
  })
  .then(res => {
    const reduceAndMove = res.map(async img => {
    if(img.charAt(0) != '.'){
      await useSharp(img);
      //  return reducedImg;
      }
    })
    return Promise.all(reduceAndMove);
  })
  .then(d => {
    return {'success': 'Images Reduced'};
  }).catch(console.log)
}

async function useSharp(img){
  return new Promise((resolve, reject) => {
    let fileName = img.split('.');
    return sharp(path.join(__dirname, `../public/${file.defaults.newimagesfolder}/${img}`))
      .resize(250, 250)
      .jpeg({
        quality: 80,
        mozjpeg: true
      })
      .toFile(path.join(__dirname, `../public/${file.defaults.imagesfolder}/${fileName[0]}.jpg`), function(err) {
        if(err){
          reject({'error': err});
        }else{
          resolve({'success': 'Images reduced'});
        }
    })
  });
}

function getFolderContents(folder){
  return new Promise((resolve, reject) => {
    fs.readdir(path.join(__dirname, `../public/${folder}/`), (error, files) => {
      if(error){
        return reject(error);
      }
      return resolve(files);
    });
  })
}


async function output_txt(data){
  let newURL = path.join(__dirname, `../public/text/${data.name}.txt`);
  let changeHere = data.info;
  let nextChange = changeHere.replace(/&lt;/g, '<');
  let useThis = nextChange.replace(/&gt;/g, '>');
  let newDate = data.name.split('-');

  let html = newDate[0]+'/'+newDate[1]+' dayparts';
  html += '\n\n';
  html += useThis;

  return new Promise((resolve, reject) => {
    try {
      fs.writeFileSync(newURL, html);
      resolve({'txt': `/text/${data.name}.txt`, 'name' : data.name });
    }catch (err) {
      reject({'error': err});
    }
  })
}

async function gather_images(data){
  const env = JSON.parse(fs.readFileSync(path.join(__dirname, `../data/enviornment.json`), {encoding:'utf8', flag:'r'}));
  let linksOnly = data.links.split(',');
  let links = [];
  let num = 1;
  linksOnly.forEach(link => {
    let addOrder = {'num':num, 'url':link};
    links.push(addOrder);
    num++;
  })

  try{
    const checkToken = await checkifTokenIsLiveStill(env.token);
    const afterDeleteItmes = await delete_items_from_directory(path.join(__dirname, `../public/${file.defaults.newimagesfolder}`));
    const downloadedImages = await downloadAllSelectedImages(env.token, links);
    return {'success': downloadedImages};
  }catch(error){
    return {'error': error};
  }
}

async function checkifTokenIsLiveStill(token){
  // link to file in dropbox account to make sure token is relative
  let sharedBoxFile = "https://sm01.box.com/s/tlpwtltoog4zeuj8e14xcd1f6vjki45j";

  client = BoxSDK.getBasicClient(token);
  return new Promise((resolve, reject) => {
    client.sharedItems.get(
        sharedBoxFile,
        null,
        {fields: 'type,id,extension'},
      ).then(file => {
        console.log('checkifTokenIsLiveStill no error');
        resolve(true);
      }).catch((e) => {
        console.log('checkifTokenIsLiveStill error');
        console.log(e);
        reject('Your token has expired');
      });
  })
}

async function downloadAllSelectedImages(token, links){
  const allTheImages = [];

  links.forEach(link => {
    allTheImages.push(downloadImage(token, link));
  })

  return Promise.all(allTheImages)
   .then((results) => {
       console.log("all images returned");
       return results;
   })
   .catch((e) => {
       console.log("downloadAllSelectedImages Promise.all "+e);
       return 'There was an issue downloading images';
   });

}

async function downloadImage(token, link){
  let client = BoxSDK.getBasicClient(token);
  return new Promise((resolve, reject) => {
    client.sharedItems.get(
      link.url,
      null,
      {fields: 'type,id,extension'},
    ).then(imgs => {
      client.files.getReadStream(imgs.id, null, function(error, stream) {
      	if (error) {
      		console.log("downloadImage "+error.statusCode);
          reject(`There was an issue downloading this image ${link.url}`);
          return;
      	}
      	var output = fs.createWriteStream(path.join(__dirname, `../public/${file.defaults.newimagesfolder}/cover${link.num}.${imgs.extension}`));
      	stream.pipe(output);
        stream.on('end', function() {
          const serverPath = path.join(__dirname, `../public/${file.defaults.newimagesfolder}/cover${link.num}.${imgs.extension}`);
          const temp = path.join(__dirname, `../public/${file.defaults.tempfolder}/cover${link.num}.${imgs.extension}`);
          const image = sharp(serverPath);
          return image
          .metadata()
          .then(function(metadata) {
            return image
              .resize(1000,1000,{fit: sharp.fit.inside, withoutEnlargement: true})
              .toFile(temp)
              .then(() => {
                fs.renameSync(path.join(__dirname, `../public/${file.defaults.tempfolder}/cover${link.num}.${imgs.extension}`), path.join(__dirname, `../public/${file.defaults.newimagesfolder}/cover${link.num}.${imgs.extension}`));
                resolve(`cover${link.num}.${imgs.extension}`);
              })
              .catch(err => {
                console.error(err);
                reject({'error': err});
              })
          })
          .catch(err => {
            console.error(err);
            reject('There was an issue reducing image');
          })
        });
    }).catch(error => {
        console.log('getReadStream error '+error.statusCode);
        reject('There was an issue retrieving image information');
      });
    })
  })
}


async function output_code(data){
  const folderAssoc = {
    'A' : '',
    'B' : '2',
    'C' : '3',
    'D' : '4',
    'E' : '5',
    'F' : '6',
    'G' : '7',
  }
  let sendThis;
  let theseDir = [];
  let title = data.name;
  let splitName = title.split('_');
  let filesInImages = fs.readdirSync(path.join(__dirname, `../public/${file.defaults.imagesfolder}`));
  let newURL = path.join(__dirname, `../public/${file.defaults.outputfiles}/${splitName[0]}_${splitName[1]}_${data.iterator}/${data.name}`);
  for (let i = 0; i <= 5; i++) {
    let end = (i == 0) ? folderAssoc[data.iterator] : `_${data.iterator}${i}`;
    fs.mkdirSync(newURL+end, { recursive: true });

      fs.writeFileSync(newURL+end+'/index.html', data.code);
      fs.mkdirSync(newURL+end+'/images');
      if(i > 0){
        fs.copyFileSync(path.join(__dirname, `../defaults/${i}/script.js`), `${newURL}${end}/script.js`);
        fs.copyFileSync(path.join(__dirname, `../defaults/${i}/style.css`), `${newURL}${end}/style.css`);
      }else{
        fs.copyFileSync(path.join(__dirname, `../defaults/script.js`), `${newURL}${end}/script.js`);
        fs.copyFileSync(path.join(__dirname, `../defaults/style.css`), `${newURL}${end}/style.css`);
      }

      filesInImages.forEach(img => {
        fs.copyFileSync(path.join(__dirname, `../public/${file.defaults.imagesfolder}/${img}`), `${newURL}${end}/${file.defaults.imagesfolder}/${img}`);
      })

  }

    const zip = new AdmZip();
    let zipEntries = zip.getEntries(); // an array of ZipEntry records
    console.log(`${splitName[0]}_${splitName[1]}_${data.iterator}`);
    const outputFile = path.join(__dirname, `../public/${file.defaults.outputfiles}/${splitName[0]}_${splitName[1]}_${data.iterator}.zip`);
    console.log(path.join(__dirname, `../public/${file.defaults.outputfiles}/${splitName[0]}_${splitName[1]}_${data.iterator}/`));
    zip.addLocalFolder(path.join(__dirname, `../public/${file.defaults.outputfiles}/${splitName[0]}_${splitName[1]}_${data.iterator}/`));

    zip.writeZip(outputFile);
    return {'zip': `/${file.defaults.outputfiles}/${splitName[0]}_${splitName[1]}_${data.iterator}.zip`, 'name': `${splitName[0]}_${splitName[1]}_${data.iterator}`};
}

async function update_images(){
  //processing on the front end, just need to return success bc thts wht the
  // function needs
  return {'success': 'do the thing'};
}

async function create_zip(data){
  const zip = new AdmZip();
  const outputFile = path.join(__dirname, `../public/${file.defaults.savedzips}/${data.name}.zip`);
  zip.addLocalFolder(path.join(__dirname, `../public/${file.defaults.newimagesfolder}`));
  zip.writeZip(outputFile);
  return {'success': `zip ${data.name}.zip created`};
}

async function open_zip(data){
  return await Promise.all([delete_items_from_directory(path.join(__dirname, `../public/${file.defaults.newimagesfolder}`)),delete_items_from_directory(path.join(__dirname, `../public/${file.defaults.tempfolder}`))])
  .then(b => {
    return new Promise((resolve, reject) => {
      try {
        const zip = new AdmZip(path.join(__dirname, `../public/${file.defaults.savedzips}/${data.name}.zip`));
        const outputDir = path.join(__dirname, `../public/${file.defaults.tempfolder}`);
        zip.extractAllTo(outputDir);
        resolve({'success': 'images extracted!'});
      } catch (e) {
        reject({'error': `Something went wrong. ${e}`});
      }
    })
   })
  .then(c => {
    let files;
    return new Promise((resolve, reject) => {
      try {
        files = fs.readdirSync(path.join(__dirname, `../public/${file.defaults.tempfolder}/${data.name}`));
        resolve(files);
      }catch (err) {
        reject({'error': err});
      }
    })
    .then(files => {
      let filesToReturn = [];
      return Promise.all([
        files.forEach(file => {
         if(file.charAt(0) != '.'){
           try {
             fsPromises.rename(path.join(__dirname, `../public/${file.defaults.tempfolder}/${data.name}/${file}`), path.join(__dirname, `../public/${file.defaults.newimagesfolder}/${file}`));
             return file;
           } catch (err) {
              return {'error': err};
           }
         }
       })
      ])
      .then(e => {
        return new Promise((resolve, reject) => {
          try {
            fsPromises.rmdir(path.join(__dirname, `../public/${file.defaults.tempfolder}/${data.name}`));
            resolve({'success': 'run frontend function'});
          } catch (err) {
            reject({'error': err});
          }
        })
      })
      .then(f => {
        return new Promise((resolve, reject) => {
          try {
            files = fs.readdirSync(path.join(__dirname, `../public/${file.defaults.newimagesfolder}`));
            resolve({'success': 'run frontend function', 'files': files});
          }catch (err) {
            reject({'error': err});
          }
        })
      })
    })
  })
}

async function delete_zip(data){
  return new Promise((resolve, reject) => {
    fs.unlink(path.join(__dirname, `../public/${file.defaults.savedzips}/${data.name}.zip`), err => {
      if (err){
        reject({'error': err});
        return;
      }
      resolve({'success': data.deleteid});
    });
  })
}

async function delete_csv(data){
  return new Promise((resolve, reject) => {
    fs.unlink(path.join(__dirname, `../public/${file.defaults.storecsvs}/${data.name}.csv`), err => {
      if (err){
        reject({'error': err});
        return;
      }
      resolve({'success': data.deleteid});
    });
  })
}

async function cleanUpFolders(){
  delete_items_from_directory(path.join(__dirname, `../public/${file.defaults.outputfiles}`));
  delete_items_from_directory(path.join(__dirname, `../public/text`));
  return {'success': 'yay!'};
}

module.exports = {
  add_default,
  add_sheet,
  run_sheet,
  delete_sheet,
  output_dedicated_file,
  scrape_images,
  output_code,
  reduce_images,
  sendToCropArea,
  crop_image,
  update_images,
  create_zip,
  open_zip,
  delete_zip,
  delete_csv,
  output_txt,
  gather_images,
  cleanUpFolders
};
