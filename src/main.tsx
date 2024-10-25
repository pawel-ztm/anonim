import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import App2 from './App2.tsx';
import App from './App.tsx';
import 'bootstrap/dist/css/bootstrap.min.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <App />
    {/* <App2 /> */}
  </StrictMode>
);
