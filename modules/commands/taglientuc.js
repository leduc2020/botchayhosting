<<<<<<< HEAD
const taggedMap = new Map();

module.exports = {
  config: {
    name: "taglientuc",
    version: "1.2",
    author: "ChatGPT + bạn",
    description: "Tag người nào đó liên tục",
    usage: "taglientuc @người 10 1",
    commandCategory: "group",
    cooldowns: 5,
  },

  run: async function({ api, event, args }) {
    const threadID = event.threadID;
    const senderID = event.senderID;

    // Nếu lệnh là 'stop'
    if (args[0] && args[0].toLowerCase() === "stop") {
      if (taggedMap.has(threadID)) {
        clearInterval(taggedMap.get(threadID));
        taggedMap.delete(threadID);
        return api.sendMessage("✅ Đã dừng tag liên tục", threadID);
      } else {
        return api.sendMessage("⚠️ Không có quá trình tag nào đang chạy", threadID);
      }
    }

    // Nếu có @tag mà không có số lần + delay
    if (event.mentions && Object.keys(event.mentions).length === 1 && args.length < 3) {
      return api.sendMessage(
        `📝 Hướng dẫn sử dụng:\n` +
        `⭐ taglientuc @người số_lần số_giây: Tag chỉ người được tag.\n` +
        `⭐ taglientuc stop: Dừng quá trình tag liên tục.`,
        threadID
      );
    }

    // Nếu đang tag trong box này rồi
    if (taggedMap.has(threadID)) {
      return api.sendMessage("⏳ Box này đang tag, vui lòng đợi hoàn thành rồi tag tiếp", threadID);
    }

    // Tách số lần và số giây
    const delay = parseInt(args[args.length - 1]) * 1000;
    const times = parseInt(args[args.length - 2]);
    const nameParts = args.slice(0, args.length - 2);
    const tagName = nameParts.join(" ");

    const mentionID = Object.keys(event.mentions)[0];
    if (!mentionID || isNaN(times) || isNaN(delay)) {
      return api.sendMessage("📝 Hướng dẫn sử dụng:\n⭐ taglientuc @người số_lần số_giây: Tag chỉ người được tag.\n⭐ taglientuc stop: Dừng quá trình tag liên tục.", threadID);
    }

    // Nếu mõm acc
    if (times >= 40 && delay <= 5000) {
      return api.sendMessage("😒😒 tag z mõm acc đó cu tăng thời gian lên", threadID);
    }

    // ✅ Gửi thông báo xác nhận bắt đầu tag
    api.sendMessage(
      `✅ Đã thêm ${tagName} vào danh sách gọi hồn\n` +
      `🔄 Số lần tag là: ${times}\n` +
      `⏰ Thời gian giữa các lần tag là ${delay / 1000} giây`,
      threadID
    );

    // Bắt đầu tag liên tục
    let count = 0;
    const interval = setInterval(() => {
      if (count >= times) {
        clearInterval(interval);
        taggedMap.delete(threadID);
        return;
      }

      api.sendMessage({
        body: `${tagName}`,
        mentions: [{
          tag: tagName,
          id: mentionID
        }]
      }, threadID);

      count++;
    }, delay);

    taggedMap.set(threadID, interval);
  }
};
=======
module.exports.config = {
    name: "taglientuc",
    version: "1.0.0",
    hasPermssion: 0,
    credits: "VanHung & Dựa trên demo của NTKhang",
    description: "Tag liên tục người bạn tag trong 5 lần\nCó thể gọi là gọi hồn người đó",
    commandCategory: "Box chat",
    usages: "taglientuc @mention",
    cooldowns: 90,
    dependencies: {
        "fs-extra": "",
        "axios": ""
    }
}

module.exports.run = async function({ api, args, Users, event}) {
    var mention = Object.keys(event.mentions)[0];
    if(!mention) return api.sendMessage("Cần phải tag 1 người bạn muốn gọi hồn", event.threadID);
    let name =  event.mentions[mention];
    var arraytag = [];
        arraytag.push({id: mention, tag: name});
    var a = function (a) { api.sendMessage(a, event.threadID); }
a("Bắt đầu gọi hồn!");
setTimeout(() => {a({body: "ra đây chơi em" + " " + name, mentions: arraytag})} , 3000);
setTimeout(() => {a({body: "ra đây chơi em" + " " + name, mentions: arraytag})} , 4000);
setTimeout(() => {a({body: "ra đây chơi em" + " " + name, mentions: arraytag})} , 5000);
setTimeout(() => {a({body: "ra đây chơi em" + " " + name, mentions: arraytag})} , 6000);
setTimeout(() => {a({body: "ra đây chơi em" + " " + name, mentions: arraytag})} , 6500);
setTimeout(() => {a({body: "ra đây chơi em" + " " + name, mentions: arraytag})} , 7000);
setTimeout(() => {a({body: "ra đây chơi em" + " " + name, mentions: arraytag})} , 7500);
setTimeout(() => {a({body: "ra đây chơi em" + " " + name, mentions: arraytag})} , 8000);
setTimeout(() => {a({body: "ra đây chơi em" + " " + name, mentions: arraytag})} , 8500);
setTimeout(() => {a({body: "ra đây chơi em" + " " + name, mentions: arraytag})} , 9000);
setTimeout(() => {a({body: "ra đây chơi em" + " " + name, mentions: arraytag})} , 9500);
setTimeout(() => {a({body: "ra đây chơi em" + " " + name, mentions: arraytag})} , 10000);
 }
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
