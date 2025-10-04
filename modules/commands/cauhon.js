/**
* @author ProCoderMew
* @warn Do not edit code or edit credits
*/

module.exports.config = {
    name: "cauhon",
    version: "2.0.0",
    hasPermssion: 0,
    credits: "DinhPhuc",
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
    const dirMaterial = __dirname + `/cache/`;
    const path = resolve(__dirname, 'cache', 'cauhon.png');
    if (!existsSync(dirMaterial + "canvas")) mkdirSync(dirMaterial, { recursive: true });
    if (!existsSync(path)) await downloadFile("https://imgur.com/6wbmljm.png", path);
}

async function makeImage({ one, two }) {
    const fs = global.nodemodule["fs-extra"];
    const path = global.nodemodule["path"];
    const axios = global.nodemodule["axios"]; 
    const jimp = global.nodemodule["jimp"];
    const __root = path.resolve(__dirname, "cache");

    let batgiam_img = await jimp.read(__root + "/cauhon.png");
    let pathImg = __root + `/batgiam_${one}_${two}.png`;
    let avatarOne = __root + `/avt_${one}.png`;
    let avatarTwo = __root + `/avt_${two}.png`;
    
    let getAvatarOne = (await axios.get(`https://graph.facebook.com/${one}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarOne, Buffer.from(getAvatarOne, 'utf-8'));
    
    let getAvatarTwo = (await axios.get(`https://graph.facebook.com/${two}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`, { responseType: 'arraybuffer' })).data;
    fs.writeFileSync(avatarTwo, Buffer.from(getAvatarTwo, 'utf-8'));
    
    let circleOne = await jimp.read(await circle(avatarOne));
    let circleTwo = await jimp.read(await circle(avatarTwo));
    batgiam_img.resize(500, 500).
    composite(circleOne.resize(130, 130), 300, 160).
    composite(circleTwo.resize(130, 130), 55, 115);
    
    let raw = await batgiam_img.getBufferAsync("image/png");
    
    fs.writeFileSync(pathImg, raw);
    fs.unlinkSync(avatarOne);
    fs.unlinkSync(avatarTwo);
    
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
    if (!mention) return api.sendMessage("→ 𝗩𝘂𝗶 𝗹𝗼̀𝗻𝗴 𝘁𝗮𝗴 𝟭 𝗻𝗴𝘂̛𝗼̛̀𝗶 𝗺𝗮̀ 𝗯𝗮̣𝗻 𝗺𝘂𝗼̂́𝗻 𝗰𝗮̂̀𝘂 𝗵𝗼̂𝗻", threadID, messageID);
    else {
        var one = senderID, two = mention;
        return makeImage({ one, two }).then(path => api.sendMessage({ body: "→ 𝗡𝗮̀𝘆 " + tag + '𝗹𝗮̀𝗺 𝗻𝗴𝘂̛𝗼̛̀𝗶 𝘆𝗲̂𝘂 𝘁𝗼̛́ 𝗻𝗵𝗲́ , 𝗵𝗼̂𝗻𝗴 đ𝗼̂̀𝗻𝗴 𝘆́ 𝗹𝗮̀𝗺 𝗰𝗵𝗼́ 😍',
            mentions: [{
          tag: tag,
          id: mention
        }],
     attachment: fs.createReadStream(path) }, threadID, () => fs.unlinkSync(path), messageID));
    }
}