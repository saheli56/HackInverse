import { createRoot } from 'react-dom/client';
import { ClauseGuardUI } from '../components/ClauseGuardUI';

const CONTAINER_ID = 'clause-guard-extension-root';

function injectStyles(): void {
  const style = document.createElement('style');
  style.textContent = `
    @keyframes spin {
      from { transform: rotate(0deg); }
      to { transform: rotate(360deg); }
    }
    @keyframes pulse {
      0%, 100% { opacity: 0.4; }
      50% { opacity: 1; }
    }
    #${CONTAINER_ID} * {
      box-sizing: border-box;
    }
  `;
  document.head.appendChild(style);
}

function injectUI(): void {
  if (document.getElementById(CONTAINER_ID)) {
    return;
  }

  injectStyles();

  const container = document.createElement('div');
  container.id = CONTAINER_ID;
  document.body.appendChild(container);

  const root = createRoot(container);
  root.render(<ClauseGuardUI />);
}

if (document.readyState === 'loading') {
  document.addEventListener('DOMContentLoaded', injectUI);
} else {
  injectUI();
}
