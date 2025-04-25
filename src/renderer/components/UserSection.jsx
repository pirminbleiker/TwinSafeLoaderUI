import React from 'react';

function UserSection({
  globalUser, setGlobalUser, globalPass, setGlobalPass, handleTestAll, devices
}) {
  return (
    <section className="user-section">
      <div className="user-row">
        <label>User:</label>
        <input
          type="text"
          placeholder="Global User"
          value={globalUser}
          onChange={e => setGlobalUser(e.target.value)}
        />
        <label>Passwort:</label>
        <input
          type="password"
          placeholder="Global Passwort"
          value={globalPass}
          onChange={e => setGlobalPass(e.target.value)}
        />
        <button
          className="btn"
          onClick={handleTestAll}
          disabled={!globalUser || !globalPass || !devices.length}
        >
          Alle testen
        </button>
      </div>
    </section>
  );
}

export default UserSection;
