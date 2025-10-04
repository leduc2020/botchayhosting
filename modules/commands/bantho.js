module.exports.config = {
<<<<<<< HEAD
	name: "bantho",
	version: "1.0.1",
	hasPermssion: 0,
	credits: "quên - rework by DMH dzai",
	description: "Ảnh bàn thờ của đứa tag",
	commandCategory: "Hành Động",
	usages: "@tag",
	cooldowns: 5,
	dependencies: {
	  "fs-extra": "",
	  "axios": "",
	  "canvas" :"",
	  "jimp": "",
	  "node-superfetch": ""
	}
};

module.exports.circle = async (image) => {
	  const jimp = global.nodemodule['jimp'];
  	image = await jimp.read(image);
  	image.circle();
  	return await image.getBufferAsync("image/png");
};

module.exports.run = async ({ event, api, args, Users }) => {
try {
  const Canvas = global.nodemodule['canvas'];
  const request = global.nodemodule["node-superfetch"];
  const jimp = global.nodemodule["jimp"];
  const fs = global.nodemodule["fs-extra"];
  var path_toilet = __dirname+'/cache/bantho.png'; 
  var id = Object.keys(event.mentions)[0] || event.senderID;
  const canvas = Canvas.createCanvas(960, 634);
	const ctx = canvas.getContext('2d');
	const background = await Canvas.loadImage('https://i.postimg.cc/2SN36JnQ/brK0Hbb.jpg');
  
	var avatar = await request.get(`https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
	avatar = await this.circle(avatar.body);
	ctx.drawImage(background, 0, 0, canvas.width, canvas.height);
	ctx.drawImage(await Canvas.loadImage(avatar), 353, 158, 205, 205);
	const imageBuffer = canvas.toBuffer();
	fs.writeFileSync(path_toilet,imageBuffer);
	 api.sendMessage({attachment: fs.createReadStream(path_toilet, {'highWaterMark': 128 * 1024}), body: "Ơ kìa bạn khỏe không ?:))"}, event.threadID, () => fs.unlinkSync(path_toilet), event.messageID);
}
catch(e) {api.sendMessage(e.stack, event.threadID )}
}
// Text by DMH - do not clear this line & forget me !

  ////////   //         /////////       //         ////////   /////////
  //    //   //         //           //    //    //           //
  //   ///   //         //          //      //    ////        //
  ////////   //         /////////   //      //      ///       /////////
  //         //         //          //////////         ///    //
  //         //         //          //      //           //   //
  //         /////////  /////////   //      //   ////////     /////////  
=======
  name: "bantho",
  version: "1.0.2",
  hasPermssion: 0,
  credits: "MewMew revamped by DMH",
  description: "Comment trên phub ( ͡° ͜ʖ ͡°)",
  commandCategory: "game",
  usages: "phub [text]",
  cooldowns: 10,
  dependencies: {
    canvas: "",
    axios: "",
    "fs-extra": "",
  },
};

module.exports.wrapText = (ctx, text, maxWidth) => {
  return new Promise((resolve) => {
    if (ctx.measureText(text).width < maxWidth) return resolve([text]);
    if (ctx.measureText("W").width > maxWidth) return resolve(null);
    const words = text.split(" ");
    const lines = [];
    let line = "";
    while (words.length > 0) {
      let split = false;
      while (ctx.measureText(words[0]).width >= maxWidth) {
        const temp = words[0];
        words[0] = temp.slice(0, -1);
        if (split) words[1] = `${temp.slice(-1)}${words[1]}`;
        else {
          split = true;
          words.splice(1, 0, temp.slice(-1));
        }
      }
      if (ctx.measureText(`${line}${words[0]}`).width < maxWidth)
        line += `${words.shift()} `;
      else {
        lines.push(line.trim());
        line = "";
      }
      if (words.length === 0) lines.push(line.trim());
    }
    return resolve(lines);
  });
};

module.exports.run = async function ({ api, event, args, Users }) {
  let { senderID, threadID, messageID } = event;
  const { loadImage, createCanvas } = require("canvas");
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];
  let pathImg = __dirname + "/cache/phub.png";
  var text = args.join(" ");
  var namee = (await Users.getData(senderID)).name
  var id = Object.keys(event.mentions)[0] || event.senderID;
  let pathAva = __dirname + "/cache/avt.png";
  let Avatar = (
    await axios.get(
      `https://graph.facebook.com/${id}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`,
      { responseType: "arraybuffer" }
    )
  ).data;
  fs.writeFileSync(pathAva, Buffer.from(Avatar, "utf-8"));
  if (!text)
    return api.sendMessage("Nhập nội dung comment phub", threadID, messageID);
  let getPorn = (
    await axios.get(`https://i.imgur.com/brK0Hbb.jpg`, {
      responseType: "arraybuffer",
    })
  ).data;
  fs.writeFileSync(pathImg, Buffer.from(getPorn, "utf-8"));
  let baseImage = await loadImage(pathImg);
  let baseAva = await loadImage(pathAva);
  let canvas = createCanvas(baseImage.width, baseImage.height);
  let ctx = canvas.getContext("2d");
  ctx.drawImage(baseImage, 0, 0, canvas.width, canvas.height);
  ctx.font = "700 23px Arial";
  ctx.fillStyle = "#FF9900";
  ctx.textAlign = "start";
  let fontSize = 23;
  ctx.drawImage(baseAva, 388, 162, 144, 180);
  while (ctx.measureText(text).width > 2600) {
    fontSize--;
    ctx.font = `400 ${fontSize}px Arial, sans-serif`;
  }
  const lines = await this.wrapText(ctx, text, 1160);
  //ctx.fillText(lines.join("\n"), 30, 443); //comment
  ctx.beginPath();
  const imageBuffer = canvas.toBuffer();
  fs.writeFileSync(pathImg, imageBuffer);
  fs.removeSync(pathAva);
  return api.sendMessage(
    { body: "Xin vĩnh biệt cụuuuu !!!",
      attachment: fs.createReadStream(pathImg) },
    threadID,
    () => fs.unlinkSync(pathImg),
    messageID
  );
};
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
