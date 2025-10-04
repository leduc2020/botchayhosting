<<<<<<< HEAD
=======
const fs = require("fs");
const path = __dirname + "/../commands/data/timeJoin.json";

>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
module.exports.config = {
    name: "timejoin",
    eventType: ["log:unsubscribe"],
    version: "1.0.0",
<<<<<<< HEAD
    credits: "Nam",
    description: "Tự xóa data time join user khi out"
};
const fs = require("fs");
var path = __dirname + "/../commands/cache/timeJoin.json";
module.exports.run = async function ({
    event: e
}) {
    const {
        threadID: t,
        logMessageData: l
    } = e, {
        writeFileSync: w,
        readFileSync: r
    } = fs, {
        stringify: s,
        parse: p
    } = JSON;
    var v = l.leftParticipantFbId;
    let a = p(r(path));
    a[v + t] = "";
    w(path, s(a, null, 2));
}
=======
    credits: "Nam & DongDev fix",
    description: "Tự xóa dữ liệu thời gian tham gia của người dùng khi thoát"
};

module.exports.run = async function ({ event: e }) {
    const { threadID: t, logMessageData: l } = e;
    const { writeFileSync: w, readFileSync: r } = fs;
    const { stringify: s, parse: p } = JSON;

    const v = l.leftParticipantFbId;
    let a = p(r(path));
    delete a[v + t];
    w(path, s(a, null, 2));
};
>>>>>>> 4398b3a5fd9045b8de57d496d6bc325c61036aaa
