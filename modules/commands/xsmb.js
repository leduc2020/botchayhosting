<<<<<<< HEAD
const { get } = require('axios');

module.exports.config = {
  name: 'xsmb',
  version: '10.10',
  hasPermssion: 0,
  credits: 'DC-Nam - Fix tối ưu bởi ChatGPT',
  description: 'Gửi kết quả XSMB lúc 18:33 giờ Việt Nam',
  commandCategory: 'Tiện ích',
  usages: '[ngày-tháng-năm]',
  cooldowns: 3
};

// ✅ Format kết quả xổ số
function formatResult(result) {
  const match = result.message.match(/Giải Đặc Biệt: ([\d-]+)/);
  const special = match ? match[1] : 'Không rõ';
  return `🎉 Giải Đặc Biệt: ${special}\n\n${result.message}`;
}

// ✅ TỰ ĐỘNG GỬI KẾT QUẢ LÚC 6:33 PM
module.exports.onLoad = (o) => {
  if (global.xsmbInterval) clearInterval(global.xsmbInterval);

  const sentTodayMap = new Set(); // Lưu nhóm đã gửi
  let lastSentDate = null;

  global.xsmbInterval = setInterval(async () => {
    const now = new Date();
    const timeVN = now.toLocaleTimeString('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour12: true,
      hour: '2-digit',
      minute: '2-digit',
    });

    const dateVN = now.toLocaleDateString('vi-VN', {
      timeZone: 'Asia/Ho_Chi_Minh'
    }); // VD: "17/07/2025"

    // Nếu sang ngày mới thì reset danh sách nhóm đã gửi
    if (lastSentDate !== dateVN) {
      lastSentDate = dateVN;
      sentTodayMap.clear();
    }

    // Gửi vào đúng 6:33 PM giờ VN
    if (timeVN === '06:33 PM') {
      try {
        const res = await get(`https://api-ngollll.onrender.com/v2/tien-ich/check-xsmb.json`);
        const data = res.data?.data || [];
        if (!data[0]) return;

        const message = formatResult(data[0]);
        const threads = global.data?.allThreadID || [];

        for (const threadID of threads) {
          if (sentTodayMap.has(threadID)) continue;

          o.api.sendMessage(message, threadID, (err) => {
            if (!err) sentTodayMap.add(threadID);
          });
        }

        console.log(`[BOT] ✅ Đã gửi kết quả XSMB lúc 6:33 PM ngày ${dateVN}`);
      } catch (err) {
        console.error('[BOT] ❌ Lỗi khi gửi XSMB:', err.message);
      }
    }
  }, 10000); // Kiểm tra mỗi 10 giây
};

// ✅ XỬ LÝ KHI NGƯỜI DÙNG GỌI LỆNH THỦ CÔNG
module.exports.run = async function ({ api, event, args }) {
  const send = (msg, reply = false) => api.sendMessage(msg, event.threadID, reply ? event.messageID : null);

  try {
    const res = await get(`https://api-ngollll.onrender.com/v2/tien-ich/check-xsmb.json`);
    const data = res.data?.data || [];

    if (args[0]) {
      if (!/^\d{1,2}-\d{1,2}-\d{4}$/.test(args[0]))
        return send(`[⚜️] Vui lòng nhập đúng định dạng: ngày-tháng-năm (VD: 16-07-2025)`, true);

      const [d, m, y] = args[0].split("-");
      const inputFormatted = [d.padStart(2, '0'), m.padStart(2, '0'), y].join("-");

      const found = data.find(i => i.message.includes(inputFormatted));
      if (!found)
        return send(`[⚜️] Không tìm thấy kết quả ngày "${inputFormatted}"`, true);

      return send(formatResult(found), true);
    } else {
      return send(formatResult(data[0]), true); // Gửi kết quả hôm nay
    }
  } catch (err) {
    return send(`❌ Lỗi khi lấy dữ liệu: ${err.message}`, true);
  }
=======
const axios = require('axios');
const cheerio = require('cheerio');
const moment = require('moment-timezone');

module.exports.config = {
 name: 'xsmb',
 version: '1.0.0',
 hasPermission: 2,
 credits: 'DongDev',
 description: 'Kết quả xsmb',
 commandCategory: 'Tiện ích',
 usages: '[]',
 cooldowns: 20,
 images: [],
};

module.exports.run = async function ({ api, event, args }) { 
 moment.tz.setDefault('Asia/Ho_Chi_Minh');
 const currentHour = moment().hour();
 const isAfter6PM = currentHour >= 18;
 let date;
 let thu;
 if (isAfter6PM) {
 date = moment.tz("Asia/Ho_Chi_Minh").format("DD-MM-YYYY");
 thu = moment.tz('Asia/Ho_Chi_Minh').format('dddd');
 if (thu == 'Sunday') thu = 'Chủ Nhật';
 if (thu == 'Monday') thu = 'Thứ Hai';
 if (thu == 'Tuesday') thu = 'Thứ Ba';
 if (thu == 'Wednesday') thu = 'Thứ Tư';
 if (thu == "Thursday") thu = 'Thứ Năm';
 if (thu == 'Friday') thu = 'Thứ Sáu';
 if (thu == 'Saturday') thu = 'Thứ Bảy';
 } else {
 date = moment.tz("Asia/Ho_Chi_Minh").subtract(1, 'days').format("DD-MM-YYYY");
 thu = moment.tz('Asia/Ho_Chi_Minh').subtract(1, 'days').format('dddd');
 if (thu == 'Sunday') thu = 'Chủ Nhật';
 if (thu == 'Monday') thu = 'Thứ Hai';
 if (thu == 'Tuesday') thu = 'Thứ Ba';
 if (thu == 'Wednesday') thu = 'Thứ Tư';
 if (thu == "Thursday") thu = 'Thứ Năm';
 if (thu == 'Friday') thu = 'Thứ Sáu';
 if (thu == 'Saturday') thu = 'Thứ Bảy';
 }

 try {
 const response = await axios.get(`https://az24.vn/xsmb-${date}.html`);
 if (response.data.includes("Địa chỉ mà bạn vừa truy cập không tồn tại"))
 return res.status(404).json({ message: 'Not found result for this date' });
 const html = response.data;
 const $ = cheerio.load(html);
 const title = $('.title-bor strong a.title-a').last().text();
 const MaDB = $('.madb span').text();
 const GDB = $('.v-gdb').text();
 const G1 = $('.v-g1').text();
 const G2 = $('.v-g2-0').text() + " - " + $('.v-g2-1').text();
 const G3 = $('.v-g3-0').text() + " - " + $('.v-g3-1').text() + " - " + $('.v-g3-2').text() + " - " + $('.v-g3-3').text() + " - " + $('.v-g3-4').text() + " - " + $('.v-g3-5').text();
 const G4 = $('.v-g4-0').text() + " - " + $('.v-g4-1').text() + " - " + $('.v-g4-2').text() + " - " + $('.v-g4-3').text();
 const G5 = $('.v-g5-0').text() + " - " + $('.v-g5-1').text() + " - " + $('.v-g5-2').text() + " - " + $('.v-g5-3').text() + " - " + $('.v-g5-4').text() + " - " + $('.v-g5-5').text();
 const G6 = $('.v-g6-0').text() + " - " + $('.v-g6-1').text() + " - " + $('.v-g6-2').text();
 const G7 = $('.v-g7-0').text() + " - " + $('.v-g7-1').text() + " - " + $('.v-g7-2').text() + " - " + $('.v-g7-3').text();

 const data = `[ Kết quả Xổ Số Miền Bắc ]\n────────────────────\n⏰ Time: ${thu} Ngày ${date}\n\n🔰 Mã Đặc biệt: ${MaDB}\n✏️ Giải Đặc biệt: ${GDB}\n────────────────────\n1️⃣ Giải 1: ${G1}\n2️⃣ Giải 2: ${G2}\n3️⃣ Giải 3: ${G3}\n3️⃣ Giải 4: ${G4}\n5️⃣ Giải 5: ${G5}\n6️⃣ Giải 6: ${G6}\n7️⃣ Giải 7: ${G7}\n────────────────────\n⚠️ Kết quả được lấy trực tiếp từ website, nhanh hơn, chính xác hơn.`;
 api.sendMessage(data, event.threadID);
 } catch (error) {
 console.error(error);
 // Handle error appropriately
 }
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
};