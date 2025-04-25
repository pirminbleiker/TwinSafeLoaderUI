import React from 'react';

function StatusBox({ info }) {
  return (
    <section>
      <div className="status-box">
        <b>Status/Info:</b>
        <br />
        {info}
      </div>
    </section>
  );
}

export default StatusBox;
