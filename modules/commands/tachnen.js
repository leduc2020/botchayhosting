module.exports.config = {
<<<<<<< HEAD
    name: 'tách',
    version: '1.1.1',
    hasPermssion: 0,
    Rent: 2,
    credits: 'adu',
    description: 'Tách nền',
    commandCategory: 'Tiện ích',
    usages: 'Reply images or url images',
    cooldowns: 2,
    usePrefix: false,
=======
    name: 'tachnen',
    version: '1.1.1',
    hasPermssion: 0,
    credits: 'Vihoo',
    description: 'tách nền ảnh',
    commandCategory: 'Tiện ích',
    usages: 'Reply images or url images',
    cooldowns: 2,
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
    dependencies: {
         'form-data': '',
         'image-downloader': ''
      }
  };
  
  const axios = require('axios');
  const FormData = require('form-data');
  const fs = require('fs-extra');
  const path = require('path');
  const {image} = require('image-downloader');
  module.exports.run = async function({
      api, event, args
  }){
      try {
<<<<<<< HEAD
        var tpk = `Tách thành công!`;
          if (event.type !== "message_reply") return api.sendMessage({body:"🧬 Bạn phải reply một ảnh nào đó",attachment: (await axios.get((await axios.get(`https://marked-bubbly-wildcat.glitch.me/cosplayv2`)).data.url, {
                                     responseType: 'stream'
                                 })).data
                   },  event.threadID, event.messageID);
          if (!event.messageReply.attachments || event.messageReply.attachments.length == 0) return api.sendMessage({body:"😡 Bạn phải reply một ảnh nào đó",attachment: (await axios.get((await axios.get(`https://marked-bubbly-wildcat.glitch.me/vdcosplayv2`)).data.url, {
                                     responseType: 'stream'
                                 })).data
                   },  event.threadID, event.messageID);
          if (event.messageReply.attachments[0].type != "photo") return api.sendMessage("➜ Đây không phải là image", event.threadID, event.messageID);
  
          const content = (event.type == "message_reply") ? event.messageReply.attachments[0].url : args.join(" ");
          const KeyApi = ["VFxMjCGQdECnQUySnYoiBUfv"]
=======
        var tpk = `🖼️=== [ 𝗧𝗔́𝗖𝗛 𝗕𝗔𝗖𝗞𝗚𝗥𝗢𝗨𝗡𝗗 ] ===🖼️
━━━━━━━━━━━━━━━
➜ 𝗧𝗮́𝗰𝗵 𝘁𝗵𝗮̀𝗻𝗵 𝗰𝗼̂𝗻𝗴 𝗻𝗲̂̀𝗻 𝗰𝘂̉𝗮 𝗮̉𝗻𝗵 𝗯𝗮̣𝗻 𝘃𝘂̛̀𝗮 𝗿𝗲𝗽𝗹𝘆`;
          if (event.type !== "message_reply") return api.sendMessage("Bạn phải reply một ảnh nào đó", event.threadID, event.messageID);
          if (!event.messageReply.attachments || event.messageReply.attachments.length == 0) return api.sendMessage("Bạn phải reply một ảnh nào đó", event.threadID, event.messageID);
          if (event.messageReply.attachments[0].type != "photo") return api.sendMessage("Đây không phải là image", event.threadID, event.messageID);
  
          const content = (event.type == "message_reply") ? event.messageReply.attachments[0].url : args.join(" ");
          const KeyApi = ["t4Jf1ju4zEpiWbKWXxoSANn4","CTWSe4CZ5AjNQgR8nvXKMZBd","PtwV35qUq557yQ7ZNX1vUXED","wGXThT64dV6qz3C6AhHuKAHV","82odzR95h1nRp97Qy7bSRV5M","4F1jQ7ZkPbkQ6wEQryokqTmo","4F1jQ7ZkPbkQ6wEQryokqTmo","sBssYDZ8qZZ4NraJhq7ySySR","NuZtiQ53S2F5CnaiYy4faMek","f8fujcR1G43C1RmaT4ZSXpwW"]
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
          const inputPath = path.resolve(__dirname, 'cache', `photo.png`);
           await image({
          url: content, dest: inputPath
      });
          const formData = new FormData();
          formData.append('size', 'auto');
          formData.append('image_file', fs.createReadStream(inputPath), path.basename(inputPath));
          axios({
              method: 'post',
              url: 'https://api.remove.bg/v1.0/removebg',
              data: formData,
              responseType: 'arraybuffer',
              headers: {
                  ...formData.getHeaders(),
                  'X-Api-Key': KeyApi[Math.floor(Math.random() * KeyApi.length)],
              },
              encoding: null
          })
              .then((response) => {
                  if (response.status != 200) return console.error('Error:', response.status, response.statusText);
                  fs.writeFileSync(inputPath, response.data);
<<<<<<< HEAD
                  return api.sendMessage({body:tpk, attachment: fs.createReadStream(inputPath)},event.threadID, () => fs.unlinkSync(inputPath));
=======
                  return api.sendMessage({ attachment: fs.createReadStream(inputPath) }, event.threadID, () => fs.unlinkSync(inputPath));
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
              })
              .catch((error) => {
                  return console.error('Request failed:', error);
              });
       } catch (e) {
          console.log(e)
<<<<<<< HEAD
          return api.sendMessage(`➜ Lỗi rồi hãy kiểm tra key api!!!`, event.threadID, event.messageID);
    }
  };
=======
          return api.sendMessage(`có cái nịt`, event.threadID, event.messageID);
    }
  };
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
