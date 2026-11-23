import { VersionInfo } from '@start9labs/start-sdk'
import { v29_4_14 } from './v29.4_14'

export const current = VersionInfo.of({
  version: '#knots:29.4:15',
  releaseNotes: {
    en_US: 'Update Bitcoin Knots to v29.5.1.knots20260508. Mainnet coinbase rewards mined from block 979,919 until RDTS expiry mature after 25,920 blocks each. Knots revalidates the affected blocks on upgrade. This release also fixes peer handling and wallet notifications.',
    es_ES: 'Actualiza Bitcoin Knots a v29.5.1.knots20260508. Cada recompensa coinbase minada desde el bloque 979.919 hasta la expiración de RDTS madura tras 25.920 bloques. Knots revalida los bloques afectados al actualizar. Esta versión también corrige la gestión de pares y las notificaciones del monedero.',
    de_DE: 'Aktualisiert Bitcoin Knots auf v29.5.1.knots20260508. Jede ab Block 979.919 bis zum Ablauf von RDTS geschürfte Coinbase-Belohnung reift nach 25.920 Blöcken. Knots validiert die betroffenen Blöcke beim Upgrade erneut. Diese Version behebt auch Fehler bei Peer-Verbindungen und Wallet-Benachrichtigungen.',
    pl_PL: 'Aktualizacja Bitcoin Knots do v29.5.1.knots20260508. Każda nagroda coinbase wydobyta od bloku 979 919 do wygaśnięcia RDTS dojrzewa po 25 920 blokach. Knots ponownie weryfikuje objęte zmianą bloki. To wydanie poprawia także obsługę połączeń z węzłami i powiadomienia portfela.',
    fr_FR: 'Mise à jour de Bitcoin Knots vers v29.5.1.knots20260508. Chaque récompense coinbase minée à partir du bloc 979 919 et avant l’expiration de RDTS arrive à maturité après 25 920 blocs. Knots revalide les blocs concernés lors de la mise à niveau. Cette version corrige aussi la gestion des pairs et les notifications du portefeuille.',
  },
  migrations: v29_4_14.options.migrations,
})
  .satisfies('29.4:14')
  .satisfies('28.4:27')
