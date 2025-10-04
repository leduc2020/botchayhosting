<<<<<<< HEAD
﻿module.exports.config = {
=======
module.exports.config = {
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
    name: 'listbox',
    version: '1.0.0',
    credits: 'ManhG',
    hasPermssion: 2,
<<<<<<< HEAD
    description: '[Ban/Unban/Remove/Addme] List thread bot đã tham gia',
    commandCategory: 'Admin',
    usages: '[số trang/all]',
=======
    description: '[Ban/Unban/Remove] List thread bot đã tham gia',
    commandCategory: 'Hệ Thống',
    usages: '[số trang/all]',
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
    cooldowns: 5
};

module.exports.handleReply = async function({ api, event, args, Threads, handleReply }) {
    const { threadID, messageID } = event;
    if (parseInt(event.senderID) !== parseInt(handleReply.author)) return;
    const moment = require("moment-timezone");
    const time = moment.tz("Asia/Ho_Chi_minh").format("HH:MM:ss L");
    var arg = event.body.split(" ");
<<<<<<< HEAD

=======
    //var idgr = handleReply.groupid[arg[1] - 1];
    //var groupName = handleReply.groupName[arg[1] - 1];
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
    switch (handleReply.type) {
        case "reply":
            {
                if (arg[0] == "ban" || arg[0] == "Ban") {
<<<<<<< HEAD
                    var nums = arg.slice(1).map(n => parseInt(n)); // Lấy danh sách số thứ tự
                    for (let num of nums) {
                        var idgr = handleReply.groupid[num - 1];
                        var groupName = handleReply.groupName[num - 1];
                        const data = (await Threads.getData(idgr)).data || {};
                        data.banned = true;
                        data.dateAdded = time;
                        await Threads.setData(idgr, { data });
                        global.data.threadBanned.set(idgr, { dateAdded: data.dateAdded });
                        api.sendMessage(`Nhóm ${groupName} (TID: ${idgr}) đã bị ban.`, threadID);
                    }
                    api.unsendMessage(handleReply.messageID);
                }

                if (arg[0] == "unban" || arg[0] == "Unban") {
                    var nums = arg.slice(1).map(n => parseInt(n));
                    for (let num of nums) {
                        var idgr = handleReply.groupid[num - 1];
                        var groupName = handleReply.groupName[num - 1];
                        const data = (await Threads.getData(idgr)).data || {};
                        data.banned = false;
                        data.dateAdded = null;
                        await Threads.setData(idgr, { data });
                        global.data.threadBanned.delete(idgr);
                        api.sendMessage(`Nhóm ${groupName} (TID: ${idgr}) đã được unban.`, threadID);
                    }
                    api.unsendMessage(handleReply.messageID);
                }

                if (arg[0] == "out" || arg[0] == "Out") {
                    var nums = arg.slice(1).map(n => parseInt(n));
                    for (let num of nums) {
                        var idgr = handleReply.groupid[num - 1];
                        var groupName = handleReply.groupName[num - 1];
                        api.removeUserFromGroup(`${api.getCurrentUserID()}`, idgr);
                        api.sendMessage(`Đã rời khỏi nhóm ${groupName} (TID: ${idgr}).`, threadID);
                    }
                    api.unsendMessage(handleReply.messageID);
                }

                if (arg[0] == "Join" || arg[0] == "Join") {
                    var nums = arg.slice(1).map(n => parseInt(n));
                    var msg = "";
                    for (let num of nums) {
                        var idgr = handleReply.groupid[num - 1];
                        var groupName = handleReply.groupName[num - 1];
                        try {
                            api.addUserToGroup(parseInt(event.senderID), idgr);
                            msg += `Đã thêm bạn vào nhóm ${groupName} (TID: ${idgr})\n`;
                        } catch (error) {
                            msg += `Không thể thêm vào nhóm ${groupName} (TID: ${idgr}) do lỗi: ${error.message}\n`;
                        }
                    }
                    api.sendMessage(msg, threadID);
                    api.unsendMessage(handleReply.messageID);
                }
                break;
            }
    }
};

module.exports.run = async function({ api, event, args }) {
    const permission = ["100083174347639"];
    if (!permission.includes(event.senderID)) return api.sendMessage("Bạn không có quyền sử dụng lệnh này.", event.threadID, event.messageID);

    try {
        var inbox = await api.getThreadList(100, null, ['INBOX']);
        let list = [...inbox].filter(group => group.isSubscribed && group.isGroup);
        var listthread = [];
        
        for (var groupInfo of list) {
            const threadInfo = await api.getThreadInfo(groupInfo.threadID);
            listthread.push({
                id: groupInfo.threadID,
                name: groupInfo.name || "Chưa đặt tên",
                participants: groupInfo.participants.length,
                inviteLinkEnabled: groupInfo.inviteLinkEnabled || false, // Kiểm tra trạng thái liên kết lời mời
                messageCount: threadInfo.messageCount || 0, // Lấy tổng số tin nhắn
                inviteLink: threadInfo.inviteLink || (threadInfo.inviteLinkEnabled ? "Có liên kết lời mời" : "Không có liên kết"), // Lấy liên kết lời mời
                approvalStatus: threadInfo.approvalEnabled || false // Kiểm tra trạng thái phê duyệt
            });
        }

        listthread.sort((a, b) => b.participants - a.participants);
        
        var groupid = [];
        var groupName = [];
        var page = parseInt(args[0]) || 1;
        var limit = 10; // Giới hạn số nhóm hiển thị mỗi trang
        var msg = `====『 𝗟𝗜𝗦𝗧 𝗡𝗛𝗢́𝗠 』====\n\n`;
        var numPage = Math.ceil(listthread.length / limit);

        for (var i = limit * (page - 1); i < limit * page; i++) {
            if (i >= listthread.length) break;
            let group = listthread[i];
            msg += `${i + 1}. ${group.name}\n💌 TID: ${group.id}\n👤 Số thành viên: ${group.participants}\n🔗 Liên kết lời mời: ${group.inviteLinkEnabled ? "Bật" : "Tắt"}\n📩 Tổng số tin nhắn: ${group.messageCount}\n🔗 Liên kết: ${group.inviteLink}\n📝 Trạng thái phê duyệt: ${group.approvalStatus ? "Bật" : "Tắt"}\n\n`;
            groupid.push(group.id);
            groupName.push(group.name);
        }

        msg += `Trang ${page}/${numPage}\nDùng lệnh ${global.config.PREFIX}listbox + số trang/all\n`;

        api.sendMessage(msg + "Reply với các lệnh: Out, Ban, Unban, join + số thứ tự để thực hiện hành động.", event.threadID, (e, data) =>
            global.client.handleReply.push({
                name: this.config.name,
                author: event.senderID,
                messageID: data.messageID,
                groupid,
                groupName,
                type: 'reply'
            })
        );
    } catch (e) {
        console.log(e);
        api.sendMessage("Có lỗi xảy ra, vui lòng thử lại sau.", event.threadID);
=======
                    var arrnum = event.body.split(" ");
                    var msg = "";
                    var modules = "[ 𝐌𝐎𝐃𝐄 ] - 𝗧𝗵𝘂̛̣𝗰 𝘁𝗵𝗶 𝗯𝗮𝗻 «\n"
                    var nums = arrnum.map(n => parseInt(n));
                    nums.shift();
                    for (let num of nums) {
                        var idgr = handleReply.groupid[num - 1];
                        var groupName = handleReply.groupName[num - 1];

                        const data = (await Threads.getData(idgr)).data || {};
                        data.banned = true;
                        data.dateAdded = time;
                        var typef = await Threads.setData(idgr, { data });
                        global.data.threadBanned.set(idgr, { dateAdded: data.dateAdded });
                        msg += typef + ' ' + groupName + '\n𝗧𝗜𝗗: ' + idgr + "\n";
                        console.log(modules, msg)
                    }
                    api.sendMessage(``, idgr, () =>
                        api.sendMessage(`${global.data.botID}`, () =>
                            api.sendMessage(` [ 𝐌𝐎𝐃𝐄 ] - 𝗧𝗵𝘂̛̣𝗰 𝘁𝗵𝗶 𝗯𝗮𝗻 «\n(true/false) «\n\n ${msg}`, threadID, () =>
                                api.unsendMessage(handleReply.messageID))));
                    break;
                }

                if (arg[0] == "unban" || arg[0] == "Unban" || arg[0] == "ub" || arg[0] == "Ub") {
                    var arrnum = event.body.split(" ");
                    var msg = "";
                    var modules = "[ 𝐌𝐎𝐃𝐄 ] - 𝗧𝗵𝘂̛̣𝗰 𝘁𝗵𝗶 𝘂𝗻𝗯𝗮𝗻\n"
                    var nums = arrnum.map(n => parseInt(n));
                    nums.shift();
                    for (let num of nums) {
                        var idgr = handleReply.groupid[num - 1];
                        var groupName = handleReply.groupName[num - 1];

                        const data = (await Threads.getData(idgr)).data || {};
                        data.banned = false;
                        data.dateAdded = null;
                        var typef = await Threads.setData(idgr, { data });
                        global.data.threadBanned.delete(idgr, 1);
                        msg += typef + ' ' + groupName + '\n𝗧𝗜𝗗: ' + idgr + "\n";
                        console.log(modules, msg)
                    }
                    api.sendMessage(``, idgr, () =>
                        api.sendMessage(`${global.data.botID}`, () =>
                            api.sendMessage(`» [ 𝐌𝐎𝐃𝐄 ] - 𝗧𝗵𝘂̛̣𝗰 𝘁𝗵𝗶 𝘂𝗻𝗯𝗮𝗻 «(true/false)\n\n${msg}`, threadID, () =>
                                api.unsendMessage(handleReply.messageID))));
                    break;
                }

                if (arg[0] == "out" || arg[0] == "Out") {
                    var arrnum = event.body.split(" ");
                    var msg = "";
                    var modules = "[ 𝐌𝐎𝐃𝐄 ] - 𝗧𝗵𝘂̛̣𝗰 𝘁𝗵𝗶 𝗢𝘂𝘁\n"
                    var nums = arrnum.map(n => parseInt(n));
                    nums.shift();
                    for (let num of nums) {
                        var idgr = handleReply.groupid[num - 1];
                        var groupName = handleReply.groupName[num - 1];
                        var typef = api.removeUserFromGroup(`${api.getCurrentUserID()}`, idgr);
                        msg += typef + ' ' + groupName + '\n» TID: ' + idgr + "\n";
                        console.log(modules, msg)
                    }
                    api.sendMessage(``, idgr, () =>
                        api.sendMessage(`${global.data.botID}`, () =>
                            api.sendMessage(`[ 𝐌𝐎𝐃𝐄 ] - 𝘁𝗵𝘂̛̣𝗰 𝘁𝗵𝗶 𝗼𝘂𝘁\n(true/false)\n\n${msg} `, threadID, () =>
                                api.unsendMessage(handleReply.messageID))));
                    break;
                }
            }
    }
};
module.exports.run = async function({ api, event, args }) {
  const permission = global.config.ADMINBOT;
  if (!permission.includes(event.senderID)) return api.sendMessage("cút :))", event.threadID, event.messageID);
    switch (args[0]) {
        case "all":
            {
                var inbox = await api.getThreadList(100, null, ['INBOX']);
                let list = [...inbox].filter(group => group.isSubscribed && group.isGroup);
                var listthread = [];
                var listbox = [];
                /////////
                for (var groupInfo of list) {
                    //let data = (await api.getThreadInfo(groupInfo.threadID));
                    //const listUserID = event.participantIDs.filter(ID => ID);
                    listthread.push({
                        id: groupInfo.threadID,
                        name: groupInfo.name || "Chưa đặt tên",
                        participants: groupInfo.participants.length
                    });
                }
                /////////
                var listbox = listthread.sort((a, b) => {
                    if (a.participants > b.participants) return -1;
                    if (a.participants < b.participants) return 1;
                });
                /////////  
                var groupid = [];
                var groupName = [];
                var page = 1;
                page = parseInt(args[0]) || 1;
                page < -1 ? page = 1 : "";
                var limit = 100000;
                var msg = "====『 𝗟𝗜𝗦𝗧 𝗡𝗛𝗢́𝗠 』====\n━━━━━━━━━━━━━━━━━━\n\n";
                var numPage = Math.ceil(listbox.length / limit);

                for (var i = limit * (page - 1); i < limit * (page - 1) + limit; i++) {
                    if (i >= listbox.length) break;
                    let group = listbox[i];
                    msg += `━━━━━━━━━━━━━━━━━━\n${i + 1}. ${group.name}\n💌 𝗧𝗜𝗗: ${group.id}\n👤 𝗦𝗼̂́ 𝘁𝗵𝗮̀𝗻𝗵 𝘃𝗶𝗲̂𝗻: ${group.participants}\n\n`;
                    groupid.push(group.id);
                    groupName.push(group.name);
                }
                msg += `\n𝗧𝗿𝗮𝗻𝗴 ${page}/${numPage}\n𝗗𝘂̀𝗻𝗴 ${global.config.PREFIX}𝗹𝗶𝘀𝘁𝗯𝗼𝘅 + 𝘀𝗼̂́ 𝘁𝗿𝗮𝗻𝗴/𝗮𝗹𝗹\n\n`

                api.sendMessage(msg + "━━━━━━━━━━━━━━━━━━\n→ 𝗥𝗲𝗽𝗹𝘆 𝗢𝘂𝘁 , 𝗕𝗮𝗻 , 𝗨𝗻𝗯𝗮𝗻 + 𝘀𝗼̂́ 𝘁𝗵𝘂̛́ 𝘁𝘂̛̣, \n→ 𝗰𝗼́ 𝘁𝗵𝗲̂̉ 𝗿𝗲𝗽 𝗻𝗵𝗶𝗲̂̀𝘂 𝘀𝗼̂́, 𝗰𝗮́𝗰𝗵 𝗻𝗵𝗮𝘂 𝗯𝗮̆̀𝗻𝗴 𝗱𝗮̂́𝘂 𝗰𝗮́𝗰𝗵 đ𝗲̂̉ 𝗢𝘂𝘁, 𝗕𝗮𝗻, 𝗨𝗻𝗯𝗮𝗻 𝘁𝗵𝗿𝗲𝗮𝗱 đ𝗼́ 🌹", event.threadID, (e, data) =>
                    global.client.handleReply.push({
                        name: this.config.name,
                        author: event.senderID,
                        messageID: data.messageID,
                        groupid,
                        groupName,
                        type: 'reply'
                    })
                )
            }
            break;

        default:
            try {
                var inbox = await api.getThreadList(100, null, ['INBOX']);
                let list = [...inbox].filter(group =>  group.isSubscribed && group.isGroup);
                var listthread = [];
                var listbox = [];
                /////////
                for (var groupInfo of list) {
                    //let data = (await api.getThreadInfo(groupInfo.threadID));
                    //const listUserID = event.participantIDs.filter(ID => ID);
                    listthread.push({
                        id: groupInfo.threadID,
                        name: groupInfo.name || "Chưa đặt tên",
messageCount: groupInfo.messageCount,
                        participants: groupInfo.participants.length
                    });

                } //for
                var listbox = listthread.sort((a, b) => {
                    if (a.participants > b.participants) return -1;
                    if (a.participants < b.participants) return 1;
                });
                var groupid = [];
                var groupName = [];
                var page = 1;
                page = parseInt(args[0]) || 1;
                page < -1 ? page = 1 : "";
                var limit = 100;
                var msg = "=====『 𝗟𝗜𝗦𝗧 𝗡𝗛𝗢́𝗠 』=====\n\n";
                var numPage = Math.ceil(listbox.length / limit);

                for (var i = limit * (page - 1); i < limit * (page - 1) + limit; i++) {
                    if (i >= listbox.length) break;
                    let group = listbox[i];
                    msg += `━━━━━━━━━━━━━━━━━━\n${i + 1}. ${group.name}\n[🔰] → 𝗧𝗜𝗗: ${group.id}\n[👤] → 𝗦𝗼̂́ 𝘁𝗵𝗮̀𝗻𝗵 𝘃𝗶𝗲̂𝗻: ${group.participants}\n[💬] → 𝗧𝗼̂̉𝗻𝗴 𝘁𝗶𝗻 𝗻𝗵𝗮̆́𝗻: ${group.messageCount}\n`;
                    groupid.push(group.id);
                    groupName.push(group.name);
                }
                msg += `\n→ 𝗧𝗿𝗮𝗻𝗴 ${page}/${numPage}\𝗗𝘂̀𝗻𝗴 ${global.config.PREFIX}𝗹𝗶𝘀𝘁𝗯𝗼𝘅 + 𝘀𝗼̂́ 𝘁𝗿𝗮𝗻𝗴/𝗮𝗹𝗹\n`

                api.sendMessage(msg + "━━━━━━━━━━━━━━━━━━\n→ 𝗥𝗲𝗽𝗹𝘆 𝗢𝘂𝘁 , 𝗕𝗮𝗻 , 𝗨𝗻𝗯𝗮𝗻 + 𝘀𝗼̂́ 𝘁𝗵𝘂̛́ 𝘁𝘂̛̣, \n→ 𝗰𝗼́ 𝘁𝗵𝗲̂̉ 𝗿𝗲𝗽 𝗻𝗵𝗶𝗲̂̀𝘂 𝘀𝗼̂́, 𝗰𝗮́𝗰𝗵 𝗻𝗵𝗮𝘂 𝗯𝗮̆̀𝗻𝗴 𝗱𝗮̂́𝘂 𝗰𝗮́𝗰𝗵 đ𝗲̂̉ 𝗢𝘂𝘁, 𝗕𝗮𝗻, 𝗨𝗻𝗯𝗮𝗻 𝘁𝗵𝗿𝗲𝗮𝗱 đ𝗼́ 🌹", event.threadID, (e, data) =>
                    global.client.handleReply.push({
                        name: this.config.name,
                        author: event.senderID,
                        messageID: data.messageID,
                        groupid,
                        groupName,
                        type: 'reply'
                    })
                )
            } catch (e) {
                return console.log(e)
            }
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
    }
};