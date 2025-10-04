<<<<<<< HEAD
﻿module.exports.config = {
	name: "ping",
	version: "1.0.4",
	hasPermssion: 1,
	credits: "Mirai Team",
	description: "tag toàn bộ thành viên",
	commandCategory: "Quản Trị Viên",
	usages: "[Text]",
	cooldowns: 5
};

module.exports.run = async function({ api, event, args }) {
	try {
		const botID = api.getCurrentUserID();
		const listUserID = event.participantIDs.filter(ID => ID != botID && ID != event.senderID);
		var body = (args.length != 0) ? args.join(" ") : "này mấy cậu không tương tác à tin kêu QTV kick bây giờ tương tác lẹ", mentions = [], index = 0;
		
		for(const idUser of listUserID) {
			body = "‎" + body;
			mentions.push({ id: idUser, tag: "‎", fromIndex: index - 1 });
			index -= 1;
		}

		return api.sendMessage({ body, mentions }, event.threadID, event.messageID);

	}
	catch (e) { return console.log(e); }
  }
=======
module.exports = {
	config: {
		name: "ping",
		usePrefix: false,
		credits: "Mr.Ben",
		hasPermssion: 1,
		usages: "bỏ trống hoặc nhập nội dung muốn ping, có thể reply ảnh, video",
		commandCategory: "Tiện ích", 
		cooldowns: 0
	},
	run: async function({ api, event, args, Users }) {
		try {
			const
				ID = event.participantIDs || (await api.getThreadInfo(event.threadID)).participantIDs,
				axios = require("axios"),
				fs = require("fs-extra")
		if (event.type == 'message_reply') {
			if (!event.messageReply.attachments[0]) return api.sendMessage("vui lòng chỉ reply ảnh, video", event.threadID, event.messageID)
			var
				mentions = []
			for (var user of ID) {
				var body = (args.length == 0) ? "Yuz 🍒 đã xóa bạn ra khỏi nhóm" : args.join(" ")
				mentions.push({
					tag: body,
					id: user
				})
			}
			var i = 1, ben = []
			for (var cc in event.messageReply.attachments) {
				if (event.messageReply.attachments[cc].type == "photo" || event.messageReply.attachments[cc].type == "sticker") type = ".jpg";
			if (event.messageReply.attachments[cc].type == "video") type = ".mp4";
			if (event.messageReply.attachments[cc].type == "audio") type = ".mp3";
			var
				path = __dirname + "/cache/ping" + (i++) + type,
				img = (await axios.get(event.messageReply.attachments[cc].url, {responseType:"arraybuffer"})).data
			fs.writeFileSync(path, Buffer.from(img,"utf-8"))
				ben.push(fs.createReadStream(path))
			}
			return api.sendMessage({
				body: `${body}`, 
				attachment: ben,
				mentions}, event.threadID, () => fs.unlinkSync(path))
		}
			else {
				var
					mentions = []
				for (var user of ID) {
				var
				 body = (args.length == 0) ? "Yuz đã xóa bạn ra khỏi nhóm" : args.join(" ")
				mentions.push({
					tag: body,
					id: user
				})
				}
			return api.sendMessage({
				body: `${body}`,
				mentions}, event.threadID)
			}
		} catch (e) {
			console.log(e)
		}
	}
					}
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
