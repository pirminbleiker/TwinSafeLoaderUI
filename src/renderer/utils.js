// TwinSAFE CSV parsen
export function parseTwinSafeCsv(csv) {
  const lines = csv.trim().split('\n');
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

// Projekt-CRC aus Loader-Output extrahieren
export function extractProjectCrc(output) {
  const match = /Download of '.*?' \(0x([0-9a-fA-F]+)\) to/.exec(output);
  return match ? `0x${match[1]}` : '';
}
