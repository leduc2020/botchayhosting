<<<<<<< HEAD
const fs = require("fs-extra");
const Jimp = require("jimp");

module.exports.config = {
    name: "caro",
    version: "2.0.5",
    hasPermssion: 0,
    credits: "Tùng (fix reply + smaller X/O)",
    description: "Game cờ caro với ảnh Jimp (link online)",
    commandCategory: "Game",
    usages: "@tag | stop",
    cooldowns: 5
};

let games = {};

const BOARD_SIZE = 10;   // đổi sang 12 nếu muốn 12x12
const WIN_LENGTH = 5;   // đổi sang 5 nếu muốn luật 5 ô

const EMPTY = 0;
const X = 1;
const O = 2;

// Link ảnh ô trống, X, O
const IMG_EMPTY = "https://files.catbox.moe/m4ytd6.png"; // ô trống
const IMG_X = "https://files.catbox.moe/1qfisj.png";     // ô X
const IMG_O = "https://files.catbox.moe/ce334f.jpeg";    // ô O

function createBoard() {
    return Array.from({ length: BOARD_SIZE }, () => Array(BOARD_SIZE).fill(EMPTY));
}

async function renderBoardImage(board) {
    const cellSize = 50;
    const piecePadding = 8;
    const pieceSize = Math.max(8, cellSize - piecePadding * 2);

    const marginTop = 35;    // tăng ô dấu lên 35px
    const marginLeft = 35;

    const boardWidthPx = BOARD_SIZE * cellSize;
    const boardHeightPx = BOARD_SIZE * cellSize;

    const imgWidth = boardWidthPx + marginLeft;
    const imgHeight = boardHeightPx + marginTop;

    const img = new Jimp(imgWidth, imgHeight, 0xffffffff);

    const emptyCell = await Jimp.read(IMG_EMPTY);
    const xCell = await Jimp.read(IMG_X);
    const oCell = await Jimp.read(IMG_O);

    const xResized = xCell.clone().resize(pieceSize, pieceSize);
    const oResized = oCell.clone().resize(pieceSize, pieceSize);

    // Tạo ảnh ô dấu kích thước 35x35
    const emptyCellSmall = emptyCell.clone().resize(marginLeft, marginTop);

    // Tải font 32px (gần với 27px)
    const font = await Jimp.loadFont(Jimp.FONT_SANS_32_BLACK);

    // Vẽ nền ô dấu hàng ngang
    for (let x = 0; x < BOARD_SIZE; x++) {
        const px = marginLeft + x * cellSize;
        img.composite(emptyCellSmall, px, 0);
    }

    // Vẽ nền ô dấu hàng dọc
    for (let y = 0; y < BOARD_SIZE; y++) {
        const py = marginTop + y * cellSize;
        img.composite(emptyCellSmall, 0, py);
    }

    // Góc trên trái
    img.composite(emptyCellSmall, 0, 0);

    // Vẽ chữ hàng ngang (chữ màu đỏ thì in chữ đen rồi tô đè màu đỏ)
    for (let x = 0; x < BOARD_SIZE; x++) {
        const letter = String.fromCharCode(65 + x);
        const xPos = marginLeft + x * cellSize + Math.floor(cellSize / 2) - 15; // canh chỉnh
        const yPos = 2;
        img.print(font, xPos, yPos, letter);
    }

    // Vẽ chữ hàng dọc
    for (let y = 0; y < BOARD_SIZE; y++) {
        const number = (y + 1).toString();
        const xPos = 2;
        const yPos = marginTop + y * cellSize + Math.floor(cellSize / 2) - 22;
        img.print(font, xPos, yPos, number);
    }

    // Thay đổi màu chữ thành đỏ bằng cách scan pixel (cách này đơn giản)
    img.scan(0, 0, img.bitmap.width, marginTop, function(x, y, idx) {
        // idx là vị trí pixel bắt đầu (RGBA)
        // Tô đỏ nếu pixel gần màu đen
        if (this.bitmap.data[idx] < 50 && this.bitmap.data[idx + 1] < 50 && this.bitmap.data[idx + 2] < 50) {
            this.bitmap.data[idx] = 255;     // R
            this.bitmap.data[idx + 1] = 0;   // G
            this.bitmap.data[idx + 2] = 0;   // B
        }
    });
    img.scan(0, 0, marginLeft, img.bitmap.height, function(x, y, idx) {
        if (this.bitmap.data[idx] < 50 && this.bitmap.data[idx + 1] < 50 && this.bitmap.data[idx + 2] < 50) {
            this.bitmap.data[idx] = 255;
            this.bitmap.data[idx + 1] = 0;
            this.bitmap.data[idx + 2] = 0;
        }
    });

    // Vẽ bàn cờ chính
    for (let y = 0; y < BOARD_SIZE; y++) {
        for (let x = 0; x < BOARD_SIZE; x++) {
            let px = marginLeft + x * cellSize;
            let py = marginTop + y * cellSize;
            img.composite(emptyCell, px, py);
            if (board[y][x] === X) {
                const cx = px + Math.floor((cellSize - pieceSize) / 2);
                const cy = py + Math.floor((cellSize - pieceSize) / 2);
                img.composite(xResized, cx, cy);
            } else if (board[y][x] === O) {
                const cx = px + Math.floor((cellSize - pieceSize) / 2);
                const cy = py + Math.floor((cellSize - pieceSize) / 2);
                img.composite(oResized, cx, cy);
            }
        }
    }

    const path = __dirname + `/cache/board_${Date.now()}.png`;
    await img.writeAsync(path);
    return path;
}
function checkWin(board, x, y, symbol) {
    const directions = [
        [1, 0], [0, 1], [1, 1], [1, -1]
    ];
    for (let [dx, dy] of directions) {
        let count = 1;
        for (let dir of [-1, 1]) {
            let nx = x, ny = y;
            while (true) {
                nx += dx * dir;
                ny += dy * dir;
                if (nx < 0 || ny < 0 || nx >= BOARD_SIZE || ny >= BOARD_SIZE) break;
                if (board[ny][nx] === symbol) count++;
                else break;
            }
        }
        if (count >= WIN_LENGTH) return true;
    }
    return false;
}

module.exports.run = async ({ api, event, args }) => {
    const gameID = event.threadID;

    // Lệnh hủy ván
    if (args[0] && args[0].toLowerCase() === "stop") {
        const game = games[gameID];
        if (!game) return api.sendMessage("Hiện tại không có ván cờ nào đang diễn ra.", event.threadID);

        // cho phép người chơi hoặc admin nhóm hủy
        const threadInfo = await api.getThreadInfo(event.threadID);
        const isAdmin = (threadInfo.adminIDs || []).some(e => String(e.id) === String(event.senderID));

        if (!game.players.includes(String(event.senderID)) && !isAdmin) {
            return api.sendMessage("Bạn không có quyền hủy ván này.", event.threadID);
        }

        // thử thu hồi ảnh cuối cùng nếu có
        if (game.lastMsg) {
            try { await api.unsendMessage(game.lastMsg); } catch (e) {}
        }

        delete games[gameID];
        return api.sendMessage("Ván cờ đã bị hủy.", event.threadID);
    }

    // Bắt đầu ván mới (tag 1 người)
    if (event.mentions && Object.keys(event.mentions).length === 1) {
        let opponentID = Object.keys(event.mentions)[0];
        if (String(opponentID) === String(event.senderID)) return api.sendMessage("Không thể chơi với chính mình.", event.threadID);

        games[gameID] = {
            board: createBoard(),
            players: [String(event.senderID), String(opponentID)],
            turn: 0,
            lastMsg: null
        };

        const imgPath = await renderBoardImage(games[gameID].board);
        let name = (await api.getUserInfo(event.senderID))[event.senderID].name;

        api.sendMessage({
            body: `🩷 Bắt đầu cờ caro 🩷\nLượt của ${name} (❌)`,
            attachment: fs.createReadStream(imgPath)
        }, event.threadID, (err, info) => {
            if (!err && info && info.messageID) games[gameID].lastMsg = info.messageID;
            try { fs.unlinkSync(imgPath); } catch(e){ }
        });
    } else {
        api.sendMessage("Vui lòng tag 1 người để chơi hoặc dùng `caro stop` để hủy.", event.threadID);
    }
};

module.exports.handleEvent = async ({ api, event }) => {
    const game = games[event.threadID];
    if (!game) return;

    // chỉ xử lý khi là lượt người đó (so sánh string)
    if (String(event.senderID) !== game.players[game.turn]) return;

    const body = (event.body || "").toUpperCase().trim();
    if (!body) return;

    // parse dạng Letter + Number (ví dụ A1, B10)
    const m = body.match(/^([A-Z])(\d{1,2})$/);
    if (!m) return; // không phải nước đi hợp lệ

    const x = m[1].charCodeAt(0) - 65;
    const y = parseInt(m[2], 10) - 1;

    if (x < 0 || x >= BOARD_SIZE || y < 0 || y >= BOARD_SIZE) {
        return api.sendMessage(`Nước đi không hợp lệ. Bảng hiện có ${BOARD_SIZE} cột và ${BOARD_SIZE} hàng. Ví dụ: A1`, event.threadID);
    }

    const { board, players, turn, lastMsg } = game;

    if (board[y][x] !== EMPTY) return api.sendMessage("Ô này đã được đánh.", event.threadID);

    const symbol = turn === 0 ? X : O;
    board[y][x] = symbol;

    // thu hồi ảnh cũ (nếu có)
    if (game.lastMsg) {
        try { await api.unsendMessage(game.lastMsg); } catch (e) {}
        game.lastMsg = null;
    }

    // kiểm tra thắng
    if (checkWin(board, x, y, symbol)) {
        const imgPath = await renderBoardImage(board);
        let winnerName = (await api.getUserInfo(players[turn]))[players[turn]].name;
        api.sendMessage({
            body: `Người chơi ${winnerName} (${symbol === X ? "❌" : "⭕"}) thắng!`,
            attachment: fs.createReadStream(imgPath)
        }, event.threadID, () => {
            try { fs.unlinkSync(imgPath); } catch(e){}
        });
        delete games[event.threadID];
        return;
    }

    // chuyển lượt
    game.turn = 1 - turn;
    const imgPath = await renderBoardImage(board);
    let nextName = (await api.getUserInfo(players[game.turn]))[players[game.turn]].name;
    api.sendMessage({
        body: `Lượt của ${nextName} (${game.turn === 0 ? "❌" : "⭕"})`,
        attachment: fs.createReadStream(imgPath)
    }, event.threadID, (err, info) => {
        if (!err && info && info.messageID) game.lastMsg = info.messageID;
        try { fs.unlinkSync(imgPath); } catch(e){}
    });
=======
module.exports.config = {
    name: 'caro',
    version: '1.0.0',
    hasPermssion: 0,
    credits: 'fix by jukie-mazid',
    description: 'game cờ caro 5x5 dành cho 2 người',
    commandCategory: 'Game',
    usages: '@tag',
    cooldowns: 5,
    dependencies: {
      "fs-extra": "",
      "axios": "",
      "canvas": "",
      "jimp": "",
      "node-superfetch": ""
    }
};

module.exports.handleReply = async ({ handleReply, event, api ,Users}) => {
  function delay(ms) {
       return new Promise(resolve => setTimeout(resolve, ms));
  };
  var {x, y, d, d1, sizeboard, sectionSize, boardbuffer} = handleReply;
    var { threadID, senderID, messageID, body } = event;
    const chalk = global.nodemodule["chalk"];
    var args   = body.split(' ');
    if(!args[1]) return api.sendMessage("Bạn chưa nhập tọa độ Y", threadID, messageID);
    var toadoX = parseInt(args[0]),
        toadoY = parseInt(args[1]);
          //check error tọa độ
          if(toadoX == NaN || toadoY == NaN) return api.sendMessage("Tọa độ X hoặc Y không hợp lệ", threadID, messageID);
          if(toadoX > sizeboard) return api.sendMessage("Tọa độ X không được lớn hơn số ô của bàn cờ", threadID, messageID);
          if(toadoY > sizeboard) return api.sendMessage("Tọa độ Y không được lớn hơn số ô của bàn cờ", threadID, messageID);
      //get data game
    var gameint  = global.game[threadID];
    var luot     = gameint.ditruoc;
    var luotuser = gameint.luot[senderID];
    //===========
    if (global.game[threadID].toadogame.includes(toadoX.toString() + toadoY)) return api.sendMessage('Vị trí này đã được đánh từ trước', threadID, messageID);

var _0xb4b2=["\x6C\x75\x6F\x74","\x6B\x65\x79\x73","\x66\x69\x6C\x74\x65\x72","\x6E\x61\x6D\x65","\x67\x65\x74\x44\x61\x74\x61"];var arrluot=Object[_0xb4b2[1]](gameint[_0xb4b2[0]]);var iddoithu=parseInt(arrluot[_0xb4b2[2]]((_0xd327x3)=>{return _0xd327x3!= senderID}));var namedoithu=( await Users[_0xb4b2[4]](iddoithu))[_0xb4b2[3]]
    //=============Check lượt===========//
    if (luotuser != luot) {
      return api.sendMessage({body: 'Chưa tới lượt của bạn!! Lượt này là của '+namedoithu, mentions: [{tag: namedoithu,id: iddoithu}]}, threadID, messageID);
    };
    if (luot == 0) {
        global.game[threadID].ditruoc = 1;
        var quanco = 'X';
        var linkCo = 'https://i.ibb.co/ByyrhMs/Xpng.png';
    };
    if (luot == 1) {
        global.game[threadID].ditruoc = 0;
        var quanco = 'O';
        var linkCo = 'https://i.ibb.co/FgtkNM9/Opng.png';
    };
    
  //d thứ [x+y][x]
  //X = 4, Y = 2;
  //set cờ vào data để check WIN;
  //==============PUSH DATA===========//
  if(toadoY > toadoX) var soptu = toadoY-toadoX;
  else var soptu = toadoX-toadoY;
  var soo = sizeboard - 1;//số ô
    x[toadoY][toadoX]               = quanco;
    y[toadoX][toadoY]               = quanco;
    d[toadoX +toadoY][toadoX]       = quanco;
    d1[soo-soptu][toadoX]           = quanco;
    //===============khai báo==============
    const Canvas = global.nodemodule["canvas"];
    const fs = global.nodemodule["fs-extra"];
    var path1 = __dirname+'/cache/caro1'+threadID+'.png';
    var path2 = __dirname+'/cache/caro2'+threadID+'.png';
    //===========CANVAS============//
    //vẽ lại boardgame trước sau đó vẽ lên background
    const boardgame = await Canvas.loadImage(boardbuffer);//board lấy từ handleReply
    var xboard = boardgame.width,
        yboard = boardgame.height;
    const canvas = Canvas.createCanvas(xboard, yboard);
    let ctx = canvas.getContext('2d');
    ctx.drawImage(boardgame, 0, 0, xboard, yboard);
    var quanCo = await Canvas.loadImage(linkCo);//lấy ảnh quân cờ
    ctx.drawImage(quanCo, toadoX * sectionSize, toadoY * sectionSize, sectionSize, sectionSize);
    var boardbuffer = canvas.toBuffer();//vẽ xong board game
    //=============BACKGROUND================
    const background = await Canvas.loadImage(path2);
    var xbground = background.width,
        ybground = background.height;
    const canvasbg = Canvas.createCanvas(xbground, ybground);
    const ctxx = canvasbg.getContext('2d');
    ctxx.drawImage(background, 0, 0, xbground, ybground);
    const board = await Canvas.loadImage(boardbuffer);
    ctxx.drawImage(board, (xbground-880)/2, 320, 880, 880);
    //==============================
    global.game[threadID].toadogame.push(toadoX.toString() + toadoY);
    //=========FUNCTION CHECK WIN??===========
  function checkWin(x, y, d, d1, toadoX, toadoY, quanco, sizeboard, sectionSize) {
    var dem = 0;
    //============CHECK X=============

    for (let X of x[toadoY]) {
        if(X == quanco) {
          dem++;
        } else {
          dem = 0;

        }
        if (dem == 5) {
          return {
            WIN: true
          }
        }
    };
    dem = 0;
    //============CHECK Y============
    for (let Y of y[toadoX]) {
        if (Y == quanco) {
            dem++;
        } else { 
            dem = 0;
        }
        if (dem == 5) {
          return {
            WIN: true
          }
        }
    }
    //============CHECK D============
    dem = 0;
    for (let D of d[toadoX+toadoY]) {
        if (D == quanco) {
            dem++;
        } else {
            dem = 0;
        }
        if (dem == 5) {
          return {
            WIN: true
          }
        };
    };
  //==============CHECK D1===========
    dem = 0;
    var soo = sizeboard-1;
    if(toadoY > toadoX) {var soptu = toadoY-toadoX;}
    else {var soptu = toadoX-toadoY;};
    for (let D1 of d1[soo-soptu]) {
        if (D1 == quanco) {
            dem++;
        } else {dem = 0;}
        if(dem == 5) {
          return {
            WIN: true
          }
        }
    };
    return {WIN: false};
  };
  
 var _0xfb59=["\x6E\x61\x6D\x65","\x67\x65\x74\x44\x61\x74\x61"];var myname=( await Users[_0xfb59[1]](senderID))[_0xfb59[0]]
  //==========CHECK WIN OR NOT==============//
  var CHECKWIN = checkWin(x, y, d, d1, toadoX, toadoY, quanco, sizeboard, sectionSize);
  if(CHECKWIN.WIN == true) {
    fs.writeFileSync(path2, canvasbg.toBuffer());
      api.unsendMessage(handleReply.messageID, () => {
        api.sendMessage({
          body: "You win 🥳🥳 "+myname,
          attachment: fs.createReadStream(path2),
          mentions: [{
            tag: myname,
            id: senderID
          }]
          
        }, threadID, messageID);
      });
    return global.game[threadID] = {};
  };
  fs.writeFileSync(path2, canvasbg.toBuffer());
  api.unsendMessage(handleReply.messageID, () => {
    api.sendMessage({body: 'Reply tin nhắn này kèm theo tọa độ X Y để đánh quân cờ, ví dụ:\n1 5\nLượt tiếp theo là của '+namedoithu, attachment: fs.createReadStream(path2), mentions: [{
      tag: namedoithu,
      id: iddoithu
    }]},threadID, (e, info) => {
            client.handleReply.push({
                name: this.config.name,
                author: senderID,
                messageID: info.messageID,
                x: x,
                y: y,
                d: d,
                d1: d1,
                sizeboard: sizeboard,
                sectionSize: sectionSize,
                boardbuffer: boardbuffer
            });
        },messageID);
  })
};


module.exports.run = async ({ event, api, args }) => {
    var { threadID, senderID, messageID } = event;
    if (!global.game) {
        global.game = {};
    };
    if (!global.game[threadID]) {
        global.game[threadID] = {};
    };
    if(args[0] == "clear"){
      var author = global.game[threadID].author;
      if(!author) return api.sendMessage('Chưa có bàn cờ nào được tạo trong nhóm của bạn', threadID, messageID);
      if (senderID != author) return api.sendMessage('Chỉ có người tạo '+author+' bàn cờ mới có thể kết thúc bàn cờ này', threadID, messageID);
      global.game[threadID] = {};
      return api.sendMessage('Đã xóa bàn caro!!', threadID, messageID);
      
    }
    
    if (global.game[threadID].author) {
        return api.sendMessage('Nhóm này đã có bàn cờ được tạo, vui lòng kết thúc bàn cờ bàng cách chat "$caro clear"', threadID, messageID);
    };
    var player2 = Object.keys(event.mentions)[0];
    if(!player2) return api.sendMessage("Cần tag người bạn muốn chơi cùng!!", event.threadID, event.messageID);
    global.game[threadID] = {
        luot: {
            [senderID]: 1,
            [player2]: 0
        },
        toadogame: [],
        ditruoc: 1,
        author: senderID
    };
    /**/
    //CREATE BOARD GAME
    var kytu = "@";
    var x = [], y = [], d = [], d1 = [];
    var size = 16;
    //Create horizon and Column ( X and Y )
    for (let i = 0; i < size; i++) {
        x[i] = [];
        y[i] = [];
        for(let j = 0; j < size; j++) {
          x[i][j] = kytu;
          y[i][j] = kytu;
        }
    }
    //Create diagonal lines
    var auto = '+';
    var so_d = 0;
    var chieudaio = size*2-1;//số đường xiêng của board
    for (var i = 0; i < chieudaio; i++) {
        if(auto == '+') so_d++;
        if(auto == "-") so_d--;
        d[i] = [];
        d1[i] = [];
        for(let j = 0; j < so_d; j++) {
          d[i][j] = "@";
          d1[i][j] = "@";
          if(so_d == size) auto = "-";
        };
    };
    //==============================
    const Canvas = global.nodemodule["canvas"];
    const fs = global.nodemodule["fs-extra"];
    const axios = global.nodemodule["axios"];
    const spf = global.nodemodule["node-superfetch"];
    var path1 = __dirname+'/cache/caro1'+threadID+'.png';
    var path2 = __dirname+'/cache/caro2'+threadID+'.png';
    
    //==============================
    const imgboard = await Canvas.loadImage(
        'https://vn112.com/wp-content/uploads/2018/01/pxsolidwhiteborderedsvg-15161310048lcp4.png');
    var xboard = imgboard.width,
        yboard = imgboard.height;
    const canvas = Canvas.createCanvas(xboard, yboard);
    let ctx = canvas.getContext('2d');
    ctx.drawImage(imgboard, 0, 0, canvas.width, canvas.height);
    var sizeboard = parseInt(16);//số ô

    // vẽ boardgame và lưu
    var sectionSize = xboard/sizeboard; //size mỗi ô sẽ bằng chiều dài chia số ô??
    //=============kẻ bảng=================
    for (i = 0; i <= sizeboard; i++) {
        for (j = 0; j <= sizeboard; j++) {
            // Đường ngang
            ctx.moveTo(0, sectionSize * j);
            ctx.lineTo(sectionSize * sizeboard, sectionSize * j);
            ctx.stroke();
            // Đường dọc
            ctx.moveTo(sectionSize * i, 0);
            ctx.lineTo(sectionSize * i, sectionSize * sizeboard);
            ctx.stroke();
        }
    };
    
    const boardbuffer = canvas.toBuffer();
    //vẽ background và lấy boardgame ra vẽ lên

    var background = await Canvas.loadImage("https://i.ibb.co/WVgwgtc/0afd2951b10413352a363ea51b4606ac.jpg");
    var xbground = background.width,
        ybground = background.height;
    const canvasbg = Canvas.createCanvas(xbground, ybground);
    let ctxx = canvasbg.getContext('2d');
    ctxx.drawImage(background, 0, 0, xbground, ybground);
    //reg font
    ctxx.fillStyle = "#000000";
    ctxx.textAlign = "center";
    if(!fs.existsSync(__dirname+'/cache/bold-font.ttf')) {
      let getfont = (await axios.get("https://drive.google.com/u/0/uc?id=1Kx2hi9VX5X4KjwO1uFR6048fm4dKAMnp&export=download", { responseType: "arraybuffer" })).data;
      fs.writeFileSync(__dirname+'/cache/bold-font.ttf', Buffer.from(getfont, "utf-8"));
    };
    Canvas.registerFont(__dirname+'/cache/bold-font.ttf', {
        family: "caro",
        weight: "regular",
        style: "normal"
    });
    ctxx.font = "bold 36px caro";
    //vẽ board lên background
    var boardCv = await Canvas.loadImage(boardbuffer);
    ctxx.drawImage(boardCv, (xbground-880)/2, 320, 880, 880);
    console.log((xbground-880)/2);
    //vẽ tọa độ
    //var canchinh = 880/16/2; // =27.5
    for(let i = 0; i < 16; i++) {
      ctxx.fillText(i, (xbground-880)/2+i*(880/16)+27.5, 310);//880 là size board lúc vẽ vài background
      ctxx.fillText(i, (xbground-880)/2-30, 330+i*(880/16)+27.5)
    }
    //
    try{
    var avt1 = (await spf.get(`https://graph.facebook.com/${senderID}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)).body;
    var avt2 = (await spf.get(`https://graph.facebook.com/${player2}/picture?width=512&height=512&access_token=6628568379%7Cc1e620fa708a1d5696fb991c1bde5662`)).body;
    ctxx.drawImage(await Canvas.loadImage(avt1), xbground/2-100-200, (320-200)/2, 200, 200);
    ctxx.drawImage(await Canvas.loadImage(avt2), xbground/2+100    , (320-200)/2, 200, 200);
    }
    catch(e) {};
    var VS = (await spf.get("https://i.ibb.co/RQjPz7f/1624961650011.png")).body;
    var logoVS = await Canvas.loadImage(VS);
    ctxx.drawImage(logoVS, xbground/2-200/2, (320-200)/2, 200, 200);
    //ctxx.drawImage(logoVS, 10,10,200,200);
    fs.writeFileSync(path2, canvasbg.toBuffer());
    api.sendMessage({body: "Tạo ván cờ caro thành công, bạn đi trước, reply tin nhắn này kèm theo tọa độ X Y để đánh quân cờ, ví dụ:\n1 5", attachment: fs.createReadStream(path2)}, threadID, (e, info) => {
            client.handleReply.push({
                name: this.config.name,
                author: senderID,
                messageID: info.messageID,
                x: x,
                y: y,
                d: d,
                d1: d1,
                sizeboard: sizeboard,
                sectionSize: sectionSize,
                boardbuffer: boardbuffer
            });
        }
    );
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
};