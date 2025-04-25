# TwinSafeLoaderUI

TwinSafeLoaderUI ist eine Desktop-Anwendung (Electron + React), die eine grafische Benutzeroberfläche für den Beckhoff TwinSAFE Loader bereitstellt. Sie ermöglicht das komfortable Verwalten, Laden, Aktivieren und Löschen von TwinSAFE Logic Projekten auf EtherCAT-basierten Sicherheitssteuerungen.

## Features

- **Gateway-Auswahl:** Zeigt alle lokalen Netzwerkadapter/IP-Adressen zur Auswahl als EtherCAT-Gateway.
- **Klemmen-Scan:** Listet alle gefundenen TwinSAFE Logic Geräte im Netzwerk auf.
- **Bin-File-Auswahl:** Für jedes Gerät kann eine Safety-Applikation (`.bin`-Datei) ausgewählt werden.
- **Projekt laden/aktivieren/löschen:** Komfortable Steuerung der wichtigsten Loader-Funktionen per Klick.
- **Status- und Fehlerausgabe:** Rückmeldung zu allen Aktionen und Rückgabewerten des Loaders.
- **Mehrbenutzerfähig:** Unterstützung individueller Zugangsdaten pro Gerät.

## Voraussetzungen

- **Node.js** (empfohlen: v18 oder neuer)
- **npm** (wird mit Node.js installiert)
- **TwinSAFE_Loader.exe** im Projektverzeichnis

## Installation

1. Repository klonen oder entpacken.
2. Abhängigkeiten installieren:

   ```sh
   npm install
   ```

3. Entwicklungsmodus starten:

   ```sh
   npm run dev
   ```

   oder als Electron-App:

   ```sh
   npm start
   ```

## Build (für Produktion)

```sh
npm run dist
```

Das gebaute Electron-Paket befindet sich anschließend im `dist/`-Verzeichnis.

## Nutzung

1. Anwendung starten.
2. Gateway-IP auswählen (typisch: x.x.x.254).
3. "Klemmen scannen" klicken, um TwinSAFE Logic Geräte zu finden.
4. Für jedes Gerät kann ein `.bin`-File gewählt und geladen werden.
5. Nach erfolgreichem Laden kann das Projekt aktiviert werden.

## Hinweise

- Die App nutzt intern das Kommandozeilentool `TwinSAFE_Loader.exe`.
- Für alle Aktionen werden die Rückgabewerte und Ausgaben des Loaders angezeigt.
- Erweiterungen wie Customizing, Parameter-Handling etc. sind möglich.

## Lizenz

Apache License 2.0

---

© BRUDERER AG – TwinSafeLoaderUI
