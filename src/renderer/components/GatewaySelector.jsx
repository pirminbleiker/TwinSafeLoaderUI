import React from 'react';

function GatewaySelector({
  adapters, gw, setGw, customGw, setCustomGw, handleAddCustomGw, handleScan, scanStatus
}) {
  return (
    <section className="gateway-section">
      <div className="gateway-row">
        <label>Gateway:</label>
        <select value={gw} onChange={e => setGw(e.target.value)}>
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
        />
        <button
          className="btn"
          onClick={handleAddCustomGw} disabled={!customGw}>
          Hinzufügen
        </button>
        <button
          className="btn"
          onClick={handleScan} disabled={!gw}>
          Klemmen scannen
        </button>
        <span className="scan-status">{scanStatus}</span>
      </div>
    </section>
  );
}

export default GatewaySelector;
