import {createRoot} from 'react-dom/client';
import App from './App.tsx';
import './index.css';
import { registerSW } from 'virtual:pwa-register';

// Register PWA service worker with auto-update
registerSW({
  immediate: true,
  onNeedRefresh() {
    console.log('PWA: New content available, updating in background...');
  },
  onOfflineReady() {
    console.log('PWA: Application offline cache ready.');
  },
});

createRoot(document.getElementById('root')!).render(<App />);
