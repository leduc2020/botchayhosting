<<<<<<< HEAD
﻿require('events').EventEmitter.defaultMaxListeners = 90; // hoặc cao hơn nếu cần
const { spawn } = require("child_process");
const logger = require(process.cwd() + "/utils/log.js");
function startBot(message) {
    (message) ? logger(message, "[ STARTING ]") : "";
=======
﻿const { spawn } = require("child_process");
const logger = require(process.cwd() + "/utils/log.js");
const express = require("express");
const path = require("path");

// ==== PHẦN 1: CHẠY WEB HTML ====
const app = express();
const PORT = process.env.PORT || 3000;

// phục vụ toàn bộ file HTML từ thư mục /public
app.use(express.static(path.join(__dirname, "public")));

// route gốc trả về index.html
app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "public", "index.html"));
});

// khởi động web server
app.listen(PORT, () => {
    console.log(`🌐 Web đang chạy tại: http://localhost:${PORT}`);
});

// ==== PHẦN 2: CHẠY BOT ====
function startBot(message) {
    if (message) logger(message, "[ STARTING ]");

>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
    const child = spawn("node", ["--trace-warnings", "--async-stack-traces", "main.js"], {
        cwd: __dirname,
        stdio: "inherit",
        shell: true
    });
<<<<<<< HEAD
    child.on("close", (codeExit) => {
        if (codeExit != 0 || global.countRestart && global.countRestart < 5) {
            startBot("Tiến Hành Khởi Động Lại...");
            global.countRestart += 1;
            return;
        } else return;
    });
    child.on("error", function (error) {
        logger("Đã xảy ra lỗi: " + JSON.stringify(error), "[ STARTING ]");
    });
}
=======

    child.on("close", (codeExit) => {
        if (codeExit != 0 || (global.countRestart && global.countRestart < 5)) {
            startBot("Tiến hành khởi động lại...");
            global.countRestart = (global.countRestart || 0) + 1;
            return;
        }
    });

    child.on("error", (error) => {
        logger("Đã xảy ra lỗi: " + JSON.stringify(error), "[ STARTING ]");
    });
}

>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
startBot();