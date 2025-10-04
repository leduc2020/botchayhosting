const request = require("request");
const fs = require("fs")
const axios = require("axios")
module.exports.config = {
  name: "đấm",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Kaneki",
  description: "Đấm người bạn tag",
<<<<<<< HEAD
  commandCategory: "Hành Động",
=======
  commandCategory: "Game",
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
  usages: "[tag]",
  cooldowns: 5,
};

module.exports.run = async({ api, event, Threads, global }) => {
  var link = [    
<<<<<<< HEAD
"https://i.postimg.cc/SNX8pD8Z/13126.gif",
"https://i.postimg.cc/TYZb2gJT/1467506881-1016b5fd386cf30488508cf6f0a2bee5.gif",
"https://i.postimg.cc/fyV3DR33/anime-punch.gif",
"https://i.postimg.cc/P5sLnhdx/onehit-30-5-2016-3.gif",
=======
"https://i.imgur.com/RfOn1ww.gif"
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
   ];
   var mention = Object.keys(event.mentions);
     let tag = event.mentions[mention].replace("@", "");
    if (!mention) return api.sendMessage("Vui lòng tag 1 người", threadID, messageID);
<<<<<<< HEAD
   var callback = () => api.sendMessage({body:`${tag}` + ` Tao Đập Vô Cái Lồn Mày nè chó\nChừa Cái Tội Bố Láo Nha Con Chó Lồn`,mentions: [{tag: tag,id: Object.keys(event.mentions)[0]}],attachment: fs.createReadStream(__dirname + "/cache/puch.gif")}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/puch.gif"));  
      return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/cache/puch.gif")).on("close",() => callback());
   }
=======
   var callback = () => api.sendMessage({body:`${tag}` + ` 𝗕𝗮̣𝗻 𝘁𝗵𝗮̣̂𝘁 𝗹𝗮̀ 𝘅𝗮̀𝗺 𝗹𝗼̂̀𝗻 𝗺𝗶̀𝗻𝗵 𝘅𝗶𝗻 𝗽𝗵𝗲́𝗽 Đ𝗮̂́𝗺 𝗰𝗵𝗲̂́𝘁 𝗰𝗼𝗻 𝗺𝗲̣ 𝗯𝗮̣𝗻 𝗻𝗵𝗲́ 🎀`,mentions: [{tag: tag,id: Object.keys(event.mentions)[0]}],attachment: fs.createReadStream(__dirname + "/cache/spair.gif")}, event.threadID, () => fs.unlinkSync(__dirname + "/cache/spair.gif"));  
      return request(encodeURI(link[Math.floor(Math.random() * link.length)])).pipe(fs.createWriteStream(__dirname+"/cache/spair.gif")).on("close",() => callback());
}
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
