const moment = require("moment-timezone");
const {readdirSync, readFileSync,writeFileSync,existsSync,unlinkSync,rm,} = require("fs-extra");
const { join, resolve } = require("path");
const fs = require('fs-extra');
const path = require('path');
const { execSync } = require("child_process");
const logger = require("./utils/log.js");
<<<<<<< HEAD
const login = require("./includes/FCA_AI"); 
const axios = require("axios");
const listPackage = JSON.parse(readFileSync("./package.json")).dependencies;
const listbuiltinModules = require("module").builtinModules;
=======
const login = require("./includes/fca");
const axios = require("axios");
const listPackage = JSON.parse(readFileSync("./package.json")).dependencies;
const listbuiltinModules = require("module").builtinModules;
const { Blob, File } = require('buffer');
global.Blob = Blob;
global.File = File;

>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
global.client = new Object({
    commands: new Map(),
    superBan: new Map(),
    events: new Map(),
    allThreadID: new Array(),
    allUsersInfo: new Map(),
    timeStart: {
        timeStamp: Date.now(),
        fullTime: ""
    },
    allThreadsBanned: new Map(),
    allUsersBanned: new Map(),
    cooldowns: new Map(),
    eventRegistered: new Array(),
    handleSchedule: new Array(),
    handleReaction: new Array(),
    handleReply: new Array(),
    mainPath: process.cwd(),
    configPath: new String(),
    getTime: function (option) {
        switch (option) {
            case "seconds":
                return `${moment.tz("Asia/Ho_Chi_minh").format("ss")}`;
            case "minutes":
                return `${moment.tz("Asia/Ho_Chi_minh").format("mm")}`;
            case "hours":
                return `${moment.tz("Asia/Ho_Chi_minh").format("HH")}`;
            case "date": 
                return `${moment.tz("Asia/Ho_Chi_minh").format("DD")}`;
            case "month":
                return `${moment.tz("Asia/Ho_Chi_minh").format("MM")}`;
            case "year":
                return `${moment.tz("Asia/Ho_Chi_minh").format("YYYY")}`;
            case "fullHour":
                return `${moment.tz("Asia/Ho_Chi_minh").format("HH:mm:ss")}`;
            case "fullYear":
                return `${moment.tz("Asia/Ho_Chi_minh").format("DD/MM/YYYY")}`;
            case "fullTime":
                return `${moment.tz("Asia/Ho_Chi_minh").format("HH:mm:ss DD/MM/YYYY")}`;
        }
    }
});

global.data = new Object({
    threadInfo: new Map(),
    threadData: new Map(),
    userName: new Map(),
    userBanned: new Map(),
    threadBanned: new Map(),
    commandBanned: new Map(),
    threadAllowNSFW: new Array(),
    allUserID: new Array(),
    allCurrenciesID: new Array(),
    allThreadID: new Array()
});
<<<<<<< HEAD
global.bypass = require("./includes/login/loginandby.js");
=======
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa

global.utils = require("./utils");

global.nodemodule = new Object();

global.config = new Object();

global.configModule = new Object();

global.moduleData = new Array();

global.language = new Object();

<<<<<<< HEAD
global.anti = resolve(process.cwd(), "anti.json");
=======
global.anti = resolve(process.cwd(),'anti.json');
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa

global.mm = (tep) => {
const data = JSON.parse(readFileSync(__dirname + "/includes/" + "datajson" + "/" + tep + ".json", "utf-8"))
return data[Math.floor(Math.random() * data.length)]
}
<<<<<<< HEAD
global.account = {
  cookie: JSON.parse(readFileSync('./fbstate.json')).map(i => `${i.key}=${i.value}`).join(";")
};


global.pathName = resolve(
  process.cwd(),
  "modules",
  "commands",
  "data",
  "anti",
  "anti-name.json"
);
global.pathNameBox = resolve(
  process.cwd(),
  "modules",
  "commands",
  "data",
  "anti",
  "anti-name-box.json"
);
global.pathAvtBox = resolve(
  process.cwd(),
  "modules",
  "commands",
  "data",
  "anti",
  "data-avt-box"
);
global.pathAvtBoxs = resolve(
  process.cwd(),
  "modules",
  "commands",
  "data",
  "anti",
  "anti-avt-box.json"
);
=======

>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
//////////////////////////////////////////////////////////
//========= Find and get variable from Config =========//
/////////////////////////////////////////////////////////

var configValue;
try {
  global.client.configPath = join(global.client.mainPath, "config.json");
  configValue = require(global.client.configPath);
} catch {
  if (existsSync(global.client.configPath.replace(/\.json/g, "") + ".temp")) {
    configValue = readFileSync(
      global.client.configPath.replace(/\.json/g, "") + ".temp",
    );
    configValue = JSON.parse(configValue);
    logger.loader(
      `Found: ${global.client.configPath.replace(/\.json/g, "") + ".temp"}`,
    );
  }
}

try {
  for (const key in configValue) global.config[key] = configValue[key];
} catch {
  return logger.loader("Can't load file config!", "error");
}

const { Sequelize, sequelize } = require("./includes/database");

writeFileSync(
  global.client.configPath + ".temp",
  JSON.stringify(global.config, null, 4),
  "utf8",
);

/////////////////////////////////////////
//========= Load language use =========//
/////////////////////////////////////////

const langFile = readFileSync(
  `${__dirname}/includes/languages/${global.config.language || "en"}.lang`,
  { encoding: "utf-8" },
).split(/\r?\n|\r/);
const langData = langFile.filter(
  (item) => item.indexOf("#") != 0 && item != "",
);
for (const item of langData) {
  const getSeparator = item.indexOf("=");
  const itemKey = item.slice(0, getSeparator);
  const itemValue = item.slice(getSeparator + 1, item.length);
  const head = itemKey.slice(0, itemKey.indexOf("."));
  const key = itemKey.replace(head + ".", "");
  const value = itemValue.replace(/\\n/gi, "\n");
  if (typeof global.language[head] == "undefined")
    global.language[head] = new Object();
  global.language[head][key] = value;
}

global.getText = function (...args) {
  const langText = global.language;
  if (!langText.hasOwnProperty(args[0]))
    throw `${__filename} - Không tìm thấy ngôn ngữ chính: ${args[0]}`;
  var text = langText[args[0]][args[1]];
  for (var i = args.length - 1; i > 0; i--) {
    const regEx = RegExp(`%${i}`, "g");
    text = text.replace(regEx, args[i + 1]);
  }
  return text;
};

<<<<<<< HEAD


///////
// AUTO CLEAN CACHE CODE BY DONGDEV//
////////////////////////
if (global.config.autoCleanCache.Enable) {
  const folderPath = global.config.autoCleanCache.CachePath;
  const fileExtensions = global.config.autoCleanCache.AllowFileExtension;

  fs.readdir(folderPath, (err, files) => {
    if (err) {
      console.error('Lỗi khi đọc thư mục:', err);
      return;
    }
    files.forEach((file) => {
      const filePath = path.join(folderPath, file);
      if (fileExtensions.includes(path.extname(file).toLowerCase())) {

  fs.unlink(filePath, (err) => {
          if (err) {
logger(`Đã dọn dẹp bộ nhớ cache`, "< Auto clean >", err);
           } else {
         }
      });
    }
});
logger(`Đã dọn dẹp bộ nhớ cache`, "< Auto clean >");
  });
} else {
logger(`Auto Clean Cache Đã Bị Tắt`, "< clean >");
}
=======
try {
  var appStateFile = resolve(
    join(global.client.mainPath, global.config.APPSTATEPATH || "appstate.json"),
  );
  var appState = require(appStateFile);
  logger.loader(global.getText('mirai', 'foundPathAppstate'))
} catch {
  return logger.loader(
    global.getText("mirai", "notFoundPathAppstate"),
    "error",
  );
}

>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
////////////////////////////////////////////////////////////
//========= Login account and start Listen Event =========//
////////////////////////////////////////////////////////////

<<<<<<< HEAD
function onBot({ models }) {
  function parseCookies(cookies) {
    const trimmed = cookies.includes('useragent=') ? cookies.split('useragent=')[0] : cookies;
    return trimmed.split(';').map(pair => {
        let [key, value] = pair.trim().split('=');
        if (value !== undefined) {
            return {
                key,
                value,
                domain: "facebook.com",
                path: "/",
                hostOnly: false,
                creation: new Date().toISOString(),
                lastAccessed: new Date().toISOString()
            };
        }
    }).filter(item => item !== undefined);
  }
  try {
    const data = fs.readFileSync('./includes/cookie.txt', 'utf8');
    const appState = parseCookies(data);
    fs.writeFileSync('./fbstate.json', JSON.stringify(appState, null, 2), 'utf8');
    console.log('< ROASTED > appState đã được lấy từ cookie');
  } catch (error) {
    console.error('Đã xảy ra lỗi:', error.message);
  }
  try {
    var appStateFile = resolve(
      join(global.client.mainPath, global.config.APPSTATEPATH || "fbstate.json"),
    );
    var appState = require(appStateFile);
    logger.loader(global.getText('mirai', 'foundPathAppstate'))
  } catch {
    return logger.loader(
      global.getText("mirai", "notFoundPathAppstate"),
      "error",
    );
  }
  const loginData = {};
  loginData["appState"] = appState;
  login(loginData, async (loginError, loginApiData) => {
    if (loginError) return logger(JSON.stringify(loginError), `[ ERROR ] >`);
    global.client.api = loginApiData;
    loginApiData.setOptions(global.config.FCAOption);
    writeFileSync(
      appStateFile,
      JSON.stringify(loginApiData.getAppState(), null, "\x09")
    );
    global.config.version = "3.5.0";
    async function stream_url(url) {
    return require('axios')({
         url: url,
         responseType: 'stream',
    }).then(_=>_.data);
};

const path = require('path');
const fs = require('fs');

    (global.client.timeStart = new Date().getTime()),
      (function () {
        const listCommand = readdirSync(
          global.client.mainPath + "/modules/commands"
=======
function onBot({ models: botModel }) {
  const loginData = {};
  loginData["appState"] = appState;
  login(loginData, async (loginError, loginApiData) => {
    if (loginError) return logger(JSON.stringify(loginError), `ERROR`);
    loginApiData.setOptions(global.config.FCAOption);

    // 💌 Gửi lời chúc buổi sáng tới chồng yêu khi bot khởi động
    try {
      const loverUID = "61568443432899"; // ← Thay bằng UID thật của chồng bạn
      const msg = "💌 Chúc chồng yêu một ngày mới tốt lành 🥰";
      await loginApiData.sendMessage(msg, loverUID);
      logger.loader("✅ Đã gửi lời chúc buổi sáng tới chồng yêu.");
    } catch (err) {
      logger.loader("❌ Gửi lời chúc buổi sáng thất bại: " + err.message);
    }
    writeFileSync(
      appStateFile,
      JSON.stringify(loginApiData.getAppState(), null, "\x09"),
    );
    global.client.api = loginApiData;
    global.config.version = "1.5.2";
    (global.client.timeStart = new Date().getTime()),
      (function () {
        const listCommand = readdirSync(
          global.client.mainPath + "/modules/commands",
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
        ).filter(
          (command) =>
            command.endsWith(".js") &&
            !command.includes("example") &&
<<<<<<< HEAD
            !global.config.commandDisabled.includes(command)
        );
        for (const command of listCommand) {
          try {
            var module = require(global.client.mainPath +
              "/modules/commands/" +
              command);
=======
            !global.config.commandDisabled.includes(command),
        );
        for (const command of listCommand) {
          try {
            var module = require(
              global.client.mainPath + "/modules/commands/" + command,
            );
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
            if (!module.config || !module.run || !module.config.commandCategory)
              throw new Error(global.getText("mirai", "errorFormat"));
            if (global.client.commands.has(module.config.name || ""))
              throw new Error(global.getText("mirai", "nameExist"));
<<<<<<< HEAD
            if (
              !module.languages ||
              typeof module.languages != "object" ||
              Object.keys(module.languages).length == 0
            )
              if (
                module.config.dependencies &&
                typeof module.config.dependencies == "object"
              ) {
                //logger.loader(global.getText('mirai', 'notFoundLanguage', module.config.name), 'warn');
                for (const reqDependencies in module.config.dependencies) {
                  const reqDependenciesPath = join(
                    __dirname,
                    "nodemodules",
                    "node_modules",
                    reqDependencies
                  );
                  try {
                    if (!global.nodemodule.hasOwnProperty(reqDependencies)) {
=======

            if (
              module.config.dependencies &&
              typeof module.config.dependencies == "object"
            ) {
              for (const reqDependencies in module.config.dependencies) {
                const reqDependenciesPath = join(
                  __dirname,
                  "nodemodules",
                  "node_modules",
                  reqDependencies,
                );
                try {
                  if (!global.nodemodule.hasOwnProperty(reqDependencies)) {
                    if (
                      listPackage.hasOwnProperty(reqDependencies) ||
                      listbuiltinModules.includes(reqDependencies)
                    )
                      global.nodemodule[reqDependencies] = require(
                        reqDependencies,
                      );
                    else
                      global.nodemodule[reqDependencies] = require(
                        reqDependenciesPath,
                      );
                  } else "";
                } catch {
                  var check = false;
                  var isError;
                  logger.loader(
                    global.getText(
                      "mirai",
                      "notFoundPackage",
                      reqDependencies,
                      module.config.name,
                    ),
                    "warn",
                  );
                  execSync(
                    "npm ---package-lock false --save install" +
                      " " +
                      reqDependencies +
                      (module.config.dependencies[reqDependencies] == "*" ||
                      module.config.dependencies[reqDependencies] == ""
                        ? ""
                        : "@" + module.config.dependencies[reqDependencies]),
                    {
                      stdio: "inherit",
                      env: process["env"],
                      shell: true,
                      cwd: join(__dirname, "nodemodules"),
                    },
                  );
                  for (let i = 1; i <= 3; i++) {
                    try {
                      require["cache"] = {};
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
                      if (
                        listPackage.hasOwnProperty(reqDependencies) ||
                        listbuiltinModules.includes(reqDependencies)
                      )
<<<<<<< HEAD
                        global.nodemodule[
                          reqDependencies
                        ] = require(reqDependencies);
                      else
                        global.nodemodule[
                          reqDependencies
                        ] = require(reqDependenciesPath);
                    } else "";
                  } catch {
                    var check = false;
                    var isError;
                    logger.loader(
                      global.getText(
                        "mirai",
                        "notFoundPackage",
                        reqDependencies,
                        module.config.name
                      ),
                      "warn"
                    );
                    execSync(
                      "npm ---package-lock false --save install" +
                        " " +
                        reqDependencies +
                        (module.config.dependencies[reqDependencies] == "*" ||
                        module.config.dependencies[reqDependencies] == ""
                          ? ""
                          : "@" + module.config.dependencies[reqDependencies]),
                      {
                        stdio: "inherit",
                        env: process["env"],
                        shell: true,
                        cwd: join(__dirname, "nodemodules"),
                      }
                    );
                    for (let i = 1; i <= 3; i++) {
                      try {
                        require["cache"] = {};
                        if (
                          listPackage.hasOwnProperty(reqDependencies) ||
                          listbuiltinModules.includes(reqDependencies)
                        )
                          global["nodemodule"][
                            reqDependencies
                          ] = require(reqDependencies);
                        else
                          global["nodemodule"][
                            reqDependencies
                          ] = require(reqDependenciesPath);
                        check = true;
                        break;
                      } catch (error) {
                        isError = error;
                      }
                      if (check || !isError) break;
                    }
                    if (!check || isError)
                      throw global.getText(
                        "mirai",
                        "cantInstallPackage",
                        reqDependencies,
                        module.config.name,
                        isError
                      );
                  }
                }
                //logger.loader(global.getText('mirai', 'loadedPackage', module.config.name));
              }
=======
                        global["nodemodule"][reqDependencies] = require(
                          reqDependencies,
                        );
                      else
                        global["nodemodule"][reqDependencies] = require(
                          reqDependenciesPath,
                        );
                      check = true;
                      break;
                    } catch (error) {
                      isError = error;
                    }
                    if (check || !isError) break;
                  }
                  if (!check || isError)
                    throw global.getText(
                      "mirai",
                      "cantInstallPackage",
                      reqDependencies,
                      module.config.name,
                      isError,
                    );
                }
              }
            }
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
            if (module.config.envConfig)
              try {
                for (const envConfig in module.config.envConfig) {
                  if (
                    typeof global.configModule[module.config.name] ==
                    "undefined"
                  )
                    global.configModule[module.config.name] = {};
                  if (typeof global.config[module.config.name] == "undefined")
                    global.config[module.config.name] = {};
                  if (
                    typeof global.config[module.config.name][envConfig] !==
                    "undefined"
                  )
                    global["configModule"][module.config.name][envConfig] =
                      global.config[module.config.name][envConfig];
                  else
                    global.configModule[module.config.name][envConfig] =
                      module.config.envConfig[envConfig] || "";
                  if (
                    typeof global.config[module.config.name][envConfig] ==
                    "undefined"
                  )
                    global.config[module.config.name][envConfig] =
                      module.config.envConfig[envConfig] || "";
                }
<<<<<<< HEAD
                //logger.loader(global.getText('mirai', 'loadedConfig', module.config.name));
              } catch (error) {
                throw new Error(
                  global.getText(
                    "mirai",
                    "loadedConfig",
                    module.config.name,
                    JSON.stringify(error)
                  )
                );
              }
=======
              } catch (error) {}
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
            if (module.onLoad) {
              try {
                const moduleData = {};
                moduleData.api = loginApiData;
<<<<<<< HEAD
                moduleData.models = models;
=======
                moduleData.models = botModel;
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
                module.onLoad(moduleData);
              } catch (_0x20fd5f) {
                throw new Error(
                  global.getText(
                    "mirai",
                    "cantOnload",
                    module.config.name,
<<<<<<< HEAD
                    JSON.stringify(_0x20fd5f)
                  ),
                  "error"
=======
                    JSON.stringify(_0x20fd5f),
                  ),
                  "error",
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
                );
              }
            }
            if (module.handleEvent)
              global.client.eventRegistered.push(module.config.name);
            global.client.commands.set(module.config.name, module);
<<<<<<< HEAD
            //logger.loader(global.getText('mirai', 'successLoadModule', module.config.name));
          } catch (error) {
            //logger.loader(global.getText('mirai', 'failLoadModule', module.config.name, error), 'error');
          }
=======
          } catch (error) {}
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
        }
      })(),
      (function () {
        const events = readdirSync(
<<<<<<< HEAD
          global.client.mainPath + "/modules/events"
        ).filter(
          (event) =>
            event.endsWith(".js") &&
            !global.config.eventDisabled.includes(event)
        );
        for (const ev of events) {
          try {
            var event = require(global.client.mainPath +
              "/modules/events/" +
              ev);
=======
          global.client.mainPath + "/modules/events",
        ).filter(
          (event) =>
            event.endsWith(".js") &&
            !global.config.eventDisabled.includes(event),
        );
        for (const ev of events) {
          try {
            var event = require(
              global.client.mainPath + "/modules/events/" + ev,
            );
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
            if (!event.config || !event.run)
              throw new Error(global.getText("mirai", "errorFormat"));
            if (global.client.events.has(event.config.name) || "")
              throw new Error(global.getText("mirai", "nameExist"));
            if (
              event.config.dependencies &&
              typeof event.config.dependencies == "object"
            ) {
              for (const dependency in event.config.dependencies) {
                const _0x21abed = join(
                  __dirname,
                  "nodemodules",
                  "node_modules",
<<<<<<< HEAD
                  dependency
=======
                  dependency,
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
                );
                try {
                  if (!global.nodemodule.hasOwnProperty(dependency)) {
                    if (
                      listPackage.hasOwnProperty(dependency) ||
                      listbuiltinModules.includes(dependency)
                    )
                      global.nodemodule[dependency] = require(dependency);
                    else global.nodemodule[dependency] = require(_0x21abed);
                  } else "";
                } catch {
                  let check = false;
                  let isError;
                  logger.loader(
                    global.getText(
                      "mirai",
                      "notFoundPackage",
                      dependency,
<<<<<<< HEAD
                      event.config.name
                    ),
                    "warn"
=======
                      event.config.name,
                    ),
                    "warn",
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
                  );
                  execSync(
                    "npm --package-lock false --save install" +
                      dependency +
                      (event.config.dependencies[dependency] == "*" ||
                      event.config.dependencies[dependency] == ""
                        ? ""
                        : "@" + event.config.dependencies[dependency]),
                    {
                      stdio: "inherit",
                      env: process["env"],
                      shell: true,
                      cwd: join(__dirname, "nodemodules"),
<<<<<<< HEAD
                    }
=======
                    },
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
                  );
                  for (let i = 1; i <= 3; i++) {
                    try {
                      require["cache"] = {};
                      if (global.nodemodule.includes(dependency)) break;
                      if (
                        listPackage.hasOwnProperty(dependency) ||
                        listbuiltinModules.includes(dependency)
                      )
                        global.nodemodule[dependency] = require(dependency);
                      else global.nodemodule[dependency] = require(_0x21abed);
                      check = true;
                      break;
                    } catch (error) {
                      isError = error;
                    }
                    if (check || !isError) break;
                  }
                  if (!check || isError)
                    throw global.getText(
                      "mirai",
                      "cantInstallPackage",
                      dependency,
<<<<<<< HEAD
                      event.config.name
                    );
                }
              }
              //logger.loader(global.getText('mirai', 'loadedPackage', event.config.name));
=======
                      event.config.name,
                    );
                }
              }
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
            }
            if (event.config.envConfig)
              try {
                for (const _0x5beea0 in event.config.envConfig) {
                  if (
                    typeof global.configModule[event.config.name] == "undefined"
                  )
                    global.configModule[event.config.name] = {};
                  if (typeof global.config[event.config.name] == "undefined")
                    global.config[event.config.name] = {};
                  if (
                    typeof global.config[event.config.name][_0x5beea0] !==
                    "undefined"
                  )
                    global.configModule[event.config.name][_0x5beea0] =
                      global.config[event.config.name][_0x5beea0];
                  else
                    global.configModule[event.config.name][_0x5beea0] =
                      event.config.envConfig[_0x5beea0] || "";
                  if (
                    typeof global.config[event.config.name][_0x5beea0] ==
                    "undefined"
                  )
                    global.config[event.config.name][_0x5beea0] =
                      event.config.envConfig[_0x5beea0] || "";
                }
<<<<<<< HEAD
                //logger.loader(global.getText('mirai', 'loadedConfig', event.config.name));
              } catch (error) {
                throw new Error(
                  global.getText(
                    "mirai",
                    "loadedConfig",
                    event.config.name,
                    JSON.stringify(error)
                  )
                );
              }
            if (event.onLoad)
              try {
                const eventData = {};
                (eventData.api = loginApiData), (eventData.models = models);
=======
              } catch (error) {}
            if (event.onLoad)
              try {
                const eventData = {};
                (eventData.api = loginApiData), (eventData.models = botModel);
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
                event.onLoad(eventData);
              } catch (error) {
                throw new Error(
                  global.getText(
                    "mirai",
                    "cantOnload",
                    event.config.name,
<<<<<<< HEAD
                    JSON.stringify(error)
                  ),
                  "error"
                );
              }
            global.client.events.set(event.config.name, event);
            //logger.loader(global.getText('mirai', 'successLoadModule', event.config.name));
          } catch (error) {
            //logger.loader(global.getText('mirai', 'failLoadModule', event.config.name, error), 'error');
          }
        }
      })();
    logger.loader(
      global.getText(
        "mirai",
        "finishLoadModule",
        global.client.commands.size,
        global.client.events.size
      )
    );
    //logger.loader('=== ' + (Date.now() - global.client.timeStart) + 'ms ===')

    writeFileSync(
      global.client["configPath"],
      JSON["stringify"](global.config, null, 4),
      "utf8"
    );
unlinkSync(global["client"]["configPath"] + ".temp");
    const listenerData = {};
    listenerData.api = loginApiData;
    listenerData.models = models;
    const listener = require("./includes/listen")(listenerData);
   /* logger("AUTO check Rent đã hoạt đông!", "[ RENT ]")
    setInterval(async function() {
      await require("./model/rentBot.js")(loginApiData)
    }, 1000 * 60 * 60 * 1)*/
=======
                    JSON.stringify(error),
                  ),
                  "error",
                );
              }
            global.client.events.set(event.config.name, event);
          } catch (error) {}
        }
      })();
    logger.loader(`Tải thành công: ${global.client.commands.size} lệnh - ${global.client.events.size} sự kiện`);
    logger.loader('Time start: ' + (Date.now() - global.client.timeStart) / 1000 + 's') 
    writeFileSync(
      global.client["configPath"],
      JSON["stringify"](global.config, null, 4),
      "utf8",
    );
    unlinkSync(global["client"]["configPath"] + ".temp");
    const listenerData = {};
    listenerData.api = loginApiData;
    listenerData.models = botModel;
    const listener = require("./includes/listen")(listenerData);
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
    function listenerCallback(error, message) {
      if (error) {
        if (JSON.stringify(error).includes("601051028565049")) {
          var form = {
            av: loginApiData.getCurrentUserID(),
            fb_api_caller_class: "RelayModern",
            fb_api_req_friendly_name: "FBScrapingWarningMutation",
            variables: "{}",
            server_timestamps: "true",
            doc_id: "6339492849481770",
          };
          loginApiData.httpPost(
            "https://www.facebook.com/api/graphql/",
            form,
            (e, i) => {
              var res = JSON.parse(i)
              console.log(res.data.fb_scraping_warning_clear)
              if (e || res.errors) {
                return logger(
                  "Lỗi không thể xóa cảnh cáo của facebook.",
                  "error"
                );
              }
              if (res.data.fb_scraping_warning_clear.success) {
                logger("Đã vượt cảnh cáo facebook thành công.", "[ success ]");
                global.handleListen = loginApiData.listenMqtt(listenerCallback);
                setTimeout(
                  (_) => (mqttClient.end(), connect_mqtt()),
                  1000 * 60 * 60 * 6
                );
              }
            }
          );
        } else {
          return logger(
            global.getText("mirai", "handleListenError", JSON.stringify(error)),
            "error"
          );
        }
      }
      if (
        ["presence", "typ", "read_receipt"].some((data) => data == message?.type)
      ) {
        return;
      }
      if (global.config.DeveloperMode == true) {
        console.log(message);
      }
      return listener(message);
    }
<<<<<<< HEAD

=======
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
    const connect_mqtt = (_) => {
      global.handleListen = loginApiData.listenMqtt(listenerCallback);
      setTimeout((_) => (mqttClient.end(), connect_mqtt()), 1000 * 60 * 60 * 6);
    };
<<<<<<< HEAD

    connect_mqtt();

=======
    connect_mqtt();    
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
  });
}

(async () => {
  try {
    await sequelize.authenticate();
    const authentication = {};
    authentication.Sequelize = Sequelize;
    authentication.sequelize = sequelize;
    const models = require("./includes/database/model")(authentication);
    const botData = {};
    botData.models = models;
    onBot(botData);
  } catch (error) {
    logger(
      global.getText("mirai", "successConnectDatabase", JSON.stringify(error)),
      "[ DATABASE ]",
    );
  }
})();
<<<<<<< HEAD
process.on("unhandledRejection", (err, p) => {});
=======
process.on("unhandledRejection", (err, p) => {});
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
