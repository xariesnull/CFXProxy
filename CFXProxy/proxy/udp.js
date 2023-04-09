const dgram = require("dgram");
const client = dgram.createSocket("udp4");

var Handler = {
    connections: {},
    Initialize: (PROXY) => {},
}

Handler.Initialize = (proxy) => {
    client.on("error", (err) => {
        Log("error", `Serwer UDP -> Wystąpił problem z serwerem UDP`);
        console.error(err);

        client.close();
    });
    
    client.on("message", (client_data, info) => {
        if (Handler.connections[info.address] && client_data.length === 52 && client_data.toString("hex").search("82ff00010000ffff00000") !== -1) {
            delete Handler.connections[info.address];
        };
    
        if (!Handler.connections[info.address]) {
            Log("info", `Serwer UDP -> Nowe połączenie [${info.address}]`)
    
            Handler.connections[info.address] = dgram.createSocket("udp4");
    
            Handler.connections[info.address].on("message", (server_data)=> {
                client.send(server_data, info.port, info.address, (err) => {
                    if (err) {
                        console.log(err);
                    };
                });
            });
        };
    
        Handler.connections[info.address].send(client_data, parseInt(CFG.endpoint.port), CFG.endpoint.host, (err) => {
            if (err) {
                console.log(err);
            };
        });
    });
    
    client.on("listening", () => {
        Log("success", `Serwer UDP -> uruchomiony (port: ${proxy.port})`);
    });
    
    client.on("close", () => {
        Log("error", `Serwer UDP -> Został zatrzymany.`);
    });
    
    client.bind({
        address: proxy.host,
        port: proxy.port,
    });
}

module.exports = Handler;