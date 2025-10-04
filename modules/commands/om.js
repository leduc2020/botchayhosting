<<<<<<< HEAD
﻿const request = require("request");
=======
const request = require("request");
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
const fs = require("fs")
const axios = require("axios")
module.exports.config = {
  name: "ôm",
  version: "1.0.0",
  hasPermssion: 0,
<<<<<<< HEAD
  credits: "Lê Định Mod",
  description: "ôm người Bạn Muốn",
  commandCategory: "Hành Động",
=======
  credits: "Hải harin",
  description: "ôm người Bạn Muốn",
  commandCategory: "game",
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
  usages: "@tag",
  cooldowns: 5,
  dependencies: {"request": "","fs": "","axios": ""}
};

module.exports.run = async({api,event,args,client,Users,Threads,__GLOBAL,Currencies}) => {
        const request = require('request')
                const fs = require('fs')
                  var mention = Object.keys(event.mentions)[0];
let tag = event.mentions[mention].replace("@", "");
        var link = [
<<<<<<< HEAD
          "https://genk.mediacdn.vn/2016/04-1483112033497.gif",
             ];
   var callback = () => api.sendMessage({body: `Cậu ${tag} à 💌, Tớ muốn ôm cậu 💗` , mentions: [{
          tag: tag,
          id: Object.keys(event.mentions)[0]
        }],
  attachment: fs.createReadStream(__dirname + "/cache/om.gif")}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/om.gif"));
      return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/cache/om.gif")).on("close",() => callback());
=======
          "https://i.imgur.com/IyjnH5d.gif",
             ];
   var callback = () => api.sendMessage({body: `${tag} ‎𝗢̂𝗺𝗺 𝗺𝘂̣𝘁 𝗰𝗮́𝗶 𝗻𝗲̀ 💓` , mentions: [{
          tag: tag,
          id: Object.keys(event.mentions)[0]
        }],
  attachment: fs.createReadStream(__dirname + "/noprefix/ôm.gif")}, event.threadID, () => fs.unlinkSync(__dirname + "/noprefix/ôm.gif"));
      return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/noprefix/ôm.gif")).on("close",() => callback());
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
   };