import React, { useEffect, useState } from 'react';

const BRUDERER_GREEN = "#009639";
const ERROR_RED = "#d32f2f";

function App() {
  const [adapters, setAdapters] = useState([]);
  const [gw, setGw] = useState('');
  const [devices, setDevices] = useState([]);
  const [scanStatus, setScanStatus] = useState('');
  const [binFiles, setBinFiles] = useState({});
  const [customGw, setCustomGw] = useState('');
  const [info, setInfo] = useState('');
  const [userPass, setUserPass] = useState({}); // { [ethercatAddr]: { user, pass } }
  const [globalUser, setGlobalUser] = useState('Administrator');
  const [globalPass, setGlobalPass] = useState('TwinSAFE');
  const [detailsOpen, setDetailsOpen] = useState({}); // { [ethercatAddr]: bool }
  const [testResults, setTestResults] = useState({}); // { [ethercatAddr]: 'success' | 'fail' | undefined }
  const [activateResults, setActivateResults] = useState({}); // { [ethercatAddr]: 'success' | 'fail' | undefined }
  const [crcAfterLoad, setCrcAfterLoad] = useState({}); // { [ethercatAddr]: string }
  const [canActivate, setCanActivate] = useState({}); // { [ethercatAddr]: bool }

  useEffect(() => {
    if (window.api?.getNetworkInterfaces) {
      window.api.getNetworkInterfaces().then(data => {
        setAdapters(data || []);
      });
    } else {
      // Mock für dev-server
      setAdapters([
        { name: 'MockAdapter', address: '192.168.67.254' }
      ]);
    }
  }, []);

  const handleAddCustomGw = () => {
    if (customGw && !adapters.some(a => a.address === customGw)) {
      setAdapters(prev => [...prev, { name: 'Custom', address: customGw }]);
      setGw(customGw);
      setCustomGw('');
    }
  };

  // Hilfsfunktion zum Parsen der TwinSAFE-CSV
  function parseTwinSafeCsv(csv) {
    const lines = csv.trim().split('\n');
    // Suche die Zeile mit den Spaltenüberschriften
    const headerIdx = lines.findIndex(line =>
      line.toLowerCase().includes('ethercat address')
    );
    if (headerIdx === -1 || headerIdx === lines.length - 1) return [];
    const headers = lines[headerIdx].split(';').map(h => h.trim());
    const dataLines = lines.slice(headerIdx + 1);
    return dataLines
      .filter(line => line.trim() && line.includes(';'))
      .map(line => {
        const values = line.split(';');
        const obj = {};
        headers.forEach((h, i) => {
          obj[h] = values[i] ? values[i].trim() : '';
        });
        return obj;
      });
  }

  const handleScan = async () => {
    setScanStatus('Scanning...');
    setInfo('');
    const exportFile = 'export.csv';
    const args = ['TwinSAFE_Loader.exe', '--gw', gw, '--list', exportFile];
    // Ausgabe des Kommandos in der Konsole
    console.log('CLI-Kommando:', args.join(' '));
    if (!window.api?.runLoader) {
      setTimeout(() => {
        setDevices([{
          'EtherCAT address': '1001',
          'FSoE address': '100',
          'type': 'EL6910',
          'project crc': '0x1234',
          'name': 'MockLogic',
          'serial number': '123456'
        }]);
        setScanStatus('Scan erfolgreich (Mock)');
        setInfo(`Mock-Scan erfolgreich. Return code: 0`);
      }, 500);
      return;
    }
    const result = await window.api.runLoader(args);
    setInfo(
      `Return code: ${result.code}\n` +
      (result.stdout ? `stdout:\n${result.stdout}\n` : '') +
      (result.stderr ? `stderr:\n${result.stderr}\n` : '')
    );
    if (result.code === 0) {
      const csv = await window.api.readCsv(exportFile);
      setDevices(parseTwinSafeCsv(csv));
      setScanStatus('Scan erfolgreich');
    } else {
      setScanStatus('Fehler');
    }
  };

  const handleChooseBin = async (slaveAddr) => {
    if (!window.api?.chooseBinFile) {
      // Mock für dev-server: Simuliere Dateiauswahl
      setBinFiles({ ...binFiles, [slaveAddr]: 'mock/path/to/file.bin' });
      return;
    }
    const file = await window.api.chooseBinFile();
    if (file) {
      setBinFiles({ ...binFiles, [slaveAddr]: file });
    }
  };

  const handleUserPassChange = (addr, field, value) => {
    setUserPass(prev => ({
      ...prev,
      [addr]: { ...prev[addr], [field]: value }
    }));
  };

  const handleToggleDetails = (addr) => {
    setDetailsOpen(prev => ({
      ...prev,
      [addr]: !prev[addr]
    }));
  };

  // Test für einzelnes Gerät (mit individuellen oder globalen Credentials)
  const handleTestLogin = async (slaveAddr, opts = {}) => {
    const creds = userPass[slaveAddr] || { user: globalUser, pass: globalPass };
    if (!opts.silent) setInfo('');
    setTestResults(prev => ({ ...prev, [slaveAddr]: undefined }));
    const args = [
      'TwinSAFE_Loader.exe',
      '--gw', gw,
      '--user', creds.user || '',
      '--pass', creds.pass || '',
      '--slave', slaveAddr,
      '--list', 'test.csv'
    ];
    // Ausgabe des Kommandos in der Konsole
    console.log('CLI-Kommando:', args.join(' '));
    if (!window.api?.runLoader) {
      if (!opts.silent) setInfo(
        `Mock: Login erfolgreich. Return code: 0`
      );
      setTestResults(prev => ({ ...prev, [slaveAddr]: 'success' }));
      return;
    }
    const result = await window.api.runLoader(args);
    if (!opts.silent) {
      setInfo(
        `Return code: ${result.code}\n` +
        (result.stdout ? `stdout:\n${result.stdout}\n` : '') +
        (result.stderr ? `stderr:\n${result.stderr}\n` : '')
      );
    }
    setTestResults(prev => ({
      ...prev,
      [slaveAddr]: result.code === 0 ? 'success' : 'fail'
    }));
  };

  // Globaler Test für alle Geräte: ruft die lokale Testfunktion für jeden Slave auf
  const handleTestAll = async () => {
    setInfo('');
    if (!devices.length) return;
    for (const dev of devices) {
      const addr = String(dev['EtherCAT address']);
      // eslint-disable-next-line no-await-in-loop
      await handleTestLogin(addr, { silent: true });
    }
  };

  // Hilfsfunktion: Projekt-CRC aus Loader-Output extrahieren (korrektes Format)
  function extractProjectCrc(output) {
    // Sucht nach "Download of '...' (0x....) to ..."
    const match = /Download of '.*?' \(0x([0-9a-fA-F]+)\) to/.exec(output);
    return match ? `0x${match[1]}` : '';
  }

  // Nach dem Laden: CRC extrahieren, anzeigen, Aktivieren freigeben
  const handleLoadBin = async (slaveAddr) => {
    const binFile = binFiles[slaveAddr];
    if (!binFile) return;
    setInfo('');
    const creds = userPass[slaveAddr] || { user: globalUser, pass: globalPass };
    const args = [
      'TwinSAFE_Loader.exe',
      '--gw', gw,
      '--user', creds.user || '',
      '--pass', creds.pass || '',
      '--slave', slaveAddr,
      '--proj', binFile
    ];
    console.log('CLI-Kommando:', args.join(' '));
    if (!window.api?.runLoader) {
      setInfo(`Mock: Laden erfolgreich. Return code: 0`);
      setCrcAfterLoad(prev => ({ ...prev, [slaveAddr]: '0xMOCKCRC' }));
      setCanActivate(prev => ({ ...prev, [slaveAddr]: true }));
      return;
    }
    const result = await window.api.runLoader(args);
    setInfo(
      `Return code: ${result.code}\n` +
      (result.stdout ? `stdout:\n${result.stdout}\n` : '') +
      (result.stderr ? `stderr:\n${result.stderr}\n` : '')
    );
    if (result.code === 0) {
      // Projekt-CRC aus Output extrahieren
      const crc = extractProjectCrc(result.stdout + '\n' + result.stderr) || '';
      setCrcAfterLoad(prev => ({ ...prev, [slaveAddr]: crc }));
      setCanActivate(prev => ({ ...prev, [slaveAddr]: !!crc }));
      alert('Laden erfolgreich');
    } else {
      setCanActivate(prev => ({ ...prev, [slaveAddr]: false }));
      alert('Fehler');
    }
  };

  // Aktivieren für ein Gerät
  const handleActivate = async (slaveAddr) => {
    setInfo('');
    const creds = userPass[slaveAddr] || { user: globalUser, pass: globalPass };
    const crc = crcAfterLoad[slaveAddr];
    if (!crc) {
      setInfo('Kein CRC nach Laden gefunden.');
      return;
    }
    const binFile = binFiles[slaveAddr];
    const args = [
      'TwinSAFE_Loader.exe',
      '--gw', gw,
      '--user', creds.user || '',
      '--pass', creds.pass || '',
      '--slave', slaveAddr,
      '--proj', binFile,
      '--crc', crc
    ];
    console.log('CLI-Kommando:', args.join(' '));
    if (!window.api?.runLoader) {
      setInfo(`Mock: Aktivieren erfolgreich. Return code: 0`);
      setActivateResults(prev => ({ ...prev, [slaveAddr]: 'success' }));
      return;
    }
    const result = await window.api.runLoader(args);
    setInfo(
      `Return code: ${result.code}\n` +
      (result.stdout ? `stdout:\n${result.stdout}\n` : '') +
      (result.stderr ? `stderr:\n${result.stderr}\n` : '')
    );
    setActivateResults(prev => ({
      ...prev,
      [slaveAddr]: result.code === 0 ? 'success' : 'fail'
    }));
    alert(result.code === 0 ? 'Aktivieren erfolgreich' : 'Fehler beim Aktivieren');
  };

  // Globales Aktivieren: alle Geräte mit CRC aktivieren
  const handleActivateAll = async () => {
    setInfo('');
    for (const dev of devices) {
      const addr = String(dev['EtherCAT address']);
      if (canActivate[addr]) {
        // eslint-disable-next-line no-await-in-loop
        await handleActivate(addr);
      }
    }
  };

  // Delete-Funktion für ein Gerät
  function handleDelete(slaveAddr) {
    setInfo('');
    const creds = userPass[slaveAddr] || { user: globalUser, pass: globalPass };
    const args = [
      'TwinSAFE_Loader.exe',
      '--gw', gw,
      '--user', creds.user || '',
      '--pass', creds.pass || '',
      '--slave', slaveAddr,
      '--delete'
    ];
    console.log('CLI-Kommando:', args.join(' '));
    if (!window.api?.runLoader) {
      setInfo(`Mock: Delete erfolgreich. Return code: 0`);
      return;
    }
    window.api.runLoader(args).then(result => {
      setInfo(
        `Return code: ${result.code}\n` +
        (result.stdout ? `stdout:\n${result.stdout}\n` : '') +
        (result.stderr ? `stderr:\n${result.stderr}\n` : '')
      );
      alert(result.code === 0 ? 'Delete erfolgreich' : 'Fehler beim Delete');
    });
  }

  return (
    <div style={{
      fontFamily: 'Segoe UI, Arial, sans-serif',
      background: '#f8f9fa',
      minHeight: '100vh',
      margin: 0,
      padding: 0
    }}>
      <header style={{
        background: BRUDERER_GREEN,
        color: '#fff',
        padding: '12px 32px 12px 16px',
        fontSize: 28,
        fontWeight: 700,
        letterSpacing: 1,
        boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        display: 'flex',
        alignItems: 'center'
      }}>
        {/* Logo entfernt */}
        <span style={{ letterSpacing: 2 }}>BRUDERER</span>
        <span style={{
          fontWeight: 400,
          fontSize: 18,
          marginLeft: 20,
          letterSpacing: 0,
          opacity: 0.8
        }}>
          TwinSAFE Loader UI
        </span>
      </header>
      <main style={{
        maxWidth: 1100,
        margin: '32px auto',
        background: '#fff',
        borderRadius: 12,
        boxShadow: '0 4px 24px rgba(0,0,0,0.07)',
        padding: 32
      }}>
        <section style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 500 }}>Gateway:</label>
            <select
              value={gw}
              onChange={e => setGw(e.target.value)}
              style={{
                padding: '6px 12px',
                borderRadius: 6,
                border: '1px solid #bbb',
                minWidth: 180,
                fontSize: 15
              }}
            >
              <option value="">Bitte wählen...</option>
              {adapters.length === 0 && <option disabled>Keine Adapter gefunden</option>}
              {adapters.map(a => (
                <option key={a.address} value={a.address}>{a.name} ({a.address})</option>
              ))}
            </select>
            <input
              type="text"
              placeholder="Custom Gateway"
              value={customGw}
              onChange={e => setCustomGw(e.target.value)}
              style={{
                width: 160,
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #bbb'
              }}
            />
            <button
              onClick={handleAddCustomGw}
              disabled={!customGw}
              style={{
                background: BRUDERER_GREEN,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 18px',
                fontWeight: 500,
                cursor: customGw ? 'pointer' : 'not-allowed',
                opacity: customGw ? 1 : 0.5
              }}
            >
              Hinzufügen
            </button>
            <button
              onClick={handleScan}
              disabled={!gw}
              style={{
                background: '#fff',
                color: BRUDERER_GREEN,
                border: `2px solid ${BRUDERER_GREEN}`,
                borderRadius: 6,
                padding: '6px 18px',
                fontWeight: 500,
                cursor: gw ? 'pointer' : 'not-allowed',
                opacity: gw ? 1 : 0.5
              }}
            >
              Klemmen scannen
            </button>
            <span style={{ marginLeft: 10, fontWeight: 500, color: '#888' }}>{scanStatus}</span>
          </div>
        </section>
        <section style={{ marginBottom: 28 }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 16, flexWrap: 'wrap' }}>
            <label style={{ fontWeight: 500 }}>User:</label>
            <input
              type="text"
              placeholder="Global User"
              value={globalUser}
              onChange={e => setGlobalUser(e.target.value)}
              style={{
                width: 120,
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #bbb'
              }}
            />
            <label style={{ fontWeight: 500 }}>Passwort:</label>
            <input
              type="password"
              placeholder="Global Passwort"
              value={globalPass}
              onChange={e => setGlobalPass(e.target.value)}
              style={{
                width: 120,
                padding: '6px 10px',
                borderRadius: 6,
                border: '1px solid #bbb'
              }}
            />
            <button
              onClick={handleTestAll}
              disabled={!globalUser || !globalPass || !devices.length}
              style={{
                background: BRUDERER_GREEN,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 18px',
                fontWeight: 500,
                cursor: (!globalUser || !globalPass || !devices.length) ? 'not-allowed' : 'pointer',
                opacity: (!globalUser || !globalPass || !devices.length) ? 0.5 : 1
              }}
            >
              Alle testen
            </button>
          </div>
        </section>
        <section>
          <div style={{ marginBottom: 18, display: 'flex', alignItems: 'center', gap: 16 }}>
            <button
              onClick={handleActivateAll}
              disabled={
                !devices.some(dev => canActivate[String(dev['EtherCAT address'])])
              }
              style={{
                background: BRUDERER_GREEN,
                color: '#fff',
                border: 'none',
                borderRadius: 6,
                padding: '6px 18px',
                fontWeight: 500,
                cursor: devices.some(dev => canActivate[String(dev['EtherCAT address'])]) ? 'pointer' : 'not-allowed',
                opacity: devices.some(dev => canActivate[String(dev['EtherCAT address'])]) ? 1 : 0.5
              }}
            >
              Alle aktivieren
            </button>
          </div>
          <h3 style={{ marginBottom: 16, color: BRUDERER_GREEN, fontWeight: 700 }}>Gefundene TwinSAFE Logic Geräte</h3>
          <div style={{ overflowX: 'auto' }}>
            <table style={{
              width: '100%',
              borderCollapse: 'collapse',
              background: '#fff',
              borderRadius: 8,
              overflow: 'hidden',
              boxShadow: '0 1px 4px rgba(0,0,0,0.04)'
            }}>
              <thead style={{ background: '#f3f3f3' }}>
                <tr>
                  <th style={{ padding: 8 }}>EtherCAT Addr</th>
                  <th style={{ padding: 8 }}>FSoE Addr</th>
                  <th style={{ padding: 8 }}>Typ</th>
                  <th style={{ padding: 8 }}>CRC</th>
                  <th style={{ padding: 8 }}>Name</th>
                  <th style={{ padding: 8 }}>Seriennr.</th>
                  <th style={{ padding: 8 }}>Details</th>
                  <th style={{ padding: 8 }}>Test</th>
                  <th style={{ padding: 8 }}>Bin-File</th>
                  <th style={{ padding: 8 }}>Laden</th>
                  <th style={{ padding: 8 }}>CRC nach Laden</th>
                  <th style={{ padding: 8 }}>Aktivieren</th>
                  <th style={{ padding: 8 }}>Delete</th>
                </tr>
              </thead>
              <tbody>
                {devices.map(dev => {
                  const addr = String(dev['EtherCAT address']);
                  const creds = userPass[addr] || {};
                  const open = detailsOpen[addr];
                  const testResult = testResults[addr];
                  const crcLoaded = crcAfterLoad[addr] || '';
                  const canAct = canActivate[addr];
                  const activateResult = activateResults[addr];
                  return (
                    <tr key={addr} style={{ borderBottom: '1px solid #eee', background: open ? '#f9f9f9' : '#fff' }}>
                      <td style={{ padding: 8 }}>{dev['EtherCAT address']}</td>
                      <td style={{ padding: 8 }}>{dev['FSoE address']}</td>
                      <td style={{ padding: 8 }}>{dev['type']}</td>
                      <td style={{ padding: 8 }}>{dev['project crc']}</td>
                      <td style={{ padding: 8 }}>{dev['name']}</td>
                      <td style={{ padding: 8 }}>{dev['serial number']}</td>
                      <td style={{ padding: 8, minWidth: 120 }}>
                        <button
                          onClick={() => handleToggleDetails(addr)}
                          style={{
                            background: open ? '#eee' : '#fff',
                            color: BRUDERER_GREEN,
                            border: `1px solid ${BRUDERER_GREEN}`,
                            borderRadius: 6,
                            padding: '4px 10px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          {open ? 'Details ausblenden' : 'Details'}
                        </button>
                        {open && (
                          <div style={{ marginTop: 7 }}>
                            <input
                              type="text"
                              placeholder="User"
                              value={typeof creds.user === 'string' ? creds.user : ''}
                              onChange={e => handleUserPassChange(addr, 'user', e.target.value)}
                              style={{
                                width: 80,
                                padding: '4px 7px',
                                borderRadius: 6,
                                border: '1px solid #bbb',
                                marginRight: 6
                              }}
                              autoComplete="username"
                            />
                            <input
                              type="password"
                              placeholder="Passwort"
                              value={typeof creds.pass === 'string' ? creds.pass : ''}
                              onChange={e => handleUserPassChange(addr, 'pass', e.target.value)}
                              style={{
                                width: 80,
                                padding: '4px 7px',
                                borderRadius: 6,
                                border: '1px solid #bbb'
                              }}
                              autoComplete="current-password"
                            />
                          </div>
                        )}
                      </td>
                      <td style={{ padding: 8 }}>
                        <button
                          onClick={() => handleTestLogin(addr)}
                          style={{
                            background: testResult === 'success' ? BRUDERER_GREEN : testResult === 'fail' ? ERROR_RED : '#fff',
                            color: testResult ? '#fff' : BRUDERER_GREEN,
                            border: `1.5px solid ${testResult === 'success' ? BRUDERER_GREEN : testResult === 'fail' ? ERROR_RED : BRUDERER_GREEN}`,
                            borderRadius: 6,
                            padding: '4px 12px',
                            fontWeight: 500,
                            cursor: 'pointer',
                            transition: 'background 0.2s, border 0.2s, color 0.2s'
                          }}
                        >
                          Test
                        </button>
                      </td>
                      <td style={{ padding: 8, minWidth: 120 }}>
                        <button
                          onClick={() => handleChooseBin(addr)}
                          style={{
                            background: binFiles[addr] ? BRUDERER_GREEN : '#fff',
                            color: binFiles[addr] ? '#fff' : BRUDERER_GREEN,
                            border: `1.5px solid ${BRUDERER_GREEN}`,
                            borderRadius: 6,
                            padding: '4px 12px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          {binFiles[addr] ? 'Geändert' : 'Wählen'}
                        </button>
                        <div style={{
                          fontSize: 10,
                          maxWidth: 120,
                          wordBreak: 'break-all',
                          color: '#888',
                          marginTop: 2
                        }}>
                          {binFiles[addr] || ''}
                        </div>
                      </td>
                      <td style={{ padding: 8 }}>
                        <button
                          onClick={() => handleLoadBin(addr)}
                          disabled={!binFiles[addr]}
                          style={{
                            background: binFiles[addr] ? BRUDERER_GREEN : '#eee',
                            color: binFiles[addr] ? '#fff' : '#aaa',
                            border: 'none',
                            borderRadius: 6,
                            padding: '4px 12px',
                            fontWeight: 500,
                            cursor: binFiles[addr] ? 'pointer' : 'not-allowed',
                            opacity: binFiles[addr] ? 1 : 0.6
                          }}
                        >
                          Laden
                        </button>
                      </td>
                      <td style={{ padding: 8, fontFamily: 'monospace', color: '#333', fontSize: 13 }}>
                        {crcLoaded}
                      </td>
                      <td style={{ padding: 8 }}>
                        <button
                          onClick={() => handleActivate(addr)}
                          disabled={!canAct}
                          style={{
                            background: canAct
                              ? activateResult === 'success'
                                ? BRUDERER_GREEN
                                : activateResult === 'fail'
                                  ? ERROR_RED
                                  : '#fff'
                              : '#eee',
                            color: canAct && activateResult ? '#fff' : canAct ? BRUDERER_GREEN : '#aaa',
                            border: canAct
                              ? `1.5px solid ${activateResult === 'success'
                                ? BRUDERER_GREEN
                                : activateResult === 'fail'
                                  ? ERROR_RED
                                  : BRUDERER_GREEN}`
                              : '1.5px solid #ccc',
                            borderRadius: 6,
                            padding: '4px 12px',
                            fontWeight: 500,
                            cursor: canAct ? 'pointer' : 'not-allowed',
                            opacity: canAct ? 1 : 0.6,
                            transition: 'background 0.2s, border 0.2s, color 0.2s'
                          }}
                        >
                          Aktivieren
                        </button>
                      </td>
                      <td style={{ padding: 8 }}>
                        <button
                          onClick={() => handleDelete(addr)}
                          style={{
                            background: '#fff',
                            color: ERROR_RED,
                            border: `1.5px solid ${ERROR_RED}`,
                            borderRadius: 6,
                            padding: '4px 12px',
                            fontWeight: 500,
                            cursor: 'pointer'
                          }}
                        >
                          Delete
                        </button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </section>
        <section>
          <div style={{
            marginTop: 32,
            background: '#f4f4f4',
            borderRadius: 8,
            boxShadow: '0 1px 4px rgba(0,0,0,0.03)',
            padding: 16,
            minHeight: 60,
            fontFamily: 'monospace',
            whiteSpace: 'pre-wrap',
            color: '#222'
          }}>
            <b>Status/Info:</b>
            <br />
            {info}
          </div>
        </section>
        <footer style={{
          marginTop: 36,
          textAlign: 'center',
          color: '#888',
          fontSize: 14,
          padding: 12
        }}>
          © {new Date().getFullYear()} BRUDERER AG &ndash; TwinSAFE Loader UI
        </footer>
      </main>
    </div>
  );
}

export default App;