module.exports.config = {
  name: "trai",
<<<<<<< HEAD
  version: "2.0.0",
  hasPermssion: 0,
  credits: "Vtuan",
  description: "Xem ảnh gái",
  commandCategory: "Ảnh",
  usages: "",
  cooldowns: 2
};

module.exports.run = async ({ api, event ,Users}) => {
  const axios = require('axios');
  const request = require('request');
  const fs = require("fs");
  const girl = require('./../../includes/datajson/trai.json');
  var image1 = girl[Math.floor(Math.random() * girl.length)].trim();
  var image2 = girl[Math.floor(Math.random() * girl.length)].trim();
  var image3 = girl[Math.floor(Math.random() * girl.length)].trim();
  var image4 = girl[Math.floor(Math.random() * girl.length)].trim();
  function downloadAndSendImage(image,fileName,callback){
    request(image).pipe(fs.createWriteStream(__dirname + `/`+fileName)).on("close", callback);
  }
  let callback = function () {
    return api.sendMessage({
      body: 'Ngắm đê',
      attachment: [
       fs.createReadStream(__dirname + `/1.png`), 
       fs.createReadStream(__dirname + `/2.png`), 
       fs.createReadStream(__dirname + `/3.png`), 
       fs.createReadStream(__dirname + `/4.png`)
      ]
    }, event.threadID, () => {
      fs.unlinkSync(__dirname + `/1.png`);
      fs.unlinkSync(__dirname + `/2.png`);
      fs.unlinkSync(__dirname + `/3.png`);
      fs.unlinkSync(__dirname + `/4.png`);
    }, event.messageID);
  };
  downloadAndSendImage(image1,'1.png',()=>{
    downloadAndSendImage(image2,'2.png',()=>{
      downloadAndSendImage(image3,'3.png',()=>{
        downloadAndSendImage(image4,'4.png',callback)
      })
    })
  }) 
}
=======
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Thắng",
  description: "Random ảnh trai",
  commandCategory: "Random-Ảnh/video",
  usages: "trai",
  cooldowns: 2,
  dependencies: {
    "request":"",
    "fs-extra":"",
    "axios":""
  }
    
};

module.exports.run = async({api,event,args,Users,Threads,Currencies}) => {
const axios = global.nodemodule["axios"];
const request = global.nodemodule["request"];
const fs = global.nodemodule["fs-extra"];
    var link = [
"https://i.imgur.com/RugqIsE.jpg",
"https://i.imgur.com/Zg8gCRi.jpg",
"https://i.imgur.com/QSOo3hN.jpg",
"https://i.imgur.com/Q12izpx.jpg",
"https://i.imgur.com/4pa7ThF.jpg",
"https://i.imgur.com/gmZQoqe.jpg",
"https://i.imgur.com/g2HOtF6.jpg",
"https://i.imgur.com/yl7A6Ns.jpg",
"https://i.imgur.com/eaDOZnC.jpg",
"https://i.imgur.com/VFspbfW.jpg",
"https://i.imgur.com/RP1tpFz.jpg",
"https://i.imgur.com/cJErkOY.jpg",
"https://i.imgur.com/fOaL1RC.jpg",
"https://i.imgur.com/mDrBofk.jpg",
"https://i.imgur.com/ffu0IQV.jpg",
"https://i.imgur.com/xkoPbyl.jpg",
"https://i.imgur.com/uQ30ady.jpg",
"https://i.imgur.com/QPIce66.jpg",
"https://i.imgur.com/gH0Qwte.jpg",
"https://i.imgur.com/eoVIliQ.jpg",
"https://i.imgur.com/jCOlQPw.jpg",
"https://i.imgur.com/3wOuBgV.jpg",
"https://i.imgur.com/Cl64w7g.jpg",
"https://i.imgur.com/vi90Mtb.jpg",
"https://i.imgur.com/7QeSlYO.jpg",
"https://i.imgur.com/khII2UE.jpg",
"https://i.imgur.com/VrNREYM.jpg",
"https://i.imgur.com/pmLUEcX.jpg",
"https://i.imgur.com/blDv1A2.jpg",
"https://i.imgur.com/1j8CNAM.jpg",
"https://i.imgur.com/3oPVFG3.jpg",
"https://i.imgur.com/qPSJTEF.jpg",
"https://i.imgur.com/MvjXMnC.jpg",
"https://i.imgur.com/jcQJvuY.jpg",
"https://i.imgur.com/okvL0Ly.jpg",
"https://i.imgur.com/AmY8uZH.jpg",
"https://i.imgur.com/WIbcx59.jpg",
"https://i.imgur.com/J0fqMYW.jpg",
"https://i.imgur.com/RSNmZDW.jpg",
"https://i.imgur.com/m8bCWJR.jpg",
"https://i.imgur.com/txI312W.jpg",
"https://i.imgur.com/pwa9Qxj.jpg",
"https://i.imgur.com/hutrUcx.jpg",
"https://i.imgur.com/GOuzwUe.jpg",
"https://i.imgur.com/LYkV9VF.jpg",
"https://i.imgur.com/ufFpS22.jpg",
"https://i.imgur.com/HnBfMR0.jpg",
     ];
     var callback = () => api.sendMessage({body:`𝗕𝗼̛́𝘁 𝗠𝗲̂ 𝗧𝗿𝗮𝗶 𝗟𝗮̣𝗶 -.-`,attachment: fs.createReadStream(__dirname + "/cache/1.jpg")}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/1.jpg"));  
      return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/cache/1.jpg")).on("close",() => callback());
   };
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
