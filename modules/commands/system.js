<<<<<<< HEAD
const si = require("systeminformation");
const pidusage = require("pidusage");
const os = require("os");

module.exports.config = {
  name: "system",
  version: "5.1", // Cập nhật version để phản ánh định dạng mới
  hasPermssion: 2,
  credits: "ĐÉO CÓ (Chỉnh sửa định dạng bởi Gemini)",
  description: "Hiển thị thông tin hệ thống theo định dạng text file",
  commandCategory: "Admin",
  usages: "",
  cooldowns: 5,
  dependencies: {
    "systeminformation": "",
    "pidusage": ""
  }
};

/**
 * Hàm phụ trợ: Định dạng Byte thành KB/MB/GB
 */
function formatBytes(bytes) {
  const sizes = ['B', 'KB', 'MB', 'GB', 'TB'];
  if (bytes === 0) return '0 B';
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (bytes / Math.pow(1024, i)).toFixed(1) + ' ' + sizes[i];
}

/**
 * Hàm phụ trợ: Định dạng giây thành H:M:S
 */
function formatUptime(seconds) {
  const hrs = Math.floor(seconds / 3600);
  const mins = Math.floor((seconds % 3600) / 60);
  const secs = Math.floor(seconds % 60);
  return `${hrs}h ${mins}m ${secs}s`;
}

module.exports.run = async ({ api, event }) => {
  const { threadID, messageID } = event;
  const startTime = Date.now();

  api.sendMessage("⏳ Đang thu thập và định dạng cấu hình hệ thống...", threadID, messageID);

  try {
    // 1. Thu thập dữ liệu
    const [
      cpu, mem, osInfo, disks, usage, battery, ping, 
      baseboard, graphics, memLayout, system
    ] = await Promise.all([
      si.cpu(),
      si.mem(),
      si.osInfo(),
      si.diskLayout(),
      pidusage(process.pid),
      si.battery(),
      si.inetLatency(),
      si.baseboard(),
      si.graphics(),
      si.memLayout(),
      si.system()
    ]);

    // 2. Xử lý dữ liệu và tạo chuỗi con

    // Chi tiết RAM
    const ramInfo = memLayout.map((m, i) => {
      const sizeGB = (m.size / 1024 / 1024 / 1024).toFixed(1);
      const type = m.type || "?";
      const speed = m.clockSpeed || "?";
      const manufacturer = m.manufacturer || "?";
      return `- Chi tiết thanh ${i + 1}: ${sizeGB} GB (${type}, ${speed} MHz, Hãng: ${manufacturer})`;
    }).join("\n");

    // Ổ đĩa
    const diskList = disks.map((d, i) => {
      const sizeGB = (d.size / 1024 / 1024 / 1024).toFixed(0);
      const name = d.name || "N/A";
      const interfaceType = d.interfaceType || "?";
      return `- Ổ ${i + 1}: ${name} - ${interfaceType}, ${sizeGB} GB`;
    }).join("\n");
    
    // Giả lập dữ liệu cũ: Chỉ lấy GPU đầu tiên nếu có nhiều
    const gpuData = graphics.controllers[0];
    const gpuVram = gpuData && gpuData.vram ? gpuData.vram + " MB" : "Không rõ";
    const gpuName = gpuData ? `${gpuData.vendor || "Không rõ"} ${gpuData.model || "Không rõ"}` : "Không có GPU rời";

    // Màn hình (Chỉ lấy màn hình chính)
    const primaryDisplay = graphics.displays.find(d => d.main) || graphics.displays[0];
    const displayModel = primaryDisplay ? primaryDisplay.model || "Generic PnP Monitor" : "Không rõ";

    // 3. Xây dựng chuỗi kết quả (msg) theo định dạng yêu cầu

    const msg =
`=========================================
THÔNG TIN CẤU HÌNH HỆ THỐNG - ${system.model || "Không rõ"}
=========================================

1. CẤU HÌNH CƠ BẢN
--------------------
- Hãng/Model: ${system.manufacturer || "Không rõ"} ${system.model || "Không rõ"}
- Bo mạch chủ: ${baseboard.manufacturer} ${baseboard.model || "Không rõ"}
- Hệ điều hành: ${osInfo.platform} (Phiên bản ${osInfo.build || osInfo.release}, ${osInfo.arch})
- Uptime máy: ${formatUptime(os.uptime())}

2. BỘ XỬ LÝ & ĐỒ HỌA (CPU/GPU)
-------------------------------
- CPU: ${cpu.manufacturer} ${cpu.brand}
    - Cấu hình: ${cpu.cores} nhân / ${cpu.physicalCores} luồng
    - Tốc độ cơ bản: ${cpu.speed} GHz
    - Mức sử dụng: ${usage.cpu.toFixed(1)}%
- GPU: ${gpuName}
    - VRAM: ${gpuVram}

3. BỘ NHỚ & LƯU TRỮ (RAM/Ổ ĐĨA)
--------------------------------
- Tổng RAM: ${(mem.total / 1024 / 1024 / 1024).toFixed(1)} GB (Trống: ${(mem.available / 1024 / 1024 / 1024).toFixed(1)} GB)
- Loại RAM: ${memLayout[0] ? memLayout[0].type || "?" : "Không rõ"}, ${memLayout[0] ? memLayout[0].clockSpeed || "?" : "Không rõ"} MHz
${ramInfo}
- Ổ đĩa: ${diskList}

4. TRẠNG THÁI VÀ THIẾT BỊ
---------------------------
- Màn hình: ${displayModel} (Chính)
- Pin: ${battery.hasBattery ? `${battery.percent !== null ? battery.percent + "%" : "Không rõ"} (${battery.isCharging ? "Đang sạc" : "Không sạc"})` : "Không có Pin"}
- Ping mạng: ${ping !== null ? ping + " ms" : "Không rõ"}
- Uptime bot: ${formatUptime(process.uptime())}
- Phản hồi Bot: ${(Date.now() - startTime)} ms`;

    return api.sendMessage(msg, threadID, messageID);
  } catch (err) {
    return api.sendMessage(`⚠️ Lỗi khi lấy thông tin hệ thống:\n${err.message}`, threadID, messageID);
  }
};
=======
module.exports.config = {
	name: "system",
	version: "1.0.1",
	hasPermssion: 3,
	credits: "Mirai Team",
	description: "Xem thông tin phần cứng mà bot đang sử dụng",
	commandCategory: "Hệ thống",
	cooldowns: 5,
 images: [],
	dependencies: {
		"systeminformation": "",
		"pidusage": ""
	}
};

function byte2mb(bytes) {
	const units = ['Bytes', 'KB', 'MB', 'GB', 'TB', 'PB', 'EB', 'ZB', 'YB'];
	let l = 0, n = parseInt(bytes, 10) || 0;
	while (n >= 1024 && ++l) n = n / 1024;
	return `${n.toFixed(n < 10 && l > 0 ? 1 : 0)}${units[l]}`;
}

module.exports.run = async function ({ api, event }) {
	const { cpu, time, cpuTemperature, currentLoad, memLayout, diskLayout, mem, osInfo } = global.nodemodule["systeminformation"];
	const timeStart = Date.now();

	try {
		const pidusage = await global.nodemodule["pidusage"](process.pid)
		var { manufacturer, brand, speedMax, physicalCores, cores } = await cpu();
		var { main: mainTemp } = await cpuTemperature();
		var { currentLoad: load } = await currentLoad();
		var { uptime } = await time();
		var diskInfo = await diskLayout();
		var memInfo = await memLayout();
		var { total: totalMem, available: availableMem } = await mem();
		var { platform: OSPlatform, build: OSBuild } = await osInfo();;
		var disk = [], i = 1;

		var hours = Math.floor(uptime / (60 * 60));
		var minutes = Math.floor((uptime % (60 * 60)) / 60);
		var seconds = Math.floor(uptime % 60);
		if (hours < 10) hours = "0" + hours;
		if (minutes < 10) minutes = "0" + minutes;
		if (seconds < 10) seconds = "0" + seconds;

		for (const singleDisk of diskInfo) {
			disk.push(
				`==== 「 DISK ${i++} 」 ====\n` +
				"📝 Name: " + singleDisk.name + "\n" +
				"📌 Type: " + singleDisk.interfaceType + "\n" + 
				"🔎 Size: " + byte2mb(singleDisk.size) + "\n" +
				"🌡️ Temperature: " + singleDisk.temperature + "°C"
			)
		}

		return api.sendMessage(
			"===== [ System Info ] =====\n" +
			"==== 「 CPU 」 ====\n" +
			"💻 CPU Model: " + manufacturer + " " + brand + " " + speedMax + "GHz\n" +
			"© Cores: " + cores + "\n" +
			"📝 Threads: " + physicalCores + "\n" +
			"🌡️ Temperature: " + mainTemp + "°C\n" +
			"🔄 Load: " + load.toFixed(1) + "%\n" +
			"🔐 Node usage: " + pidusage.cpu.toFixed(1) + "%\n" +
			"===== 「 MEMORY 」 =====\n" +
			"🗂️ Size: " + byte2mb(memInfo[0].size) +
			"\n📝 Type: " + memInfo[0].type +
			"\n⚙️ Total: " + byte2mb(totalMem) +
			"\n📥 Available: " + byte2mb(availableMem) +
			"\n🔐 Node usage: " + byte2mb(pidusage.memory) + "\n" +
			disk.join("\n") + "\n" +
			"===== 「 OS 」 =====\n" +
			"🔄 Platform: " + OSPlatform +
			"\n📥 Build: " + OSBuild +
			"\n⏳ Uptime: " + hours + ":" + minutes + ":" + seconds +
			"\n⚙️ Ping: " + (Date.now() - timeStart) + "ms",
			event.threadID, event.messageID
		)
 } catch (e) {
 console.log(e)
	}
}
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
