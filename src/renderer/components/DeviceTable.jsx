import React from 'react';

function DeviceTable({
  devices,
  userPass,
  setUserPass,
  detailsOpen,
  setDetailsOpen,
  testResults,
  handleTestLogin,
  binFiles,
  handleChooseBin,
  handleLoadBin,
  crcAfterLoad,
  canActivate,
  handleActivate,
  activateResults,
  handleDelete
}) {
  return (
    <section>
      <h3 className="device-table-title">Gefundene TwinSAFE Logic Geräte</h3>
      <div className="device-table-wrapper">
        <table className="device-table">
          <thead>
            <tr>
              <th>EtherCAT Addr</th>
              <th>FSoE Addr</th>
              <th>Typ</th>
              <th>CRC</th>
              <th>Name</th>
              <th>Seriennr.</th>
              <th>Details</th>
              <th>Test</th>
              <th>Bin-File</th>
              <th>Laden</th>
              <th>CRC nach Laden</th>
              <th>Aktivieren</th>
              <th>Delete</th>
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

              // Button-Klasse für "Laden"
              let loadBtnClass = "btn load-btn";
              if (crcLoaded && binFiles[addr]) {
                loadBtnClass += " success";
              } else if (binFiles[addr]) {
                loadBtnClass += " enabled";
              } else {
                loadBtnClass += " disabled";
              }

              // Button-Klasse für "Aktivieren"
              let activateBtnClass = "btn activate-btn";
              if (canAct) {
                if (activateResult === 'success') {
                  activateBtnClass += " success";
                } else if (activateResult === 'fail') {
                  activateBtnClass += " fail";
                } else {
                  activateBtnClass += " enabled";
                }
              } else {
                activateBtnClass += " disabled";
              }

              return (
                <tr key={addr}>
                  <td>{dev['EtherCAT address']}</td>
                  <td>{dev['FSoE address']}</td>
                  <td>{dev['type']}</td>
                  <td>{dev['project crc']}</td>
                  <td>{dev['name']}</td>
                  <td>{dev['serial number']}</td>
                  <td>
                    <button
                      className={`btn details-btn${open ? ' open' : ''}`}
                      onClick={() => setDetailsOpen(prev => ({ ...prev, [addr]: !prev[addr] }))}
                    >
                      {open ? 'Details ausblenden' : 'Details'}
                    </button>
                    {open && (
                      <div className="details-inputs">
                        <input
                          type="text"
                          placeholder="User"
                          value={typeof creds.user === 'string' ? creds.user : ''}
                          onChange={e => setUserPass(prev => ({
                            ...prev,
                            [addr]: { ...prev[addr], user: e.target.value }
                          }))}
                          className="input user-input"
                          autoComplete="username"
                        />
                        <input
                          type="password"
                          placeholder="Passwort"
                          value={typeof creds.pass === 'string' ? creds.pass : ''}
                          onChange={e => setUserPass(prev => ({
                            ...prev,
                            [addr]: { ...prev[addr], pass: e.target.value }
                          }))}
                          className="input pass-input"
                          autoComplete="current-password"
                        />
                      </div>
                    )}
                  </td>
                  <td>
                    <button
                      className={`btn test-btn${testResult === 'success' ? ' success' : testResult === 'fail' ? ' fail' : ''}`}
                      onClick={() => handleTestLogin(addr)}
                    >
                      Test
                    </button>
                  </td>
                  <td>
                    <button
                      className={`btn bin-btn${binFiles[addr] ? ' selected' : ''}`}
                      onClick={() => handleChooseBin(addr)}
                    >
                      {binFiles[addr] ? 'Geändert' : 'Wählen'}
                    </button>
                    <div className="binfile-path">{binFiles[addr] || ''}</div>
                  </td>
                  <td>
                    <button
                      className={loadBtnClass}
                      onClick={() => handleLoadBin(addr)}
                      disabled={!binFiles[addr]}
                    >
                      Laden
                    </button>
                  </td>
                  <td className="crc-cell">
                    {crcLoaded}
                  </td>
                  <td>
                    <button
                      className={activateBtnClass}
                      onClick={() => handleActivate(addr)}
                      disabled={!canAct}
                    >
                      Aktivieren
                    </button>
                  </td>
                  <td>
                    <button
                      className="btn delete-btn"
                      onClick={() => handleDelete(addr)}
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
  );
}

export default DeviceTable;
