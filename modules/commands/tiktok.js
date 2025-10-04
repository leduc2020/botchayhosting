const axios = require("axios");
const fs = require("fs-extra");
<<<<<<< HEAD

module.exports.config = {
    name: "tiktok",
    version: "1.0.2",
    hasPermission: 0,
    credits: "Kz Khanhh",
    description: "Tìm kiếm video TikTok hoặc xem thông tin profile TikTok",
    commandCategory: "Tiện ích",
    usage: "tiktok <từ khóa> hoặc tiktok user <username>",
    cooldowns: 5
};

const formatNumber = (num) => {
    if (num >= 1000000) return (num / 1000000).toFixed(1) + 'M';
    if (num >= 1000) return (num / 1000).toFixed(1) + 'K';
    return num.toString();
};

const extractUsername = (input) => {
    if (input.includes('tiktok.com/@')) return input.split('@')[1].split('/')[0].split('?')[0];
    if (input.includes('tiktok.com/')) {
        const parts = input.split('/');
        const userIndex = parts.findIndex(part => part.startsWith('@'));
        if (userIndex !== -1) return parts[userIndex].substring(1);
    }
    if (input.startsWith('@')) return input.substring(1);
    return input;
};

module.exports.handleReply = async ({ api, event, handleReply }) => {
    const { threadID, messageID, body } = event;
    if (handleReply.author !== event.senderID || !body) return;

    const args = body.split(' ');
    if (isNaN(body)) return api.sendMessage("Vui lòng nhập số thứ tự hợp lệ!", threadID, messageID);
    const index = parseInt(body) - 1; // Khai báo biến index một lần ở đây

    switch (handleReply.type) {
        case 'search':
            const { videoInfo } = handleReply;
            if (index < 0 || index >= videoInfo.length) return api.sendMessage("Số thứ tự không hợp lệ!", threadID, messageID);

            api.setMessageReaction("⏳", event.messageID, () => {}, true);
            api.unsendMessage(handleReply.messageID);

            const { digg_count, comment_count, play_count, share_count, download_count, duration, region, title, nickname, unique_id, video_url } = videoInfo[index];
            try {
                const res = await axios.get(video_url, { responseType: "stream" });
                res.data.pipe(fs.createWriteStream(__dirname + "/cache/tiktok.mp4"));
                res.data.on("end", () => {
                    api.setMessageReaction("✅", event.messageID, () => {}, true);
                    api.sendMessage({
                        body: `====== TIKTOK =====
Quốc gia: ${region || 'Không có'}
Tiêu đề: ${title}
Kênh: ${nickname}
ID người dùng: ${unique_id}
Lượt thích: ${formatNumber(digg_count)}
Bình luận: ${formatNumber(comment_count)}
Lượt xem: ${formatNumber(play_count)}
Chia sẻ: ${formatNumber(share_count)}
Lượt tải: ${formatNumber(download_count)}
Thời gian: ${duration} giây`,
                        attachment: fs.createReadStream(__dirname + "/cache/tiktok.mp4")
                    }, threadID, () => fs.unlinkSync(__dirname + "/cache/tiktok.mp4"), messageID);
                });
            } catch (err) {
                console.log('Lỗi tải video:', err.message);
                api.sendMessage("Có lỗi khi tải video!", threadID, messageID);
                api.setMessageReaction("❌", event.messageID, () => {}, true);
            }
            break;

        case 'userVideos':
            const { videos } = handleReply;
            if (index < 0 || index >= videos.length) return api.sendMessage("Số thứ tự không hợp lệ!", threadID, messageID);

            api.setMessageReaction("⏳", event.messageID, () => {}, true);
            api.unsendMessage(handleReply.messageID);

            const selectedVideo = videos[index];
            const attachments = [];
            const tempFiles = [];

            try {
                const isPhotoPost = selectedVideo.duration === 0 && selectedVideo.images && selectedVideo.images.length > 0;

                if (isPhotoPost) {
                    const maxImages = Math.min(selectedVideo.images.length, 50);
                    for (let i = 0; i < maxImages; i++) {
                        try {
                            const imageResponse = await axios.get(selectedVideo.images[i], { responseType: 'arraybuffer' });
                            const imagePath = __dirname + `/cache/tikuser_image_${i}.jpg`;
                            fs.writeFileSync(imagePath, Buffer.from(imageResponse.data));
                            attachments.push(fs.createReadStream(imagePath));
                            tempFiles.push(imagePath);
                        } catch (e) {
                            console.log(`Lỗi tải ảnh ${i}:`, e.message);
                        }
                    }

                    api.setMessageReaction("✅", event.messageID, () => {}, true);
                    api.sendMessage({
                        body: `====== TIKTOK ẢNH =====
Tiêu đề: ${selectedVideo.title}
Tổng số ảnh: ${selectedVideo.images.length}
Lượt thích: ${formatNumber(selectedVideo.digg_count)}
Chia sẻ: ${formatNumber(selectedVideo.share_count)}
Lượt xem: ${formatNumber(selectedVideo.play_count)}
Đã gửi ${Math.min(maxImages, selectedVideo.images.length)} ảnh`,
                        attachment: attachments
                    }, threadID, () => {
                        tempFiles.forEach(file => {
                            try { fs.unlinkSync(file); } catch (e) { console.log('Lỗi xóa file:', e.message); }
                        });
                    }, messageID);
                } else {
                    if (selectedVideo.cover) {
                        try {
                            const imageResponse = await axios.get(selectedVideo.cover, { responseType: 'arraybuffer' });
                            const imagePath = __dirname + "/cache/tikuser_image.jpg";
                            fs.writeFileSync(imagePath, Buffer.from(imageResponse.data));
                            attachments.push(fs.createReadStream(imagePath));
                            tempFiles.push(imagePath);
                        } catch (e) {
                            console.log('Lỗi tải ảnh cover:', e.message);
                        }
                    }

                    if (selectedVideo.play && !selectedVideo.play.includes('.mp3')) {
                        const videoResponse = await axios.get(selectedVideo.play, { responseType: "stream" });
                        const videoPath = __dirname + "/cache/tikuser_video.mp4";
                        videoResponse.data.pipe(fs.createWriteStream(videoPath));

                        videoResponse.data.on("end", () => {
                            attachments.push(fs.createReadStream(videoPath));
                            tempFiles.push(videoPath);

                            api.setMessageReaction("✅", event.messageID, () => {}, true);
                            api.sendMessage({
                                body: `====== TIKTOK VIDEO =====
Tiêu đề: ${selectedVideo.title}
Thời gian: ${selectedVideo.duration}s
Lượt thích: ${formatNumber(selectedVideo.digg_count)}
Chia sẻ: ${formatNumber(selectedVideo.share_count)}
Lượt xem: ${formatNumber(selectedVideo.play_count)}
Đã gửi kèm ảnh cover + video`,
                                attachment: attachments
                            }, threadID, () => {
                                tempFiles.forEach(file => {
                                    try { fs.unlinkSync(file); } catch (e) { console.log('Lỗi xóa file:', e.message); }
                                });
                            }, messageID);
                        });

                        videoResponse.data.on("error", (err) => {
                            console.log('Lỗi stream video:', err);
                            tempFiles.forEach(file => {
                                try { fs.unlinkSync(file); } catch (e) {} });
                            api.sendMessage("Có lỗi khi tải video!", threadID, messageID);
                            api.setMessageReaction("❌", event.messageID, () => {}, true);
                        });
                    } else {
                        if (attachments.length > 0) {
                            api.setMessageReaction("✅", event.messageID, () => {}, true);
                            api.sendMessage({
                                body: `====== TIKTOK ÂM THANH =====
Tiêu đề: ${selectedVideo.title}
Lượt thích: ${formatNumber(selectedVideo.digg_count)}
Lượt xem: ${formatNumber(selectedVideo.play_count)}
Chỉ có ảnh cover (bài đăng âm thanh)`,
                                attachment: attachments
                            }, threadID, () => {
                                tempFiles.forEach(file => {
                                    try { fs.unlinkSync(file); } catch (e) {} });
                            }, messageID);
                        } else {
                            api.sendMessage("Không thể tải ảnh hoặc video!", threadID, messageID);
                            api.setMessageReaction("❌", event.messageID, () => {}, true);
                        }
                    }
                }
            } catch (err) {
                console.log(err);
                tempFiles.forEach(file => { try { fs.unlinkSync(file); } catch (e) {} });
                api.sendMessage("Có lỗi khi tải nội dung!", threadID, messageID);
                api.setMessageReaction("❌", event.messageID, () => {}, true);
            }
            break;
    }
};

module.exports.run = async ({ api, event, args }) => {
    api.setMessageReaction("⏳", event.messageID, () => {}, true);
    const input = args.join(" ");
    if (!input) return api.sendMessage("Vui lòng nhập từ khóa hoặc tên người dùng!", event.threadID, event.messageID);

    const isUserCommand = args[0].toLowerCase() === "user";
    const query = isUserCommand ? args.slice(1).join(" ") : input;

    if (isUserCommand) {
        // Xem thông tin profile
        const username = extractUsername(query);
        if (!username) return api.sendMessage("Tên người dùng không hợp lệ! Vui lòng nhập @username hoặc URL profile.", event.threadID, event.messageID);

        try {
            const profileResponse = await axios.get(`https://www.tikwm.com/api/user/info`, {
                params: { unique_id: username },
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });

            if (profileResponse.data.code !== 0) return api.sendMessage("Không tìm thấy người dùng này hoặc tài khoản bị riêng tư!", event.threadID, event.messageID);

            const userInfo = profileResponse.data.data.user;
            const stats = profileResponse.data.data.stats;

            let avatarAttachment = null;
            const avatarUrl = userInfo.avatarLarger || userInfo.avatarMedium || userInfo.avatarThumb;
            if (avatarUrl) {
                try {
                    const avatarResponse = await axios.get(avatarUrl, { responseType: 'arraybuffer' });
                    const avatarPath = __dirname + "/cache/tikuser_avatar.jpg";
                    fs.writeFileSync(avatarPath, Buffer.from(avatarResponse.data));
                    avatarAttachment = fs.createReadStream(avatarPath);
                } catch (e) {
                    console.log('Lỗi tải avatar:', e.message);
                }
            }

            const videosResponse = await axios.get(`https://www.tikwm.com/api/user/posts`, {
                params: { unique_id: username, count: 10, cursor: 0 },
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });

            let videosList = '';
            let videos = [];
            if (videosResponse.data.code === 0 && videosResponse.data.data.videos) {
                videos = videosResponse.data.data.videos.slice(0, 5);
                videosList = '\n\nVideo mới nhất:\n===================\n';
                videos.forEach((video, index) => {
                    const title = video.title.length > 50 ? video.title.substring(0, 50) + '...' : video.title;
                    const isPhotoPost = video.duration === 0 && video.images && video.images.length > 0;
                    const postType = isPhotoPost ? '[Ảnh]' : (video.play && video.play.includes('.mp3') ? '[Âm thanh]' : '[Video]');
                    videosList += `${index + 1}. ${postType} ${title}\n   Xem: ${formatNumber(video.play_count)} | Thích: ${formatNumber(video.digg_count)}${isPhotoPost ? ` | Ảnh: ${video.images.length}` : ''}\n---------------\n`;
                });
                videosList += '\nTrả lời tin nhắn này với số thứ tự để tải video!';
            }

            let socialLinks = '';
            const socials = [];
            if (userInfo.ins_id && userInfo.ins_id.trim()) socials.push(`Instagram: @${userInfo.ins_id}`);
            if (userInfo.twitter_id && userInfo.twitter_id.trim()) socials.push(`Twitter: @${userInfo.twitter_id}`);
            if (userInfo.youtube_channel_title && userInfo.youtube_channel_id) socials.push(`YouTube: ${userInfo.youtube_channel_title}`);
            if (socials.length > 0) socialLinks = '\n\nMạng xã hội:\n=============\n' + socials.join('\n');

            const profileInfo = `====== TIKTOK TÀI KHOẢN =====
Tên: ${userInfo.nickname || 'Không có'}
Tên người dùng: @${userInfo.uniqueId || username}
Mô tả: ${userInfo.signature || 'Không có mô tả'}
Thống kê:
- Người theo dõi: ${formatNumber(stats.followerCount || stats.follower_count || 0)}
- Đang theo dõi: ${formatNumber(stats.followingCount || stats.following_count || 0)}
- Tổng lượt thích: ${formatNumber(stats.heartCount || stats.heart_count || stats.total_likes || 0)}
- Tổng video: ${formatNumber(stats.videoCount || stats.video_count || 0)}
Đã xác minh: ${userInfo.verified ? 'Có' : 'Không'}
Riêng tư: ${userInfo.secret || userInfo.privateAccount ? 'Có' : 'Không'}${socialLinks}${videosList}`;

            api.setMessageReaction("✅", event.messageID, () => {}, true);
            api.sendMessage({ body: profileInfo, attachment: avatarAttachment }, event.threadID, (err, info) => {
                if (err) return console.log(err);
                if (avatarAttachment) {
                    try { fs.unlinkSync(__dirname + "/cache/tikuser_avatar.jpg"); } catch (e) { console.log('Lỗi xóa avatar:', e.message); }
                }
                if (videos.length > 0) {
                    global.client.handleReply.push({
                        name: module.exports.config.name,
                        author: event.senderID,
                        messageID: info.messageID,
                        videos,
                        type: "userVideos"
                    });
                }
            });
        } catch (err) {
            console.log('Lỗi khi gọi TikWM API:', err.message);
            api.sendMessage("Có lỗi khi lấy thông tin tài khoản. Vui lòng kiểm tra tên người dùng và thử lại!", event.threadID, event.messageID);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
        }
    } else {
        // Tìm kiếm video
        try {
            const response = await axios.get(`https://www.tikwm.com/api/feed/search`, {
                params: { keywords: query, count: 12, cursor: 0, HD: 1 },
                headers: { 'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36' }
            });

            const result = response.data.data.videos;
            if (!result || result.length === 0) return api.sendMessage("Không tìm thấy kết quả nào!", event.threadID, event.messageID);

            const lengthResult = result.length > 9 ? 9 : result.length;
            let videoInfo = [];
            let msg = `Tìm thấy ${lengthResult} kết quả phù hợp với từ khóa\n===================\n`;
            let nameATM = [], attachment = [];

            for (let i = 0; i < lengthResult; i++) {
                const video = result[i];
                const digg_count = video.digg_count || 0;
                const comment_count = video.comment_count || 0;
                const play_count = video.play_count || 0;
                const share_count = video.share_count || 0;
                const download_count = video.download_count || 0;
                const duration = video.duration || 0;
                const region = video.region || 'Không có';
                const title = video.title || 'Không có tiêu đề';
                const nickname = video.author?.nickname || 'Không rõ';
                const unique_id = video.author?.unique_id || 'Không rõ';
                const video_url = video.play || video.wmplay || '';
                const cover = video.cover || video.origin_cover || '';

                if (cover) {
                    try {
                        let stream_ = await axios.get(encodeURI(cover), { responseType: 'arraybuffer' });
                        const tempDir = __dirname + `/tikinfo${Date.now()}${i}.png`;
                        fs.writeFileSync(tempDir, Buffer.from(stream_.data, 'utf8'));
                        nameATM.push(tempDir);
                        attachment.push(fs.createReadStream(tempDir));
                    } catch (e) {
                        console.log('Lỗi tải ảnh cover:', e.message);
                    }
                }

                msg += `Kết quả ${i + 1}\nTác giả: ${nickname}\nTiêu đề: ${title}\nThời gian: ${duration} giây\n===================\n`;
                videoInfo.push({ digg_count, comment_count, play_count, share_count, download_count, region, nickname, title, video_url, cover, unique_id, duration });
            }

            api.setMessageReaction("✅", event.messageID, () => {}, true);
            msg += '\nTrả lời tin nhắn này với số thứ tự để tải video!';

            api.sendMessage({ body: msg, attachment }, event.threadID, (err, info) => {
                if (err) return console.log(err);
                nameATM.forEach(pa => {
                    try { fs.unlinkSync(pa); } catch (e) { console.log('Lỗi xóa file:', e.message); }
                });
                global.client.handleReply.push({
                    name: module.exports.config.name,
                    author: event.senderID,
                    messageID: info.messageID,
                    videoInfo,
                    type: "search"
                });
            });
        } catch (err) {
            console.log('Lỗi khi gọi TikWM API:', err.message);
            api.sendMessage("Có lỗi khi tìm kiếm video TikTok. Vui lòng thử lại sau!", event.threadID, event.messageID);
            api.setMessageReaction("❌", event.messageID, () => {}, true);
        }
    }
=======
const request = require("request");
module.exports.config = {
  name: "tiktok",
  version: "1.0.0",
  hasPermssion: 0,
  credits: "SenThanh & mod by DongDev",
  description: "Thông tin từ nền tảng TikTok",
  commandCategory: "Tiện ích",
  usages: "",
  cooldowns: 5,
  usePrefix: false,
  images: [],
};

const roof = n => +n != +Math.floor(n) ? +Math.floor(n) + 1 : +n;
const localeStr = n => ((+n).toLocaleString()).replace(/,/g, '.');
const {
    get
} = require('axios'),
{
    createReadStream,
    mkdirSync,
  rmdirSync,
  unlinkSync
  } = require('fs-extra'),
  {
  image
  } = require('image-downloader');
  module.exports.handleReply = async ({ api, event, handleReply }) => {
  const $ = handleReply;
  if($.case == 'runListUserPost') {
      if(['list'].includes(event.args[0])){
          if(event.args[1] > roof($.data.length/6) || event.args[1]<1 || isNaN(event.args[1])) return api.sendMessage(`❎ Trang ${event.args[1]} không nằm trong danh sách`, event.threadID, event.messageID); else return runListUserPost(api, event, $.data, 6,+event.args[1],$.type ,$.author);
      } else return api.sendMessage({body: $.type?infoVideoUserPost($.data[event.args[0]-1]):infoMusicUserPost($.data[event.args[0]-1].music_info),attachment: await downStreamURL($.data[event.args[0]-1][$.type?'play':'music'],__dirname+`/cache/${event.messageID}.${$.type?'mp4':'mp3'}`)}, event.threadID, () => unlinkSync(__dirname+`/cache/${event.messageID}.${$.type?'mp4':'mp3'}`), event.messageID);
  };
  const { threadID, messageID, body } = event;
  if (handleReply.author != event.senderID || !body) return;
  let args = body.split(' ');
  switch (handleReply.type) {
  case 'trending':
    const lower1 = args[0].toLowerCase();
    const lower2 = !args[1] ? '' : args[1].toLowerCase();
    if (lower1 == 'trang') {
      if (isFinite(lower2) && lower2 <= roof(handleReply.data.data.length / 6)) return runInfoTrending(handleReply.data, api, event, this.config.name, 6, +lower2)
      else return api.sendMessage(`❎ Không tìm thấy trang ${lower2} trong danh sách`, threadID, messageID);
    }
    if (isFinite(lower1) && !!lower2 && !['wm'].includes(lower2)) return api.sendMessage(`⚠️ Vui lòng nhập đúng định dạng`, threadID, messageID);
    const data = handleReply.data.data[(+lower1) - 1];
    const info = { url: data[(!lower2 ? '' : lower2) + 'play'], msg: infoVideo(data) };
    axios.get(info.url, { responseType: 'stream' }).then(response => api.sendMessage({ body: info.msg, attachment: response.data }, threadID, messageID)).catch(e => api.sendMessage(e, threadID, messageID));
  case 'search':
    if (isNaN(body)) return;
    const { videoInfo } = handleReply;
    const index = parseInt(body) - 1;
    if (index < 0 || index >= videoInfo.length) return api.sendMessage("❎ Số thứ tự không hợp lệ", threadID, messageID);
      
      api.unsendMessage(handleReply.messageID);

    const { digg_count, comment_count, play_count, share_count, download_count, duration, region, title, nickname, unique_id } = videoInfo[index];
    axios.get(videoInfo[index].nowatermark, { responseType: "stream" }).then(res => {
      res.data.pipe(fs.createWriteStream(__dirname + "/cache/tiktok.mp4"));
      res.data.on("end", () => {
        api.sendMessage({ body: `[ VIDEO TIKTOK ]\n────────────────────\n🗺️ Quốc gia: ${region}\n📝 Tiêu đề: ${title}\n🌾 Tên kênh: ${nickname}\n📌 ID người dùng: ${unique_id}\n❤️ Lượt tim: ${digg_count}\n💬 Tổng bình luận: ${comment_count}\n🔎 Lượt xem: ${play_count}\n🔀 Lượt chia sẻ: ${share_count}\n⬇️ Lượt tải: ${download_count}\n⏳ Thời gian: ${duration} giây`, attachment: fs.createReadStream(__dirname + "/cache/tiktok.mp4") }, threadID, () => fs.unlinkSync(__dirname + "/cache/tiktok.mp4"), messageID);
      });
    }).catch(err => console.log(err));
    break;
   }
};

module.exports.run = async ({ api, event, args }) => {
  const axios = require("axios");
  const fs = require('fs-extra');
  const tm = process.uptime(),Tm=(require('moment-timezone')).tz('Asia/Ho_Chi_Minh').format('HH:mm:ss | DD/MM/YYYY')
    h=Math.floor(tm / (60 * 60)),H=h<10?'0'+h:h,
    m=Math.floor((tm % (60 * 60)) / 60),M=m<10?'0'+m:m,
    s=Math.floor(tm % 60),S=s<10?'0'+s:s,$=':'
  const img = (await axios.get(`https://i.imgur.com/NnKG3KM.jpg`, { responseType: "stream"})).data
  if (!args[0]) return api.sendMessage({body:"[ TIKTOK - Hướng Dẫn Sử Dụng ]\n────────────────────\n→⁠ tiktok info + id: xem thông tin người dùng\n→ tiktok video + link: tải video tiktok\n⁠→⁠ tiktok music + link: tải âm thanh của video\n→⁠ tiktok search + từ khóa: tìm kiếm video thông qua từ khóa\n→⁠ tiktok trending: random trending tiktok\n→⁠ tiktok post + id: xem những bài đăng của người dùng", attachment: (img)},event.threadID);
  if (args[0] == 'post') return runListUserPost(api, event, (await get(`https://www.tikwm.com/api/user/posts?unique_id=${args[1]}`)).data.data.videos, 6, 1, true, event.senderID);
  const { threadID, messageID } = event;
  const type = args[0];
  const keyword = args[1];
  switch (type.toLowerCase()) {
    case "-i":
    case "info":
      if (!args[1]) return api.sendMessage("⚠️ Bạn chưa nhập tên tài khoản của người dùng cần xem thông tin", threadID);
      try {      axios.get(encodeURI(`https://www.tikwm.com/api/user/info?unique_id=${keyword}`)).then(async (res) => {
          if (res.data.erro == 1) return api.sendMessage("⚠️ Tên tài khoản không tồn tại", threadID);
          const { id, signature, uniqueId, nickname, region, relation } = res.data.data.user;
          const { followerCount, videoCount, heartCount, followingCount } = res.data.data.stats;
          var img =  res.data.data.user.avatarMedium;
        var path = __dirname + "/cache/1.png";
    let getimg = (await axios.get(`${img}`, { responseType: 'arraybuffer' })).data;
  fs.writeFileSync(path, Buffer.from(getimg, "utf-8"));
  let msg = `[ TIKTOK INFO USER ]\n────────────────────\n👤 Tên tài khoản: ${uniqueId}\n✏️ ID: ${id}\n🔰 Tên người dùng: ${nickname}\n🌐 URL: https://www.tiktok.com/@${uniqueId}\n📝 Mô tả: ${signature}\n👫 Mối quan hệ: ${relation}\n📌 Lượt theo dõi: ${followerCount}\n📎 Đang theo dõi: ${followingCount}\n🔎 Tổng video: ${videoCount}\n❤️ Lượt tim: ${heartCount}\n────────────────────\n⏰ Time: ${Tm}`.replace(/^ +/gm, '')
            return api.sendMessage({
              body: msg,
              attachment: fs.createReadStream(__dirname + "/cache/1.png")}, event.threadID, event.messageID); 
        })
      } catch (error) { console.log(error) }
      break
    case 'search':
    case 'seach':
    case '-s':
      args.shift();
      const search = args.join(" ");
      if (!search) return api.sendMessage("⚠️ Bạn chưa nhập từ khóa tìm kiếm", threadID);
      axios.get(`https://www.tikwm.com/api/feed/search?keywords=${encodeURI(search)}`).then(async res => {
        const { videos: result } = res.data.data;
        if (result.length == 0) return api.sendMessage("⛔ Không tìm thấy kết quả nào", threadID);

        const lengthResult = result.length > 9 ? 9 : result.length;
        let videoInfo = [];
        let msg = `[ TIKTOK SEARCH ]\n────────────────────\n📝 Hệ thống tìm thấy ${lengthResult} kết quả phù hợp với từ khóa của bạn:\n`;
        let nameATM = [], attachment = [];
        for (let i = 0; i < lengthResult; i++) {
          const { digg_count, comment_count, play_count, share_count, download_count, duration, region, title, play: nowatermark, origin_cover: cover } = result[i];
          const { nickname, unique_id } = result[i].author;
          let stream_ = await axios.get(encodeURI(cover), { responseType: 'arraybuffer' });
            const tempDir = __dirname + "/cache/" + Date.now() + ".png";
          fs.writeFileSync(tempDir, Buffer.from(stream_.data, 'utf8'));
          nameATM.push(tempDir);
          attachment.push(fs.createReadStream(tempDir));
          msg += `\n\n${i + 1}. ${nickname}\n📃 Tiêu đề: ${title}\n⏳ Thời gian: ${duration} giây`;
          videoInfo.push({ digg_count, comment_count, play_count, share_count, download_count, region, nickname, title, nowatermark, cover, unique_id, duration });
        }
        msg += `\n────────────────────\n📌 Phản hồi tin nhắn này theo số thứ tự của video cần tải\n⏰ Time: ${Tm}`;

        api.sendMessage({body: msg, attachment}, threadID, (err, info) => {
          if (err) return console.log(err);
          nameATM.forEach(pa => fs.unlinkSync(pa));
          global.client.handleReply.push({
            name: this.config.name,
            author: event.senderID,
            messageID: info.messageID,
            videoInfo,
            type: "search"
          })
        })
      }).catch(err => console.log(err));
      break
    case "-v":
    case "video":
      try {   
        const res = await axios.get(`https://www.tikwm.com/api/?url=${keyword}`);
        const { play, author, digg_count, comment_count, play_count, share_count, download_count, title, duration, region } = res.data.data;
        var callback = () => api.sendMessage({ body: `[ VIDEO TIKTOK ]\n────────────────────\n🗺️ Quốc gia: ${region}\n📝 Tiêu đề: ${title}\n👤 Tên kênh: ${author.nickname}\n🌾 ID người dùng: ${author.unique_id}\n❤️ Lượt tim: ${digg_count}\n💬 Tổng bình luận: ${comment_count}\n🔎 Lượt xem: ${play_count}\n🔀 Lượt chia sẻ: ${share_count}\n⬇️ Lượt tải: ${download_count}\n⏳ Thời gian: ${duration} giây`, attachment: fs.createReadStream(__dirname + "/cache/tkvd.mp4") }, threadID, () => fs.unlinkSync(__dirname + "/cache/tkvd.mp4"), messageID);
        request(encodeURI(`${play}`)).pipe(fs.createWriteStream(__dirname + '/cache/tkvd.mp4')).on('close', () => callback());
      }
      catch (err) {
        console.log(err)
        return api.sendMessage("Đã xảy ra lỗi...", event.threadID);
      }
      break;
    case "-m":
    case "music":
      try {
        const res = await axios.get(`https://www.tikwm.com/api/?url=${keyword}`);
        const { music, music_info } = res.data.data;
        var callback = () => api.sendMessage({ body: `[ MUSIC TIKTOK ]\n────────────────────\n📝 Tiêu đề audio: ${music_info.title}\n✏️ Album: ${music_info.album}\n👤 Tác giả: ${music_info.author}\n⏳ Thời gian: ${music_info.duration} giây`, attachment: fs.createReadStream(__dirname + "/cache/tkvd.mp3") }, threadID, () => fs.unlinkSync(__dirname + "/cache/tkvd.mp3"), messageID);
        request(encodeURI(`${music}`)).pipe(fs.createWriteStream(__dirname + '/cache/tkvd.mp3')).on('close', () => callback());
      }
      catch (err) {
        console.log(err)
        return api.sendMessage("❎ Đã xảy ra lỗi...", event.threadID);
      }
      break;
    case "-tr":
    case "trending":
      axios.get(`https://www.tikwm.com/api/feed/list?region=VN`).then(response_api => {
        runInfoTrending(response_api.data, api, event, this.config.name, 6, args[1] && isNaN(args[1]) ? args[1] : 1)
      }).catch(e => api.sendMessage(e, event.threadID, event.messageID));
    default:
      break
  }
}
module.exports.handleReaction = function({
    handleReaction: $, api, event
}){
    if($.case == 'runListUserPost') return runListUserPost(api, event, $.data, 6,1,$.type?false:true,$.author);
};
async function runInfoTrending(res, api, event, name, length, limit) {
  let dirTD = `${__dirname}/cache/tiktok_trending_${event.senderID}`;
  if (!fs.existsSync(dirTD)) fs.mkdirSync(dirTD, { recursive: true });
  const attachment = [];
  var txt = `[ TIKTOK TRENDING ]\n────────────────────\n`

  for (var i = (length * limit) - length; i < length * limit; i++) {
    if (!res.data || !res.data[i]) break;
    const { title, origin_cover, duration, video_id } = res.data[i];

    const dest = `${dirTD}/${video_id}.jpg`
    txt += `${i + 1}. ${title.split(' ').filter(i => !i.startsWith('#')).join(' ')}\n🔗 Hashtag: ${title.split(' ').filter(i => i.startsWith('#')).join(', ')}\n⏳ Thời gian: ${duration} giây\n\n`;
    await DownloadImage(origin_cover, dest);
    attachment.push(fs.createReadStream(dest));
  };
  txt += `\n────────────────────\n📝 Trang [ ${limit} | ${roof(res.data.length / length)} ]\n📌 Phản hồi tin nhắn này theo số thứ tự để tải video không logo hoặc số thứ tự + wm để tải video có logo\n✏️ Phản hồi tin nhắn này < trang + số trang > để chuyển trang`;

  api.sendMessage({ body: txt, attachment }, event.threadID, (err, info) => {
    if (err) return console.log(err);
    const obj = {
      name: name,
      messageID: info.messageID,
      author: event.senderID,
      data: res,
      type: 'trending'
    }
    global.client.handleReply.push(obj);
    fs.rmdirSync(dirTD, { recursive: true });
  });
};

function DownloadImage(url, path) {
  return new Promise((resolve, reject) => {
    request(url)
      .pipe(fs.createWriteStream(path))
      .on('close', () => resolve())
      .on('error', reject);
  });
}

function infoVideo(data) {
  return `[ INFO VIDEO TIKTOK ]\n────────────────────\n🗺️ Quốc gia: ${data.region}\n📝 Tiêu đề: ${data.title.split(' ').filter(i => !i.startsWith('#')).join(' ')}\n📌 Hashtag: ${data.title.split(' ').filter(i => i.startsWith('#')).join(', ')}\n❤️ Lượt tim: ${localeStr(data.digg_count)}\n💬 Tổng bình luận: ${localeStr(data.comment_count)}\n🔀 Lượt chia sẻ: ${localeStr(data.share_count)}\n⬇️ Lượt tải: ${localeStr(data.download_count)}\n⏳ Thời gian: ${data.duration} giây\n🌾 ID người dùng: ${data.author.unique_id}\n👤 Tên người dùng: ${data.author.nickname}`;
};
function infoAudio(data) {
  return `[ INFO AUDIO TIKTOK ]\n────────────────────\n📝 Tiêu đề Audio: ${data.music_info.title}\n⏳ Thời gian: ${data.music_info.duration} giây\n👤 Tên tác giả: ${data.music_info.author}\n🎵 Âm thanh gốc: ${data.music_info.original == true ? 'Có' : 'Không'}`;
};
/* /// */
async function downStreamURL(a, b) {
    await image({
        url: a, dest: b
    });
    return createReadStream(b);
};
function infoMusicUserPost(a){
    return `[ INFO AUDIO TIKTOK]\n────────────────────\n📌 ID: ${a.id}\n📝 Tiêu đề: ${a.title}\n- Thời gian: ${a.duration}s\n🎵 Nhạc gốc: ${a.original}\n👤 Tác giả: ${a.author}\n✏️ Album: ${a.album}`;
};
 function infoVideoUserPost(a){
     return `[ INFO VIDEO TIKTOK ]\n────────────────────\n📌 ID: ${a.video_id}\n📝 Tiêu đề: ${a.title}\n- Lượt thích: ${a.digg_count}\n💬 Lượt bình luận: ${a.comment_count}\n🔀 Lượt chia sẻ: ${a.share_count}\n⬇️ Lượt tải: ${a.download_count}\n⏳ Thời gian: ${a.duration}s\n👤 Tên: ${a.author.nickname}\n🌾 ID: ${a.author.unique_id}`;
 };
 async function runListUserPost(a, b, c, d, e,g,h) {
     const dir = __dirname + '/cache/downStreamURL_'+b.messageID;
    mkdirSync(dir);
    var txt = '',
    atm = [],
    i = (d*e)-d,
    l = c.length;
    for (;i<d*e;i++){
        const j = g?c[i]:c[i].music_info;
        if(!j)break;
        txt += `${i+1}. ${j.title} (${j.duration}s)\n`;
        atm.push(await downStreamURL(g?j.origin_cover:j.cover, `${dir}/${g?j.video_id:j.id}.jpg`));
        };
        txt+=`\n📝 Trang [ ${e}/${roof(c.length/d)} ]\n\n📌 Phản hồi + < STT > để tải ${g?'video':'music'}\n👉 Phản hồi + < list > + < STT > để chuyển trang\n🔎 Reaction để chuyển qua danh sách ${g?'music':'video'}`;

a.sendMessage({body: txt, attachment: atm}, b.threadID, (err, data)=> {
    const opt = {
                name: 'tiktok', messageID: data.messageID, author: h, type: g, 'case': 'runListUserPost', data: c
            };
            global.client.handleReaction.push(opt), global.client.handleReply.push(opt);
        rmdirSync(dir, {
            recursive: true
        })
    });
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
};