module.exports.config = {
<<<<<<< HEAD
	name: 'menu',
	version: '1.1.1',
	hasPermssion: 0,
	credits: 'DC-Nam mod by Vtuan & DongDev fix',
	description: 'Xem danh sách nhóm lệnh, thông tin lệnh',
	commandCategory: 'Nhóm',
	usages: '[...name commands|all]',
	cooldowns: 1,
	images: [],
	envConfig: {
		autoUnsend: {
			status: true,
			timeOut: 300
		}
	}
};

const { autoUnsend = this.config.envConfig.autoUnsend } = global.config == undefined ? {} : global.config.menu == undefined ? {} : global.config.menu;
const { compareTwoStrings, findBestMatch } = require('string-similarity');
const { readFileSync, writeFileSync, existsSync } = require('fs-extra');

module.exports.run = async function ({ api, event, args }) {
	const moment = require("moment-timezone");
	const { sendMessage: send, unsendMessage: un } = api;
	const { threadID: tid, messageID: mid, senderID: sid } = event;
	const cmds = global.client.commands;

	const time = moment.tz("Asia/Ho_Chi_Minh").format("HH:mm:ss || DD/MM/YYYY");

	if (args.length >= 1) {
		if (typeof cmds.get(args.join(' ')) == 'object') {
			const body = infoCmds(cmds.get(args.join(' ')).config);
			return send(body, tid, mid);
		} else {
			if (args[0] == 'all') {
				const data = cmds.values();
				var txt = '[ BOT MENU LIST ALL ]\n───────────────\n',
					count = 0;
				for (const cmd of data) txt += `|› ${++count}. ${cmd.config.name} | ${cmd.config.description}\n`;
				txt += `───────────────\n|› ⏳ Tự động gỡ tin nhắn sau: ${autoUnsend.timeOut}s`;
				return send({ body: txt, attachment: global.ytb_rst2.length > 0 ? global.ytb_rst2.splice(0, 1) : undefined }, tid, (a, b) => autoUnsend.status ? setTimeout(v1 => un(v1), 1000 * autoUnsend.timeOut, b.messageID) : '');
			} else {
				const cmdsValue = cmds.values();
				const arrayCmds = [];
				for (const cmd of cmdsValue) arrayCmds.push(cmd.config.name);
				const similarly = findBestMatch(args.join(' '), arrayCmds);
				if (similarly.bestMatch.rating >= 0.3) return send(` "${args.join(' ')}" là lệnh gần giống là "${similarly.bestMatch.target}" ?`, tid, mid);
			}
		}
	} else {
		const data = commandsGroup();
		var txt = '[ BOT MENU LIST ]\n───────────────\n', count = 0;
		for (const { commandCategory, commandsName } of data) txt += `|› ${++count}. ${commandCategory} || có ${commandsName.length} lệnh\n`;
		txt += `───────────────\n|› 📝 Tổng có: ${global.client.commands.size} lệnh\n|› ⏰ Time: ${time}\n|› 🔎 Reply từ 1 đến ${data.length} để chọn\n|› ⏳ Tự động gỡ tin nhắn sau: ${autoUnsend.timeOut}s`;
		return send({ body: txt }, tid, (a, b) => {
			global.client.handleReply.push({ name: this.config.name, messageID: b.messageID, author: sid, 'case': 'infoGr', data });
			if (autoUnsend.status) setTimeout(v1 => un(v1), 5000 * autoUnsend.timeOut, b.messageID);
		}, mid);
	}
};

module.exports.handleReply = async function ({ handleReply: $, api, event }) {
	const { sendMessage: send, unsendMessage: un } = api;
	const { threadID: tid, messageID: mid, senderID: sid, args } = event;

	if (sid != $.author) {
		const msg = `⛔ Cút ra chỗ khác`;
		return send(msg, tid, mid);
	}

	switch ($.case) {
		case 'infoGr': {
			var data = $.data[(+args[0]) - 1];
			if (data == undefined) {
				const txt = `❎ "${args[0]}" không nằm trong số thứ tự menu`;
				const msg = txt;
				return send(msg, tid, mid);
			}

			un($.messageID);
			var txt = `=== [ ${data.commandCategory} ] ===\n───────────────\n`,
				count = 0;
			for (const name of data.commandsName) {
				const cmdInfo = global.client.commands.get(name).config;
				txt += `|› ${++count}. ${name} | ${cmdInfo.description}\n`;
			}
			txt += `───────────────\n|› 🔎 Reply từ 1 đến ${data.commandsName.length} để chọn\n|› ⏳ Tự động gỡ tin nhắn sau: ${autoUnsend.timeOut}s\n|› 📝 Dùng ${prefix(tid)}help + tên lệnh để xem chi tiết cách sử dụng lệnh`;
			return send({ body: txt }, tid, (a, b) => {
				global.client.handleReply.push({ name: this.config.name, messageID: b.messageID, author: sid, 'case': 'infoCmds', data: data.commandsName });
				if (autoUnsend.status) setTimeout(v1 => un(v1), 5000 * autoUnsend.timeOut, b.messageID);
			});
		}
		case 'infoCmds': {
			var data = global.client.commands.get($.data[(+args[0]) - 1]);
			if (typeof data != 'object') {
				const txt = `⚠️ "${args[0]}" không nằm trong số thứ tự menu`;
				const msg = txt;
				return send(msg, tid, mid);
			}

			const { config = {} } = data || {};
			un($.messageID);
			const msg = infoCmds(config);
			return send(msg, tid, mid);
		}
		default:
	}
};

function commandsGroup() {
	const array = [],
		cmds = global.client.commands.values();
	for (const cmd of cmds) {
		const { name, commandCategory } = cmd.config;
		const find = array.find(i => i.commandCategory == commandCategory)
		!find ? array.push({ commandCategory, commandsName: [name] }) : find.commandsName.push(name);
	}
	array.sort(sortCompare('commandsName'));
	return array;
}

function infoCmds(a) {
	return `[ INFO - COMMANDS ]\n──────────────────\n|› 📔 Tên lệnh: ${a.name}\n|› 🌴 Phiên bản : ${a.version}\n|› 🔐 Quyền hạn : ${premssionTxt(a.hasPermssion)}\n|› 👤 Tác giả : ${a.credits}\n|› 🌾 Mô tả : ${a.description}\n|› 📎 Thuộc nhóm : ${a.commandCategory}\n|› 📝 Cách dùng : ${a.usages}\n|› ⏳ Thời gian chờ : ${a.cooldowns} giây\n`;
}

function premssionTxt(a) {
	return a == 0 ? 'Thành Viên' : a == 1 ? 'Quản Trị Viên Nhóm' : a == 2 ? 'ADMINBOT' : 'Người Điều Hành Bot';
}

function prefix(a) {
	const tidData = global.data.threadData.get(a) || {};
	return tidData.PREFIX || global.config.PREFIX;
}

function sortCompare(k) {
	return function (a, b) {
		return (a[k].length > b[k].length ? 1 : a[k].length < b[k].length ? -1 : 0) * -1;
	};
}
=======

  name: 'menu',

  version: '2.2.0',

  hasPermssion: 0,

  credits: 'DC-Nam mod by Gojo Satoru',

  description: 'Hiển thị menu lệnh tùy chỉnh theo quyền hạn người dùng',

  commandCategory: 'Tiện ích',

  usages: '[tên lệnh | all]',

  cooldowns: 5,

  envConfig: {

    autoUnsend: {

      status: true,

      timeOut: 90,

      usePrefix: false

    }

  }

};

const { autoUnsend = module.exports.config.envConfig.autoUnsend } = global.config?.menu || {};

const { findBestMatch } = require('string-similarity');

async function getThreadAdminIDs(api, threadID) {

  try {

    const threadInfo = await api.getThreadInfo(threadID);

    return threadInfo.adminIDs.map(admin => admin.id);

  } catch (error) {

    console.error("Lỗi khi lấy danh sách admin:", error);

    return [];

  }

}

function canAccessCommand(cmdPermssion, userPermssion, isGroupAdmin) {

  if (userPermssion === 3) return true; // ADMINBOT có thể truy cập mọi lệnh

  if (userPermssion === 2) return cmdPermssion <= 2; // Người điều hành bot có thể truy cập lệnh có permssion <= 2

  if (isGroupAdmin) return cmdPermssion <= 1; // Admin nhóm có thể truy cập lệnh có permssion <= 1

  return cmdPermssion === 0; // Thành viên thường chỉ có thể truy cập lệnh có permssion = 0

}

function permissionTxt(permission) {

  return permission === 0 ? '👥 Thành Viên' :

         permission === 1 ? '👑 Quản Trị Viên Nhóm' :

         permission === 2 ? '🛠️ Người Điều Hành Bot' : '🌟 ADMINBOT';

}

function infoCmds(config) {

  return `╭━━━『 ℹ️ ${config.name} ℹ️ 』━━━╮\n` +

         `┃ 🔢 Phiên bản: ${config.version}\n` +

         `┃ 🔐 Quyền hạn: ${permissionTxt(config.hasPermssion)}\n` +

         `┃ 👤 Tác giả  : ${config.credits}\n` +

         `┃ 📝 Mô tả    : ${config.description}\n` +

         `┃ 📁 Nhóm lệnh: ${config.commandCategory}\n` +

         `┃ 🔧 Cách dùng: ${config.usages}\n` +

         `┃ ⏱️ Thời gian chờ: ${config.cooldowns} giây\n` +

         `╰━━━━━━━━━━━━━━━━━━━━╯`;

}

function getRandomIcons(count) {

  const allIcons = ['🌟', '🚀', '💡', '🔥', '🎈', '🎉', '🎊', '🏆', '🏅', '🥇', '🥈', '🥉', '🎖️', '🏵️', '🎗️', '🎯', '🎭', '🎨', '🎬', '🎤', '🎧', '🎼', '🎹', '🥁', '🎷', '🎺', '🎸', '🪕', '🎻', '🎲', '🎮', '🕹️', '🎰', '🎳', '🏏', '🏑', '🏒', '🏓', '🏸', '🥊', '🥋', '🥅', '⛳', '⛸️', '🎣', '🤿', '🎽', '🎿', '🛷', '🥌', '🎱', '🪀', '🏹', '🎢', '🎡', '🎠'];

  return [...allIcons].sort(() => 0.5 - Math.random()).slice(0, count);

}

function commandsGroup(permssion, isGroupAdmin) {

  const groups = [];

  for (const [name, cmd] of global.client.commands) {

    if (canAccessCommand(cmd.config.hasPermssion, permssion, isGroupAdmin)) {

      const { commandCategory } = cmd.config;

      const group = groups.find(g => g.commandCategory === commandCategory);

      if (group) {

        group.commandsName.push(name);

      } else {

        groups.push({ commandCategory, commandsName: [name] });

      }

    }

  }

  return groups.sort((a, b) => b.commandsName.length - a.commandsName.length);

}

function findSimilarCommands(input, commands, limit = 3) {

  const matches = findBestMatch(input, commands);

  return matches.ratings

    .filter(match => match.rating > 0.3)

    .sort((a, b) => b.rating - a.rating)

    .slice(0, limit)

    .map(match => match.target);

}

async function sendFullCommandList(api, send, tid, mid, isAdmin, isGroupAdmin, permssion) {

  const cmds = Array.from(global.client.commands.values()).filter(cmd => 

    canAccessCommand(cmd.config.hasPermssion, permssion, isGroupAdmin)

  );

  let txt = '╭───『 All Commands 』───╮\n';

  cmds.forEach((cmd, index) => {

    txt += `┃ ${index + 1}. ${cmd.config.name}\n`;

  });

  txt += `╰─────────────────────╯\n🔸 Dùng "menu + tên lệnh" để xem chi tiết\n🔸 Gỡ tự động sau: ${autoUnsend.timeOut}s`;

  send(txt, tid, (error, info) => {

    if (autoUnsend.status) setTimeout(() => api.unsendMessage(info.messageID), autoUnsend.timeOut * 1000);

  });

}

module.exports.run = async function({ api, event, args, permssion }) {

  const { sendMessage: send, unsendMessage: un } = api;

  const { threadID: tid, messageID: mid, senderID: sid } = event;

  const cmds = global.client.commands;

  const isAdmin = permssion === 2 || permssion === 3;

  const adminIDs = await getThreadAdminIDs(api, tid);

  const isGroupAdmin = adminIDs.includes(sid);

  if (args.length >= 1) {

    if (args[0].toLowerCase() === 'all') {

      return await sendFullCommandList(api, send, tid, mid, isAdmin, isGroupAdmin, permssion);

    }

    const cmdName = args.join(' ').toLowerCase();

    const cmd = cmds.get(cmdName) || cmds.find(c => c.config.name.toLowerCase() === cmdName);

    if (cmd && canAccessCommand(cmd.config.hasPermssion, permssion, isGroupAdmin)) {

      return send(infoCmds(cmd.config), tid, mid);

    } else {

      const accessibleCommands = Array.from(cmds.keys()).filter(name => {

        const cmd = cmds.get(name);

        return canAccessCommand(cmd.config.hasPermssion, permssion, isGroupAdmin);

      });

      const similarCommands = findSimilarCommands(cmdName, accessibleCommands);

      if (similarCommands.length > 0) {

        return send(`❓ Không tìm thấy lệnh "${cmdName}". Có phải bạn muốn tìm:\n${similarCommands.join('\n')}`, tid, mid);

      } else {

        return send(`❌ Không tìm thấy lệnh "${cmdName}" hoặc bạn không có quyền truy cập.`, tid, mid);

      }

    }

  } else {

    const data = commandsGroup(permssion, isGroupAdmin);

    const icons = getRandomIcons(data.length);

    let txt = '╭━━━『 🌟 Menu Yuz 🌟 』━━╮\n';

    for (let i = 0; i < data.length; i++) {

      const { commandCategory, commandsName } = data[i];

      txt += `┃ ${i + 1}. ${icons[i]} ${commandCategory}: ${commandsName.length} lệnh\n`;

    }

    txt += `╰━━━━━━━━━━━━━╯\n` +

           `╭━━━━━━━╮\n` + 

           `┃  ${data.reduce((sum, group) => sum + group.commandsName.length, 0)} lệnh.\n` +

           `╰━━━━━━━╯\n` +

           `📝 Reply số từ 1 đến ${data.length} để xem chi tiết\n` +

           `💡 Gõ "menu all" để xem tất cả lệnh có thể truy cập\n` +

           `⏱️ Tự động gỡ sau: ${autoUnsend.timeOut}s\n` +

           `📱 Facebook Admin: ${global.config.FACEBOOK_ADMIN || "https://www.facebook.com/profile.php?id=61550528673840"}`;

    

    send(txt, tid, (error, info) => {

      global.client.handleReply.push({

        name: this.config.name,

        messageID: info.messageID,

        author: sid,

        'case': 'infoGr',

        data,

        permssion,

        isGroupAdmin

      });

      if (autoUnsend.status) setTimeout(() => un(info.messageID), autoUnsend.timeOut * 1000);

    });

  }

};

module.exports.handleReply = async function({ handleReply: $, api, event }) {

  const { sendMessage: send, unsendMessage: un } = api;

  const { threadID: tid, messageID: mid, senderID: sid, body } = event;

  const args = body.split(' ');

  

  if (sid != $.author) {

    return send(`🚫 Bạn không có quyền sử dụng lệnh này`, tid, mid);

  }

  

  switch ($.case) {

    case 'infoGr': {

      const data = $.data[parseInt(args[0]) - 1];

      if (!data) {

        return send(`❌ "${args[0]}" không nằm trong số thứ tự menu`, tid, mid);

      }

      un($.messageID);

      const icons = getRandomIcons(data.commandsName.length);

      let txt = `╭━━━『 📁 ${data.commandCategory} 📁 』━━━╮\n`;

      for (let i = 0; i < data.commandsName.length; i++) {

        txt += `┃ ${i + 1}. ${icons[i]} ${data.commandsName[i]}\n`;

      }

      txt += `╰━━━━━━━━━━━━━━━━━━━━━╯\n` +

             `📝 Reply từ 1 đến ${data.commandsName.length} để xem chi tiết lệnh\n` +

             `⏱️ Tự động gỡ sau: ${autoUnsend.timeOut}s`;

      send(txt, tid, (error, info) => {

        global.client.handleReply.push({

          name: this.config.name,

          messageID: info.messageID,

          author: sid,

          'case': 'infoCmds',

          data: data.commandsName,

          permssion: $.permssion,

          isGroupAdmin: $.isGroupAdmin

        });

        if (autoUnsend.status) setTimeout(() => un(info.messageID), autoUnsend.timeOut * 1000);

      });

      break;

    }

    case 'infoCmds': {

      const cmdName = $.data[parseInt(args[0]) - 1];

      const cmd = global.client.commands.get(cmdName);

      if (!cmd || !canAccessCommand(cmd.config.hasPermssion, $.permssion, $.isGroupAdmin)) {

        return send(`❌ "${args[0]}" không nằm trong số thứ tự menu hoặc bạn không có quyền truy cập`, tid, mid);

      }

      un($.messageID);

      send(infoCmds(cmd.config), tid, mid);

      break;

    }

  }

};
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
