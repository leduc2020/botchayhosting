<<<<<<< HEAD
﻿const fs = require('fs');

module.exports.config = {
  name: 'setname',
  version: '2.4.0',
  hasPermssion: 0,
  credits: 'DC-Nam & ChatGPT',
  description: 'Thay đổi, kiểm tra, xử lý biệt danh trong nhóm hoặc tên nhóm (box)',
  commandCategory: 'Quản Trị Viên',
  usages: '[biệt danh mới|check|box tên nhóm mới]',
  cooldowns: 0,
};

// Lưu trữ dữ liệu check theo threadID
const pendingChecks = new Map();

module.exports.run = async function ({ api, event, args }) {
  const { threadID, senderID, messageReply, mentions, type, messageID } = event;

  // CHẾ ĐỘ ĐỔI TÊN NHÓM (BOX)
  if (args[0] && args[0].toLowerCase() === 'box') {
    const threadInfo = await api.getThreadInfo(threadID);
    const isSenderAdmin = threadInfo.adminIDs.some(e => e.id == senderID);

    if (!isSenderAdmin) {
      return api.sendMessage('⚠️ Chỉ quản trị viên mới được đổi tên nhóm.', threadID, messageID);
    }

    const newName = args.slice(1).join(' ').trim();
    if (!newName) return api.sendMessage('⚠️ Vui lòng nhập tên nhóm mới.', threadID, messageID);

    try {
      await api.setTitle(newName, threadID);
      return api.sendMessage(`✅ Đã đổi tên nhóm thành: ${newName}`, threadID, messageID);
    } catch (err) {
      return api.sendMessage('❌ Không thể đổi tên nhóm.', threadID, messageID);
    }
  }

  // CHẾ ĐỘ CHECK
  if (args[0] && args[0].toLowerCase() === 'check') {
    const threadInfo = await api.getThreadInfo(threadID);
    const allMembers = threadInfo.participantIDs;
    const nicknames = threadInfo.nicknames || {};

    // 1. CHECK BIỆT DANH NGƯỜI BỊ REPLY
    if (type === 'message_reply') {
      const targetID = messageReply.senderID;
      const nick = nicknames[targetID] || null;
      return api.sendMessage(nick
        ? `💻 Biệt danh của người này là: "${nick}"`
        : `⚠️ Người này chưa có biệt danh trong nhóm.`, threadID, messageID);
    }

    // 2. CHECK BIỆT DANH NGƯỜI ĐƯỢC TAG
    if (Object.keys(mentions).length > 0) {
      const targetID = Object.keys(mentions)[0];
      const nick = nicknames[targetID] || null;
      return api.sendMessage(nick
        ? `💳 Biệt danh của người được tag là: "${nick}"`
        : `⚠️ Người được tag chưa có biệt danh trong nhóm.`, threadID, messageID);
    }

    // 3. DANH SÁCH THÀNH VIÊN CHƯA CÓ BIỆT DANH
    const threadUsers = threadInfo.userInfo.filter(u => allMembers.includes(u.id) && u.type === 'User');
    const noNick = threadUsers.filter(u => !nicknames[u.id]);

    if (noNick.length === 0) {
      return api.sendMessage('✅ Tất cả thành viên đều đã có biệt danh.', threadID);
    }

    const list = noNick.map((user, i) => `${i + 1}. ${user.name} (${user.id})`).join('\n');
    
    // Lưu thông tin vào Map
    pendingChecks.set(threadID, {
      users: noNick.map(user => user.id),
      names: noNick.map(user => user.name),
      timestamp: Date.now()
    });

    return api.sendMessage(
      `📋 Danh sách thành viên chưa có biệt danh:\n✅ ${threadUsers.length - noNick.length}/${threadUsers.length} đã có biệt danh\n❌ ${noNick.length} chưa có:\n${list}`,
      threadID, (err, info) => {
        if (!err) {
          pendingChecks.set(`${threadID}_msg`, info.messageID);
        }
      }
    );
  }

  // CHẾ ĐỘ SET BIỆT DANH
  const rawInput = args.join(' ');
  let targetID = senderID;
  let targetName = '';
  let isSelf = true;

  // Xác định người đặt biệt danh
  if (type === 'message_reply') {
    targetID = messageReply.senderID;
    targetName = messageReply.senderName;
    isSelf = false;
  } else if (Object.keys(mentions).length > 0) {
    targetID = Object.keys(mentions)[0];
    targetName = mentions[targetID];
    isSelf = false;
  }

  // Loại bỏ tên người bị tag/reply khỏi chuỗi biệt danh
  const newName = isSelf ? rawInput : rawInput.replace(targetName, '').trim();

  api.changeNickname(
    newName,
    threadID,
    targetID,
    async (err) => {
      if (err) {
        return api.sendMessage('❌ Không thể đổi biệt danh. Nhóm có thể đang bật liên kết.', threadID);
      } else {
        let message = '';
        if (isSelf) {
          message = `${newName ? '✅ Đã đổi biệt danh của bạn thành: ' + newName : '🔄 Đã gỡ biệt danh của bạn'}`;
        } else {
          // Lấy thông tin người dùng để hiển thị tên
          const userInfo = await api.getUserInfo(targetID);
          const userName = userInfo[targetID]?.name || targetName;
          message = `${newName ? `✅ Đã đổi biệt danh của ${userName} thành: ${newName}` : `🔄 Đã gỡ biệt danh của ${userName}`}`;
        }
        return api.sendMessage(message, threadID);
      }
    }
  );
};

module.exports.handleReply = async function ({ api, event }) {
  const { threadID, body, senderID } = event;
  const checkData = pendingChecks.get(threadID);
  
  if (!checkData) return;
  
  // Kiểm tra quyền admin nếu có lệnh kick
  const threadInfo = await api.getThreadInfo(threadID);
  const isAdmin = threadInfo.adminIDs.some(e => e.id == senderID);

  // Xử lý lệnh tag all
  if (body.toLowerCase() === 'tag all') {
    const mentions = checkData.users.map((id, index) => ({ 
      id, 
      tag: `${index + 1}. ${checkData.names[index]}` 
    }));
    return api.sendMessage({ 
      body: `📌 Tag toàn bộ ${checkData.users.length} thành viên chưa có biệt danh:`, 
      mentions 
    }, threadID);
  }

  // Xử lý lệnh kick all
  if (body.toLowerCase() === 'kick all') {
    if (!isAdmin) {
      return api.sendMessage('❌ Chỉ quản trị viên mới có thể kick thành viên.', threadID);
    }
    
    let kickCount = 0;
    for (const uid of checkData.users) {
      try {
        await api.removeUserFromGroup(uid, threadID);
        kickCount++;
      } catch (e) {
        console.log(`Không thể kick: ${uid}`);
      }
    }
    pendingChecks.delete(threadID);
    return api.sendMessage(`🚫 Đã kick ${kickCount}/${checkData.users.length} thành viên chưa có biệt danh.`, threadID);
  }

  // Xử lý lệnh kick + số
  if (body.toLowerCase().startsWith('kick ')) {
    if (!isAdmin) {
      return api.sendMessage('❌ Chỉ quản trị viên mới có thể kick thành viên.', threadID);
    }
    
    const index = parseInt(body.substring(5));
    if (!isNaN(index) && index > 0 && index <= checkData.users.length) {
      const kickID = checkData.users[index - 1];
      const kickName = checkData.names[index - 1];
      
      try {
        await api.removeUserFromGroup(kickID, threadID);
        return api.sendMessage(`🚫 Đã kick thành viên số ${index} (${kickName}) khỏi nhóm.`, threadID);
      } catch (e) {
        return api.sendMessage(`❌ Không thể kick thành viên số ${index} (${kickName}).`, threadID);
      }
    } else {
      return api.sendMessage('⚠️ Sai cú pháp. Vui lòng reply "kick + số" (ví dụ: kick 1).', threadID);
    }
  }

  // Xử lý tag theo số
  const index = parseInt(body);
  if (!isNaN(index) && index > 0 && index <= checkData.users.length) {
    const tagID = checkData.users[index - 1];
    const tagName = checkData.names[index - 1];
    return api.sendMessage({ 
      body: `🔔 Thành viên số ${index}: ${tagName}`, 
      mentions: [{ id: tagID, tag: tagName }] 
    }, threadID);
  }

  return api.sendMessage('⚠️ Sai cú pháp. Vui lòng reply:\n- Số để tag thành viên\n- "tag all" để tag toàn bộ\n- "kick + số" để kick thành viên\n- "kick all" để kick toàn bộ', threadID);
};

// Xóa dữ liệu cũ sau 10 phút
setInterval(() => {
  const now = Date.now();
  for (const [key, value] of pendingChecks.entries()) {
    if (value.timestamp && now - value.timestamp > 10 * 60 * 1000) {
      pendingChecks.delete(key);
    }
  }
}, 60 * 1000);
=======
const fs = require('fs-extra');
const path = require('path');

module.exports.config = {
    name: 'setname',
    version: '4.0.0',
    hasPermssion: 0,
    Rent: 1,
    credits: 'Vtuan | Cthinh',
    description: 'Đổi biệt danh trong nhóm của bạn hoặc của người bạn tag',
    commandCategory: 'Người dùng',
    usages: '[trống/reply/tag] + [name]',
    usePrefix: false,
    cooldowns: 0
};

module.exports.run = async ({ api, event, args, Users }) => {
    const filePath = path.join(__dirname, './../../modules/commands/data/setname.json');
    const mention = Object.keys(event.mentions)[0];
    let { threadID, messageReply, senderID, mentions, type } = event;
  
    if (!fs.existsSync(filePath)) {
        fs.writeJsonSync(filePath, []);
        api.sendMessage('Đã tạo dữ liệu. vui lòng sử dụng lại lệnh!', threadID);
        return;
    }

    const jsonData = fs.readJsonSync(filePath);
    const existingData = jsonData.find(data => data.id_Nhóm === threadID);

    if (args.length > 0 && args[0].toLowerCase() === 'add') {
        if (args.length < 2) {
            api.sendMessage('Vui lòng nhập kí tự.', threadID);
            return;
        }
        const newData = { id_Nhóm: threadID, kí_tự: args.slice(1).join(' ') || '' };
        if (existingData) {
            existingData.kí_tự = newData.kí_tự;
        } else {
            jsonData.push(newData);
        }
        fs.writeJsonSync(filePath, jsonData);
        api.sendMessage('Đã cập nhật kí tự setname.', threadID);
        return;
    }

    if (args.length > 0 && args[0].toLowerCase() === 'help') {
        api.sendMessage('📑Cách sử dụng:\n- setname add [kí_tự]: Thêm kí tự setname\n- setname + tên: Đổi biệt danh\n- setname check: để xem những người chưa có biệt danh trong nhóm', threadID);
        return;
    }

  if (args.length > 0 && args[0].toLowerCase() === 'check') {
    try {
      let threadInfo = await api.getThreadInfo(event.threadID);
      let u = threadInfo.nicknames || {};
      let participantIDs = threadInfo.participantIDs;
      let listbd = participantIDs.filter(userID => !u[userID]);

      if (listbd.length > 0) {
        let listNames = [];
        let listMentions = [];

        for (let [index, userID] of listbd.entries()) {
          try {
            let userInfo = await Users.getInfo(userID);
            let name = userInfo.name || "Người dùng không có tên";
            listNames.push(`${index + 1}. ${name}`);
            listMentions.push({ tag: `@${name}`, id: userID });
          } catch (error) {
            console.error(`Lỗi khi lấy thông tin người dùng có ID: ${userID}`);
          }
        }
        if (listNames.length > 0) {
          let message = `😌- Danh sách người chưa có biệt danh:\n${listNames.join("\n")}`;
          if (event.body.includes("call")) {
            message += "\n\nHãy đặt biệt danh cho mình nhé!";
            api.sendMessage({ body: `dậy đặt biệt danh đi :<`, mentions: listMentions }, event.threadID);
          } else if (event.body.includes("del")) {
            let isAdmin = threadInfo.adminIDs.some(item => item.id == event.senderID);
            if (isAdmin) {
              for (let userID of listbd) {
                api.removeUserFromGroup(userID, event.threadID);
              }
              message += "\n\nĐã xóa những người chưa có biệt danh ra khỏi nhóm.";
              api.sendMessage(message, event.threadID);
            } else {
              message += "\n\nBạn không có quyền xóa người khác ra khỏi nhóm.";
              api.sendMessage(message, event.threadID);
            }
          } else if (event.body.includes("help")) {
            message = `📔~ Lệnh check dùng để kiểm tra các thành viên trong nhóm chưa có biệt danh.\nCách sử dụng: check [call | del | help]\n\n- checksn: chỉ hiển thị danh sách người chưa có biệt danh.\n- check call: tag tất cả người chưa có biệt danh và gửi kèm tin nhắn hãy đặt biệt danh.\n- check del: xóa tất cả người chưa có biệt danh ra khỏi nhóm (chỉ dành cho quản trị viên).\n- checksn help: hiển thị hướng dẫn sử dụng lệnh này.`;
            api.sendMessage(message, event.threadID);
          } else {
            message += "\n\n- dùng check help để xem cách sử dụng toàn bộ chức năng của lệnh.";
            api.sendMessage(message, event.threadID);
          }
        } else {
          api.sendMessage(`✅Không có người nào chưa có biệt danh.`, event.threadID);
        }
      } else {
        api.sendMessage(`✅Tất cả thành viên đã có biệt danh.`, event.threadID);
      }
    } catch (error) {
      console.error(error);
      api.sendMessage('❌Đã xảy ra lỗi khi thực hiện chức năng kiểm tra biệt danh.', event.threadID);
    }
      return;
  }
  if (args.length > 0 && args[0].toLowerCase() === 'all') {
      const threadInfo = await api.getThreadInfo(event.threadID);
      const idtv = threadInfo.participantIDs;
      const nameToChange = args.slice(1).join(" ");

      function delay(ms) {
          return new Promise(resolve => setTimeout(resolve, ms));
      };

      for (let setname of idtv) {
          let newName = nameToChange;

          if (existingData) {
              const senderName = await Users.getNameUser(event.senderID);
              const kt = existingData.kí_tự;
              newName = kt + ' ' + senderName;
          }

          await delay(100);
          await api.changeNickname(newName, event.threadID, setname);
      }

      api.sendMessage('✅Đã thay đổi biệt danh cho tất cả thành viên trong nhóm.', event.threadID);
      return;
  }
  
  if (existingData) {
      const kt = existingData.kí_tự;
      let name = await Users.getNameUser(event.senderID);
      const names = args.length > 0 ? args.join(' ') : `${name}`;
      if (names.indexOf('@') !== -1) {
          api.changeNickname(`${kt} ${names.replace(mentions[mention], "")}`, threadID, mention, e => !e ? api.sendMessage(`${!args[0] ? 'Gỡ' : 'Thay đổi'} biệt danh hoàn tất!\nDùng setname help để xem tất cả các chức năng của lệnh`, event.threadID) : api.sendMessage(`[ ! ] - Hiện tại nhóm đang bật liên kết tham gia nên bot không thể set được biệt danh cho người dùng, hãy tắt liên kết mời để có thể xử dụng tính năng này!`, event.threadID));
      } else {
          api.changeNickname(`${kt} ${names}`, threadID, event.type == 'message_reply' ? event.messageReply.senderID : event.senderID, e => !e ? api.sendMessage(`${!args[0] ? 'Gỡ' : 'Thay đổi'} biệt danh hoàn tất!\nDùng setname help để xem tất cả các chức năng của lệnh`, event.threadID) : api.sendMessage(`[ ❌ ] - Hiện tại nhóm đang bật liên kết tham gia nên bot không thể set được biệt danh cho người dùng, hãy tắt liên kết mời để có thể xử dụng tính năng này!`, event.threadID));
      }
  } else {
        if (args.join().indexOf('@') !== -1) {
            const name = args.join(' ');
            api.changeNickname(`${name.replace(mentions[mention], "")}`, threadID, mention, e => !e ? api.sendMessage(`${!args[0] ? 'Gỡ' : 'Thay đổi'} biệt danh hoàn tất!\nDùng setname help để xem tất cả các chức năng của lệnh`, event.threadID) : api.sendMessage(`[ ! ] - Hiện tại nhóm đang bật liên kết tham gia nên bot không thể set được biệt danh cho người dùng,hãy tắt liên kết mời để có thể xử dụng tính năng này!`, event.threadID));
        } else {
            api.changeNickname(args.join(' '), event.threadID, event.type == 'message_reply' ? event.messageReply.senderID : event.senderID, e => !e ? api.sendMessage(`${!args[0] ? 'Gỡ' : 'Thay đổi'} biệt danh hoàn tất!\nDùng setname help để xem tất cả các chức năng của lệnh`, event.threadID) : api.sendMessage(`[ ! ] - Hiện tại nhóm đang bật liên kết tham gia nên bot không thể set được biệt danh cho người dùng,hãy tắt liên kết mời để có thể xử dụng tính năng này!`, event.threadID));
        }
    }
};
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
