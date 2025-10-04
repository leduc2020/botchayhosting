module.exports.config = {
  name: "bye",
  version: "1.0.0",
  hasPermssion: 0,
<<<<<<< HEAD
  credit: "Sam",
  description: "Gửi lời chào tạm biệt",
  commandCategory: "Quản Trị Viên", 
  usages: "[text]",
  cooldowns: 5
}

module.exports.handleEvent = async ({ event, api, Users }) => {
  let KEY = [
    "bye",
    "pai",
    "bai", 
    "tạm biệt",
    "tam biet",
    "goodbye",
    "see you",
    "see ya",
    "biết",
    "chào tạm biệt",
    "hen gap lai"
  ];
  
  let thread = global.data.threadData.get(event.threadID) || {};
  if (typeof thread["bye"] == "undefined" || thread["bye"] == false) return;
  
  if (KEY.includes(event.body.toLowerCase())) {
    let name = await Users.getNameUser(event.senderID);
    let msg = {
      body: `Tạm biệt ${name} nha bạn nhớ sớm quay lại nhé\nNhi và mọi người trong nhóm đợi ${name} đó mãi iu:3`,
      mentions: [{
        tag: name,
        id: event.senderID
      }]
    }
    api.sendMessage(msg, event.threadID, event.messageID);
  }
}

=======
  credit: "Trúc cute :)",
  description: "hi gửi sticker",
  commandCategory: "Hệ Thống",
  usages: "[text]",
  cooldowns: 0
}

module.exports.handleEvent = async ({ event, api, Users }) => {
  let KEY = ["bye",
    "bai",
    "bye",
    "off",
    "byee",
    "pai",
    "paii"];
  let thread = global.data.threadData.get(event.threadID) || {};
  if (typeof thread["bye"] == "undefined", thread["bye"] == false) return
  else {
  if (event.body && KEY.includes(event.body.toLowerCase()) !== false) {
    let data = [
      "526214684778630",
      "526220108111421",
      "526220308111401",
      "526220484778050",
      "526220691444696",
      "526220814778017",
      "526220978111334",
      "526221104777988",
      "526221318111300",
      "526221564777942",
      "526221711444594",
      "526221971444568",
     "2041011389459668", "2041011569459650", "2041011726126301", "2041011836126290", "2041011952792945", "2041012109459596", "2041012262792914", "2041012406126233", "2041012539459553", "2041012692792871", "2041014432792697", "2041014739459333", "2041015016125972", "2041015182792622", "2041015329459274", "2041015422792598", "2041015576125916", "2041017422792398", "2041020049458802", "2041020599458747", "2041021119458695", "2041021609458646", "2041022029458604", "2041022286125245"
    ];
    let sticker = data[Math.floor(Math.random() * data.length)];
    let moment = require("moment-timezone");
    let hours = moment.tz('Asia/Ho_Chi_Minh').format('HHmm');
    let data2 = [
      "tốt lành",
      "vui vẻ"
    ];
    let text = data2[Math.floor(Math.random() * data2.length)]
    let session = (
    hours > 0001 && hours <= 400 ? "sáng tinh mơ" : 
    hours > 401 && hours <= 700 ? "sáng sớm" :
    hours > 701 && hours <= 1000 ? "sáng" :
    hours > 1001 && hours <= 1200 ? "trưa" : 
    hours > 1201 && hours <= 1700 ? "chiều" : 
    hours > 1701 && hours <= 1800 ? "chiều tà" : 
    hours > 1801 && hours <= 2100 ? "tối" : 
    hours > 2101 && hours <= 2400 ? "tối muộn" : 
    "lỗi");
    let name = await Users.getNameUser(event.senderID);
    let mentions = [];
    mentions.push({
      tag: name,
      id: event.senderID
    })
    let msg = {body: `[🥨] → Tạm biệt ${name}\n[💓] → Chúc bạn một buổi ${session} ${text}\n[🌚] → Nhớ quay lại sớm để tương tác với bot nha\n[🌹] → I love ${name}\n[🕰] → Bây giờ là : ${moment().tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || DD/MM/YYYY")}`, mentions}
    api.sendMessage(msg, event.threadID, (e, info) => {
      setTimeout(() => {
        api.sendMessage({sticker: sticker}, event.threadID);
      }, 100)
    }, event.messageID)
  }
      }
},
  
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
module.exports.languages = {
  "vi": {
    "on": "Bật",
    "off": "Tắt",
    "successText": `${this.config.name} thành công`,
  },
  "en": {
<<<<<<< HEAD
    "on": "on", 
=======
    "on": "on",
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
    "off": "off",
    "successText": "success!",
  }
}

module.exports.run = async ({ event, api, Threads, getText }) => {
  let { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data;
<<<<<<< HEAD
  
  if (typeof data["bye"] == "undefined" || data["bye"] == false) {
    data["bye"] = true;
  } else {
    data["bye"] = false;
  }
  
  await Threads.setData(threadID, { data });
  global.data.threadData.set(threadID, data);
  
  return api.sendMessage(
    `${(data["bye"] == false) ? getText("off") : getText("on")} ${getText("successText")}`,
    threadID,
    messageID
  );
}
=======
  if (typeof data["bye"] == "undefined" || data["bye"] == true) data["bye"] = false;
  else data["bye"] = true;
  await Threads.setData(threadID, {
    data
  });
  global.data.threadData.set(threadID, data);
  return api.sendMessage(`${(data["bye"] == false) ? getText("off") : getText("on")} ${getText("successText")}`, threadID, messageID);
      }
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
