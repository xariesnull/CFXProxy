process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
process.on("uncaughtException", () => {});
process.on("unhandledRejection", () => {});

fs = require("fs");

require("./utilities.js");

if (CFG = ToJson(fs.readFileSync("./config.json", "utf-8"))) {
    Log("success", "Poprawnie załadowano plik konfiguracyjny.");
} else {
    return Log("error", "Błąd podczas ładowania \"config.json\" - sprawdź poprawność składni");
}

cfxKeyData = {};

require("./proxy/app.js").Initialize(CFG.app.http, CFG.app.https);
require("./proxy/tcp.js").Initialize(CFG.proxy);
require("./proxy/udp.js").Initialize(CFG.proxy);

require("./keyauth/keyAuth.js").AuthorizeKey(CFG.cfxKey, success => {
    require("./keyauth/keyAuth.js").DoPublicListening(30000);
});