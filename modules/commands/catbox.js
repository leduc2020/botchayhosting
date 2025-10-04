<<<<<<< HEAD
module.exports ={config: {
name: 'catbox',
commandCategory: 'Tiện ích',
hasPermssion: 0,
credits: 'Lê Minh Tiến',
usages: 'chuyển ảnh, video, gif sang link catbox',
description: 'chuyển ảnh,video,gif sang link catbox',
cooldowns: 0},

run:async(o)=>{let send=(msg)=>o.api.sendMessage(msg,o.event.threadID,o.event.messageID),msg=[];if (o.event.type !=="message_reply")return send("⚠️ Hình ảnh không hợp lệ, vui lòng phản hồi một video, ảnh nào đó");for (let i of o.event.messageReply.attachments) {
=======
module.exports ={config: {name: 'catbox',commandCategory: 'Tiện ích',hasPermssion: 0,credits: 'Lê Minh Tiến',usages: 'chuyển ảnh, video, gif sang link catbox',description: 'chuyển ảnh,video,gif sang link catbox',cooldowns: 0},run:async(o)=>{let send=(msg)=>o.api.sendMessage(msg,o.event.threadID,o.event.messageID),msg=[];if (o.event.type !=="message_reply")return send("⚠️ Hình ảnh không hợp lệ, vui lòng phản hồi một video, ảnh nào đó");for (let i of o.event.messageReply.attachments) {
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
await require('axios').get(`https://catbox-mnib.onrender.com/upload?url=${encodeURIComponent(i.url)}`).then(async ($) => {msg+=`"${$.data.url}",\n`})}return send(msg)}}