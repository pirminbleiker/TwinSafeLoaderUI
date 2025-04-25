import { parseTwinSafeCsv, extractProjectCrc } from './utils';

export function useLoaderActions({
  gw, userPass, globalUser, globalPass, binFiles, setBinFiles,
  setInfo, setTestResults, setActivateResults, setCrcAfterLoad, setCanActivate, setDevices, setScanStatus
}) {
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

  const handleChooseBin = async (slaveAddr) => {
    if (!window.api?.chooseBinFile) {
      setBinFiles(prev => ({ ...prev, [slaveAddr]: 'mock/path/to/file.bin' }));
      return;
    }
    const file = await window.api.chooseBinFile();
    if (file) {
      setBinFiles(prev => ({ ...prev, [slaveAddr]: file }));
    }
  };

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
      const crc = extractProjectCrc(result.stdout + '\n' + result.stderr) || '';
      setCrcAfterLoad(prev => ({ ...prev, [slaveAddr]: crc }));
      setCanActivate(prev => ({ ...prev, [slaveAddr]: !!crc }));
      alert('Laden erfolgreich');
    } else {
      setCanActivate(prev => ({ ...prev, [slaveAddr]: false }));
      alert('Fehler');
    }
  };

  const handleActivate = async (slaveAddr) => {
    setInfo('');
    const creds = userPass[slaveAddr] || { user: globalUser, pass: globalPass };
    const crc = binFiles[slaveAddr] && extractProjectCrc(binFiles[slaveAddr]);
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

  const handleDelete = (slaveAddr) => {
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
  };

  const handleTestAll = async (devices) => {
    setInfo('');
    if (!devices.length) return;
    for (const dev of devices) {
      const addr = String(dev['EtherCAT address']);
      // eslint-disable-next-line no-await-in-loop
      await handleTestLogin(addr, { silent: true });
    }
  };

  const handleScan = async () => {
    setScanStatus('Scanning...');
    setInfo('');
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

  return {
    handleTestLogin,
    handleChooseBin,
    handleLoadBin,
    handleActivate,
    handleDelete,
    handleTestAll,
    handleScan
  };
}
