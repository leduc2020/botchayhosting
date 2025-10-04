module.exports.config = {
<<<<<<< HEAD
	name: "dịch",
=======
	name: "dich",
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
	version: "1.0.1",
	hasPermssion: 0,
	credits: "Mirai Team",
	description: "Dịch văn bản",
	commandCategory: "Tiện ích",
<<<<<<< HEAD
	usages: "[prefix]dịch [en/ko/ja/vi] [Text]",
	usePrefix:false,
=======
	usages: "[en/ko/ja/vi] [Text]",
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
	cooldowns: 5,
	dependencies: {
		"request":  ""
	}
};

module.exports.run = async ({ api, event, args }) => {
<<<<<<< HEAD
	const request = require("request");
	var content = args.join(" ");
	if (content.length == 0 && event.type != "message_reply") return global.utils.throwError(this.config.name, event.threadID,event.messageID);
	var translateThis = content.slice(0, content.indexOf(" ->"));
=======
  const axios = require('axios');
  const { resolve } = global.nodemodule["path"];
  const { createReadStream, unlinkSync } = global.nodemodule["fs-extra"];
	const request = global.nodemodule["request"];
	var content = args.join(" ");
	if (content.length == 0 && event.type != "message_reply") return global.utils.throwError(this.config.name, event.threadID,event.messageID);
var language = (["ru","en","ko","ja"].some(item => content.indexOf(item) == 0)) ? content.slice(0, content.indexOf(" ")) : global.config.language;
		var msg = (language != global.config.language) ? content.slice(3, content.length) : content;
		const path = resolve(__dirname, 'cache', `${event.threadID}_${event.senderID}.mp3`);
	var translateThis = content.slice(0, content.indexOf(" ->"));
  
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
	var lang = content.substring(content.indexOf(" -> ") + 4);
	if (event.type == "message_reply") {
		translateThis = event.messageReply.body
		if (content.indexOf("-> ") !== -1) lang = content.substring(content.indexOf("-> ") + 3);
		else lang = global.config.language;
	}
	else if (content.indexOf(" -> ") == -1) {
		translateThis = content.slice(0, content.length)
		lang = global.config.language;
<<<<<<< HEAD
=======
    await global.utils.downloadFile(`https://translate.google.com/translate_tts?ie=UTF-8&q=${encodeURIComponent(msg)}&tl=${language}&client=tw-ob`, path);
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
	}
	return request(encodeURI(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=${lang}&dt=t&q=${translateThis}`), (err, response, body) => {
		if (err) return api.sendMessage("Đã có lỗi xảy ra!", event.threadID, event.messageID);
		var retrieve = JSON.parse(body);
		var text = '';
		retrieve[0].forEach(item => (item[0]) ? text += item[0] : '');
		var fromLang = (retrieve[2] === retrieve[8][0][0]) ? retrieve[2] : retrieve[8][0][0]
<<<<<<< HEAD
		api.sendMessage(`📄 Google Dịch:\n─────────────────\n ${text}\n─────────────────\n ✏️ Dịch từ  ${fromLang} sang ${lang}`, event.threadID, event.messageID);
=======
    api.sendMessage({body: `=====「 𝗚𝗢𝗢𝗚𝗟𝗘 𝗗𝗜̣𝗖𝗛 」=====\n\n💞 𝗕𝗼𝘁 𝘃𝘂̛̀𝗮 𝗱𝗶̣𝗰𝗵 𝘅𝗼𝗻𝗴 𝗻𝗼̣̂𝗶 𝗱𝘂𝗻𝗴 ${event.body} 𝗰𝘂̉𝗮 𝗯𝗮̣𝗻\n🗣️ 𝗡𝗴𝗼̂𝗻 𝗡𝗴𝘂̛̃: English \n🌐 𝗡𝗼̣̂𝗶 𝗱𝘂𝗻𝗴 𝘀𝗮𝗼 𝗸𝗵𝗶 𝗱𝗶̣𝗰𝗵: ${text}\n🔗 Đ𝘂̛𝗼̛̣𝗰 𝗱𝗶̣𝗰𝗵 𝘁𝘂̛̀ ${fromLang} 𝘀𝗮𝗻𝗴 ${lang}`, attachment: createReadStream(path)}, event.threadID, () => unlinkSync(path))
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
	});
}