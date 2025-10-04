module.exports.config = {
<<<<<<< HEAD
  name: "taoanhbox",
  version: "2.3.3",
  hasPermssion: 1,
  credits: "ThanhTung",
  description: "Tạo ảnh all thành viên trong box",
  commandCategory: "Quản Trị Viên",
  usages: "anhbox <size> [#mã màu] <tiêu đề>",
  cooldowns: 5,
  dependencies: {
    "fs-extra": "",
    "axios": "",
    "canvas": "",
    "jimp": "",
    "node-superfetch": "",
    "chalk": ""
  }
};

module.exports.circle = async (image) => {
  const jimp = global.nodemodule["jimp"];
  image = await jimp.read(image);
  image.circle();
  return await image.getBufferAsync("image/png");
};

module.exports.run = async ({ event, api, args }) => {
  const jimp = global.nodemodule["jimp"];
  const Canvas = global.nodemodule["canvas"];
  const superfetch = global.nodemodule["node-superfetch"];
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];
  const { threadID, messageID } = event;

  function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)); }

  if (args[0] == 'help' || args[0] == '0' || args[0] == '-h') {
    return api.sendMessage('Sử dụng: ' + this.config.name + ' [size avt] [mã màu] [tên nhóm (title)] || bỏ trống tất cả bot sẽ get thông tin tự động', threadID, messageID);
  }

  const fontPath = __dirname + `/cache/TUVBenchmark.ttf`;
  if (!fs.existsSync(fontPath)) {
    const fontData = (await axios.get(`https://drive.google.com/u/0/uc?id=1NIoSu00tStE8bIpVgFjWt2in9hkiIzYz&export=download`, { responseType: "arraybuffer" })).data;
    fs.writeFileSync(fontPath, Buffer.from(fontData, "utf-8"));
  }

  const bgList = [
"https://files.catbox.moe/f25ukt.jpeg",
"https://files.catbox.moe/u7amr0.jpeg",
"https://files.catbox.moe/csiqa3.jpeg",
"https://files.catbox.moe/2nzxgc.jpeg"];
  const background = await Canvas.loadImage(bgList[Math.floor(Math.random() * bgList.length)]);
  const bgX = background.width;

  const threadInfo = await api.getThreadInfo(threadID);
  const { participantIDs, adminIDs, name, userInfo, threadName } = threadInfo;
  const admin = adminIDs.map(e => e.id);
  const live = userInfo.filter(u => u.gender !== undefined);

  const boxAvatarURL = threadInfo.imageSrc || `https://i.imgur.com/bwMjOdp.jpg`;
  const boxAvatarRaw = await superfetch.get(boxAvatarURL);
  const boxAvatarBuffer = boxAvatarRaw.body;
  const boxAvatarCircle = await module.exports.circle(boxAvatarBuffer);
  const boxAvatarImage = await Canvas.loadImage(boxAvatarCircle);

  let size, color, title;
  const image = bgX * 1000;
  const sizeParti = Math.floor(image / live.length);
  const sizeAuto = Math.floor(Math.sqrt(sizeParti));
  if (!args[0]) {
    size = sizeAuto;
    color = '#FFFFFF';
    title = threadName || name;
  } else {
    size = parseInt(args[0]);
    if (isNaN(size) || size < 10 || size > 1000) return api.sendMessage("Kích thước không hợp lệ!", threadID, messageID);
    color = args[1] || '#FFFFFF';
    title = args.slice(2).join(" ").trim();
    if (!title) title = threadName || name;
  }

  const l = parseInt(size / 15);
  const adminUsers = live.filter(u => admin.includes(u.id));
  const memberUsers = live.filter(u => !admin.includes(u.id));
  const maxPerRow = Math.floor(bgX / (size + l));

  const imgCanvas = Canvas.createCanvas(bgX, 5000);
  const ctx = imgCanvas.getContext('2d');

  for (let y = 0; y < 5000; y += background.height) {
    ctx.drawImage(background, 0, y, bgX, Math.min(background.height, 5000 - y));
  }

  Canvas.registerFont(fontPath, { family: "TUVBenchmark" });
  const maxTitleWidth = bgX * 0.9;
  let titleFontSize = 100;
  ctx.font = `${titleFontSize}px TUVBenchmark`;
  while (ctx.measureText(title).width > maxTitleWidth && titleFontSize > 10) {
    titleFontSize -= 2;
    ctx.font = `${titleFontSize}px TUVBenchmark`;
  }

  ctx.textAlign = "center";
  ctx.lineWidth = 8;
  ctx.strokeStyle = "#ff69b4";
  ctx.strokeText(title, bgX / 2, titleFontSize + 30);
  ctx.fillStyle = color;
  ctx.fillText(title, bgX / 2, titleFontSize + 30);

  // Avatar box hình tròn với viền trắng
  const boxSize = 400;
  const boxX = 60;
  const boxY = 40;
  const centerX = boxX + boxSize / 2;
  const centerY = boxY + boxSize / 2;

  ctx.save();
  ctx.beginPath();
  ctx.arc(centerX, centerY, boxSize / 2, 0, Math.PI * 2);
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(boxAvatarImage, boxX, boxY, boxSize, boxSize);
  ctx.restore();

  ctx.beginPath();
  ctx.arc(centerX, centerY, boxSize / 2 + 5, 0, Math.PI * 2);
  ctx.strokeStyle = "#FFFFFF";
  ctx.lineWidth = 10;
  ctx.stroke();
  ctx.closePath();

  // Avatar admin căn giữa
  let totalAdminWidth = adminUsers.length * (size + l) - l;
  let xRight = Math.floor((bgX - totalAdminWidth) / 2);
  let yRight = titleFontSize + 80;

  for (let adminUser of adminUsers) {
    try {
      const avtAdmin = await superfetch.get(`https://graph.facebook.com/${adminUser.id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
      const avatar = await module.exports.circle(avtAdmin.body);
      const avatarImage = await Canvas.loadImage(avatar);
      ctx.drawImage(avatarImage, xRight, yRight, size, size);

      ctx.beginPath();
      ctx.arc(xRight + size / 2, yRight + size / 2, size / 2 + 4, 0, Math.PI * 2);
      ctx.strokeStyle = "#00FF00";
      ctx.lineWidth = 6;
      ctx.stroke();
      ctx.closePath();

      xRight += size + l;
    } catch (err) {
      console.log("Lỗi admin avatar: ", adminUser.id);
    }
  }

  // Vẽ avatar thành viên căn giữa
  let i = 0;
  const drawAvatars = async (users, startY) => {
    let x = 0, y = startY;
    for (let index = 0; index < users.length;) {
      const rowUsers = users.slice(index, index + maxPerRow);
      const rowWidth = rowUsers.length * (size + l) - l;
      x = Math.floor((bgX - rowWidth) / 2);

      for (let user of rowUsers) {
        try {
          const avtUser = await superfetch.get(`https://graph.facebook.com/${user.id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`);
          const avatar = await module.exports.circle(avtUser.body);
          const avatarload = await Canvas.loadImage(avatar);
          ctx.drawImage(avatarload, x, y, size, size);
          x += size + l;
          i++;
        } catch (e) {
          console.log("Lỗi: " + user.id);
        }
        index++;
      }
      y += size + l;
    }
    return y;
  };

  const lastYMembers = await drawAvatars(memberUsers, yRight + size + 40);
  const actualHeight = lastYMembers + size + 200;

  const cutCanvas = Canvas.createCanvas(bgX, actualHeight);
  const cutCtx = cutCanvas.getContext('2d');
  cutCtx.drawImage(imgCanvas, 0, 0);

  const pathAVT = __dirname + `/cache/${Date.now() + 10000}.png`;
  const cutImage = await jimp.read(cutCanvas.toBuffer());
  await cutImage.writeAsync(pathAVT);
  await delay(300);

  return api.sendMessage({
    body: `🍗 Tổng: ${i} thành viên\n👑 Admin: ${adminUsers.length} | 👥 Member: ${memberUsers.length}\n📏 Kích thước ảnh: ${bgX} x ${actualHeight}\n🍠 Lọc ${participantIDs.length - i} người dùng ẩn`,
    attachment: fs.createReadStream(pathAVT)
  }, threadID, (err) => {
    if (err) api.sendMessage(`Đã xảy ra lỗi: ${err}`, threadID, messageID);
    fs.unlinkSync(pathAVT);
  }, messageID);
};
=======
    name: "taoanhbox",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "shion - key chinhle",
    description: "Tạo ảnh all thành viên trong box",
    commandCategory: "game",
    usages: "family <size> [#mã màu] hoặc family <size>\nNhập size avatar thành viên thích hợp và mã màu cho chữ (mặc định là đen) theo cú pháp:\n$family <size> <mã màu> <title>\nTrong đó:\n•size: Size mỗi avatar thành viên\n•mã màu: mã màu dạng hex\n•title: tiêu đề ảnh, mặc định là tên box\nVí dụ: $family 200 #ffffff Anh em một nhà\nNếu chọn size = 0 thì sẽ tự chỉnh size, nếu không điền title thì title sẽ là tên box",
    cooldowns: 5,
    dependencies: {
      "fs-extra": "", 
      "axios":"", 
      "canvas": "", 
      "jimp": "", 
      "node-superfetch": "",
      "chalk": ""
    }
};
module.exports.run = async ({ event, api, args }) => {
module.exports.circle = async (image) => {
    const jimp = global.nodemodule["jimp"];
    image = await jimp.read(image);
    image.circle();
    return await image.getBufferAsync("image/png");
  }
  const jimp = global.nodemodule["jimp"];
  const Canvas = global.nodemodule["canvas"];
  const superfetch=global.nodemodule["node-superfetch"];
  const fs = global.nodemodule["fs-extra"];
  const axios = global.nodemodule["axios"];
  const img = new Canvas.Image();
  function delay(ms) { return new Promise(resolve => setTimeout(resolve, ms)) };
  const { threadID, messageID } = event;
  var live = [], admin = [], i = 0;
  if(args[0] == 'help' || args[0] == '0' || args[0] == '-h') return api.sendMessage('Sử dụng: '+ this.config.name + ' [size avt]' + ' [mã màu]' + ' [tên nhóm (title)] || bỏ trống tất cả bot sẽ get thông tin tự động', threadID, messageID)
  /*============DOWNLOAD FONTS=============*/
  if(!fs.existsSync(__dirname+`/cache/TUVBenchmark.ttf`)) { 
      let downFonts = (await axios.get(`https://drive.google.com/u/0/uc?id=1NIoSu00tStE8bIpVgFjWt2in9hkiIzYz&export=download`, { responseType: "arraybuffer" })).data;
      fs.writeFileSync(__dirname+`/cache/TUVBenchmark.ttf`, Buffer.from(downFonts, "utf-8"));
    };
  /*===========BACKGROUND & AVATAR FRAMES==========*/
  var bg = ['https://i.imgur.com/P3QrAgh.jpg', 'https://i.imgur.com/RueGAGI.jpg', 'https://i.imgur.com/bwMjOdp.jpg', 'https://i.imgur.com/trR9fNf.jpg']
  var background = await Canvas.loadImage(bg[Math.floor(Math.random() * bg.length)]);
  var bgX = background.width;
  var bgY = background.height;
  var khungAvt = await Canvas.loadImage("https://i.imgur.com/gYxZFzx.png")
  const imgCanvas = Canvas.createCanvas(bgX, bgY);
  const ctx = imgCanvas.getContext('2d');
  ctx.drawImage(background, 0, 0, imgCanvas.width, imgCanvas.height);
  /*===============GET INFO GROUP CHAT==============*/
  var { participantIDs, adminIDs, name, userInfo } = await api.getThreadInfo(threadID)
  for(let idAD of adminIDs) { admin.push(idAD.id) };
  /*=====================REMOVE ID DIE===================*/
  for(let idUser of userInfo) {
    if (idUser.gender != undefined) { live.push(idUser) }
  }
  /*======================CUSTOM====================*/
  let size, color, title
  var image = bgX*(bgY-200);
  var sizeParti = Math.floor(image/live.length);
  var sizeAuto = Math.floor(Math.sqrt(sizeParti));
  if(!args[0]) { size = sizeAuto; color = '#FFFFFF' ; title = encodeURIComponent(name) }
  else { size = parseInt(args[0]); color = args[1] || '#FFFFFF' ; title = args.slice(2).join(" ") || name; }
  /*===========DISTANCE============*/
  var l = parseInt(size/15), x = parseInt(l), y = parseInt(200), xcrop = parseInt(live.length*size), ycrop = parseInt(200+size);
  size = size-l*2;
  /*================CREATE PATH AVATAR===============*/
  api.sendMessage(`🍗Ảnh dự tính: ${participantIDs.length}\n🍠Size background: ${bgX} x ${bgY}\n🥑Size Avatar: ${size}\n🥪Màu: ${color}`,threadID, messageID);
  var pathAVT = (__dirname+`/cache/${Date.now()+10000}.png`)
  /*=================DRAW AVATAR MEMBERS==============*/
    for(let idUser of live) {
      console.log("Vẽ: " + idUser.id);
      try { var avtUser = await superfetch.get(`https://graph.facebook.com/${idUser.id}/picture?height=720&width=720&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`) } 
      catch(e) { continue }
      if(x+size > bgX) { xcrop = x; x += (-x)+l; y += size+l; ycrop += size+l };
      if(ycrop > bgY) { ycrop += (-size); break };
      avtUser = avtUser.body;
      var avatar = await this.circle(avtUser);
      var avatarload = await Canvas.loadImage(avatar);
      img.src = avatarload;
      ctx.drawImage(avatarload, x, y, size, size);
      if(admin.includes(idUser.id)) { ctx.drawImage(khungAvt, x, y, size, size) };
      i++
      console.log("Done: " + idUser.id);
      x += parseInt(size+l);
    }
    /*==================DRAW TITLE==================*/
    Canvas.registerFont(__dirname+`/cache/TUVBenchmark.ttf`, { family: "TUVBenchmark"});
    ctx.font = "100px TUVBenchmark";
    ctx.fillStyle = color;
    ctx.textAlign = "center";
    ctx.fillText(decodeURIComponent(title), xcrop/2, 133);
    /*===================CUT IMAGE===================*/
    console.log(`Vẽ thành công ${i} avt`)
    console.log(`Lọc thành công ${participantIDs.length-i} người dùng facebook`)
    const cutImage = await jimp.read(imgCanvas.toBuffer());
    cutImage.crop(0, 0, xcrop, ycrop+l-30).writeAsync(pathAVT);
    await delay(300);
    /*====================SEND IMAGE==================*/ 
    return api.sendMessage({body: `🍗Số thành viên: ${i}\n🥪Size background: ${bgX} x ${bgY}\n🍠Lọc ${participantIDs.length-i} người dùng facebook`, attachment: fs.createReadStream(pathAVT)}, threadID, (error, info) =>{
      if (error) return api.sendMessage(`Đã xảy ra lỗi ${error}`, threadID, () => fs.unlinkSync(pathAVT), messageID)
      console.log('Gửi ảnh thành công'); 
      fs.unlinkSync(pathAVT) }, messageID); 
}
//export FONTCONFIG_PATH=/etc/fonts
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
