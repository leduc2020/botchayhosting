<<<<<<< HEAD
﻿const games = {};

function getCard() {
  const ranks = ["A", "2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K"];
  const suits = ["♠", "♥", "♦", "♣"];
  return ranks[Math.floor(Math.random() * ranks.length)] + suits[Math.floor(Math.random() * suits.length)];
}

function calcPoints(cards) {
  let points = 0;
  const ranks = { "A": 1, "J": 10, "Q": 10, "K": 10 };
  for (let c of cards) {
    let rank = c.slice(0, -1);
    points += ranks[rank] || parseInt(rank);
  }
  return points % 10;
}

function compareHands(a, b) {
  if (a.points > b.points) return 1;
  if (a.points < b.points) return -1;
  
  // Nếu bằng điểm thì so chất bài: Cơ ♥ > Rô ♦ > Tép ♣ > Bích ♠
  const suitOrder = { "♥": 4, "♦": 3, "♣": 2, "♠": 1 };
  const maxSuitA = Math.max(...a.cards.map(c => suitOrder[c.slice(-1)]));
  const maxSuitB = Math.max(...b.cards.map(c => suitOrder[c.slice(-1)]));
  
  if (maxSuitA > maxSuitB) return 1;
  if (maxSuitA < maxSuitB) return -1;
  
  // Nếu cùng chất thì so lá bài cao nhất
  const order = { "A": 14, "K": 13, "Q": 12, "J": 11, "10": 10, "9": 9, "8": 8, "7": 7, "6": 6, "5": 5, "4": 4, "3": 3, "2": 2 };
  const maxA = Math.max(...a.cards.map(c => order[c.slice(0, -1)]));
  const maxB = Math.max(...b.cards.map(c => order[c.slice(0, -1)]));
  
  if (maxA > maxB) return 1;
  if (maxA < maxB) return -1;
  
  return 0;
}

// Hàm chuyển đổi định dạng tiền tệ
function parseMoney(moneyValue) {
  if (typeof moneyValue === 'string') {
    return parseFloat(moneyValue.replace(/\./g, '').replace(',', '.'));
  }
  return moneyValue;
}

// Hàm tính phần thưởng theo số lượng người chơi và tổng tiền
function calculateReward(pot, playerCount) {
  if (pot >= 3000000 && playerCount < 5) {
    return Math.floor(pot * 0.3);
  }
  if (playerCount > 8) {
    return Math.floor(pot * 0.3);
  } else if (playerCount > 5) {
    return Math.floor(pot * 0.5);
  }
  return pot;
}

module.exports.config = {
  name: "baicao",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "Ngọc Nhi x GPT",
  description: "Game bài cào",
  commandCategory: "Game",
  usages: "[create số tiền | thamgia | roi | huy | chia]",
  cooldowns: 5
};

module.exports.run = async function ({ api, event, args, Currencies, Users }) {
  const { threadID, senderID } = event;
  const name = await Users.getNameUser(senderID);

  if (!args[0]) {
    return api.sendMessage(
`🎴 Luật Bài Cào 3 lá:
- Mỗi người được chia 3 lá, tính nút (A=1, J/Q/K=10).
- Tổng điểm % 10 là số nút. Cao nhất: 9 nút.
- Nếu cùng nút → so chất bài (Cơ ♥ > Rô ♦ > Tép ♣ > Bích ♠)
- Nếu vẫn hòa → so lá bài cao nhất

📌 Cách chơi:
/baicao create [số tiền] → tạo bàn
thamgia → tham gia
roi → rời bàn
huy → hủy (chủ bàn)
/baicao chia → chia bài khi đủ >=3 người

`,
      threadID
    );
  }

  const choice = args[0].toLowerCase();

  // tạo bàn
  if (choice === "create") {
    if (games[threadID]) return api.sendMessage("❌ Hiện đã có bàn, hãy tham gia hoặc chờ hủy.", threadID);

    const bet = parseInt(args[1]);
    if (!bet || bet < 1000) return api.sendMessage("⚠️ Cược tối thiểu là 1,000 VNĐ.", threadID);

    const userData = await Currencies.getData(senderID);
    const userMoney = parseMoney(userData.money);
    if (userMoney < bet) return api.sendMessage(`⚠️ Bạn không đủ tiền để tạo bàn. Số dư: ${userData.money} VNĐ.`, threadID);

    await Currencies.decreaseMoney(senderID, bet);

    games[threadID] = {
      bet,
      host: senderID,
      players: [{ id: senderID, name, bet }],
      started: false
    };
    return api.sendMessage(`🎴 ${name} đã tạo bàn với cược ${bet.toLocaleString()} VNĐ.\nGõ 'thamgia' để tham gia! (Tối đa 14 người)`, threadID);
  }

  // hủy bàn
  if (choice === "huy") {
    const game = games[threadID];
    if (!game) return api.sendMessage("❌ Chưa có bàn nào.", threadID);
    if (game.host !== senderID) return api.sendMessage("❌ Chỉ chủ bàn được hủy.", threadID);

    for (let p of game.players) {
      await Currencies.increaseMoney(p.id, game.bet);
    }
    delete games[threadID];
    return api.sendMessage("🛑 Bàn đã bị hủy.", threadID);
  }

  // chia bài
  if (choice === "chia") {
    const game = games[threadID];
    if (!game) return api.sendMessage("❌ Không có bàn.", threadID);
    if (game.host !== senderID) return api.sendMessage("❌ Chỉ chủ bàn được chia.", threadID);
    if (game.players.length < 3) return api.sendMessage("❌ Cần ít nhất 3 người để chia.", threadID);
    if (game.started) return api.sendMessage("❌ Bàn đã được chia.", threadID);

    game.started = true;
    
    // Gửi ảnh GIF khi chia bài
 
    api.sendMessage("🎴 Chủ bàn đã bấm chia, đợi 30s để chia bài...", threadID);
	

    setTimeout(async () => {
      let results = [];
      for (let p of game.players) {
        const cards = [getCard(), getCard(), getCard()];
        const points = calcPoints(cards);
        results.push({ id: p.id, name: p.name, cards, points });
      }

      // Lấy thời gian hiện tại
      const now = new Date();
      const Tm = `${now.getHours().toString().padStart(2, '0')}:${now.getMinutes().toString().padStart(2, '0')}:${now.getSeconds().toString().padStart(2, '0')} - ${now.getDate()}/${now.getMonth() + 1}/${now.getFullYear()}`;

      // Sắp xếp kết quả
      results.sort((a, b) => compareHands(b, a));
      const winner = results[0];
      const winners = results.filter(r => compareHands(r, winner) === 0);

      // Tạo message với format mới
      let msg = `[ KẾT QUẢ BÀI CÀO ]\n────────────────────\n⏰ Time: ${Tm}\n💰 Mức cược: ${game.bet.toLocaleString()} VNĐ\n\n`;
      
      // Hiển thị bài của từng người
      for (let r of results) {
        const cardsStr = r.cards.join(" | ");
        const isHost = r.id === game.host;
        msg += `👤 ${r.name}${isHost ? ' (Chủ bàn)' : ''}:\n🃏 ${cardsStr}\n⭐ Điểm: ${r.points}\n────────────────────\n\n`;
      }

      if (winners.length === 1) {
        const pot = game.bet * game.players.length;
        const reward = calculateReward(pot, game.players.length);
        
        await Currencies.increaseMoney(winner.id, reward);
        
        msg += `🏆 NGƯỜI THẮNG (${winners.length} người):\n\n`;
        msg += `- ${winner.name} (+${reward.toLocaleString()} VNĐ)\n`;
        
        // Hiển thị thông tin tỷ lệ
        if (pot >= 3000000 && game.players.length < 5) {
          msg += ``;
        } else if (game.players.length > 8) {
          msg += ``;
        } else if (game.players.length > 5) {
          msg += ``;
        }
      } else {
        msg += `⚠️ Không có người thắng (tất cả bằng điểm thấp nhất hoặc không có người thua).\n`;
        for (let p of game.players) {
          await Currencies.increaseMoney(p.id, game.bet);
        }
        msg += `💵 Đã hoàn tiền cho tất cả người chơi.\n`;
      }

      delete games[threadID];
      api.sendMessage(msg, threadID);
    }, 30000);
  }
};

// xử lý chat thamgia/roi
module.exports.handleEvent = async function ({ api, event, Users, Currencies }) {
  const { threadID, senderID, body } = event;
  if (!body) return;
  const text = body.toLowerCase();
  const name = await Users.getNameUser(senderID);

  if (text === "thamgia") {
    const game = games[threadID];
    if (!game || game.started) return;
    if (game.players.find(p => p.id === senderID)) return api.sendMessage("❌ Bạn đã tham gia.", threadID);
    
    if (game.players.length >= 14) return api.sendMessage("❌ Bàn đã đầy (tối đa 14 người).", threadID);

    const userData = await Currencies.getData(senderID);
    const userMoney = parseMoney(userData.money);
    if (userMoney < game.bet) return api.sendMessage(`⚠️ Bạn không đủ tiền để tham gia. Số dư: ${userData.money} VNĐ.`, threadID);

    await Currencies.decreaseMoney(senderID, game.bet);
    game.players.push({ id: senderID, name, bet: game.bet });
    
    const currentPot = game.bet * game.players.length;
    
    let rewardInfo = "";
    if (game.players.length > 8) {
      rewardInfo = " (Thưởng 30% tổng tiền)";
    } else if (game.players.length > 5) {
      rewardInfo = " (Thưởng 50% tổng tiền)";
    } else if (currentPot >= 3000000) {
      rewardInfo = " (Thưởng 30% - nhà cái ăn 70%)";
    }
    
    return api.sendMessage(`✅ ${name} đã tham gia với ${game.bet.toLocaleString()} VNĐ. Hiện có ${game.players.length}/14 người. Tổng: ${currentPot.toLocaleString()} VNĐ${rewardInfo}`, threadID);
  }

  if (text === "roi") {
    const game = games[threadID];
    if (!game || game.started) return;
    if (game.host === senderID) return api.sendMessage("❌ Chủ bàn không thể rời.", threadID);

    const index = game.players.findIndex(p => p.id === senderID);
    if (index !== -1) {
      await Currencies.increaseMoney(senderID, game.bet);
      game.players.splice(index, 1);
      
      const currentPot = game.bet * game.players.length;
      return api.sendMessage(`🚪 ${name} đã rời bàn. Hiện có ${game.players.length}/14 người. Tổng: ${currentPot.toLocaleString()} VNĐ`, threadID);
    }
  }
};
=======
module.exports.config = {
    name: "baicao",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "",
    description: "Game 3 cây dành cho nhóm có đặt cược (có ảnh lá bài)",
    commandCategory: "Trò Chơi",
    usages: "[start/join/info/leave]",
    cooldowns: 1
};


const values = ["2", "3", "4", "5", "6", "7", "8", "9", "10", "J", "Q", "K", "A"];
const suits = ["spades", "hearts", "diamonds", "clubs"];
const deck = [];

for (let i = 0 ; i < values.length; i++) {
  for (let x = 0; x < suits.length; x++) {
    let weight = parseInt(values[i]);
    if (["J", "Q", "K"].includes(values[i])) weight = 10;
    else if (values[i] == "A") weight = 11;
    const card = {
      Value: values[i],
      Suit: suits[x],
      Weight: weight,
      Icon: suits[x] == "spades" ? "♠️" : suits[x] == "hearts" ? "♥️" : suits[x] == "diamonds" ? "♦️" : "♣️"
        };
    deck.push(card);
  }
}

function createDeck() {
  // for 1000 turns
  // switch the values of two random cards
  const deckShuffel = [...deck];
  for (let i = 0; i < 1000; i++) {
    const location1 = Math.floor((Math.random() * deckShuffel.length));
    const location2 = Math.floor((Math.random() * deckShuffel.length));
    const tmp = deckShuffel[location1];
    deckShuffel[location1] = deckShuffel[location2];
    deckShuffel[location2] = tmp;
  }
  return deckShuffel;
}

function getLinkCard(Value, Suit) {
  return `https://raw.githubusercontent.com/ntkhang03/poker-cards/main/cards/${Value == "J" ? "jack" : Value == "Q" ? "queen" : Value == "K" ? "king" : Value == "A" ? "ace" : Value}_of_${Suit}.png`;
}

async function drawCard(cards) {
  // 500 x 726
  const Canvas = require("canvas");
    const canvas = Canvas.createCanvas(500*cards.length, 726);
  const ctx = canvas.getContext("2d");
  let x = 0;
  for (const card of cards) {
    const loadImgCard = await Canvas.loadImage(card);
    ctx.drawImage(loadImgCard, x, 0);
    x += 500;
  }
  return canvas.toBuffer();
}

module.exports.handleEvent = async ({ Currencies, event, api, Users }) => {
  const Canvas = require("canvas");
  const fs = require ("fs-extra");
  
    const { senderID, threadID, body, messageID } = event;
  
    if (typeof body == "undefined") return;
    if (!global.moduleData.baicao) global.moduleData.baicao = new Map();
    if (!global.moduleData.baicao.has(threadID)) return;
    var values = global.moduleData.baicao.get(threadID);
    if (values.start != 1) return;
  
    const deckShuffel = values.deckShuffel; // Bộ bài

    if (body.indexOf("Chia bài") == 0 || body.indexOf("chia bài")   == 0) {
        if (values.chiabai == 1) return;
        for (const key in values.player) {
            const card1 = deckShuffel.shift();
            const card2 = deckShuffel.shift();
            const card3 = deckShuffel.shift();
            var tong = (card1.Weight + card2.Weight + card3.Weight);
            if (tong >= 20) tong -= 20;
            if (tong >= 10) tong -= 10;
            values.player[key].card1 = card1;
            values.player[key].card2 = card2;
            values.player[key].card3 = card3;
            values.player[key].tong = tong;
            
            const linkCards = [];
            
            for (let i = 1; i < 4; i++) {
              const Card = values.player[key]["card" + i];
              linkCards.push(getLinkCard(Card.Value, Card.Suit));
            }
            
            const pathSave = __dirname + `/cache/card${values.player[key].id}.png`;
            fs.writeFileSync(pathSave, await drawCard(linkCards));
            
            api.sendMessage({
              body: `𝐁𝐚̀𝐢 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧 🎲: ${card1.Value}${card1.Icon} | ${card2.Value}${card2.Icon} | ${card3.Value}${card3.Icon} \n\n𝐓𝐨̂̉𝐧𝐠 𝐛𝐚̀𝐢 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧: ${tong}`,
              attachment: fs.createReadStream(pathSave)
            }, values.player[key].id, (error, info) => {
                if (error) return api.sendMessage(`𝐊𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐜𝐡𝐢𝐚 𝐛𝐚̀𝐢 𝐜𝐡𝐨 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐝𝐮̀𝐧𝐠: ${values.player[key].id}`, threadID);
                fs.unlinkSync(pathSave);
            });
                
        }
        values.chiabai = 1;
        global.moduleData.baicao.set(threadID, values);
        return api.sendMessage("💦 𝐂𝐡𝐢𝐚 𝐛𝐚̀𝐢 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠 ! 𝐓𝐚̂́𝐭 𝐜𝐚̉ 𝐦𝐨̣𝐢 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐨́ 𝟐 𝐥𝐮̛𝐨̛̣𝐭 𝐭𝐡𝐚𝐲 𝐛𝐚̀𝐢 𝐧𝐞̂𝐮́ 𝐤𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐚̂𝐲́ 𝐛𝐚̀𝐢 𝐡𝐚̃𝐲 𝐤𝐢𝐞̂̉𝐦 𝐭𝐫𝐚 𝐥𝐚̣𝐢 𝐭𝐢𝐧 𝐧𝐡𝐚̆́𝐧 𝐜𝐡𝐨̛̀ 💌", threadID);
    }

    if (body.indexOf("Đổi bài") == 0 || body.indexOf("đổi bài")   == 0) {
        if (values.chiabai != 1) return;
        var player = values.player.find(item => item.id == senderID);
        if (player.doibai == 0) return api.sendMessage("𝐁𝐚̣𝐧 𝐯𝐮̛̀𝐚 𝐬𝐮̛̉ 𝐝𝐮̣𝐧𝐠 𝐭𝐨𝐚̀𝐧 𝐛𝐨̣̂ 𝐥𝐮̛𝐨̛̣𝐭 𝐭𝐡𝐚𝐲 𝐛𝐚̀𝐢", threadID, messageID);
        if (player.ready == true) return api.sendMessage("𝐁𝐚̣𝐧 𝐯𝐮̛̀𝐚 𝐫𝐞𝐚𝐝𝐲, 𝐛𝐚̣𝐧 𝐤𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐭𝐡𝐚𝐲 𝐛𝐚̀𝐢 !", threadID, messageID);
        const card = ["card1","card2","card3"];
        player[card[(Math.floor(Math.random() * card.length))]] = deckShuffel.shift();
        player.tong = (player.card1.Weight + player.card2.Weight + player.card3.Weight);
        if (player.tong >= 20) player.tong -= 20;
        if (player.tong >= 10) player.tong -= 10;
        player.doibai -= 1;
        global.moduleData.baicao.set(values);
        
        const linkCards = [];
            
        for (let i = 1; i < 4; i++) {
          const Card = player["card" + i];
          linkCards.push(getLinkCard(Card.Value, Card.Suit));
        }
        
      const pathSave = __dirname + `/cache/card${player.id}.png`;
        fs.writeFileSync(pathSave, await drawCard(linkCards));
      
        return api.sendMessage({
          body: `🃏 𝐁𝐚̀𝐢 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧 𝐬𝐚𝐮 𝐤𝐡𝐢 𝐛𝐨𝐭 𝐭𝐡𝐚𝐲: ${player.card1.Value}${player.card1.Icon} | ${player.card2.Value}${player.card2.Icon} | ${player.card3.Value}${player.card3.Icon}\n\n⚡️ 𝐓𝐨̂̉𝐧𝐠 𝐛𝐚̀𝐢 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧: ${player.tong}`,
          attachment: fs.createReadStream(pathSave)
    }, player.id, (error, info) => {
            if (error) return api.sendMessage(`𝐊𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐭𝐡𝐚𝐲 𝐛𝐚̀𝐢 𝐜𝐡𝐨 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐝𝐮̀𝐧𝐠: ${player.id}`, threadID);
            fs.unlinkSync(pathSave);
        });
    }

    if (body.indexOf("ready") == 0 || body.indexOf("Ready")   == 0) {
        if (values.chiabai != 1) return;
        var player = values.player.find(item => item.id == senderID);
        if (player.ready == true) return;
        const name = await Users.getNameUser(player.id);
        values.ready += 1;
        player.ready = true;
        if (values.player.length == values.ready) {
            const player = values.player;
            player.sort(function (a, b) { return b.tong - a.tong });

            var ranking = [], num = 1;

            for (const info of player) {
                const name = await Users.getNameUser(info.id);
                ranking.push(`${num++} • ${name} 𝐯𝐨̛́𝐢 ${info.card1.Value}${info.card1.Icon} | ${info.card2.Value}${info.card2.Icon} | ${info.card3.Value}${info.card3.Icon} => ${info.tong} 𝐧𝐮́𝐭 💸\n`);
            }
            
            try {
                await Currencies.increaseMoney(player[0].id, values.rateBet * player.length);
            } catch (e) {};
            global.moduleData.baicao.delete(threadID);
            
            return api.sendMessage(`[⚡️] 𝐊𝐞̂́𝐭 𝐪𝐮𝐚̉:\n\n ${ranking.join("\n")}\n\n𝐑𝐢𝐞̂𝐧𝐠 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐡𝐨̛𝐢 𝐭𝐨𝐩 𝟏 𝐧𝐡𝐚̣̂𝐧 𝐯𝐞̂̀ 𝐬𝐨̂́ 𝐭𝐢𝐞̂̀𝐧 𝐭𝐮̛𝐨̛𝐧𝐠 𝐮̛́𝐧𝐠 ${values.rateBet * player.length} 𝐕𝐍𝐃 💵`, threadID);
        }
        else return api.sendMessage(`[😻] 𝐍𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐡𝐨̛𝐢: ${name} 𝐕𝐮̛̀𝐚 𝐬𝐚̆̃𝐧 𝐬𝐚̀𝐧𝐠 𝐥𝐚̣̂𝐭 𝐛𝐚̀𝐢, 𝐜𝐨̀𝐧 𝐥𝐚̣𝐢: ${values.player.length - values.ready} 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐡𝐨̛𝐢 𝐜𝐡𝐮̛𝐚 𝐥𝐚̣̂𝐭 𝐛𝐚̀𝐢`, event.threadID);
    }
    
    if (body.indexOf("nonready") == 0 || body.indexOf("Nonready")   == 0) {
        const data = values.player.filter(item => item.ready == false);
        var msg = [];

        for (const info of data) {
            const name = global.data.userName.get(info.id) || await Users.getNameUser(info.id);
            msg.push(name);
        }
        if (msg.length != 0) return api.sendMessage("[😿] 𝐍𝐡𝐮̛̃𝐧𝐠 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐡𝐨̛𝐢 𝐜𝐡𝐮̛𝐚 𝐬𝐚̆̃𝐧 𝐬𝐚̀𝐧𝐠 𝐛𝐚𝐨 𝐠𝐨̂̀𝐦: " + msg.join(", "), threadID);
        else return;
    }
}

module.exports.run = async ({ api, event, args, Currencies }) => {
    var { senderID, threadID, messageID } = event;
 const { readdirSync, readFileSync, writeFileSync, existsSync, copySync, createWriteStream, createReadStream, fs } = require("fs-extra");
  const request = require("request")
    threadID = String(threadID);
    senderID = String(senderID);
    if (!existsSync(__dirname + '/cache/3cay2.png')) {
        request('https://i.imgur.com/ixYeOs8.jpg').pipe(createWriteStream(__dirname + '/cache/3cay2.png'));
      }
    if (!global.moduleData.baicao) global.moduleData.baicao = new Map();
    var values = global.moduleData.baicao.get(threadID) || {};
  var data = await Currencies.getData(event.senderID);
  var money = data.money     
    if(!args[0]) {
var msg =  {body: `🃏====[ 𝐁𝐚̀𝐧 𝐁𝐚̀𝐢 𝐂𝐚̀𝐨 ]====🃏\n\n𝗖𝗵𝗮̀𝗼 𝗺𝘂̛̀𝗻𝗴 𝗯𝗮̣𝗻 𝘁𝗼̛́𝗶 𝘃𝗼̛́𝗶 𝘀𝗼̀𝗻𝗴 𝗯𝗮̣𝗰 𝗰𝘂̉𝗮 𝘁𝗵𝗮̂̀𝗻 𝗯𝗮̀𝗶 𝗗𝘂𝗯𝗮𝗶\n𝗡𝗲̂́𝘂 𝗺𝘂𝗼̂́𝗻 𝘁𝗵𝗮𝗺 𝗴𝗶𝗮 𝗯𝗮̣𝗻 𝗰𝗮̂̀𝗻 𝗻𝗵𝗮̣̂𝗽 𝗰𝗮́𝗰 𝗹𝗲̣̂𝗻𝗵 𝗻𝗵𝘂̛ 𝘀𝗮𝘂:\n» /𝗯𝗮𝗶𝗰𝗮𝗼 𝗰𝗿𝗲𝗮𝘁𝗲 [ Số Tiền Cược ]\n» /𝗯𝗮𝗶𝗰𝗮𝗼 𝘀𝘁𝗮𝗿𝘁 [ Bắt Đầu Bàn 3 Cây ]\n» /𝗯𝗮𝗶𝗰𝗮𝗼 𝗶𝗻𝗳𝗼 [ Xem Thông Tin Bàn Bài Cào ]\n» /𝗯𝗮𝗶𝗰𝗮𝗼 𝗷𝗼𝗶𝗻 [ Để Người Chơi Vào Game]\n» /𝗯𝗮𝗶𝗰𝗮𝗼 𝗹𝗲𝗮𝘃𝗲 [ Để Rời Bàn 3 Cây ]\n» 𝗖𝗵𝗶𝗮 𝗯𝗮̀𝗶 [ Để Chia Bài Cho Người Chơi Chỉ Có Chủ Bàn Mới Nhập Có Hiệu Lệnh ]\n» Đ𝗼̂̉𝗶 𝗕𝗮̀𝗶 [ Để Đổi Bài Mỗi Người Chơi Chỉ Có 2 Lượt Đổi Bài Tương Ứng ]\n» 𝗥𝗲𝗮𝗱𝘆 [ Sẵn Sàng Mở Bài ]\n» 𝗡𝗼𝗻𝗿𝗲𝗮𝗱𝘆 [ Xem Những Người Chưa Sẵn Sàng ]`, attachment : [
      createReadStream(__dirname + "/cache/3cay2.png")
    ]}
     return api.sendMessage(msg, threadID, messageID)    }
     switch (args[0]) {
        case "create":
        case "-c": {
            if (global.moduleData.baicao.has(threadID)) return api.sendMessage("[🃏] 𝐇𝐢𝐞̣̂𝐧 𝐭𝐚̣𝐢 𝐧𝐡𝐨́𝐦 𝐧𝐚̀𝐲 𝐜𝐨́ 𝐬𝐨̀𝐧𝐠 𝐛𝐚̀𝐢 𝐜𝐚̀𝐨 𝐯𝐚̂̃𝐧 𝐦𝐨̛̉", threadID, messageID);
            if (!args[1] || isNaN(args[1]) || parseInt(args[1]) <= 1) return api.sendMessage("⚡️ 𝐌𝐮̛́𝐜 𝐜𝐮̛𝐨̛̣𝐜 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧 𝐤𝐡𝐨̂𝐧𝐠 𝐩𝐡𝐚̉𝐢 𝐥𝐚̀ 𝐦𝐨̣̂𝐭 𝐜𝐨𝐧 𝐬𝐨̂́ 𝐡𝐨𝐚̣̆𝐜 𝐦𝐮̛́𝐜 𝐜𝐮̛𝐨̛̣𝐜 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧 𝐛𝐞́ 𝐡𝐨̛𝐧 𝟏 𝐕𝐍𝐃 💵", threadID, messageID);
      if (money < args[1]) return api.sendMessage(`[⚡️] 𝐁𝐚̣𝐧 𝐭𝐡𝐢𝐞̂́𝐮 𝐭𝐢𝐞̂̀𝐧 𝐤𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐤𝐡𝐨̛̉𝐢 𝐭𝐚̣𝐨 𝐛𝐚̀𝐧 𝐯𝐨̛́𝐢 𝐠𝐢𝐚́: ${args[1]} 𝐕𝐍𝐃 💵`,event.threadID,event.messageID);
      await Currencies.decreaseMoney(event.senderID, Number(args[1]));
            global.moduleData.baicao.set(event.threadID, { "author": senderID, "start": 0, "chiabai": 0, "ready": 0, player: [ { "id": senderID, "card1": 0, "card2": 0, "card3": 0, "doibai": 2, "ready": false } ], rateBet: Number(args[1])});
            return api.sendMessage(`🎲 𝐁𝐚̀𝐧 𝐛𝐚̀𝐢 𝐜𝐚̀𝐨 𝐯𝐨̛́𝐢 𝐠𝐢𝐚́ ${args[1]} 𝐕𝐍𝐃 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧 𝐭𝐚̣𝐨 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠 !, 𝐧𝐞̂́𝐮 𝐦𝐮𝐨̂́𝐧 𝐭𝐡𝐚𝐦 𝐠𝐢𝐚 𝐛𝐚̣𝐧 𝐡𝐚̃𝐲 𝐧𝐡𝐚̣̂𝐩 /𝐛𝐚𝐢𝐜𝐚𝐨 𝐣𝐨𝐢𝐧\n[⚡️] 𝐍𝐠𝐮̛𝐨̛̀𝐢 𝐭𝐚̣𝐨 𝐤𝐡𝐨̂𝐧𝐠 𝐜𝐚̂̀𝐧 𝐣𝐨𝐢𝐧`, event.threadID, event.messageID);
        }
        
        case "join":
        case "-j": {
            if (!values) return api.sendMessage("[🃏] 𝐇𝐢𝐞̣̂𝐧 𝐭𝐚̣𝐢 𝐜𝐡𝐮̛𝐚 𝐜𝐨́ 𝐛𝐚̀𝐧 𝐛𝐚̀𝐢 𝐜𝐚̀𝐨 𝐧𝐚̀𝐨, 𝐛𝐚̣𝐧 𝐜𝐨́ 𝐭𝐡𝐞̂̉ 𝐭𝐚̣𝐨 𝐛𝐚̆̀𝐧𝐠 𝐜𝐚́𝐜𝐡 𝐬𝐮̛̉ 𝐝𝐮̣𝐧𝐠 /𝐛𝐚𝐢𝐜𝐚𝐨 𝐜𝐫𝐞𝐚𝐭𝐞", threadID, messageID);
            if (values.start == 1) return api.sendMessage("𝐇𝐢𝐞̣̂𝐧 𝐭𝐚̣𝐢 𝐛𝐚̀𝐧 𝐛𝐚̀𝐢 𝐜𝐚̀𝐨 𝐯𝐮̛̀𝐚 𝐯𝐚̀𝐨 𝐜𝐡𝐨̛𝐢 𝐫𝐨̂̀𝐢 🙈", threadID, messageID);
            if (money < values.rateBet) return api.sendMessage(`𝐁𝐚̣𝐧 𝐯𝐚̂̃𝐧 𝐜𝐨̀𝐧 𝐭𝐡𝐢𝐞̂́𝐮 𝐭𝐢𝐞̂̀𝐧 𝐤𝐡𝐢 𝐭𝐡𝐚𝐦 𝐠𝐢𝐚 𝐛𝐚̀𝐧 𝐛𝐚̀𝐢 𝐜𝐚̀𝐨 𝐯𝐨̛́𝐢 𝐠𝐢𝐚́ 💵: ${values.rateBet}$`,event.threadID,event.messageID)
            if (values.player.find(item => item.id == senderID)) return api.sendMessage("[🃏] 𝐁𝐚̣𝐧 𝐭𝐡𝐚𝐦 𝐠𝐢𝐚 𝐭𝐮̛̀ 𝐭𝐫𝐮̛𝐨̛́𝐜 𝐫𝐨̂̀𝐢 !", threadID, messageID);
            values.player.push({ "id": senderID, "card1": 0, "card2": 0, "card3": 0, "tong": 0, "doibai": 2, "ready": false });
            await Currencies.decreaseMoney(event.senderID, values.rateBet);
            global.moduleData.baicao.set(threadID, values);
            return api.sendMessage("𝐓𝐡𝐚𝐦 𝐠𝐢𝐚 𝐛𝐚̀𝐧 𝐛𝐚̀𝐢 𝐜𝐚̀𝐨 𝐭𝐡𝐚̀𝐧𝐡 𝐜𝐨̂𝐧𝐠", threadID, messageID);
        }

        case "leave":
        case "-l": {
            if (typeof values.player == "undefined") return api.sendMessage("[🃏] 𝐇𝐢𝐞̣̂𝐧 𝐭𝐚̣𝐢 𝐜𝐡𝐮̛𝐚 𝐜𝐨́ 𝐛𝐚̀𝐧 𝐛𝐚̀𝐢 𝐜𝐚̀𝐨 𝐧𝐚̀𝐨, 𝐛𝐚̣𝐧 𝐜𝐨́ 𝐭𝐡𝐞̂̉ 𝐭𝐚̣𝐨 𝐛𝐚̆̀𝐧𝐠 𝐜𝐚́𝐜𝐡 𝐬𝐮̛̉ 𝐝𝐮̣𝐧𝐠 /𝐛𝐚𝐢𝐜𝐚𝐨 𝐜𝐫𝐞𝐚𝐭𝐞", threadID, messageID);
            if (!values.player.some(item => item.id == senderID)) return api.sendMessage("⚡️ 𝐁𝐚̣𝐧 𝐜𝐡𝐮̛𝐚 𝐭𝐡𝐚𝐦 𝐠𝐢𝐚 𝐯𝐚̀𝐨 𝐛𝐚̀𝐧 𝐛𝐚̀𝐢 𝐜𝐚̀𝐨 𝐭𝐫𝐨𝐧𝐠 𝐧𝐡𝐨́𝐦 𝐧𝐚̀𝐲 !", threadID, messageID);
            if (values.start == 1) return api.sendMessage("⚡️ 𝐇𝐢𝐞̣̂𝐧 𝐭𝐚̣𝐢 𝐛𝐚̀𝐧 𝐛𝐚̀𝐢 𝐜𝐚̀𝐨 𝐜𝐡𝐢𝐚 𝐛𝐚̀𝐢 𝐦𝐚̂́𝐭 𝐫𝐨̂̀𝐢 😿", threadID, messageID);
            if (values.author == senderID) {
                global.moduleData.baicao.delete(threadID);
                api.sendMessage("𝐍𝐡𝐚̀ 𝐜𝐚́𝐢 𝐯𝐮̛̀𝐚 𝐫𝐨̛̀𝐢 𝐤𝐡𝐨̉𝐢 𝐛𝐚̀𝐧, 𝐜𝐮̀𝐧𝐠 𝐧𝐠𝐡𝐢̃𝐚 𝐯𝐨̛́𝐢 𝐯𝐢𝐞̣̂𝐜 𝐛𝐚̀𝐧 𝐬𝐞̃ 𝐛𝐢̣ 𝐠𝐢𝐚̉𝐢 𝐭𝐚́𝐧 🃏", threadID, messageID);
            }
            else {
                values.player.splice(values.player.findIndex(item => item.id === senderID), 1);
                api.sendMessage("𝐁𝐚̣𝐧 𝐯𝐮̛̀𝐚 𝐫𝐨̛̀𝐢 𝐤𝐡𝐨̉𝐢 𝐛𝐚̀𝐧 𝐛𝐚̀𝐢 𝐜𝐚̀𝐨 𝐧𝐚̀𝐲 !", threadID, messageID);
                global.moduleData.baicao.set(threadID, values);
            }
            return;
        }

        case "start":
        case "-s": {
            if (!values) return api.sendMessage("[🃏] 𝐇𝐢𝐞̣̂𝐧 𝐭𝐚̣𝐢 𝐜𝐡𝐮̛𝐚 𝐜𝐨́ 𝐛𝐚̀𝐧 𝐛𝐚̀𝐢 𝐜𝐚̀𝐨 𝐧𝐚̀𝐨, 𝐛𝐚̣𝐧 𝐜𝐨́ 𝐭𝐡𝐞̂̉ 𝐭𝐚̣𝐨 𝐛𝐚̆̀𝐧𝐠 𝐜𝐚́𝐜𝐡 𝐬𝐮̛̉ 𝐝𝐮̣𝐧𝐠 /𝐛𝐚𝐢𝐜𝐚𝐨 𝐜𝐫𝐞𝐚𝐭𝐞", threadID, messageID);
            if (values.author !== senderID) return api.sendMessage("[🃏] 𝐁𝐚̣𝐧 𝐤𝐡𝐨̂𝐧𝐠 𝐩𝐡𝐚̉𝐢 𝐥𝐚̀ 𝐧𝐡𝐚̀ 𝐜𝐚́𝐢 𝐤𝐡𝐨̂𝐧𝐠 𝐭𝐡𝐞̂̉ 𝐛𝐚̆́𝐭 𝐬𝐭𝐚𝐫𝐭", threadID, messageID);
            if (values.player.length <= 1) return api.sendMessage("[🃏] 𝐇𝐢𝐞̣̂𝐧 𝐭𝐚̣𝐢 𝐛𝐚̀𝐧 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧 𝐤𝐡𝐨̂𝐧𝐠 𝐜𝐨́ 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐡𝐨̛𝐢 𝐧𝐚̀𝐨 𝐭𝐡𝐚𝐦 𝐠𝐢𝐚, 𝐛𝐚̣𝐧 𝐜𝐨́ 𝐭𝐡𝐞̂̉ 𝐦𝐨̛̀𝐢 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐚̂́𝐲 𝐭𝐡𝐚𝐦 𝐠𝐢𝐚 𝐛𝐚̆̀𝐧𝐠 𝐜𝐚́𝐜𝐡 𝐲𝐞̂𝐮 𝐜𝐚̂̀𝐮 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐡𝐨̛𝐢 𝐤𝐡𝐚́𝐜 𝐧𝐡𝐚̣̂𝐩 /𝐛𝐚𝐢𝐜𝐚𝐨 𝐣𝐨𝐢𝐧", threadID, messageID);
            if (values.start == 1) return api.sendMessage("[🃏] 𝐇𝐢𝐞̣̂𝐧 𝐭𝐚̣𝐢 𝐛𝐚̀𝐧 𝐭𝐫𝐨𝐧𝐠 𝐭𝐡𝐨̛̀𝐢 𝐠𝐢𝐚𝐧 𝐜𝐡𝐢𝐚 𝐛𝐚̀𝐢 𝐛𝐨̛̉𝐢 𝐧𝐡𝐚̀ 𝐜𝐚́𝐢", threadID, messageID);
            values.deckShuffel = createDeck(); // Bộ bài
            values.start = 1;
            return api.sendMessage("⚡️ 𝐁𝐚̀𝐧 𝐛𝐚̀𝐢 𝐜𝐚̀𝐨 𝐜𝐮̉𝐚 𝐛𝐚̣𝐧 𝐯𝐚̀𝐨 𝐬𝐨̀𝐧𝐠", threadID, messageID);
        }

        case "info":
        case "-i": {
            if (typeof values.player == "undefined") return api.sendMessage("[🃏] 𝐇𝐢𝐞̣̂𝐧 𝐭𝐚̣𝐢 𝐜𝐡𝐮̛𝐚 𝐜𝐨́ 𝐛𝐚̀𝐧 𝐛𝐚̀𝐢 𝐜𝐚̀𝐨 𝐧𝐚̀𝐨, 𝐛𝐚̣𝐧 𝐜𝐨́ 𝐭𝐡𝐞̂̉ 𝐭𝐚̣𝐨 𝐛𝐚̆̀𝐧𝐠 𝐜𝐚́𝐜𝐡 𝐬𝐮̛̉ 𝐝𝐮̣𝐧𝐠 /𝐛𝐚𝐢𝐜𝐚𝐨 𝐜𝐫𝐞𝐚𝐭𝐞", threadID, messageID);
            return api.sendMessage(
                "🎰== 𝐁𝐚̀𝐧 𝐁𝐚̀𝐢 𝐂𝐚̀𝐨 ==🎰" +
                "\n- 𝐍𝐡𝐚̀ 𝐂𝐚́𝐢: " + values.author +
                "\n- 𝐓𝐨̂̉𝐧𝐠 𝐬𝐨̂́ 𝐧𝐠𝐮̛𝐨̛̀𝐢 𝐜𝐡𝐨̛𝐢: " + values.player.length + " 𝐧𝐠𝐮̛𝐨̛̀𝐢" +
                "\n- 𝐌𝐮̛́𝐜 𝐜𝐮̛𝐨̛̣𝐜: " + values.rateBet + " 𝐕𝐍𝐃"
            , threadID, messageID);
        }

        default: {
            return global.utils.throwError(this.config.name, threadID, messageID);
        }
    }
}
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
