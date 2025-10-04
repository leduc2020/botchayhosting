module.exports.config = {
    name: "setqtv",
    version: "1.0.0",
<<<<<<< HEAD
    hasPermssion: 1, // 1: Quản trị viên nhóm
    credits: "DongDev",
    description: "Thêm hoặc xóa quản trị viên nhóm.",
    commandCategory: "Quản Trị Viên",
    usages: "setqtv add [tag/reply] | setqtv rm [tag/reply]",
    cooldowns: 5,
    usePrefix: false
};

module.exports.run = async function ({ api, event, args, permssion, Users }) {
    const { threadID, messageID, mentions } = event;
    const moment = require("moment-timezone");
    const gio = moment.tz("Asia/Ho_Chi_Minh").format("DD/MM/YYYY - HH:mm:ss");

    // Kiểm tra quyền hạn của người dùng (chỉ QTV nhóm trở lên mới được dùng lệnh setqtv)
    if (permssion < 1) {
        return api.sendMessage("⚠️ Bạn cần quyền Quản trị viên nhóm trở lên để sử dụng lệnh này.", threadID, messageID);
    }

    const subCommand = args[0]; // Lấy đối số đầu tiên (add/rm)

    // Nếu không có đối số (chỉ gõ setqtv), hiển thị hướng dẫn
    if (!subCommand) {
        return api.sendMessage(
            `[ HƯỚNG DẪN SỬ DỤNG LỆNH SETQTV ]\n────────────────────\n` +
            `📝 ${global.config.PREFIX}setqtv add [tag/reply]: Thêm người dùng làm quản trị viên nhóm.\n` +
            `📝 ${global.config.PREFIX}setqtv rm [tag/reply]: Gỡ quyền quản trị viên của người dùng.\n\n` +
            `⏰ Thời gian: ${gio}\n` +
            `────────────────────\n` +
            `💡 Ghi chú: Bot phải là quản trị viên nhóm để thực hiện lệnh này.`,
            threadID,
            messageID
        );
    }

    const targetIDs = []; // Mảng chứa ID của người dùng cần thao tác

    // Xác định ID của người dùng từ reply hoặc tag
    if (event.type === "message_reply") {
        targetIDs.push(event.messageReply.senderID);
    } else if (Object.keys(mentions).length > 0) {
        targetIDs.push(...Object.keys(mentions));
    } else if (args[1] && !isNaN(args[1])) { // Nếu có ID được cung cấp trực tiếp sau lệnh con
        targetIDs.push(args[1]);
    }

    // Nếu không có đối tượng để thao tác (trừ trường hợp muốn xem hướng dẫn)
    if (targetIDs.length === 0) {
        return api.sendMessage(`⚠️ Vui lòng tag hoặc reply người bạn muốn ${subCommand === "add" ? "thêm" : "xóa"} quản trị viên.`, threadID, messageID);
    }

    // Lấy thông tin nhóm và kiểm tra quyền của bot ĐÚNG LÚC CẦN THIẾT
    const threadInfo = await api.getThreadInfo(threadID);
    const botID = api.getCurrentUserID();
    const botIsAdmin = threadInfo.adminIDs.some(admin => admin.id === botID);


    switch (subCommand) {
        case "add": {
            if (!botIsAdmin) {
                return api.sendMessage("⚠️ Bot hiện không phải là quản trị viên của nhóm. Vui lòng cấp quyền quản trị viên cho bot để thêm quản trị viên.", threadID, messageID);
            }

            let successCount = 0;
            let failedCount = 0;
            const addedNames = [];

            for (const id of targetIDs) {
                try {
                    await api.changeAdminStatus(threadID, id, true);
                    const name = (await Users.getNameUser(id));
                    addedNames.push(name);
                    successCount++;
                } catch (e) {
                    failedCount++;
                    console.error(`Lỗi khi thêm QTV ${id}:`, e);
                }
            }

            if (successCount > 0) {
                api.sendMessage(`☑️ Đã thêm ${successCount} người dùng vào làm quản trị viên nhóm: ${addedNames.join(", ")}`, threadID, messageID);
            }
            if (failedCount > 0) {
                api.sendMessage(`⚠️ Không thể thêm ${failedCount} người dùng vào làm quản trị viên nhóm (có thể họ đã là QTV hoặc có lỗi xảy ra).`, threadID, messageID);
            }
            break;
        }
        case "rm":
        case "remove": {
            if (!botIsAdmin) {
                return api.sendMessage("⚠️ Bot hiện không phải là quản trị viên của nhóm. Vui lòng cấp quyền quản trị viên cho bot để gỡ quản trị viên.", threadID, messageID);
            }

            let successCount = 0;
            let failedCount = 0;
            const removedNames = [];

            for (const id of targetIDs) {
                try {
                    await api.changeAdminStatus(threadID, id, false);
                    const name = (await Users.getNameUser(id));
                    removedNames.push(name);
                    successCount++;
                } catch (e) {
                    failedCount++;
                    console.error(`Lỗi khi gỡ QTV ${id}:`, e);
                }
            }

            if (successCount > 0) {
                api.sendMessage(`☑️ Đã gỡ quyền quản trị viên của ${successCount} người dùng: ${removedNames.join(", ")}`, threadID, messageID);
            }
            if (failedCount > 0) {
                api.sendMessage(`⚠️ Không thể gỡ quyền quản trị viên của ${failedCount} người dùng (có thể họ không phải QTV hoặc có lỗi xảy ra).`, threadID, messageID);
            }
            break;
        }
        default:
            // Hướng dẫn sử dụng nếu cú pháp không đúng (ví dụ: setqtv abc)
            return api.sendMessage("⚠️ Sai cú pháp. Vui lòng dùng:\n- `setqtv add [tag/reply]` để thêm QTV\n- `setqtv rm [tag/reply]` để xóa QTV", threadID, messageID);
    }
};
=======
    hasPermssion: 1,
    credits: "ErikaOwO",
    description: "con cac",
    commandCategory: "group",
    usages: "[test]",
    cooldowns: 5
};
module.exports.run = async function ({ event, api, Currencies, args ,Users, Threads }) {
  //if(!args[0]) return api.sendMessage('co cai db', event.threadID)
  let dataThread = (await Threads.getData(event.threadID)).threadInfo;
  if (args.length == 0) return api.sendMessage(`===== [ 𝗦𝗘𝗧𝗤𝗧𝗩 ] =====\n──────────────────\n/setqtv add @tag hoặc reply → thêm thành viên làm quản trị viên nhóm\n/setqtv remove @tag hoặc reply → xóa quản trị viên của người khác`, event.threadID, event.messageID);
  if (!dataThread.adminIDs.some(item => item.id == api.getCurrentUserID()) && !dataThread.adminIDs.some(item => item.id == event.senderID)) return api.sendMessage('Mày đéo có quyền đâu cút đi 😏', event.threadID, event.messageID);
  if (args[0] == 'add') {
    if (event.type == "message_reply") {
      var uid1 = event.senderID
      var uid = event.messageReply.senderID
      api.sendMessage('Thả cảm xúc "❤" tin nhắn này để xác nhận',  event.threadID, (error, info) => {
  global.client.handleReaction.push({
      name: this.config.name, 
      type: 'add' ,
      messageID: info.messageID,
      author: uid1,
      userID: uid
    })
        event.messageID
})
    } else if(args.join().indexOf('@') !== -1){
      var uid = Object.keys(event.mentions)[0]
      var uid1 = event.senderID
      api.sendMessage('Thả cảm xúc "❤" tin nhắn này để xác nhận',  event.threadID, (error, info) => {
  global.client.handleReaction.push({
      name: this.config.name,
      type: 'add' ,
      messageID: info.messageID,
      author: uid1,
      userID: uid
    })
        event.messageID
})
    } else {
      var uid1 = event.senderID
      api.sendMessage('Thả cảm xúc "❤" tin nhắn này để xác nhận',  event.threadID, (error, info) => {
  global.client.handleReaction.push({
      name: this.config.name,
      type: 'add' ,
      messageID: info.messageID,
      author: uid1,
      userID: uid1
    })
        event.messageID
})
    }
  }
    if (args[0] == 'remove') {
    if (event.type == "message_reply") {
      var uid1 = event.senderID
      var uid = event.messageReply.senderID
      api.sendMessage('Thả cảm xúc "❤" tin nhắn này để xác nhận',  event.threadID, (error, info) => {
  global.client.handleReaction.push({
      name: this.config.name, 
      type: 'remove' ,
      messageID: info.messageID,
      author: uid1,
      userID: uid
    })
        event.messageID
})
    } else if(args.join().indexOf('@') !== -1){
      var uid = Object.keys(event.mentions)[0]
      var uid1 = event.senderID
      api.sendMessage('Thả cảm xúc "❤" tin nhắn này để xác nhận',  event.threadID, (error, info) => {
  global.client.handleReaction.push({
      name: this.config.name,
      type: 'remove' ,
      messageID: info.messageID,
      author: uid1,
      userID: uid
    })
        event.messageID
})
    }
  }
}
module.exports.handleReaction = async function({ event, api, handleReaction, Currencies,Users}){
  console.log(handleReaction)
  if (event.userID != handleReaction.author) return;
  if (event.reaction != "❤") return;
  if(handleReaction.type == 'add'){
    var name =  (await Users.getData(handleReaction.userID)).name
          api.changeAdminStatus(event.threadID, handleReaction.userID, true, editAdminsCallback)
          function editAdminsCallback(err) {
            if (err) return api.sendMessage("📌 Bot không đủ quyền hạn để thêm quản trị viên!", event.threadID, event.messageID);
            return api.sendMessage(`Đã thêm ${name} làm quản trị viên nhóm`, event.threadID, event.messageID);
          }
  }
  if(handleReaction.type == 'remove'){
        var name =  (await Users.getData(handleReaction.userID)).name
          api.changeAdminStatus(event.threadID, handleReaction.userID, false, editAdminsCallback)
          function editAdminsCallback(err) {
            if (err) return api.sendMessage("📌 Bot không đủ quyền hạn để gỡ quản trị viên!", event.threadID, event.messageID);
            return api.sendMessage(`Đã gỡ quản trị viên của ${name} thành công.`, event.threadID, event.messageID);
          }
  }
  }
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
