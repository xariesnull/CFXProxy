var net = require("net");

var Handler = {
    Initialize: (PROXY) => {},
    GetProxyConnection: (PORT) => {},
}

Handler.Initialize = (proxy) => {
    var server = net.createServer(client => {
        Log("info", `Serwer TCP -> Nowe połączenie [${client.remoteAddress}]`)

        var https = Handler.GetProxyConnection(CFG.app.https);
        var http = Handler.GetProxyConnection(CFG.app.http);

        var attached = false;

        client.on("data", data => {
            if (!attached) {
                attached = true;

                if (data[0] === 22) {
                    https.write(data);
                    client.pipe(https).pipe(client);
                } else {
                    http.write(data);
                    client.pipe(http).pipe(client);
                }
            }
        });

        client.on("error", () => {});
    });
    
    server.listen(proxy, () => {
        Log("success", `Serwer TCP -> uruchomiony (port: ${proxy.port})`);
    });

    server.on("error", (err) => {
        Log("error", `Serwer TCP -> Wystąpił problem z serwerem TCP`);
        console.error(err);
    });
}

Handler.GetProxyConnection = (p_proxy) => {
    var connection = net.createConnection({
        port: p_proxy,
    });

    connection.on("error", () => {});

    return connection;
}

module.exports = Handler;