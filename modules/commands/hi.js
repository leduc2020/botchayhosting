<<<<<<< HEAD
module.exports.config = {
  name: "hi",
  version: "1.0.0",
  hasPermssion: 0,
  credit: "Sam",
  description: "hi gửi sticker",
  commandCategory: "Giải trí",
  usages: "[text]",
  cooldowns: 5
}

module.exports.handleEvent = async ({ event, api, Users }) => {
  let KEY = [ 
    "hello",
    "hi",
    "hai",
    "chào",
    "chao",
    "hí",
    "híí",
    "hì",
    "hìì",
    "lô",
    "hii",
    "helo",
    "hê nhô"
  ];
  let thread = global.data.threadData.get(event.threadID) || {};
  if (typeof thread["hi"] == "undefined", thread["hi"] == false) return
  else {
  if (KEY.includes((event.body || '').toLowerCase()) !== false) {
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
      "1841028362616606",
      "1841028482616594",
      "1841028609283248",
      "526220308111401",
      "193082987877305",
      "2041011389459668", 
      "2041011569459650", 
      "2041011726126301",
      "2041011836126290", 
      "2041011952792945", 
      "2041012109459596", 
      "2041012262792914", 
      "2041012406126233", 
      "2041012539459553",
      "2041012692792871",
      "2041014432792697",
      "2041014739459333", 
      "2041015016125972", 
      "2041015182792622",
      "2041015329459274",
      "2041015422792598",
      "2041015576125916",
      "2041017422792398", 
      "2041020049458802",
      "2041020599458747", 
      "2041021119458695",
      "2041021609458646",
      "2041022029458604", 
      "2041022286125245",
      "2523892817885618",
      "2523892964552270",
      "2523893081218925",
      "2523893217885578",
      "2523893384552228",
      "2523892544552312",
      "2523892391218994",
      "2523891461219087",
      "2523891767885723",
      "2523891204552446",
      "2523890691219164",
      "2523890981219135",
      "2523890374552529",
      "2523889681219265",
      "2523889851219248",
      "2523890051219228",
      "2523886944552872",
      "2523887171219516",
      "2523888784552688",
      "2523888217886078",
      "2523888534552713",
      "2523887371219496",
      "2523887771219456",
      "2523887571219476",
      "237319333754393",
      "237320717087588",
      "237320150420978",
      "237320493754277",
      "237319140421079",
      "237317540421239",
      "237318950421098",
      "254597059336998",
      "254597706003600",
      "254593389337365",
      "254595492670488",
      "254595732670464",
      "254595959337108",
      "4046865862027268",
      "4046879105359277",
      "4046655705381617",
      "1926231774082483",
      "1926234657415528",
      "1926234920748835",
      "1926237197415274"
    ];
    let sticker = data[Math.floor(Math.random() * data.length)];
    let moment = require("moment-timezone");
    let hours = moment.tz('Asia/Ho_Chi_Minh').format('HHmm');
    let data2 = [
      "tốt lành 🥳",
      "vui vẻ 😄",
      "hạnh phúc ❤",
      "yêu đời 😘",
      "may mắn 🍀",
      "full năng lượng ⚡",
      "tuyệt vời 😁",
      "tỉnh táo 🤓",
      "đầy sức sống 😽",
      "nhiệt huyết 🔥"
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
    let msg = {body: `Xin chào ${name}, chúc bạn một buổi ${session} ${text}`, mentions}
    api.sendMessage(msg, event.threadID, (e, info) => {
      setTimeout(() => {
        api.sendMessage({sticker: sticker}, event.threadID);
      }, 100)
    }, event.messageID)
  }
  }
}

module.exports.languages = {
  "vi": {
    "on": "Bật",
    "off": "Tắt",
    "successText": `${this.config.name} thành công`,
  },
  "en": {
    "on": "on",
    "off": "off",
    "successText": "success!",
  }
}

module.exports.run = async ({ event, api, Threads, getText }) => {
  let { threadID, messageID } = event;
  let data = (await Threads.getData(threadID)).data;
  if (typeof data["hi"] == "undefined" || data["hi"] == true) data["hi"] = false;
  else data["hi"] = true;
  await Threads.setData(threadID, {
    data
  });
  global.data.threadData.set(threadID, data);
  return api.sendMessage(`${(data["hi"] == false) ? getText("off") : getText("on")} ${getText("successText")}`, threadID, messageID);
}
=======
const fs = require("fs");
const axios = require("axios");
const moment = require("moment-timezone");
const path = require("path");

const KEY = [
    "hello", "hi", "hai", "chào", "chao", "hí", "híí", "hì", "hìì", "lô", "hii", "helo", "hê nhô",
    "xin chào", "2", "helo", "hê nhô", "hi mn", "hello mn"
];

const DEFAULT_GREETINGS = {
    morning_early: [
        "Chúc bạn buổi sáng tràn đầy năng lượng",
        "Chào buổi sáng mới tốt lành nhé"
    ],
    morning: [
        "Chúc bạn buổi sáng vui vẻ"
    ],
    noon: [
        "Chúc bạn buổi trưa vui vẻ",
        "Nghỉ trưa thật ngon giấc nhé"
    ],
    afternoon: [
        "Chúc bạn buổi chiều vui vẻ",
        "Chiều tà rồi, nghỉ ngơi nhé!"
    ],
    evening: [
        "Chúc bạn buổi tối vui vẻ"
    ],
    night: [
        "Khuya rồi, ngủ ngon nhé!",
        "Chúc ngủ ngon nhé"
    ]
};

const AUDIO_PATH = path.join(__dirname, "..", "..", "music", "hi.mp3");
let filePath;

module.exports.config = {
    name: "hi",
    version: "1.3.0",
    hasPermission: 0,
    credits: "TrungAnh",
    description: "Chào hỏi tự động kèm âm thanh và tùy chỉnh câu chào",
    commandCategory: "Tiện ích",
    usages: "[on/off/setaudio/add/remove/list]",
    cooldowns: 5
};

module.exports.onLoad = () => {
    const dir = path.join(__dirname, "data");
    if (!fs.existsSync(dir)) {
        fs.mkdirSync(dir);
    }
    
    filePath = path.join(dir, "hi.json");
    if (!fs.existsSync(filePath)) {
        const defaultData = {
            global: {
                customGreetings: {}
            }
        };
        fs.writeFileSync(filePath, JSON.stringify(defaultData, null, 2));
    }
};

function getGreeting(hours, threadID) {
    let session;
    let greetings;
    let savedData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
    let customGreetings = savedData.global.customGreetings[hours] || [];

    if (hours >= 0 && hours <= 4) {
        session = "đêm";
        greetings = [...DEFAULT_GREETINGS.night, ...customGreetings];
    } else if (hours > 4 && hours <= 7) {
        session = "sáng sớm";
        greetings = [...DEFAULT_GREETINGS.morning_early, ...customGreetings];
    } else if (hours > 7 && hours <= 11) {
        session = "sáng";
        greetings = [...DEFAULT_GREETINGS.morning, ...customGreetings];
    } else if (hours > 11 && hours <= 13) {
        session = "trưa";
        greetings = [...DEFAULT_GREETINGS.noon, ...customGreetings];
    } else if (hours > 13 && hours <= 17) {
        session = "chiều";
        greetings = [...DEFAULT_GREETINGS.afternoon, ...customGreetings];
    } else if (hours > 17 && hours <= 21) {
        session = "tối";
        greetings = [...DEFAULT_GREETINGS.evening, ...customGreetings];
    } else {
        session = "đêm";
        greetings = [...DEFAULT_GREETINGS.night, ...customGreetings];
    }

    return {
        session,
        greeting: greetings[Math.floor(Math.random() * greetings.length)]
    };
}

module.exports.handleEvent = async function({ event, api, Users }) {
    const { threadID, messageID, body } = event;

    try {
        let savedData = {};
        try {
            const jsonData = fs.readFileSync(filePath, "utf-8");
            savedData = JSON.parse(jsonData);
        } catch (err) {
            console.error("Lỗi đọc file hi.json:", err);
            savedData = {};
        }

        if (typeof savedData[threadID]?.hi === "undefined" || savedData[threadID].hi === true) {
            if (body && KEY.includes(body.toLowerCase())) {
                const hours = parseInt(moment.tz('Asia/Ho_Chi_Minh').format('HH'));
                const { session, greeting } = getGreeting(hours, threadID);

                let name = await Users.getNameUser(event.senderID);
                let mentions = [{ tag: name, id: event.senderID }];

                let msg = {
                    body: `Xin chào ${name}, ${greeting} ❤️`,
                    mentions,
                    attachment: fs.existsSync(AUDIO_PATH) ? fs.createReadStream(AUDIO_PATH) : null
                };

                api.sendMessage(msg, threadID, messageID);
            }
        }
    } catch (error) {
        console.error("Lỗi xử lý tin nhắn chào:", error);
    }
};

module.exports.run = async ({ event, api, args }) => {
    const { threadID, messageID } = event;

    try {
        let savedData = JSON.parse(fs.readFileSync(filePath, "utf-8"));
        if (!savedData.global) savedData.global = { customGreetings: {} };
        
        const command = (args[0] || "").toLowerCase();

        switch (command) {
            case "on":
                savedData[threadID] = { hi: true };
                api.sendMessage("☑️ Đã bật chức năng chào!", threadID, messageID);
                break;
            
            case "off":
                savedData[threadID] = { hi: false };
                api.sendMessage("☑️ Đã tắt chức năng chào!", threadID, messageID);
                break;

            case "setaudio":
                if (!event.messageReply || !event.messageReply.attachments || !event.messageReply.attachments[0].url) {
                    return api.sendMessage("⚠️ Vui lòng reply một file âm thanh để cài đặt!", threadID, messageID);
                }

                const dir = path.join(__dirname, "..", "..", "music");
                if (!fs.existsSync(dir)) {
                    fs.mkdirSync(dir, { recursive: true });
                }

                try {
                    const response = await axios.get(event.messageReply.attachments[0].url, { responseType: 'arraybuffer' });
                    fs.writeFileSync(AUDIO_PATH, Buffer.from(response.data));
                    api.sendMessage("✅ Đã cài đặt âm thanh chào thành công!", threadID, messageID);
                } catch (e) {
                    api.sendMessage("❌ Lỗi khi tải file âm thanh!", threadID, messageID);
                }
                break;

            case "add":
                const hour = parseInt(args[1]);
                if (isNaN(hour) || hour < 0 || hour > 23) {
                    return api.sendMessage("⚠️ Vui lòng nhập giờ hợp lệ (0-23)!", threadID, messageID);
                }
                const greeting = args.slice(2).join(" ");
                if (!greeting) {
                    return api.sendMessage("⚠️ Vui lòng nhập câu chào!", threadID, messageID);
                }
                
                if (!savedData.global.customGreetings[hour]) {
                    savedData.global.customGreetings[hour] = [];
                }
                savedData.global.customGreetings[hour].push(greeting);
                api.sendMessage(`✅ Đã thêm câu chào cho ${hour}h: ${greeting}`, threadID, messageID);
                break;

            case "remove":
                const hourToRemove = parseInt(args[1]);
                const index = parseInt(args[2]) - 1;
                
                if (isNaN(hourToRemove) || !savedData.global.customGreetings[hourToRemove]) {
                    return api.sendMessage("⚠️ Giờ không hợp lệ hoặc không có câu chào tùy chỉnh!", threadID, messageID);
                }
                
                if (isNaN(index) || index < 0 || index >= savedData.global.customGreetings[hourToRemove].length) {
                    return api.sendMessage("⚠️ Số thứ tự câu chào không hợp lệ!", threadID, messageID);
                }
                
                const removed = savedData.global.customGreetings[hourToRemove].splice(index, 1);
                api.sendMessage(`✅ Đã xóa câu chào: ${removed[0]}`, threadID, messageID);
                break;

            case "list":
                const hour2 = parseInt(args[1]);
                if (isNaN(hour2) || hour2 < 0 || hour2 > 23) {
                    let msg = "📝 Danh sách câu chào tùy chỉnh:\n";
                    for (let h in savedData.global.customGreetings) {
                        if (savedData.global.customGreetings[h].length > 0) {
                            msg += `\n${h}h:\n`;
                            savedData.global.customGreetings[h].forEach((greeting, i) => {
                                msg += `${i + 1}. ${greeting}\n`;
                            });
                        }
                    }
                    api.sendMessage(msg, threadID, messageID);
                } else {
                    if (!savedData.global.customGreetings[hour2] || savedData.global.customGreetings[hour2].length === 0) {
                        api.sendMessage(`❌ Không có câu chào tùy chỉnh nào cho ${hour2}h!`, threadID, messageID);
                    } else {
                        let msg = `📝 Câu chào tùy chỉnh cho ${hour2}h:\n`;
                        savedData.global.customGreetings[hour2].forEach((greeting, i) => {
                            msg += `${i + 1}. ${greeting}\n`;
                        });
                        api.sendMessage(msg, threadID, messageID);
                    }
                }
                break;

            default:
                api.sendMessage("⚠️ Vui lòng sử dụng:\n- hi on: Bật chức năng\n- hi off: Tắt chức năng\n- hi setaudio: Cài đặt âm thanh (reply file)\n- hi add [giờ] [câu chào]: Thêm câu chào\n- hi remove [giờ] [số thứ tự]: Xóa câu chào\n- hi list [giờ]: Xem danh sách câu chào", threadID, messageID);
                return;
        }

        fs.writeFileSync(filePath, JSON.stringify(savedData, null, 2));

    } catch (error) {
        console.error("Lỗi xử lý lệnh hi:", error);
        api.sendMessage("❌ Đã có lỗi xảy ra!", threadID, messageID);
    }
};
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
