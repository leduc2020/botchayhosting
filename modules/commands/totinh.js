module.exports.config = {
<<<<<<< HEAD
  name: "totinh",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Vdang",
  description: "",
  commandCategory: "Tình Yêu",
  usages: "[tag]",
  cooldowns: 5,
  dependencies: {
      "axios": "",
      "fs-extra": "",
      "path": "",
      "jimp": ""
  }
};

module.exports.onLoad = async() => {
  const { resolve } = global.nodemodule["path"];
  const { existsSync, mkdirSync } = global.nodemodule["fs-extra"];
  const { downloadFile } = global.utils;
  const dirMaterial = __dirname + `/cache/canvas/`;
  const path = resolve(__dirname, 'cache/canvas', 'totinh.jpg');
  if (!existsSync(dirMaterial + "canvas")) mkdirSync(dirMaterial, { recursive: true });
  if (!existsSync(path)) await downloadFile("https://i.postimg.cc/tJ2Qjsdv/anh-to-tinh-800x590.jpg", path);
}

async function makeImage({ one, two }) {
  const fs = global.nodemodule["fs-extra"];
  const path = global.nodemodule["path"];
  const axios = global.nodemodule["axios"]; 
  const jimp = global.nodemodule["jimp"];
  const __root = path.resolve(__dirname, "cache", "canvas");

  let baseImage = await jimp.read(__root + "/totinh.jpg");
  let pathImg = __root + `/love_${one}_${two}.png`;
  let avatarOnePath = __root + `/avt_${one}.png`;
  let avatarTwoPath = __root + `/avt_${two}.png`;

  // Tải avatar từ Facebook
  const avatarUrlOne = `https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;
  const avatarUrlTwo = `https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`;

  let avatarOneData = (await axios.get(avatarUrlOne, { responseType: 'arraybuffer' })).data;
  let avatarTwoData = (await axios.get(avatarUrlTwo, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(avatarOnePath, Buffer.from(avatarOneData, 'utf-8'));
  fs.writeFileSync(avatarTwoPath, Buffer.from(avatarTwoData, 'utf-8'));

  // Xử lý ảnh tròn
  let avatarOne = await jimp.read(await circle(avatarOnePath));
  let avatarTwo = await jimp.read(await circle(avatarTwoPath));

  // Resize và chèn vào đúng vị trí đầu nhân vật (theo ảnh mẫu bạn gửi)
  avatarOne.resize(70, 70); // Nam (bên trái)
  avatarTwo.resize(70, 70); // Nữ (bên phải)
  baseImage.composite(avatarOne, 76, 178); // đầu nữ
  baseImage.composite(avatarTwo, 215, 177); // đầu nam

  // Xuất ảnh
  let finalBuffer = await baseImage.getBufferAsync("image/png");
  fs.writeFileSync(pathImg, finalBuffer);
  fs.unlinkSync(avatarOnePath);
  fs.unlinkSync(avatarTwoPath);

  return pathImg;
}

async function circle(image) {
  const jimp = require("jimp");
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
}

module.exports.run = async function ({ event, api, args }) {
  const fs = global.nodemodule["fs-extra"];
  const { threadID, messageID, senderID } = event;
  var mention = Object.keys(event.mentions)[0]
  let tag = event.mentions[mention].replace("@", "");
  if (!mention) return api.sendMessage("Vui lòng tag 1 người", threadID, messageID);
  else {
      var one = senderID, two = mention;
      return makeImage({ one, two }).then(path => api.sendMessage({ body: "Này "  +  tag + 'Làm người yêu tớ nhéee💗',
          mentions: [{
        tag: tag,
        id: mention
      }],
   attachment: fs.createReadStream(path) }, threadID, () => fs.unlinkSync(path), messageID));
  }
=======
	name: "totinh",
	version: "1.0.0",
	hasPermssion: 0,
	credits: "Henry",
	description: "Tỏ tình",
	commandCategory: "game",
	usages: "[nam/nữ] [tên tìm kiếm]",
	cooldowns: 5
};

function getMsg() {
    //Bạn có thể custom tin nhắn chúc mừng cặp đôi mới tại đây
    return `Mọi người cùng tới chúc mừng hạnh phúc cho cặp đôi mới này nào 🥰`
}

module.exports.handleReaction = async function({ api, event, handleReaction, Users, Threads }) {
	var { threadID, messageID, userID } = event;
	var { change, talkID } = handleReaction;
  const { PREFIX } = global.config;
	if (userID == change.ID) {
    var userInfo = await Users.getData(talkID);
    var matesInfo = await Users.getData(change.ID);
    var infoUser_1 = await Users.getData(talkID);
    var infoUser_2 = await Users.getData(change.ID);
    if (!infoUser_1.data) infoUser_1.data = new Object();
    if (!infoUser_1.data) infoUser_2.data = new Object();
    infoUser_1.data.dating = { status: true, mates: change.ID, time: { origin: Date.now(), fullTime: global.client.getTime('fullTime') } };
    infoUser_2.data.dating = { status: true, mates: talkID, time: { origin: Date.now(), fullTime: global.client.getTime('fullTime') } };
		await Users.setData(talkID, infoUser_1);
    await Users.setData(change.ID, infoUser_2);
		return api.sendMessage(`Bạn đã thả cảm xúc, đồng nghĩa với việc bạn đã đồng ý với lời tỏ tình này của người kia.\n\n${getMsg()}\nNotes:\n- Cả 2 bạn sẽ không thể chia tay trong vòng 7 ngày kể từ khi bắt đầu.\n- Hiện tại bạn có thể xem thông tin về cặp đôi của mình bằng cách ${PREFIX}dating info`, threadID, async (error, info) => {
			api.changeNickname(`${change.name} - Dating with ${infoUser_1.name}`, threadID, change.ID);
      var { userInfo } = await Threads.getInfo(threadID);
      if (Object.keys(userInfo).includes(talkID)) {
        api.changeNickname(`${userInfo_1.name} - Dating with ${change.name}`, threadID, talkID.ID);
      }
			api.sendMessage(`${change.name} đã đồng ý với lời tỏ tình của bạn, cả 2 người đã bắt đầu ở trạng thái hẹn hò. Bạn có thể xem thông tin về cặp đôi của mình bằng lệnh dating.`, talkID);
		})
	}
}

module.exports.handleReply = async function({ api, event, handleReply, Threads }) {
	var { threadID, messageID, senderID, body } = event;
	var { type, match } = handleReply;
	switch (type) {
		case "change":
			if (isNaN(body)) return api.sendMessage(`Lựa chọn của bạn phải là một số và là số nguyên dương.`, threadID, messageID);
			if (body > match.length) return api.sendMessage(`Lựa chọn của bạn không nằm trong danh s��ch.`, threadID, messageID);
			var change = match[body - 1];
      console.log(change)
			return api.sendMessage(`Vui lòng reply tin nhắn này kèm lời nhắn mà bạn muốn gửi đến cho người ấy.`, threadID, (error, info) => {
				global.client.handleReply.push({
					name: this.config.name,
					messageID: info.messageID,
					change: change,
					type: "message"
				})
			})
		case "message" :
			if (!body) return api.sendMessage(`Bạn cần nhập lời nhắn.`, threadID, messageID);
			var { change } = handleReply;
      var allThreads = await Threads.getAll();
      var allThreadsInfo = [], finish = 0
      for (var i of allThreads) {
        var { userInfo: allUsers } = await Threads.getInfo(i.threadID);
        for (var user of allUsers) {
          console.log(user, change.ID)
          if (user.id == change.ID) {
            console.log("Zo")
            var msg = {
              body: `Hey ~ ${change.name} - Bạn vừa nhận được một lời tỏ tình từ một người ẩn danh với lời tỏ tình:\n\n${body}.\n\nNếu bạn đồng ý, vui lòng thả cảm xúc <3 vào tin nhắn này.`,
              mentions: [ { tag: change.name, id: change.ID } ]
            };
            return api.sendMessage(msg, i.threadID, (error, info) => {
              finish++;
              global.client.handleReaction.push({
                name: this.config.name,
								messageID: info.messageID,
								change: change,
								talkID: senderID,
								type: 'accept'
              })
              api.sendMessage(`Đã gửi lời tỏ tình thành công cho ${change.name}. Bạn sẽ được thông báo khi ${change.name} đồng ý`, threadID);
            })
            if (finish == 0) return api.sendMessage(`Đã xảy ra lỗi khi gửi lời tỏ tình cho ${change.name}, vui lòng thử lại sau.`, threadID);
          }
        }
      }
		default:
			break;
	}
}


module.exports.run = async function({ api, args, event, Users }) {
	var { threadID, messageID, senderID, isGroup } = event;
	var { allowInbox } = global.config;
	if (isGroup == true) return api.sendMessage(`Lệnh này không được sử dụng trong box, vui lòng nhắn tin riêng với Bot.`, threadID);
	if (allowInbox == false) return api.sendMessage(`Để sử dụng lệnh này, vui lòng bật chế độ allowInbox trong config`, threadID);
	if (!/Nữ|Nam|nữ|nam/g.test(args[0])) return api.sendMessage(`Bạn cần nhập giới tính của đối tượng mà bạn muốn tìm.\n\nVí Dụ: <prefix>totinh nam/nữ p`, threadID, messageID);
	if (!/[a-z]|[A-Z]/g.test(args[1])) return api.sendMessage(`Để giúp việc tìm kiếm nhanh hơn, bạn cần nhập chữ cái đầu hoặc tên của người cần tìm.`, threadID, messageID);
	var userInfo = await Users.getData(senderID);
	if (userInfo.data && userInfo.data.dating && userInfo.data.dating.status == true) return api.sendMessage(`Tính cắm sừng người ta hay sao mà định tỏ tình ai nữa?`, threadID, messageID);
	switch (args[0]) {
		case "Nam":
		case "nam":
			var gender = 2;
			break;
		case "Nữ":
		case "nữ":
		case "nu":
		case "Nu":
			var gender = 1;
			break
		default:
			break;
	}
	var match = [], msg = 'Đây là những người mà bạn có thể tỏ tình:\n\n', number = 1;
	var allUsersInfo = await Users.getAll();
	for (var i of allUsersInfo) {
        if (i.name.toLowerCase().includes(args[1].toLowerCase())) {
            if (i.data !== null && !i.data.dating || i.data !== null && i.data.dating && i.data.dating.status == false) {
                let uif = await Users.getInfo(i.userID);
                if (uif.gender == gender) match.push({ ID: i.userID, name: i.name });
            }
        }
	}
	if (match.length == 0) return api.sendMessage(`Rất tiếc, không có đối tượng nào mà bạn có thể tỏ tình.`);
	for (var i of match) msg += `${number++}. ${i.name}\n`;
	msg += `\nReply tin nhắn này số tương ứng với người mà bạn muốn tỏ tình.`;
	return api.sendMessage(msg, threadID, (error, info) => {
        console.log(info)
		global.client.handleReply.push({
			name: this.config.name,
			messageID: info.messageID,
			type: 'change',
			match: match
		})
	});
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
}