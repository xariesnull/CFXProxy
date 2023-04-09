var request = require("request");

var Handler = {
    AuthorizeKey: (cfxKey) => {},
    DoPublicListening: (timeout) => {},
    GetEndpointInformations: (path, callback) => {},
    GetAllEndpointInformations: (callback) => {},
}

Handler.AuthorizeKey = (cfxKey, callback) => {
    request({
        method: "GET",
        uri: "https://keymaster.fivem.net/api/validate/" + cfxKey,
        headers: {
            "Accept": "*/*",
            "User-Agent": "FXServer/1 (master SERVER v1.0.0.6310 linux)"
        }
    }, (err, res, body) => {
        if (err) {
            Log("error", "Autoryzacja Klucza -> Wystąpił błąd podczas autoryzacji klucza (keyAuth 0x1)");
            console.error(err);
        } else {
            var content = ToJson(body);

            if (content && content.success && content.valid) {
                cfxKeyData = content;

                request({
                    method: "POST",
                    uri: "https://cfx.re/api/register/?v=2",
                    headers: {
                        "Accept": "*/*",
                        "User-Agent": "CitizenFX/1",
                        "Content-Type": "application/x-www-form-urlencoded"
                    },
                    body: JSON.stringify({
                        "ipOverride": "",
                        "port": CFG.proxy.port.toString(),
                        "token": cfxKeyData.nucleus_token
                    })
                }, (err, res, body) => {
                    if (err) {
                        Log("error", "Autoryzacja Klucza -> Wystąpił błąd podczas autoryzacji klucza (keyAuth 0x2)");
                        console.error(err);
                    } else {
                        var content = ToJson(body);

                        if (content && content.host) {
                            Log("success", "Autoryzacja Klucza -> Klucz został pomyślnie zautoryzowany! (Host: " + content.host + ")");
                            callback(true);
                        } else {
                            Log("error", "Autoryzacja Klucza -> Błąd podczas autoryzowania klucza (/api/register/?v=2)");
                        }
                    }
                });
            } else {
                Log("error", "Autoryzacja Klucza -> Błąd podczas autoryzowania klucza (/api/validate/)" + (content && content.error ? `\nBłąd: ${content.error}` : ""));
            }
        }
    });
}

Handler.DoPublicListening = (timeout) => {
    Handler.GetAllEndpointInformations(informations => {
        if (informations) {
            request({
                method: "POST",
                uri: "https://servers-ingress-live.fivem.net/ingress",
                headers: {
                    "Accept": "*/*",
                    "User-Agent": "CitizenFX/1",
                    "Content-Type": "application/json; charset=utf-8"
                },
                body: JSON.stringify({
                    "fallbackData": {
                        "dynamic": informations["dynamic.json"],
                        "info": informations["info.json"],
                        "players": informations["players.json"],
                    },
                    "forceIndirectListing": false,
                    "ipOverride": "",
                    "listingToken": cfxKeyData.listing_token,
                    "port": CFG.proxy.port,
                    "private": false
                })
            }, (err, res, body) => {
                if (err) {
                    console.log(err);
                } else {
                    var content = ToJson(body);

                    if (content && content.success) {
                        Log("success", "Autoryzacja Klucza -> Listowanie serwera powiodło się! [heartbeat]");
                    } else {
                        Log("error", "Autoryzacja Klucza -> Wystąpił problem podczas listowania serwera! [heartbeat]");
                    }
                }

                setTimeout(() => {
                    Handler.DoPublicListening(timeout);
                }, timeout);
            });
        } else {
            setTimeout(() => {
                Handler.DoPublicListening(timeout);
            }, timeout);
        }
    });
}

Handler.GetEndpointInformations = (path, callback) => {
    request({
        "method": "GET",
        "url": `http://${CFG.endpoint.host}:${CFG.endpoint.port}/${path}`,
    }, (err, res, body) => {
        if (err) {
            Log("error", `Autoryzacja Klucza -> Podczas wyciągania informacji o "${path}" wystąpił problem - Czy główny serwer jest włączony?`);
            callback(null);
        } else {
            callback(body);
        };
    });
}

Handler.GetAllEndpointInformations = (callback) => {
    var collectedData = {};
    var sentCallback = false;
    
    ["players.json", "dynamic.json", "info.json"].forEach(path => {
        Handler.GetEndpointInformations(path, informations => {
            if (informations) {
                collectedData[path] = ToJson(ModifyResponse(informations));

                if (Object.keys(collectedData).length === 3) {
                    callback(collectedData);
                }
            } else {
                if (!sentCallback) {
                    sentCallback = true;
                    callback(null);
                }
            }
        });
    });
}

module.exports = Handler;