export const short = {
  en_US: 'A Bitcoin Knots mainnet node on the BIP-110/RDTS BLAKE2b chain',
  es_ES: 'Un nodo mainnet Bitcoin Knots en la cadena BLAKE2b BIP-110/RDTS',
  de_DE: 'Ein Bitcoin-Knots-Mainnet-Knoten auf der BIP-110/RDTS-BLAKE2b-Kette',
  pl_PL: 'Węzeł mainnet Bitcoin Knots w łańcuchu BLAKE2b BIP-110/RDTS',
  fr_FR: 'Un nœud mainnet Bitcoin Knots sur la chaîne BLAKE2b BIP-110/RDTS',
}

export const long = {
  en_US: `This private StartOS build runs Bitcoin Knots v29.4.1.knots20260508 on the BIP-110/RDTS mainnet chain. It changes proof of work to BLAKE2b header v2 at block 961,640 and hardcodes the consensus headline "8-30 NYPost Deride And Conquer". Upgrading an existing RDTS node can cause a deep reorganization away from SHA256d blocks after 961,639. The split chains have no replay protection.

The package keeps the official Start9 package ID and data volume, so it upgrades the existing Bitcoin Knots service without another blockchain download. It includes pruned or archival operation, embedded I2P, outbound Tor, ZeroMQ, compact block filters, and RPC for wallets and dependent services.`,
  es_ES: `Esta compilación privada para StartOS ejecuta Bitcoin Knots v29.4.1.knots20260508 en la cadena mainnet BIP-110/RDTS. Cambia la prueba de trabajo a BLAKE2b con cabecera v2 en el bloque 961.640 e integra de forma fija el titular de consenso "8-30 NYPost Deride And Conquer". Actualizar un nodo RDTS existente puede provocar una reorganización profunda que descarte los bloques SHA256d posteriores al 961.639. Las cadenas separadas no tienen protección contra repetición.

El paquete conserva el ID y el volumen de datos del paquete oficial de Start9, por lo que actualiza el servicio Bitcoin Knots existente sin volver a descargar la cadena.`,
  de_DE: `Dieser private StartOS-Build führt Bitcoin Knots v29.4.1.knots20260508 auf der BIP-110/RDTS-Mainnet-Kette aus. Er wechselt bei Block 961.640 auf BLAKE2b-Proof-of-Work mit Header v2 und baut die Konsens-Schlagzeile „8-30 NYPost Deride And Conquer“ fest ein. Das Upgrade eines bestehenden RDTS-Knotens kann eine tiefe Reorganisation weg von SHA256d-Blöcken nach 961.639 auslösen. Die getrennten Ketten haben keinen Replay-Schutz.

Das Paket behält Paket-ID und Datenvolume des offiziellen Start9-Pakets und aktualisiert daher den bestehenden Bitcoin-Knots-Dienst ohne erneuten Blockchain-Download.`,
  pl_PL: `Ta prywatna kompilacja StartOS uruchamia Bitcoin Knots v29.4.1.knots20260508 na łańcuchu mainnet BIP-110/RDTS. Od bloku 961 640 zmienia proof of work na BLAKE2b z nagłówkiem v2 i ma na stałe wbudowany nagłówek konsensusu „8-30 NYPost Deride And Conquer”. Aktualizacja istniejącego węzła RDTS może spowodować głęboką reorganizację z bloków SHA256d po 961 639. Rozdzielone łańcuchy nie mają ochrony przed powtórzeniem.

Pakiet zachowuje identyfikator i wolumin danych oficjalnego pakietu Start9, więc aktualizuje istniejącą usługę Bitcoin Knots bez ponownego pobierania łańcucha.`,
  fr_FR: `Cette compilation privée pour StartOS exécute Bitcoin Knots v29.4.1.knots20260508 sur la chaîne mainnet BIP-110/RDTS. Elle passe à la preuve de travail BLAKE2b avec en-tête v2 au bloc 961 640 et intègre en dur le titre de consensus « 8-30 NYPost Deride And Conquer ». La mise à niveau d'un nœud RDTS existant peut provoquer une réorganisation profonde abandonnant les blocs SHA256d après 961 639. Les chaînes séparées n'ont aucune protection contre le rejeu.

Le paquet conserve l'identifiant et le volume de données du paquet Start9 officiel ; il met donc à niveau le service Bitcoin Knots existant sans retélécharger la chaîne.`,
}

export const torDescription = {
  en_US:
    'Required for .onion peer connectivity, onlynet=onion, or when a Tor address is requested.',
  es_ES:
    'Requerido para conectividad de pares .onion, onlynet=onion, o cuando se solicita una dirección Tor.',
  de_DE:
    'Erforderlich für .onion Peer-Konnektivität, onlynet=onion oder wenn eine Tor-Adresse angefordert wird.',
  pl_PL:
    'Wymagany dla połączeń .onion z peerami, onlynet=onion lub gdy żądany jest adres Tor.',
  fr_FR:
    "Requis pour la connectivité .onion entre pairs, onlynet=onion, ou lorsqu'une adresse Tor est demandée.",
}
