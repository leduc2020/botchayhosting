<<<<<<< HEAD
module.exports.config = {
	name: "lyrics",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "Jukie~",
	description: "Lyrics from nhaccuatui",
	commandCategory: "Tiện ích",
	usages: "lyrics [name of the song]",
	cooldowns: 5
};

module.exports.run = async ({ api, event,args }) => {
const axios = require("axios");
let song = args.join(" ");
const res = await axios.get(`https://api.popcat.xyz/lyrics?song=${song}`);
var lyrics = res.data.lyrics;
var name = res.data.title;
var artist = res.data.artist;
const image = res.data.image;
const download = (await axios.get(image, {
        responseType: "stream"
    })).data;
return api.sendMessage({body:`Title: ${name}\nArtist: ${artist}\n\nLyrics:\n${lyrics}`,attachment : download} ,  event.threadID, event.messageID)
}
=======
const axios = require('axios');

module.exports.config = {
 name: "lyrics",
 version: "1.0.0",
 hasPermssion: 0,
 credits: "DongDev",
 description: "Công cụ tìm lời bài hát",
 commandCategory: "Tiện ích",
 usages: "[title]",
 cooldowns: 5
};

module.exports.run = async function ({ api, args, event, messageReply }) {
 const urlAPI = `https://${process.env.REPL_SLUG}.${process.env.REPL_OWNER}.repl.co`;
 const apiKey = "DongDevVip_1572349423";
 
 if (!args.length && (!event.messageReply || !event.messageReply.body)) {
 return api.sendMessage("⚠️ Vui lòng nhập tên bài hát hoặc reply tin nhắn có chứa tên bài hát", event.threadID, event.messageID);
 }
 const titles = event.type === "message_reply" ? event.messageReply.body : args.join(" ");
try {
 const resp = await axios.get(`${urlAPI}/lyrics?title=${titles}`);
 const { title, artist, lyrics } = resp.data;
 const message = `[ LỜI BÀI HÁT ]\n────────────────────\n📌 Bài hát: ${title}\n👤 Tác giả: ${artist}\n📝 Lời bài hát: ${lyrics}`;

 api.sendMessage(message, event.threadID, event.messageID);
 } catch (error) {
 api.sendMessage("❎ Có lỗi xảy ra khi tìm lời bài hát. Vui lòng thử lại sau.", event.threadID);
 }
};
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
