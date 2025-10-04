<<<<<<< HEAD
const fs = require('fs');
const request = require('request');

module.exports.config = {
    name: "send",
    version: "1.0.0",
    hasPermssion: 2,
    credits: "TruongMini, mod by Lê Chí (lechii)",
    description: "Gửi tin nhắn đến tất cả box",
    commandCategory: "Admin",
    usages: "[prefix]send [tin nhắn]",
    cooldowns: 5,
}

let atmDir = [];

const getAtm = (atm, body) => new Promise(async (resolve) => {
    let msg = {}, attachment = [];
    msg.body = body;
    for(let eachAtm of atm) {
        await new Promise(async (resolve) => {
            try {
                let response =  await request.get(eachAtm.url),
                    pathName = response.uri.pathname,
                    ext = pathName.substring(pathName.lastIndexOf(".") + 1),
                    path = __dirname + `/cache/${eachAtm.filename}.${ext}`
                response
                    .pipe(fs.createWriteStream(path))
                    .on("close", () => {
                        attachment.push(fs.createReadStream(path));
                        atmDir.push(path);
                        resolve();
                    })
            } catch(e) { console.log(e); }
        })
    }
    msg.attachment = attachment;
    resolve(msg);
})

module.exports.handleReply = async function ({ api, event, handleReply, Users, Threads }) {
    const moment = require("moment-timezone");
      var gio = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY - HH:mm:s");
    const { threadID, messageID, senderID, body } = event;
    let name = await Users.getNameUser(senderID);
    switch (handleReply.type) {
        case "sendnoti": {
            let text = `[ Phản Hồi Từ User ]\n──────────────────\n👤 Từ User: ${name}\n🔗 Link: https://www.facebook.com/profile.php?id=${event.senderID}\n🏘️ Nhóm: ${(await Threads.getInfo(threadID)).threadName || "Unknow"}\n⏰ Time: ${gio}\n📝 Nội dung: ${body}\n\n📌 Reply tin nhắn này để phản hồi`;
            if(event.attachments.length > 0) text = await getAtm(event.attachments, `[ Phản Hồi Từ User ]\n──────────────────\n👤 Từ User: ${name}\n🔗 Link: https://www.facebook.com/profile.php?id=${event.senderID}\n🏘️ Nhóm: ${(await Threads.getInfo(threadID)).threadName || "Unknow"}\n⏰ Time: ${gio}\n📝 Nội dung: ${body}\n\n📌 Reply tin nhắn này để phản hồi` );
            api.sendMessage(text, handleReply.threadID, (err, info) => {
                atmDir.forEach(each => fs.unlinkSync(each))
                atmDir = [];
                global.client.handleReply.push({
                    name: this.config.name,
                    type: "reply",
                    messageID: info.messageID,
                    messID: messageID,
                    threadID
                })
            });
            break;
        }
        case "reply": {
            let text = `[ Phản Hồi Từ Admin ]\n──────────────────\n👤 Từ Admin: ${name}\n🔗 Link: https://www.facebook.com/profile.php?id=${event.senderID}\n🏘️ Nơi gửi: ${(await Threads.getInfo(threadID)).threadName || "Unknow"}\n⏰ Time: ${gio}\n📝 Nội dung: ${body}\n\n📌 Reply tin nhắn này để phản hồi`;
            if(event.attachments.length > 0) text = await getAtm(event.attachments, `[ Phản Hồi Từ Admin ]\n──────────────────\n👤 Từ Admin: ${name}\n🔗 Link: https://www.facebook.com/profile.php?id=${event.senderID}\n🏘️ Nơi gửi: ${(await Threads.getInfo(threadID)).threadName || "Unknow"}\n⏰ Time: ${gio}\n📝 Nội dung: ${body}\n\n📌 Reply tin nhắn này để phản hồi`);
            api.sendMessage(text, handleReply.threadID, (err, info) => {
                atmDir.forEach(each => fs.unlinkSync(each))
                atmDir = [];
                global.client.handleReply.push({
                    name: this.config.name,
                    type: "sendnoti",
                    messageID: info.messageID,
                    threadID
                })
            }, handleReply.messID);
            break;
        }
    }
}

module.exports.run = async function ({ api, event, args, Users }) {
    const moment = require("moment-timezone");
    var gio = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY - HH:mm:s");
    const { threadID, messageID, senderID, messageReply } = event;
    if (!args[0]) return api.sendMessage("Please input message", threadID);
    
    let allThread = global.data.allThreadID || [];
    let can = 0, canNot = 0;
    let text = `[ Thông Báo Admin ]\n──────────────────\n👤 Từ Admin: ${await Users.getNameUser(senderID)}\n🔗 Link: https://www.facebook.com/profile.php?id=${event.senderID}\n🏘️ Nơi gửi: ${event.isGroup == true ? 'Nhóm ' + global.data.threadInfo.get(event.threadID).threadName : 'từ cuộc trò chuyện riêng với bot '}\n⏰ Time: ${gio}\n📝 Nội dung: ${args.join(" ")}\n\n📌 Reply tin nhắn này để phản hồi\n💧 Thu hồi sau 10s`;
    
    if (event.type == "message_reply") text = await getAtm(messageReply.attachments, `[ Thông Báo Admin ]\n──────────────────\n👤 Từ Admin: ${await Users.getNameUser(senderID)}\n🔗 Link: https://www.facebook.com/profile.php?id=${event.senderID}\n🏘️ Nơi gửi: ${event.isGroup == true ? 'Nhóm ' + global.data.threadInfo.get(event.threadID).threadName : 'từ cuộc trò chuyện riêng với bot '}\n⏰ Time: ${gio}\n📝 Nội dung: ${args.join(" ")}\n\n📌 Reply tin nhắn này để phản hồi`);

    await new Promise(resolve => {
        allThread.forEach((each) => {
            try {
                api.sendMessage(text, each, (err, info) => {
                    if (err) { canNot++; }
                    else {
                        can++;
                        atmDir.forEach(each => fs.unlinkSync(each))
                        atmDir = [];
                        global.client.handleReply.push({
                            name: this.config.name,
                            type: "sendnoti",
                            messageID: info.messageID,
                            messID: messageID,
                            threadID
                        })
                        resolve();
                        
                        // Set a timeout to delete the message after 10 seconds
                        setTimeout(() => {
                            api.deleteMessage(info.messageID);
                        }, 10000); // 10000 milliseconds = 10 seconds
                    }
                })
            } catch (e) { console.log(e) }
        })
    })

    // Add a 10-second delay before confirming the notification sent successfully
    setTimeout(() => {
        api.sendMessage(`✅ Gửi thông báo thành công đến ${can} nhóm, ⚠️ Không thể gửi thông báo đến ${canNot} nhóm`, threadID);
    }, 10000); // 10000 milliseconds = 10 seconds
}
=======
module.exports.config = {
    name: "sendnoti",
    version: "1.2.8",
    hasPermssion: 2,
    credits: "DongDev",
    description: "Gửi tin nhắn đến toàn bộ nhóm và reply để phản hồi",
    commandCategory: "Admin",
    usages: "text",
    cooldowns: 2
};

const request = require("request");
const fse = require("fs-extra");
const imageDownload = require("image-downloader");
const moment = require("moment-timezone");
const fullTime = () => moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || DD/MM/YYYY");

module.exports.run = async ({ api, event, Users }) => {
    const { threadID: tid, messageID: mid, senderID: sid, attachments: atms, messageReply: mR, type, body, args } = event;
    const allTid = global.data.allThreadID || [];
    const atm = await type == "message_reply" ? mR.attachments : atms.length != 0 ? atms : "nofile";
    const content = !args[1] ? "chỉ có tệp" : body.slice(body.indexOf(args[1]));

    if (!args[1] && atm == "nofile") return api.sendMessage(`❎ Vui lòng nhập nội dung`, tid, mid);

    const msg = `[ THÔNG BÁO ADMIN ]\n───────────────────\n[👤] →⁠ Admin: ${(await Users.getData(sid)).name}\n[🌐] →⁠ Link Fb: https://www.facebook.com/profile.php?id=${event.senderID}\n[🗺️] →⁠ Từ: ${event.isGroup == true ? 'Nhóm ' + global.data.threadInfo.get(event.threadID).threadName : 'Cuộc trò chuyện riêng với bot '}\n───────────────────\n\n[💬] →⁠ Nội dung: ${content}\n───────────────────\n[⏰] →⁠ Time: ${fullTime()}\n[👉] →⁠ Reply (phản hồi) tin nhắn này để gửi về admin`;

    const uwu = atm == "nofile" ? msg : {
        body: msg,
        attachment: await downloadAttachments(atm)
    };

    let c1 = 0,
        c2 = 0;

    for (const idT of allTid) {
        const promise = new Promise(async (resolve1, reject1) => {
            await api.sendMessage(uwu, idT, async (e, i) => {
                if (e) reject1(++c2);
                else resolve1(++c1);

                return global.client.handleReply.push({
                    name: module.exports.config.name,
                    messageID: i.messageID,
                    author: sid,
                    type: "userReply"
                });
            });
        });
    }

    promise.then(async (r) => api.sendMessage(`☑️ Gửi thông báo thành công tới ${r} nhóm`, tid, mid)).catch(async (err) => api.sendMessage(`❎ Không thể gửi thông báo tới ${err} nhóm`, tid, mid));
};

module.exports.handleReply = async ({ api, event, handleReply: h, Users, Threads }) => {
    const { threadID: tid, messageID: mid, senderID: sid, attachments: atms, body, type } = event;
    const { ADMINBOT } = global.config;

    switch (h.type) {
        case "userReply": {
            const atm = atms.length != 0 ? atms : "nofile";
            const msg = `[ USER REPLY ]\n───────────────────\n[👤] →⁠ User: ${(await Users.getData(sid)).name}\n[🏘️] →⁠ Nhóm: ${(await Threads.getData(tid)).threadInfo.threadName}\n[⏰] →⁠ Time: ${fullTime()}\n\n[📝] →⁠ Nội dung: ${atm == "nofile" ? body : "Chỉ có tệp tới bạn"}\n\n───────────────────\n[👉] →⁠ Reply tin nhắn này nếu muốn phản hồi tới User`;
            const uwu = atm == "nofile" ? msg : {
                body: msg,
                attachment: await downloadAttachments(atm)
            };

            let c1 = 0,
                c2 = 0;

            for (const idA of ADMINBOT) {
                const promise = new Promise(async (resolve1, reject1) => {
                    await api.sendMessage(uwu, idA, async (e, i) => {
                        if (e) reject1(++c2);
                        else resolve1(++c1);

                        return global.client.handleReply.push({
                            name: module.exports.config.name,
                            messageID: i.messageID,
                            author: h.author,
                            idThread: tid,
                            idMessage: mid,
                            idUser: sid,
                            type: "adminReply"
                        });
                    });
                });
            }

            promise.then(async (r1) => api.sendMessage(`[📨] →⁠ Phản hồi thành công tới Admin ${(await Users.getData(h.author)).name} và ${+r1 - 1} Admin khác`, tid, mid)).catch(async (err) => api.sendMessage(`❎ Không thể phản hồi tới ${err} Admin`, tid, mid));

            break;
        }

        case "adminReply": {
            const atm = atms.length != 0 ? atms : "nofile";
            const msg = `[ ADMIN REPLY ]\n───────────────────\n[👤] →⁠ Admin: ${(await Users.getData(sid)).name}\n[⏰] →⁠ Time: ${fullTime()}\n\n[📝] →⁠ Nội dung: ${atm == "nofile" ? body : "Chỉ có tệp tới bạn"}\n───────────────────\n[👉] →⁠ Reply tin nhắn này nếu muốn phản hồi về Admin`;
            const uwu = atm == "nofile" ? msg : {
                body: msg,
                attachment: await downloadAttachments(atm)
            };

            await api.sendMessage(uwu, h.idThread, async (e, i) => {
                if (e) return api.sendMessage(`Error`, tid, mid);
                else api.sendMessage(`[📨] →⁠ Phản hồi thành công tới User ${(await Users.getData(h.idUser)).name} tại nhóm ${(await Threads.getData(h.idThread)).threadInfo.threadName}`, tid, mid);

                return global.client.handleReply.push({
                    name: module.exports.config.name,
                    messageID: i.messageID,
                    author: sid,
                    type: "userReply"
                });
            }, h.idMessage);

            break;
        }
    }
};

const downloadAttachments = async (attachments) => {
    const arr = [];

    for (let i = 0; i < attachments.length; i++) {
        const nameUrl = request.get(attachments[i].url).uri.pathname;
        const namefile = attachments[i].type !== "audio" ? nameUrl : nameUrl.replace(/\.mp4/g, ".m4a");
        const path = __dirname + "/cache/" + namefile.slice(namefile.lastIndexOf("/") + 1);

        await imageDownload.image({
            url: attachments[i].url,
            dest: path
        });

        arr.push(fse.createReadStream(path));
        fse.unlinkSync(path);
    }

    return arr;
};
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
