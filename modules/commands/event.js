<<<<<<< HEAD
const { execSync } = require('child_process');
const { writeFileSync, unlinkSync, readFileSync } = require('fs-extra');
const { join } = require('path');

module.exports.config = {
    name: "event",
    version: "1.0.1",
    hasPermssion: 2,
    credits: "Mirai Team",
    description: "Quản lý/Kiểm soát toàn bộ module của Bot",
    commandCategory: 'Admin',
    usages: "[load/unload/loadAll/unloadAll/info] [tên module]",
    cooldowns: 5,
=======
module.exports.config = {
    name: "event",
    version: "1.0.1",
    hasPermssion: 3,
    credits: "Mirai Team",
    description: "Quản lý/Kiểm soát toàn bộ module của bot",
    commandCategory: "Admin",
    usages: "[load/unload/loadAll/unloadAll/info] [tên module]",
    cooldowns: 5,
    images: [],
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
    dependencies: {
        "fs-extra": "",
        "child_process": "",
        "path": ""
    }
};

<<<<<<< HEAD
module.exports.languages = {
    "vi": {
        "nameExist": "Tên lệnh bị trùng với một lệnh mang cùng tên khác",
        "notFoundLanguage": "Lệnh %1 không hỗ trợ ngôn ngữ của bạn",
        "notFoundPackage": "Không tìm thấy package %1 hỗ trợ cho lệnh %2, tiến hành cài đặt...",
        "cantInstallPackage": "Không thể cài đặt package %1 cho lệnh %2, lỗi: %3",
        "loadedPackage": "Đã tải thành công toàn bộ package cho lệnh %1",
        "loadedConfig": "Đã tải thành công config cho lệnh %1",
        "cantLoadConfig": "Không thể tải config của lệnh %1, lỗi: %2",
        "cantOnload": "Không thể khởi chạy setup của lệnh %1, lỗi: %1",
        "successLoadModule": "Đã tải thành công lệnh %1",
        "failLoadModule": "Không thể tải thành công lệnh %1, lỗi: %2",
        "moduleError": "Những lệnh đã xảy ra sự cố không mong muốn khi đang tải: \n\n%1",
        "unloadSuccess": "Đã hủy tải lệnh %1",
        "unloadedAll": "Đã hủy tải %1 lệnh",
        "missingInput": "Tên lệnh không được để trống",
        "moduleNotExist": "Lệnh bạn nhập không tồn tại",
        "dontHavePackage": "Không có",
        "infoModule": "=== %1 ===\n- Được tạo bởi: %2\n- Phiên bản: %3\n- Các package yêu cầu: %4"
    },
    "en": {
        "nameExist": "Module's name is similar to another module!",
        "notFoundLanguage": "Module %1 does not support your language",
        "notFoundPackage": "Can't find package %1 for module %2, install...",
        "cantInstallPackage": "Can't install package %1 for module %2, error: %3",
        "loadedPackage": "Loaded package for module %1",
        "loadedConfig": "Loaded config for module %1",
        "cantLoadConfig": "Can't load config for module %1, error: %2",
        "cantOnload": "Can't load setup for module %1, error: %1",
        "successLoadModule": "Loaded module %1",
        "failLoadModule": "Can't load module %1, error: %2",
        "moduleError": "Modules which have unexpected error when loading: \n\n%1",
        "unloadSuccess": "Unloaded module %1",
        "unloadedAll": "Unloaded %1 module",
        "missingInput": "Module's name can't be left blank!",
        "moduleNotExist": "Module you enter doesn't exist!",
        "dontHavePackage": "None",
        "infoModule": "=== %1 ===\n- Coded by: %2\n- Version: %3\n- Required package: %4"
    }
}

module.exports.loadCommand = function ({ moduleList, threadID, messageID, getText }) {
    const { configPath, mainPath, api } = global.client;
    const logger = require(mainPath + "/utils/log");
    const listPackage = JSON.parse(readFileSync(global.client.mainPath + '/package.json')).dependencies;
=======
module.exports.loadCommand = function ({ moduleList, threadID, messageID }) {
    const { execSync } = global.nodemodule["child_process"];
    const { writeFileSync, unlinkSync, readFileSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];
    const { configPath, mainPath, api } = global.client;
    const logger = require(process.cwd()+ "/utils/log");
    const listPackage = JSON.parse(readFileSync(process.cwd()+ '/package.json')).dependencies;
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
    const listbuiltinModules = require("module").builtinModules;
    var errorList = [];

    delete require.cache[require.resolve(configPath)];
    var configValue = require(configPath);
    writeFileSync(configPath + ".temp", JSON.stringify(configValue, null, 4), 'utf8');

    for (const nameModule of moduleList) {
        try {
            const dirModule = join(__dirname, "..", "events", `${nameModule}.js`);
            delete require.cache[require.resolve(dirModule)];
            var event = require(dirModule);
<<<<<<< HEAD
            if (!event.config || !event.run) throw new Error(getText("errorFormat"));

            if (event.config.dependencies && typeof event.config.dependencies == "object") {
=======
            if (!event.config || !event.run) throw new Error("❎ Định dạng lỗi.");

            if (event.config.dependencies && typeof event.config.dependencies == "object") {        
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
                for (const packageName in event.config.dependencies) {
                    const moduleDir = join(global.client.mainPath, "nodemodules", "node_modules", packageName);
                    try {
                        if (!global.nodemodule.hasOwnProperty(packageName)) {
                            if (listPackage.hasOwnProperty(packageName) || listbuiltinModules.includes(packageName)) global.nodemodule[packageName] = require(packageName);
                            else global.nodemodule[packageName] = require(moduleDir);
                        }
                    }
                    catch {
                        var tryLoadCount = 0, loadSuccess = false, error;
<<<<<<< HEAD
                        logger.loader(getText("notFoundPackage", packageName, event.config.name), "warn");
=======
                        logger.loader(`Không tìm thấy package ${packageName} cho module ${event.config.name}`, "warn");
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
                        execSync(`npm --package-lock false --save install ${packageName}${(event.config.dependencies[packageName] == "*" || event.config.dependencies[packageName] == "") ? "" : `@${event.config.dependencies[packageName]}`}`,
                        {
                            stdio: "inherit",
                            env: process.env,
                            shell: true,
                            cwd: join(global.client.mainPath, "nodemodules")
                        });

                        for (tryLoadCount = 1; tryLoadCount <= 3; tryLoadCount++) {
                            require.cache = {}
                            try {
                                require.cache = {};
                                if (listPackage.hasOwnProperty(packageName) || listbuiltinModules.includes(packageName)) global.nodemodule[packageName] = require(packageName);
                                else global.nodemodule[packageName] = require(moduleDir);
                                loadSuccess = true;
                                break;
                            }
                            catch (e) { error = e }
                            if (loadSuccess || !error) break;
                        }
<<<<<<< HEAD
                        if (!loadSuccess || error) throw getText("cantInstallPackage", packageName, event.config.name, error);
                    }
                }
                logger.loader(getText("loadedPackage", event.config.name));
            }

            if (event.config.envConfig && typeof event.config.envConfig == "Object") {
=======
                        if (!loadSuccess || error) throw new Error(`Không thể cài đặt package ${packageName} cho module ${event.config.name}, lỗi: ${error}`);
                    }
                }
                logger.loader(`Đã tải thành công package cho module ${event.config.name}`);
            }

            if (event.config.envConfig && typeof event.config.envConfig == "object") {
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
                try {
                    for (const key in event.config.envConfig) {
                        if (typeof global.configModule[event.config.name] == "undefined") global.configModule[event.config.name] = {};
                        if (typeof global.config[event.config.name] == "undefined") global.config[event.config.name] = {};
                        if (typeof global.config[event.config.name][key] !== "undefined") global.configModule[event.config.name][key] = global.config[event.config.name][key];
                        else global.configModule[event.config.name][key] = event.config.envConfig[key] || "";
                        if (typeof global.config[event.config.name][key] == "undefined") global.config[event.config.name][key] = event.config.envConfig[key] || "";
                    }
<<<<<<< HEAD
                    logger.loader(getText("loadedConfig", event.config.name));
                }
                catch (error) { throw new Error(getText("loadedConfig", event.config.name, JSON.stringify(error))) }
=======
                    logger.loader(`Đã tải thành công config cho module ${event.config.name}`);
                }
                catch (error) { throw new Error(`Đã tải thành công config cho module ${event.config.name}, lỗi: ${JSON.stringify(error)}`) }
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
            }

            if (event.onLoad) {
                try { event.onLoad({ api }) }
<<<<<<< HEAD
                catch (error) { throw new Error(getText("cantOnload", event.config.name, JSON.stringify(error)), "error") }
=======
                catch (error) { throw new Error(`Không thể khởi chạy setup cho module ${event.config.name}, lỗi: ${JSON.stringify(error)}`, "error") }
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
            }

            if (global.config["eventDisabled"].includes(`${nameModule}.js`) || configValue["eventDisabled"].includes(`${nameModule}.js`)) {
                configValue["eventDisabled"].splice(configValue["eventDisabled"].indexOf(`${nameModule}.js`), 1);
                global.config["eventDisabled"].splice(global.config["eventDisabled"].indexOf(`${nameModule}.js`), 1);
            }

            global.client.events.delete(nameModule);
            global.client.events.set(event.config.name, event);
<<<<<<< HEAD
            logger.loader(`Đã tải lệnh ${event.config.name} thành công`);
        } catch (error) { errorList.push(getText("failLoadModule", event.config.name, error)) };
    }
    if (errorList.length != 0) api.sendMessage(getText("moduleError", errorList.join("\n\n")), threadID, messageID);
    api.sendMessage(`[ 𝗘𝗩𝗘𝗡𝗧𝗦 ] → Đã tải thành công ${moduleList.length - errorList.length} lệnh`, threadID, messageID);
=======
            logger.loader(`Đã tải sự kiện ${event.config.name}!`);
        } catch (error) { errorList.push(`Không thể tải module ${event.config.name}, lỗi: ${error}`) };
    }
    if (errorList.length != 0) api.sendMessage(errorList.join("\n\n"), threadID, messageID);
    api.sendMessage(`☑️ Đã tải thành công ${moduleList.length - errorList.length} sự kiện`, threadID, messageID);
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
    writeFileSync(configPath, JSON.stringify(configValue, null, 4), 'utf8');
    unlinkSync(configPath + ".temp");
    return;
}

<<<<<<< HEAD
module.exports.unloadModule = function ({ moduleList, threadID, messageID, getText }) {
    const { configPath, api } = global.client;
    const logger = require(global.client.mainPath + "/utils/log").loader;
=======
module.exports.unloadModule = function ({ moduleList, threadID, messageID }) {
    const { writeFileSync, unlinkSync } = global.nodemodule["fs-extra"];
    const { configPath, api } = global.client;
    const logger = require(process.cwd()+"/utils/log").loader;
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa

    delete require.cache[require.resolve(configPath)];
    var configValue = require(configPath);
    writeFileSync(configPath + ".temp", JSON.stringify(configValue, null, 4), 'utf8');

    for (const nameModule of moduleList) {
        global.client.events.delete(nameModule);
        configValue["eventDisabled"].push(`${nameModule}.js`);
        global.config["eventDisabled"].push(`${nameModule}.js`);
<<<<<<< HEAD
        logger(getText("unloadSuccess", nameModule));
=======
        logger(`Đã hủy tải module ${nameModule}`);
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
    }

    writeFileSync(configPath, JSON.stringify(configValue, null, 4), 'utf8');
    unlinkSync(configPath + ".temp");

<<<<<<< HEAD
    return api.sendMessage(getText("unloadedAll", moduleList.length), threadID, messageID);
}

module.exports.run = function ({ event, args, api, getText }) {
    if (event.senderID != 61554620715942) return api.sendMessage(`[ 𝗘𝗩𝗘𝗡𝗧𝗦 ] → Cần quyền SUPER ADMIN để thực hiện lệnh`, event.threadID, event.messageID)

    const { readdirSync } = require("fs-extra");
=======
    return api.sendMessage(`☑️ Đã hủy tải thành công ${moduleList.length} sự kiện`, threadID, messageID);
}

module.exports.run = function ({ event, args, api }) {
    const { readdirSync } = global.nodemodule["fs-extra"];
    const { join } = global.nodemodule["path"];
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
    const { threadID, messageID } = event;
    var moduleList = args.splice(1, args.length);

    switch (args[0]) {
<<<<<<< HEAD
        case "count": {
            let events = global.client.events.values();
            let infoEvents = "";
            api.sendMessage("[ 𝗘𝗩𝗘𝗡𝗧𝗦 ] → Hiện tại đang có " + global.client.events.size + " lệnh có thể sử dụng"+ infoEvents, event.threadID, event.messageID);
            break;
        }
        case "load": {
            if (moduleList.length == 0) return api.sendMessage(getText("missingInput"), threadID, messageID);
            else return this.loadCommand({ moduleList, threadID, messageID, getText });
        }
        case "unload": {
            if (moduleList.length == 0) return api.sendMessage(getText("missingInput"), threadID, messageID);
            else return this.unloadModule({ moduleList, threadID, messageID, getText });
=======
        case "l":
        case "load": {
            if (moduleList.length == 0) return api.sendMessage("❎ Tên module không được để trống!", threadID, messageID);
            else return this.loadCommand({ moduleList, threadID, messageID });
        }
        case "unload": {
            if (moduleList.length == 0) return api.sendMessage("❎ Tên module không được để trống!", threadID, messageID);
            else return this.unloadModule({ moduleList, threadID, messageID });
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
        }
        case "loadAll": {
            moduleList = readdirSync(join(global.client.mainPath, "modules", "events")).filter((file) => file.endsWith(".js") && !file.includes('example'));
            moduleList = moduleList.map(item => item.replace(/\.js/g, ""));
<<<<<<< HEAD
            return this.loadCommand({ moduleList, threadID, messageID, getText });
=======
            return this.loadCommand({ moduleList, threadID, messageID });
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
        }
        case "unloadAll": {
            moduleList = readdirSync(join(global.client.mainPath, "modules", "events")).filter((file) => file.endsWith(".js") && !file.includes('example'));
            moduleList = moduleList.map(item => item.replace(/\.js/g, ""));
<<<<<<< HEAD
            return this.unloadModule({ moduleList, threadID, messageID, getText });
        }
        case "info": {
            const event = global.client.events.get(moduleList.join("") || "");
            if (!event) return api.sendMessage(getText("moduleNotExist"), threadID, messageID);
            const { name, version, credits, dependencies } = event.config;
            return api.sendMessage(getText("infoModule", name.toUpperCase(), credits, version, ((Object.keys(dependencies || {})).join(", ") || getText("dontHavePackage"))), threadID, messageID);
=======
            return this.unloadModule({ moduleList, threadID, messageID });
        }
        case "info": {
            const event = global.client.events.get(moduleList.join("") || "");
            if (!event) return api.sendMessage("❎ Module bạn nhập không tồn tại!", threadID, messageID);
            const { name, version, credits, dependencies } = event.config;
            return api.sendMessage(`|› ${name.toUpperCase()}\n|› Tác giả: ${credits}\n|› Phiên bản: ${version}\n|› Các package yêu cầu: ${((Object.keys(dependencies || {})).join(", ") || "Không có")}\n──────────────────`, threadID, messageID);
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
        }
        default: {
            return global.utils.throwError(this.config.name, threadID, messageID);
        }
    }
}