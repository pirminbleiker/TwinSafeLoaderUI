import React from 'react';
import './App.css';
import { parseTwinSafeCsv } from './utils';
import GatewaySelector from './components/GatewaySelector';
import UserSection from './components/UserSection';
import DeviceTable from './components/DeviceTable';
import StatusBox from './components/StatusBox';
import { useLoaderActions } from './useLoaderActions';
import { useGateway } from './useGateway';

const BRUDERER_GREEN = "#009639";
const ERROR_RED = "#d32f2f";

function App() {
  // Gateway/Scan State & Handler ausgelagert
  const {
    adapters, setAdapters,
    gw, setGw,
    customGw, setCustomGw,
    scanStatus, setScanStatus,
    devices, setDevices,
    handleScan
  } = useGateway();

  // ...restlicher State...
  const [binFiles, setBinFiles] = React.useState({});
  const [info, setInfo] = React.useState('');
  const [userPass, setUserPass] = React.useState({});
  const [globalUser, setGlobalUser] = React.useState('Administrator');
  const [globalPass, setGlobalPass] = React.useState('TwinSAFE');
  const [detailsOpen, setDetailsOpen] = React.useState({});
  const [testResults, setTestResults] = React.useState({});
  const [activateResults, setActivateResults] = React.useState({});
  const [crcAfterLoad, setCrcAfterLoad] = React.useState({});
  const [canActivate, setCanActivate] = React.useState({});

  const loaderActions = useLoaderActions({
    gw, userPass, globalUser, globalPass, binFiles, setBinFiles,
    setInfo, setTestResults, setActivateResults, setCrcAfterLoad, setCanActivate, setDevices, setScanStatus
  });

  return (
    <div className="app-root">
      <header className="app-header">
        <span className="app-logo">BRUDERER</span>
        <span className="app-title">TwinSAFE Loader UI</span>
      </header>
      <main className="app-main">
        <GatewaySelector
          adapters={adapters}
          gw={gw}
          setGw={setGw}
          customGw={customGw}
          setCustomGw={setCustomGw}
          handleAddCustomGw={
            () => {
              if (customGw && !adapters.some(a => a.address === customGw)) {
                setAdapters(prev => [...prev, { name: 'Custom', address: customGw }]);
                setGw(customGw);
                setCustomGw('');
              }
            }
          }
          handleScan={handleScan}
          scanStatus={scanStatus}
        />
        <UserSection
          globalUser={globalUser}
          setGlobalUser={setGlobalUser}
          globalPass={globalPass}
          setGlobalPass={setGlobalPass}
          handleTestAll={
            async () => {
              setInfo('');
              if (!devices.length) return;
              for (const dev of devices) {
                const addr = String(dev['EtherCAT address']);
                // eslint-disable-next-line no-await-in-loop
                await loaderActions.handleTestLogin(addr, { silent: true });
              }
            }
          }
          devices={devices}
        />
        <DeviceTable
          devices={devices}
          userPass={userPass}
          setUserPass={setUserPass}
          detailsOpen={detailsOpen}
          setDetailsOpen={setDetailsOpen}
          testResults={testResults}
          handleTestLogin={loaderActions.handleTestLogin}
          binFiles={binFiles}
          handleChooseBin={loaderActions.handleChooseBin}
          handleLoadBin={loaderActions.handleLoadBin}
          crcAfterLoad={crcAfterLoad}
          canActivate={canActivate}
          handleActivate={loaderActions.handleActivate}
          activateResults={activateResults}
          handleDelete={loaderActions.handleDelete}
        />
        <StatusBox info={info} />
        <footer className="app-footer">
          © {new Date().getFullYear()} BRUDERER AG &ndash; TwinSAFE Loader UI
        </footer>
      </main>
    </div>
  );
}

export default App;