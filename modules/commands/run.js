this.config = {
  name: "run",
  version: "1.0.2",
<<<<<<< HEAD
  hasPermssion: 0,
  credits: "Niio-team (Quất)",
  description: "running shell",
  commandCategory: "Admin",
  usages: "[Script]",
  cooldowns: 5
}
this.run = async ({ api, event, args, Threads, Users, Currencies, models, permssion }) => {
  //if (event.senderID != global.config.ADMINBOT[0]) return api.sendMessage('⚠️ Bạn không đủ quyền hạn để sử dụng lệnh này', event.threadID, event.messageID)
  const s = a => {
    if (typeof a == "object" || typeof a == "array") { if (Object.keys(a).length != 0) a = JSON.stringify(a, null, 4); else a = "" }
    if (typeof a == "number") a = a.toString()
    return api.sendMessage(a, event.threadID, event.messageID)
  },
  {log} = console, { quất } = api
mocky = async a => {
if (typeof a == "object" || typeof a == "array") { if (Object.keys(a).length != 0) a = JSON.stringify(a, null, 4); else a = "" }
if (typeof a == "number") a = a.toString()
await require('axios').post("https://api.mocky.io/api/mock", { 
"status": 200, 
"content": a,
"content_type": "application/json",
"charset": "UTF-8", 
"secret": "cc", 
"expiration": "never" }).then(r => s(r.data.link))
}
  try {
    return s(await require("eval")(args.join(" "), {
      s,
      api,
      event,
      args,
      Threads,
      Users,
      Currencies,
      models,
      global,
      permssion,
      log,
mocky,
quất
    }, true))
  }
  catch (e) {
    s(`⚠️ Lỗi: ${e.message}\n📝 Dịch: ${(await require('axios').get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(e.message)}`)).data[0][0][0]}`)
  }
}
=======
  hasPermssion: 3,
  credits: "Quất",
  description: "running shell",
  commandCategory: "Hệ thống",
  usages: "[Script]",
  cooldowns: 5,
  usePrefix: false
}

this.run = async (o) => {
  const s = async (a) => {
    if (typeof a === "object" || Array.isArray(a)) {
      if (Object.keys(a).length !== 0)
        a = JSON.stringify(a, null, 4);
      else
        a = "";
    }
    if (typeof a === "number")
      a = a.toString();
    await o.api.sendMessage(a, o.event.threadID, o.event.messageID);
  };
  const { log } = console;
  try {
    const result = await require("eval")(o.args.join(" "), { s, o, log }, true);
    await s(result);
  } catch (e) {
    const errorMessage = `[ Lỗi ] ${e.message}\n[ Dịch ] ${(await require('axios').get(`https://translate.googleapis.com/translate_a/single?client=gtx&sl=auto&tl=vi&dt=t&q=${encodeURIComponent(e.message)}`)).data[0][0][0]}`;
    await s(errorMessage);
  }
}
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
