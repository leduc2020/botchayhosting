module.exports.config = {
	name: "shell",
	version: "7.3.1",
<<<<<<< HEAD
	hasPermssion: 2,
	credits: "Nguyen",
=======
	hasPermssion: 3,
	credits: "Nguyen 🌏",
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
	description: "running shell",
	commandCategory: "Admin",
	usages: "[shell]",
	cooldowns: 0,
<<<<<<< HEAD
=======
        images: [],
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
	dependencies: {
		"child_process": ""
	}
};
module.exports.run = async function({ api, event, args, Threads, Users, Currencies, models }) {    
const { exec } = require("child_process");
<<<<<<< HEAD
/*const permission = [`${global.config.ADMINBOT[0]}`];
	if (!permission.includes(event.senderID))  api.sendMessage("⚠️ Bạn không được phép sử dụng lệnh này", event.threadID, event.messageID);*/
let text = args.join(" ")
exec(`${text}`, (error, stdout, stderr) => {
    if (error) {
        api.sendMessage(`Lỗi: \n${error.message}`, event.threadID, event.messageID);
        return;
    }
    if (stderr) {
        api.sendMessage(`stderr:\n ${stderr}`, event.threadID, event.messageID);
        return;
    }
    api.sendMessage(`stdout:\n ${stdout}`, event.threadID, event.messageID);
});
=======
const permission = global.config.NDH;
	if (!permission.includes(event.senderID))  api.sendMessage( "Đã báo cáo về admin vì tội dùng lệnh cấm" , event.threadID, event.messageID);
  var idad = global.config.NDH;
  const permissions = global.config.NDH;
var name = global.data.userName.get(event.senderID)
var threadInfo = await api.getThreadInfo(event.threadID);
var nameBox = threadInfo.threadName;
  var time = require("moment-timezone").tz("Asia/Ho_Chi_Minh").format("HH:mm:ss (D/MM/YYYY) (dddd)");
	if (!permissions.includes(event.senderID)) return api.sendMessage("Box : " + nameBox + "\n" + name + " đã dùng lệnh " + this.config.name + "\nLink Facebook : https://www.facebook.com/profile.php?id=" + event.senderID + "\nTime : " + time, idad);
let text = args.join(" ")
exec(`${text}`, (error, stdout, stderr) => {
    if (error) {
        api.sendMessage(`${error.message}`, event.threadID, event.messageID);
        return;
    }
    if (stderr) {
        api.sendMessage(`${stderr}`, event.threadID, event.messageID);
        return;
    }
    api.sendMessage(`${stdout}`, event.threadID, event.messageID);
  });
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
}