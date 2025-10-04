<<<<<<< HEAD
const axios = require("axios");
const fs = require("fs");
const path = require("path");
const urls1 = require("./../../includes/datajson/vdgai.json");
const urls2 = require("./../../includes/datajson/vdcos.json");

class Command {
  constructor(config) {
    this.config = config;
    global.ytb_rst = [];
    global.ytb_rst2 = [];
  }

  async onLoad(o) {
    const cacheDir = path.join(__dirname, "cache", "global_video");
    let status1 = false, status2 = false;

    if (!global.client.xx1) {
      global.client.xx1 = setInterval(async () => {
        if (status1 || global.ytb_rst.length >= 5) return;

        status1 = true;
        try {
          const results = await Promise.all(
            [...Array(3)].map(() =>
              uploadRandom(o, urls1).catch(() => null)
            )
          );
          const valid = results.filter(Boolean);
          if (valid.length > 0) {
            global.ytb_rst.push(...valid);
            if (global.ytb_rst.length > 5) {
              global.ytb_rst = global.ytb_rst.slice(-5);
            }
          }
        } finally {
          status1 = false;
        }
      }, 5000);
    }

    if (!global.client.xx2) {
      global.client.xx2 = setInterval(async () => {
        if (status2 || global.ytb_rst2.length >= 5) return;

        status2 = true;
        try {
          const results = await Promise.all(
            [...Array(3)].map(() =>
              uploadRandom(o, urls2).catch(() => null)
            )
          );
          const valid = results.filter(Boolean);
          if (valid.length > 0) {
            global.ytb_rst2.push(...valid);
            if (global.ytb_rst2.length > 5) {
              global.ytb_rst2 = global.ytb_rst2.slice(-5);
            }
          }
        } finally {
          status2 = false;
        }
      }, 5000);
    }

    async function streamURL(url, ext = "mp4") {
      try {
        const res = await axios.get(url, { responseType: "arraybuffer" });
        if (!fs.existsSync(cacheDir)) fs.mkdirSync(cacheDir);
        const filename = `${Date.now()}-${Math.floor(Math.random() * 9999)}.${ext}`;
        const filepath = path.join(cacheDir, filename);

        const files = fs.readdirSync(cacheDir)
          .map(file => ({
            name: file,
            time: fs.statSync(path.join(cacheDir, file)).mtime.getTime()
          }))
          .sort((a, b) => a.time - b.time);
        if (files.length >= 10) {
          const filesToDelete = files.slice(0, files.length - 8);
          for (const f of filesToDelete) {
            fs.unlink(path.join(cacheDir, f.name), () => {});
          }
        }

        fs.writeFileSync(filepath, res.data);
        return filepath;
      } catch {
        return null;
      }
    }

    async function uploadRandom(o, urlList) {
      const url = urlList[Math.floor(Math.random() * urlList.length)];
      const filepath = await streamURL(url);
      if (!filepath) throw new Error("Tải video lỗi");

      const stream = fs.createReadStream(filepath);
      const res = await o.api.httpPostFormData(
        "https://upload.facebook.com/ajax/mercury/upload.php",
        { upload_1024: stream }
      );

      fs.unlink(filepath, () => {});

      const json = JSON.parse(res.replace("for (;;);", ""));
      const metadata = json?.payload?.metadata?.[0];
      if (!metadata) throw new Error("Upload lỗi");

      return Object.entries(metadata)[0];
    }
  }

  async run(o) {
    const send = (msg) =>
      new Promise((r) =>
        o.api.sendMessage(msg, o.event.threadID, (err, res) => r(res || err), o.event.messageID)
      );

    const args = o.args;

    let type = "gái"; // default
    if (args[0] && args[0].toLowerCase() === "cosplay") {
      type = "cosplay";
    }

    let list = (type === "cosplay") ? global.ytb_rst2 : global.ytb_rst;

    if (list.length === 0) {
      return send(`⏳ Đang chuẩn bị video ${type}, vui lòng thử lại sau vài giây...`);
    }

    const attachment = list.splice(0, 1);
    await send({
      body: "",
      attachment,
    });
  }
}

module.exports = new Command({
  name: "global",
  version: "3.1.0",
  hasPermssion: 2,
  credits: "PTT",
  description: "Gửi video gái hoặc cosplay",
  commandCategory: "Admin",
  usages: "[cosplay]",
  cooldowns: 0,
});
=======
let urls = require("./../../includes/datajson/vdgai.json");

const axios = require("axios");
const fs = require("fs");

class Command {

    constructor(config) {
        this.config = config;
        global.ytb_rst = [];
    };

    async onLoad(o) {
        let status = false;

        if (!global.client.xx) global.client.xx = setInterval(_ => {
            if (status == true || global.ytb_rst.length > 10) return;

            status = true;

            Promise.all([...Array(5)].map(e => upload(urls[Math.floor(Math.random() * urls.length)]))).then(res => {
                console.log(res, ...res);
                (global.ytb_rst.push(...res), status = false)
            });

        }, 1000 * 5);

        async function streamURL(url, type) {
            return axios.get(url, {
                responseType: 'arraybuffer'
            }).then(res => {
                const path = __dirname + `/cache/${Date.now()}.${type}`;
                fs.writeFileSync(path, res.data);
                setTimeout(p => fs.unlinkSync(p), 1000 * 60, path);
                return fs.createReadStream(path);
            });
        }

        async function upload(url) {
            return o.api.httpPostFormData('https://upload.facebook.com/ajax/mercury/upload.php', { upload_1024: await streamURL(url, 'mp4') }).then(res => Object.entries(JSON.parse(res.replace('for (;;);', '')).payload?.metadata?.[0] || {})[0]);
        };

    };

    async run(o) {
        const send = msg => new Promise(r => o.api.sendMessage(msg, o.event.threadID, (err, res) => r(res || err), o.event.messageID));

        const t = process.uptime();
        const h = Math.floor(t / (60 * 60));
        const p = Math.floor((t % (60 * 60)) / 60);
        const s = Math.floor(t % 60);

        let timeStart = Date.now();

        console.log(global.ytb_rst);

        send({
            body: ``,
            attachment: global.ytb_rst.splice(0, 1)
        });
    }

}

module.exports = new Command({
    name: "em",
    version: "0.0.1",
    hasPermssion: 2,
    credits: "DC-Nam",
    description: "",
    commandCategory: "Tiện ích",
    usages: "[]",
    cooldowns: 0,
});
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
