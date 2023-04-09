*CFXProxy 1.1* Stworzone przez topblantowski#0420 dla SativaRP

1. Przed uruchomieniem programu przejdź do pliku config.json i edytuj go w następujący sposób:
    `cfxKey` - Podaj klucz do autoryzacji FiveM z https://keymaster.fivem.net/
    `proxy`
        `host` - Publiczne IP Twojej maszyny
        `port` - Port na którym ma utworzyć się serwer TCP oraz UDP proxy.
    `endpoint`
        `host` - Publiczne IP maszyny na którym stoi "prawdziwy" serwer
        `port` - Port na którym stoi "prawdziwy" serwer (W firewall należy zablokować ten port aby nikt niepożądany nie uzyskał do niego dostępu)
    `app`
        `http` - Na tym porcie utworzy się serwer HTTP (W firewall należy zablokować ten port aby nikt niepożądany nie uzyskał do niego dostępu)
        `https` - Na tym porcie utworzy się serwer HTTPS (W firewall należy zablokować ten port aby nikt niepożądany nie uzyskał do niego dostępu)

2. Dlaczego warto zablokować porty opisane wyżej?
    - Porty blokujemy ze względu na to aby żaden ciekawski nie zobaczył, że serwer posiada niestandardowe dla protokołu FiveM otwarte porty.
    - W skrócie nie chcemy aby FiveM zablokował nasz serwer albo klucz.
    - Ogólnie endpoint port możemy zostawić otwarty aczkolwiek, jak ktoś porówna dane które przesyła nam ten port z danymi które przesyła nam port od proxy to zobaczy różnice.

3. Ważne.
    - Wyświetlenia serwera na https://keymaster.fivem.net/ trwa około 60 sekund, natomiast na liście graczy kilka minut.
    - Jeśli nie korzystamy z klucza "premium" to limit slotów wynosi 48 i jeśli ustawimy więcej to nie będzie można połączyć się z serwerem (zapewne manipulując maksymalną ilością graczy można to obejść, aczkolwiek w tej wersji program tego nie zawiera).
    - Warto pamiętać, że od teraz wszystkie połączenia graczy, są połączeniami poprzez PROXY co oznacza, że:
        - IP gracza będzie od teraz IP naszego serwera: https://imgur.com/2TsWvTk
        - Aby zapobiec rate limitowi naszego proxy dodajemy do server.cfg:
            `set sv_proxyIPRanges "IP_PROXY/32"`
        - *W tej wersji programu rzeczywiste IP klienta nie jest wysyłane, w przyszłości może zostać dodana taka opcja*
    - Trzeba usunąć paranoi

4. Uruchomienie
    - Jeśli skonfigurowałeś wszystkie wyżej wymienione elementy poprawnie czas zająć się uruchomieniem programu.
    - Zainstaluj `nodejs`:
        - Windows: https://nodejs.org/en/download/
        - Linux: sudo apt update -y && sudo apt install nodejs -y
    - Włącz serwer FiveM
    - Uruchom program wpisujac: node --no-warnings run.js
    - Przykładowe poprawne uruchomienie programu: https://imgur.com/0FwpBQY
