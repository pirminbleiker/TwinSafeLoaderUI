Ich möchte eine Frontend Applikation die mir das TwinSAFE API anspricht. es soll die Grundfunktionen des Loaders abbilden. Darunter zählen:

Auswahl des Gateways. --> IP addresse der Netzwerkadapter in einem dropdown anzeigen zur auswahl. Das gw ist normalerweise die IP addresse des EtherCAT Masters und dessen routers (x.x.x.254).
scannen der Klemmen --> mit --list export.csv kann eine liste der ethercat slaves die TwinSAFE logik untersützten ausgegeben werden. die Liste muss später verwendet werden, um das Zielsystem der Sicherheitsanwendung auszuwählen.
auswahl des *.bin files --> für jedes gefundene Logikgerät (TwinSAFE) kann eine Safety-Applikation geladen werden. die auswahl soll über dropdowns geschehen. dafür soll in der Liste der gefunden geräte jeweils für jedes gerät ein Chose button vorhanden sein. es kann dort das bin-file angegeben werden das geladen werden soll.
