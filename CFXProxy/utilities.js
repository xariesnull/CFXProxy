ToJson = (string) => {
    try {
        string = JSON.parse(string);
    } catch (e) {
        return false;
    }
    return string;
}

Log = (type, msg) => {
    if (type === "success") {
        console.log("\x1b[47m\x1b[30m (CFXProxy 1.1) " + new Date().toLocaleTimeString() + " > \x1b[0m \x1b[32m\x1b[1m" + msg + "\x1b[0m");
    } else if (type === "error") {
        console.log("\x1b[47m\x1b[30m (CFXProxy 1.1) " + new Date().toLocaleTimeString() + " > \x1b[0m \x1b[31m\x1b[1m" + msg + "\x1b[0m");
    } else {
        console.log("\x1b[47m\x1b[30m (CFXProxy 1.1) " + new Date().toLocaleTimeString() + " > \x1b[0m \x1b[1m" + msg + "\x1b[0m");
    }
}

var onlinePlayers = 0;

ModifyResponse = (content) => {
    if (Object.keys(cfxKeyData) !== 0) {
        var tempContent = ToJson(content)
        
        if (tempContent) {
            if (tempContent.vars) {
                tempContent.server = "FXServer-master v1.0.0.6331 linux";
                tempContent.vars.sv_enhancedHostSupport = "false";

                if (tempContent.vars.sv_licenseKeyToken === undefined) {
                    var newOrder = {};

                    for (var i in tempContent.vars) {
                        newOrder[i] = tempContent.vars[i];

                        if (i === "sv_lan") {
                            newOrder["sv_licenseKeyToken"] = cfxKeyData.token;
                        }
                    }

                    tempContent.vars = newOrder;
                } else {
                    tempContent.vars.sv_licenseKeyToken = cfxKeyData.token;
                }

                content = JSON.stringify(tempContent);
            } else if (tempContent.clients) {
                tempContent.clients = onlinePlayers;
                content = JSON.stringify(tempContent);
            } else if (tempContent.length !== undefined) {
                var players = [];
                onlinePlayers = 0;

                tempContent.forEach(player => {
                    var playerAdded = false;

                    if (player.identifiers) {
                        player.identifiers.forEach(identifier => {
                            if (identifier.search("license:") !== -1) {
                                if (!playerAdded) {
                                    playerAdded = true;

                                    onlinePlayers++;
                                    players.push(player);
                                }
                            }
                        });
                    }
                });

                content = JSON.stringify(players);
            } else {
                content = JSON.stringify(tempContent);
            }
        }
    }

    return content.replace(`"sv_lan":"true"`, `"sv_lan":"false"`).replace("FXServer-master v1.0.0.5053 linux", "FXServer-master v1.0.0.6331 linux");
}