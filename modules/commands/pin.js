<<<<<<< HEAD
const axios = require('axios');
const fs = require('fs');
const path = require('path');
const querystring = require('querystring');

module.exports.config = {
    name: "pin",
    version: "3.0.0",
    hasPermission: 0,
    credits: "dgk",
    description: "Tìm kiếm hình ảnh Pinterest",
    commandCategory: "media",
    usages: "[từ khóa]",
    cooldowns: 5
};

// thay cookie 
const PINTEREST_COOKIE = 'csrftoken=6044a8a6c65d538760e70c78b3c82bd0; ar_debug=1; _routing_id="26362549-c12f-4ef0-ad1a-46db9831079e"; sessionFunnelEventLogged=1; _auth=1; _pinterest_sess=TWc9PSZ1RWUyRGQrWVRsSzdacUVIaU9VQkZoWGZlUGkxcnh4SmhGTmpoSkdlNm8vckg3QXBjV2swV0VDbDEvaTFuMUx4UUlVUVlKRUwvbVp4aWJGcnlhVDg2QmNFT0hPaG9NdWxsVGlNNUtvbDg1THE0Kyt0OFZJdGw3dVBBUEU0VHViMXdBaTlZbzFodEFDYTE1c0lMUFpRTHB2OGowN1JidVBxanQrdkxGWEZwc3pqRGdNZm5CWDFDYWlLakE1UUFWQXhuNWtzdjVCR0Q0UjB6LzlHa05BcHh6amhzcTc0WmNLaGdteDRxTFJPU3ZFTElHNS84WTVkOGtxc0ZPNUNWYnRMTHVOdk8vTXN5eFRuWWVJeWo3ZUdhWHZFek9abUQ4eWZBTHZtZTdta0dmdzJXcUp5d08zTVdobEE2NU92akJkeUE4bVVFRmVMZkRnRVpVSU84Y1k1bFh4ZHAzRklTVVlobGwvQzFmN2Q0U2FGTFRlWHVYS3BTbVIwWFd0a3NrMmRXZXdRMEs3MHZSbnd4aTVuRWl6aUFNckwwM2tya29RRXNMaElRQ29mM3l5aWlGSmJHczZvR2RkdjhzaTl6TGF0R1h2TnpUNG5Yb3p4ZkdpMWtHaTRlRjlLSzdsR3lpZXJpRUZRSGt0dFVOaFBaY0taY2h6bS9JTFc1RzE2TEV0UzZlZTJWdEZsNWJkRmk0aFlVVysvcGtVVzU4d1NtelN5VmY5cTlya1EzMVNoNFJTdHJXdmgwNm5qSkZFMk90bmw4bnQyeXdPU086U0pJWm1SUGdqb3BYa1pxWkE5Vk9mUm5DWW96YTBrdFZKZ2g4V1hEcEZwU3JBK3V5YmhxenkzZ3VkZmN1ZXlKOXBpOUtwT1d5QVg3bHhrMjBmaWl6L3JtRHFWUWprZ3FGWUY0K3JDQUd0aXFjSGYzYUFKY3JsYnJLa29NT3ZITTkzaWl0enFjeE9lMkhTbXh5amVYL0ZFaFY0cEJJbnNlZGd1Ry9hS3R3c3N4YXMwSGxCZkRzY3djY0sxUGxOVWJPQk5TaUdxWS93Rmp1SWo4dDVENE1yL2lWUjRUQnJ1cUw1dWxjbzgxN3VuK01PalhlQWFPbWZ6K0VMRm1GdUdYR1dwUVVSUVJMS3ZzaWNVMDd2TERoVHoyWUZqVDEzdVRqNEpkZjZoVCtpcnlwV09VYUc5Z0hyOGZUbS9mQWZ1R1lOYzQ0d0FzUHlWVmRodWRGK0NiaU0ycjhVNklheHNKZ0FIbHg5VE41ajlpVWVoNnUycXFzNk5uOGdBRUdSYzZoRXBqMElaTjVYQTIyVTNtS3QwdjdHVDA4TUNTcm9XdEx6QzN1ajZMM2pkQkpKTXIrZWpvcXQ4REZiYkVsdlNPd2V0T1puRUdpUFpGSnh1T00vczlCWjV5VEtIQ3IzWDdneXZmREJlNHVUTTIwSkVEOWQ3cUdBYnlRT3diTFhNVEJkQysyTzUwMFlRL01td1JHN2JlZkM3Y1RnNnVZSjJPOUI5QXl6a2hncUFKVnZ5UG9SVHpZUU9HMGFGMGJvTHllcjNLaFRlTTN4cDZnZzhvT1NmVXR5VlBEMmJFUGI4TjVjMDB1b0VnUUdHcGUvMFFITnM1SkJ3d1ZMRHBIRU9aczc2QjhkNVZkQU1tNHBnK05Fdy93YjlXNkVLL3BwSE9TeUtsY0oyM2YvM0FiSEJNUWZVcTIrcUdJRDNsQTV3WEFlQmNwd2VyZnZKQ0NUaWhYUnV4NUt6UjBTYW9oL051L2NuRURheEpMRElMdlhFbS9SeVMzMkUmc0NoSFhDWTk2Q2ZLelltOXNGWDFack1LcEhVPQ==; __Secure-s_a=Y1QvZ05nSmNURGdxemx6L1UwOUFkUTFsYVB1eEgwK2lEbHJMZXNzeW80SjZqMXhoazVVUVZVRVFaWkpOWWRSS3JjZFBCQW5rb1NCRE15djFDS3FIVDE1WUdDL0Z6UkdFMW1kcVBKYndnTVA0dUN4bDVOVzhod0E0TmlGSlhCYkpzYVdwWFNTRUxpbkk3bDFDamp2UG5UY0szd0pmMy9wbFlzZkJnWEpYRkdmN2FaT2Z5bFA1aUgybG1OYTlqamw5RmZtL1RmQzlNcmkwQXZGZkRtWlVqM1N2M29LV3RYRnVmNSs4ZU5odjVYRTRDWkZRRHkwZ1VLbXhMZUVicFpBT0EvbHVWL0hyeDhuOC85RmxBd0lTSEZvQVVLSkpXNWNFNnhoWWFFbVBiNmxxR3MzM0V6Rjl1TjV6RlJQa3hkdGFjeWVkOFN4ZmRobkZCeUJ3d2xkR0hmKzRmWkw3TFAwc08xc0wvbS9XL3drbmVVdjJtUmV5M1hRYUpmLzJsQnNWWStEUmt5T28rYU1zQ0gyY1F2djJ6V1Z2anovcGlydVVYc2xjK2IzR2xNTnI4cmNobkZXL2szSTFka01LWUE5ckxOS0NmclNDSHRoTTlObzFMTk1YNGRHZnJoVmlXYVQxdElOelJERW5sNm5Sc2hoYXB3b2lmVzJDd0ZqWUlqWjExOUtYZjVsRW42Z2U2YnBkMDdXb2VBU2duV2NxaVRJOC93azE4TytMK0hWM3FrRmJZOUNhMXZ3MXZoa2lNeHg4OUQ2SGlERm1CczhJQkp0RERDZERxMWF5aFV5QlFTSERYN09vbWEwaUxLTVV6VzZ1anhYbUJtbG4zcDRqNVJ6SEZTTXFaT0lna00rQUFCZkt0VWp1UEFWVjVPY3cySUpYbU5CTHVHaGxWNit0dFF5QVpHY09nTVduOVZTY2IvblJDeUcrV3dWZG9qNlRSQ3cxcVhSTDBRbWxINGZtZVNkaE41R1djMzdjbjBhbzJDa2kxVk85SVlIeXlSSW9QNndmY2VqWjFzUXoyaFZPYVNnUXF6dm1SbWZWa0ttTk5hRWFqV0FtYWVNYkgzM0s1Q1BNVGd0Szdwb2pIcWJ5eS94QXVMTkZ6VHNRdlNUQmFGeUVpbDFkY1VTa3A1RHhwWHkyNzgvM0RFTnplUnk3Y0l1R01yQjhFVHAxU2Q2R2NjRVlhTUs1TWoycXozMGdGZ084TDVmbXBYVXBQVHVPTXNQaHVLVWdzeWFld3drTTZtNWRvcjJ5bmU5WExwR1B0V3NkNFVEY2VvQzB1QzVkUDJVVU40L00rNGhpNWtLcHl5U2ZMWFBVM3ZtYWtaQT0mU09YaVFnRExQMi9XRWNxRFJMSHA1NkIzaE80PQ==; _b="AYovPepp2ENJH6lC2RgyOsJvWs+laEqNVOhdITARklV8PlbhotyboglDk79sjQRzsm4="';

module.exports.run = async function({ api, event, args }) {
    const { threadID, messageID } = event;
    
    if (!args[0]) {
        return api.sendMessage("⚠️ Vui lòng nhập từ khóa tìm kiếm!\nVí dụ: pin mèo", threadID, messageID);
    }
    
    const query = args.join(" ");
    api.sendMessage(`🔍 Đang tìm kiếm "${query}" trên Pinterest...`, threadID, messageID);
    
    try {
        
        const searchUrl = `https://www.pinterest.com/resource/BaseSearchResource/get/`;
        
        const postData = {
            source_url: `/search/pins/?q=${encodeURIComponent(query)}&rs=typed`,
            data: JSON.stringify({
                options: {
                    article: null,
                    appliedProductFilters: "---",
                    auto_correction_disabled: false,
                    corpus: null,
                    customized_rerank_type: null,
                    filters: null,
                    query: query,
                    query_pin_sigs: null,
                    redux_normalize_feed: true,
                    rs: "typed",
                    scope: "pins",
                    source_id: null,
                    no_fetch_context_on_resource: false
                },
                context: {}
            })
        };
        
        const response = await axios.post(searchUrl, querystring.stringify(postData), {
            headers: {
                'Accept': 'application/json, text/javascript, */*, q=0.01',
                'Accept-Language': 'en-US,en;q=0.9,vi;q=0.8',
                'Content-Type': 'application/x-www-form-urlencoded',
                'Cookie': PINTEREST_COOKIE,
                'Origin': 'https://www.pinterest.com',
                'Referer': `https://www.pinterest.com/search/pins/?q=${encodeURIComponent(query)}`,
                'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36',
                'X-APP-VERSION': '9960888',
                'X-CSRFToken': '6044a8a6c65d538760e70c78b3c82bd0',
                'X-Pinterest-AppState': 'active',
                'X-Pinterest-Source-Url': `/search/pins/?q=${encodeURIComponent(query)}`,
                'X-Requested-With': 'XMLHttpRequest'
            }
        });
        
      
        const data = response.data;
        const results = data?.resource_response?.data?.results || [];
        
        if (results.length === 0) {
            return api.sendMessage(`Không tìm thấy kết quả nào cho "${query}"`, threadID, messageID);
        }
        
        
        const pins = results.slice(0, 10);
        const attachments = [];
        let message = `📌 Kết quả tìm kiếm Pinterest cho "${query}":\n\n`;
        
        
        for (let i = 0; i < pins.length; i++) {
            const pin = pins[i];
            const imageUrl = pin.images?.['474x']?.url || pin.images?.['236x']?.url || pin.images?.orig?.url;
            const title = pin.grid_title || pin.title || pin.description || `Hình ${i + 1}`;
            
            if (imageUrl) {
                try {
                    const imagePath = path.join(__dirname, 'cache', `pin_${Date.now()}_${i}.jpg`);
                    const imageResponse = await axios.get(imageUrl, { 
                        responseType: 'stream',
                        headers: {
                            'Referer': 'https://www.pinterest.com/',
                            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/138.0.0.0 Safari/537.36'
                        }
                    });
                    
                    const writer = fs.createWriteStream(imagePath);
                    imageResponse.data.pipe(writer);
                    
                    await new Promise((resolve, reject) => {
                        writer.on('finish', resolve);
                        writer.on('error', reject);
                    });
                    
                    attachments.push(fs.createReadStream(imagePath));
                    const pinUrl = `https://www.pinterest.com/pin/${pin.id}/`;
                    message += `${i + 1}. ${title.substring(0, 50)}${title.length > 50 ? '...' : ''}\n`;
                    message += `   🔗 ${pinUrl}\n\n`;
                    
                    
                    setTimeout(() => {
                        try {
                            fs.unlinkSync(imagePath);
                        } catch (e) {}
                    }, 60000);
                    
                } catch (err) {
                    console.error(`Error downloading Pinterest image ${i}:`, err);
                }
            }
        }
        
        if (attachments.length === 0) {
            return api.sendMessage("❌ Không thể tải hình ảnh. Vui lòng thử lại sau!", threadID, messageID);
        }
        
        message += `\n💡 Gõ "pin [từ khóa]" để tìm kiếm khác`;
        
        api.sendMessage({
            body: message,
            attachment: attachments
        }, threadID, messageID);
        
    } catch (error) {
        console.error("Pinterest search error:", error);
        
        if (error.response?.status === 403) {
            api.sendMessage("Cookie Pinterest đã hết hạn hoặc không hợp lệ!\nVui lòng cập nhật cookie mới.", threadID, messageID);
        } else if (error.response?.status === 429) {
            api.sendMessage("⏳ Quá nhiều request! Vui lòng thử lại sau vài phút.", threadID, messageID);
        } else {
            api.sendMessage(`Có lỗi xảy ra khi tìm kiếm Pinterest!\nLỗi: ${error.message}`, threadID, messageID);
        }
    }
};


const cacheDir = path.join(__dirname, 'cache');
if (!fs.existsSync(cacheDir)) {
    fs.mkdirSync(cacheDir);
}
=======
const axios = require("axios");

let streamURL = (url, ext = 'jpg') => require('axios').get(url, {
  responseType: 'stream',
}).then(res => (res.data.path = `tmp.${ext}`, res.data)).catch(e => null);

const PINTEREST_REGEX = /(https:\/\/(www.)?(pinterest.com|pin.it)[^ \n]*)/g;

const downloadImages = async (url, api, event) => {
  try {
    const match = PINTEREST_REGEX.exec(url);
    if (!match) {
      api.sendMessage("❎ Url bài post pinterest không hợp lệ", event.threadID, event.messageID);
      return;
    }

    const res = await axios.get(`https://api.imgbb.com/1/upload?key=588779c93c7187148b4fa9b7e9815da9&image=${match[0]}`);
    api.sendMessage({ body: "[ PINTEREST - DOWNLOAD ]\n──────────────────\n\n📎 Url: " + res.data.data.image.url, attachment: await streamURL(res.data.data.image.url, 'jpg')}, event.threadID);
  } catch (error) {
    api.sendMessage("❎ Đã có lỗi xảy ra khi tải ảnh", event.threadID, event.messageID);
  }
};

const searchPinterest = async (query, api, event) => {
  try {
    const [keyword, limitStr] = query.split('-').map(str => str.trim());
    
    if (!keyword) {
      return api.sendMessage('⚠️ Vui lòng nhập từ khóa để tìm kiếm 🔎', event.threadID, event.messageID);
    }

    const limit = !isNaN(limitStr) ? parseInt(limitStr) : null;

    if (limit && (limit <= 0 || limit > 50)) {
      return api.sendMessage('⚠️ Bạn chỉ có thể tìm kiếm tối đa 50 ảnh', event.threadID, event.messageID);
    }

    const pinter = require('./../../lib/pinter.js');
    pinter(keyword).then(async (data) => {
      const results = data.data.slice(0, limit);
      const imagePromises = Array.from({ length: limit }, async (_, i) => {
        const a = results[i];
        try {
          const stream = (await axios.get(a, { responseType: "stream" })).data;
          return stream;
        } catch (error) {
          return null;
        }
      });

      const image = await Promise.all(imagePromises);

      api.sendMessage({
        body: `[ PINTEREST - SEARCH ]\n─────────────────\n\n📝 Có ${results.length} kết quả tìm kiếm ảnh trên pinterest của từ khóa: ${keyword} 🌸\n` + (limit && limit > results.length ? `❎ Đã xảy ra lỗi khi tải ${limit - results.length} ảnh` : ""),
        attachment: image.filter(img => img !== null)
      }, event.threadID, event.messageID);
    }).catch(e => {
      api.sendMessage("❎ Đã có lỗi xảy ra khi tìm kiếm trên Pinterest", event.threadID, event.messageID);
    });
  } catch (error) {
    api.sendMessage("❎ Đã có lỗi xảy ra khi tìm kiếm trên Pinterest", event.threadID, event.messageID);
  }
};

module.exports.config = {
  name: "pinterest",
  version: "2.0.0",
  hasPermission: 0,
  credits: "DongDev",
  description: "Tải video hoặc tìm kiếm ảnh trên pinterest",
  commandCategory: "Tiện ích",
  usages: "pinterest down {url} | pinterest search {keyword}",
  cooldowns: 5,
  usePrefix: false,
  images: [
    "https://i.imgur.com/ukt4Qmr.jpeg",
    "https://i.imgur.com/yTdSIzp.jpeg"
  ],
};

module.exports.run = async function ({ api, event, args }) {
  const p = global.config.PREFIX;

  switch (args[0]) {
    case "dl":
    case "down":
      await downloadImages(args[1], api, event);
      break;

    case "s":
    case "search":
      await searchPinterest(args.slice(1).join(" "), api, event);
      break;

    default:
      const helpMessage = `[ PINTEREST ]\n──────────────────\n\n📝 Bạn có thể dùng:\n→⁠ pinterest search/s: từ khóa tìm kiếm - số lượng ảnh\n→⁠ pinterest down/dl + link: tải ảnh/video có chứa link`;
      const attachment = (await axios.get(`https://i.imgur.com/blbLKG3.jpeg`, { responseType: "stream" })).data;
      api.sendMessage({ body: helpMessage, attachment }, event.threadID, event.messageID);
      break;
  }
};
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
