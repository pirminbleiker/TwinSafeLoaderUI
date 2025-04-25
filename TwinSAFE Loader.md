# TwinSAFE Loader Dokumentation

Basierend auf der bereitgestellten Dokumentation [TwinSAFE_Loader_en.pdf](misc/twinsafe_loader_de.pdf).

## 1. Systembeschreibung

### Allgemein

Der TwinSAFE Loader ist eine Software (Programmbibliothek), die es ermöglicht, unabhängig von der TwinCAT-Entwicklungsumgebung, verschiedene Funktionen auf einem Safety Controller auszuführen[Seite: 79]. Er ist für Windows, Linux und TwinCAT/BSD verfügbar[Seite: 85, 100, 104, 107]. Die Steuerung erfolgt über Kommandozeilenparameter[Seite: 86, 130].

### Unterstützte Funktionen [Seite: 79, 129]

* Laden, Aktivieren und Löschen eines Sicherheitsprojekts
* Anpassung (Customizing) des Sicherheitsprojekts
* Inkrementelles Laden von sicheren Parametern
* Laden der sicheren Adresse

### Kommunikationsprotokolle [Seite: 121]

* ADS over EtherCAT (AoE)
* EtherCAT Mailbox Gateway

## 2. Systemanforderungen

### Betriebssysteme [Seite: 100, 104, 107]

* Windows 10 (32/64-bit)
* Linux (Debian 11 getestet, x86 64-bit und 32-bit)
* TwinCAT/BSD

### Zielsystem (TwinSAFE Logic Komponenten) [Seite: 112, 114]

* EL6900 (ab SW Version 05)
* EL/EK/EJ/EPx9yx mit y>0 (ab SW Version 01)
* AX8xxx-xxxx-xxxx mit y in (1, 2) (ab SW Version 01)
* AMP8xxx-xxyx-xxxx mit y in (1, 2, 3, 4) (ab SW Version 01)
* AM18xxx-xyxx-xxxx mit y=1 (ab SW Version 01)
* ELM7xxx-yxxx-xxxx mit y=9 (ab SW Version 01)
* Grundsätzlich alle EL6910-basierten TwinSAFE Logic Komponenten (ggf. über Konfigurationsdatei `custom_terminals.csv`)[Seite: 115, 116, 119].

### TwinCAT Version [Seite: 90]

* Für die Erstellung eines Sicherheitsprojekts, das inkrementelles Laden oder das Schreiben einer sicheren Adresse unterstützt, ist TwinCAT Version 3.1 oder höher erforderlich.

## 3. Funktionsweise & API (Kommandozeilenparameter)

Die Steuerung des TwinSAFE Loaders erfolgt über Kommandozeilenparameter[Seite: 130].

### 3.1 Kommunikation & Authentifizierung

* `--gw <IPv4-Adresse>`: Spezifiziert die IPv4-Adresse des EtherCAT Mailbox Gateways oder des EtherCAT-Masters [im AoE-Modus](Seite: 132, 256). Kann auch der Hostname sein [ab v5 im AoE-Modus](Seite: 132).
* `--ams <NetId>`: Spezifiziert die AMSNetID für ADS over EtherCAT [AoE](Seite: 132, 256). Funktioniert nicht auf einem lokalen Computer[Seite: 132].
* `--localams <NetId>`: Spezifiziert die lokale AMSNetID bei Verwendung von `--ams`. Standard: Eigene IP + ".1.1"[Seite: 132, 256].
* `--user <Benutzername>`: Benutzername mit entsprechenden Rechten auf der TwinSAFE Logic Komponente[Seite: 144, 256].
* `--pass <Passwort>`: Passwort des Benutzers[Seite: 144, 256].
* `--timeout <Zeit in ms>`: Wartezeit für Netzwerkpakete [Standard: 10000 ms](Seite: 137, 138, 256).
* `--retryattemps <Anzahl>`: Anzahl erlaubter Lese-Wiederholungsversuche beim Scannen von Slaves[Seite: 175, 256].

### 3.2 Sicherheitsprojekt Management

* **Laden:**
  * `--slave <EtherCAT-Adresse>`: EtherCAT-Adresse der TwinSAFE Logic Komponente[Seite: 147, 256].
  * `--proj <Pfad zur Binärdatei>`: Pfad zur Binärdatei des Sicherheitsprojekts[Seite: 147, 256].
  * *Beispiel:* `TwinSAFE_Loader.exe --gw 192.168.67.254 --user Administrator --pass TwinSAFE --slave 1004 --proj example_el6910.bin` [Seite: 150]
* **Aktivieren:**
  * `--slave <EtherCAT-Adresse>`: EtherCAT-Adresse der TwinSAFE Logic Komponente[Seite: 153, 256].
  * `--proj <Pfad zur Binärdatei>`: Pfad zur Binärdatei des zu aktivierenden Projekts[Seite: 153, 256].
  * `--crc <Projekt-CRC>`: Projekt-CRC des zu aktivierenden Projekts[Seite: 153, 256].
  * *Beispiel:* `TwinSAFE_Loader.exe --gw 192.168.67.254 --user Administrator --pass TwinSAFE --slave 1004 --proj example_el6910.bin --crc 0x2d63` [Seite: 154]
* **Löschen:**
  * `--slave <EtherCAT-Adresse>`: EtherCAT-Adresse der TwinSAFE Logic Komponente[Seite: 156, 256].
  * `--delete`: Befehl zum Löschen des Projekts[Seite: 156, 256].
  * *Beispiel:* `TwinSAFE_Loader.exe --gw 192.168.67.254 --user Administrator --pass TwinSAFE --slave 1004 --delete` [Seite: 157]

### 3.3 Auflisten von Komponenten & Konfigurationen

* **Alle TwinSAFE Logic Komponenten auflisten:**
  * `--list <Dateiname>`: Speichert die Liste aller verfügbaren Slaves in der angegebenen Datei [CSV-Format](Seite: 160, 256). Benötigt `--gw`.
  * *Beispiel:* `TwinSAFE_Loader.exe --gw 192.168.67.254 --list safetyterminals.csv` [Seite: 161]
  * *Dateiformat:* CSV mit Spalten: EtherCAT address; FSoE address; type; project crc; name; serial number[Seite: 163].
* **Aktuelle Gruppenkonfiguration (Customizing) auflisten:**
  * `--slave <EtherCAT-Adresse>`: EtherCAT-Adresse der TwinSAFE Logic Komponente[Seite: 205, 256].
  * `--list <Dateiname>`: Speichert die aktuelle Gruppenkonfiguration in der angegebenen Datei [CSV-Format](Seite: 205, 256). Benötigt `--gw` und `--slave`.
  * *Beispiel:* `TwinSAFE_Loader.exe --gw 192.168.67.254 --slave 1004 --list groupconfig.csv` [Seite: 206]
  * *Dateiformat (Upload):* CSV Version 2 mit Spalten: id; activate; passivate; temporarily; permanent[Seite: 208, 209].

### 3.4 Customizing (Anpassung)

* **Customizing durchführen:**
  * `--slave <EtherCAT-Adresse>`: EtherCAT-Adresse der TwinSAFE Logic Komponente[Seite: 179, 256].
  * `--customize <Pfad zur Konfigurationsdatei>`: Pfad zur CSV-Datei mit der gewünschten Gruppenkonfiguration[Seite: 179, 256].
  * `--log <Dateipfad>` (Optional): Schreibt die zurückgelesenen Customizing-Einstellungen nach dem Vorgang in eine Datei[Seite: 185, 256].
  * *Beispiel:* `TwinSAFE_Loader.exe --gw 192.168.67.254 --user Administrator --pass TwinSAFE --slave 1004 --customize groupconfig.csv` [Seite: 180]
  * *Konfigurationsdatei-Format (Download):* CSV Version 1 mit Spalten: id; activate; passivate; temporarily; permanent[Seite: 193, 197]. Werte: A (Aktiv), D (Deaktiviert/Nicht möglich), E [Möglich, aber nicht aktiv](Seite: 197, 198).

### 3.5 Inkrementelles Laden sicherer Parameter (Nur EL6910-basiert) [Seite: 215, 218]

* **Sichere Parameter des aktiven Projekts auslesen (Upload):**
  * `--slave <EtherCAT-Adresse>`: EtherCAT-Adresse der TwinSAFE Logic Komponente[Seite: 222, 256].
  * `--rdpara <Pfad zur Zieldatei>`: Befehl zum Auslesen der sicheren Parameter[Seite: 222, 256].
  * *Beispiel:* `TwinSAFE_Loader.exe --gw 192.168.67.254 --slave 1022 --rdpara safeParameters.txt` [Seite: 223]
  * *Dateiformat:* Siehe Dokumentation, Abschnitt 5.9.1.1[Seite: 224].
* **Sichere Parameter inkrementell schreiben (Download):**
  * `--slave <EtherCAT-Adresse>`: EtherCAT-Adresse der TwinSAFE Logic Komponente[Seite: 229, 256].
  * `--wrincpara <Pfad zur Parameterdatei>`: Befehl zum inkrementellen Schreiben der Parameter[Seite: 229, 256].
  * `--log <Dateipfad>` (Optional): Schreibt die Unterschiede zwischen Projektparametern und inkrementell geschriebenen Parametern in eine Datei[Seite: 235, 256].
  * *Beispiel:* `TwinSAFE_Loader.exe --gw 192.168.67.254 --user Administrator --pass TwinSAFE --slave 1022 --wrincpara safeParameters.txt` [Seite: 230]
  * *Dateiformat:* Siehe Dokumentation, Abschnitt 5.9.2.1[Seite: 238].
* **Inkrementell geschriebene Parameter auslesen (Upload):**
  * `--slave <EtherCAT-Adresse>`: EtherCAT-Adresse der TwinSAFE Logic Komponente[Seite: 242, 256].
  * `--rdincpara <Pfad zur Zieldatei>`: Befehl zum Auslesen der inkrementell geschriebenen Parameter[Seite: 242, 256].
  * *Beispiel:* `TwinSAFE_Loader.exe --gw 192.168.67.254 --slave 1022 --rdincpara incrementalSafeParameters.txt` [Seite: 243]
  * *Dateiformat:* Siehe Dokumentation, Abschnitt 5.9.3.1[Seite: 245].

### 3.6 Sichere Adresse Laden (Nur EL6910-basiert, ohne Hardware-Schalter) [Seite: 249, 250]

* `--slave <EtherCAT-Adresse>`: EtherCAT-Adresse der TwinSAFE Logic Komponente[Seite: 252, 256].
* `--wraddr <Sichere Adresse>`: Befehl zum Schreiben der sicheren Adresse [Dezimalwert 1-65535](Seite: 252, 256). Erfordert Neustart des Geräts[Seite: 253].
* *Beispiel:* `TwinSAFE_Loader.exe --gw 192.168.67.254 --user Administrator --pass TwinSAFE --slave 1024 --wraddr 42` [Seite: 253]

### 3.7 Hilfe

* `--help`: Zeigt alle verfügbaren Kommandozeilenparameter an[Seite: 256].

## 4. Fehlercodes

Der TwinSAFE Loader gibt bei Fehlern spezifische Rückgabewerte zurück[Seite: 259]. Beispiele:

* `(0) ERR_NONE`: Kein Fehler[Seite: 259].
* `(1) ERR_INVALID_PARAMETER`: Ungültiger Parameter[Seite: 259].
* `(3) ERR_AUTHENTICATION_FAILED`: Login fehlgeschlagen[Seite: 259].
* `(5) ERR_CORRUPT_COMMUNICATION`: Fehler bei Datenübertragung/Timeout[Seite: 259].
* `(6) ERR_CUSTOMIZING_FAILED`: Customizing fehlgeschlagen[Seite: 259].
* `(7) ERR_CUSTOMIZING_NOT_SUPPORTED`: Customizing nicht unterstützt [z.B. EL6900](Seite: 259).
* Weitere Codes siehe Dokumentation, Kapitel 7[Seite: 259].

## 5. Wichtige Hinweise (FMEA)

Bei Verwendung der Funktionen **Laden/Aktivieren**, **Customizing**, **Inkrementelles Laden** oder **Adresse Laden** müssen die in der FMEA (Kapitel 8 der Dokumentation) genannten Maßnahmen beachtet und umgesetzt werden, um die sicherheitstechnische Bestätigung aufrechtzuerhalten[Seite: 261, 262, 263]. Dazu gehören u.a.:

* Prüfung auf erfolgreiche Ausführung [Return Code 0](Seite: 266, 268, 270, 273, 275).
* Sicherstellung, dass nur autorisierte Benutzer Zugriff haben[Seite: 268, 270, 273, 275].
* Vergleich von gelesenen Daten (CRC, Seriennummer, Customizing-Einstellungen, Parameter, Adresse) mit Erwartungswerten[Seite: 268, 270, 273, 275].
* Durchführung einer vollständigen Abnahme nach Änderungen[Seite: 268, 270, 273].

---
*Diese Dokumentation basiert auf dem Inhalt der Datei "TwinSAFE_Loader_en.pdf"[Seite: 1].*

---

## 6. Frontend-Anwendung: Anforderungen & Konzept

### Ziel

Eine Desktop-Frontend-Applikation (z.B. Electron/React), die die Grundfunktionen des TwinSAFE Loaders abbildet und das Kommandozeilen-Tool im Hintergrund nutzt.

### Funktionen

1. **Gateway-Auswahl**
   * Zeigt alle lokalen Netzwerkadapter/IP-Adressen in einem Dropdown an.
   * Auswahl einer IP-Adresse als Gateway (`--gw`), typischerweise x.x.x.254.

2. **Klemmen-Scan**
   * Nach Gateway-Auswahl kann ein Scan der EtherCAT-Slaves durchgeführt werden (`--list export.csv`).
   * Die CSV-Datei wird eingelesen und die gefundenen TwinSAFE Logic Geräte werden tabellarisch angezeigt.

3. **Bin-File-Auswahl & Laden**
   * Für jedes gefundene Gerät gibt es einen "Choose"-Button.
   * Nach Klick kann ein `.bin`-File ausgewählt werden.
   * Das File kann dann gezielt auf das jeweilige Gerät geladen werden.

### Beispielhafter Ablauf

1. User startet die App.
2. Dropdown zeigt alle lokalen Netzwerkadapter/IPs.
3. User wählt Gateway-IP (z.B. 192.168.67.254).
4. User klickt "Scan", App ruft TwinSAFE Loader mit `--list export.csv` auf.
5. App liest export.csv, zeigt alle Geräte.
6. Für jedes Gerät: "Choose"-Button → Dateiauswahl für `.bin`-File.
7. Nach Auswahl kann das File auf das Gerät geladen werden.

### Hinweise

* Die App sollte Rückmeldungen zu Erfolg/Fehlern geben (z.B. Rückgabewert des Loaders auswerten).
* Erweiterungen (Customizing, Parameter, etc.) sind später möglich.
