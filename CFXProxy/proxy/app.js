var http = require("http");
var https = require("https");
var request = require("request");

var Handler = {
    Initialize: (p_http, p_https) => {},
    WWWHandler: (req, res, next) => {},
}

Handler.Initialize = (p_http, p_https) => {
    var s_http = http.createServer(Handler.WWWHandler);

    s_http.on("listening", () => {
        Log("success", `Serwer HTTP uruchomiony (port: ${p_http})`);
    });

    s_http.keepAliveTimeout = 0;
    s_http.listen(p_http);

    var s_https = https.createServer({
        key: fs.readFileSync("./proxy/ssl/tls.key"),
        cert: fs.readFileSync("./proxy/ssl/tls.crt"),
        rejectUnauthorized: false,
    }, Handler.WWWHandler);

    s_https.on("listening", () => {
        Log("success", `Serwer HTTPS uruchomiony (port: ${p_https})`);
    });
    
    s_https.keepAliveTimeout = 0;
    s_https.listen(p_https);
}

Handler.WWWHandler = (req, res, next) => {
    const { headers, method, url } = req;
    headers.host = CFG.endpoint.host;

    var body = [];
    req.on("error", () => {
    }).on("data", (chunk) => {
        body.push(chunk);
    }).on("end", () => {
        body = Buffer.concat(body).toString();

        res.on("error", (err) => {
            console.error(err);
        });

        if (!headers["user-agent"]) { 
            request({
                "method": method,
                "url": `${res.socket ? "https" : "http"}://${CFG.endpoint.host}:${CFG.endpoint.port}${url}`,
                "headers": headers,
                "body": body,
            }, (r_err, r_res, r_body) => {
                if (!r_err) {
                    res.statusCode = r_res.statusCode;
                    
                    if (r_res.headers["transfer-encoding"]) {
                        res.setHeader("Transfer-Encoding", r_res.headers["transfer-encoding"]);
                    };

                    res.end(ModifyResponse(r_body));
                } else {
                    return Log("error", `WWW Handler -> Błąd podczas pobierania informacji od serwera wewnętrznego "${url}" - Czy główny serwer jest włączony?`);
                };
            });
        } else {
            request({
                "method": method,
                "url": `${res.socket ? "https" : "http"}://${CFG.endpoint.host}:${CFG.endpoint.port}${url}`,
                "headers": headers,
                "body": body,
            }).pipe(res);
        }
    });
}

module.exports = Handler;