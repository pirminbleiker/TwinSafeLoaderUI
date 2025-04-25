import { useEffect, useState } from 'react';
import { parseTwinSafeCsv } from './utils';

export function useGateway() {
  const [adapters, setAdapters] = useState([]);
  const [gw, setGw] = useState('');
  const [customGw, setCustomGw] = useState('');
  const [scanStatus, setScanStatus] = useState('');
  const [devices, setDevices] = useState([]);

  useEffect(() => {
    if (window.api?.getNetworkInterfaces) {
      window.api.getNetworkInterfaces().then(data => {
        setAdapters(data || []);
      });
    } else {
      setAdapters([
        { name: 'MockAdapter', address: '192.168.67.254' }
      ]);
    }
  }, []);

  const handleScan = async () => {
    setScanStatus('Scanning...');
    // setInfo kann im App-Component gesetzt werden, falls benötigt
    const exportFile = 'export.csv';
    const args = ['TwinSAFE_Loader.exe', '--gw', gw, '--list', exportFile];
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
      }, 500);
      return;
    }
    const result = await window.api.runLoader(args);
    if (result.code === 0) {
      const csv = await window.api.readCsv(exportFile);
      setDevices(parseTwinSafeCsv(csv));
      setScanStatus('Scan erfolgreich');
    } else {
      setScanStatus('Fehler');
    }
  };

  return {
    adapters, setAdapters,
    gw, setGw,
    customGw, setCustomGw,
    scanStatus, setScanStatus,
    devices, setDevices,
    handleScan
  };
}
