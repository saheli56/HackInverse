import { createRoot } from 'react-dom/client';
import { ClauseGuardUI } from '../components/ClauseGuardUI';
import { isRelevantPage } from '../utils/pageDetector';

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
    @keyframes slideInFromRight {
      from {
        transform: translateX(100%);
        opacity: 0;
      }
      to {
        transform: translateX(0);
        opacity: 1;
      }
    }
    @keyframes slideOutToRight {
      from {
        transform: translateX(0);
        opacity: 1;
      }
      to {
        transform: translateX(100%);
        opacity: 0;
      }
    }
    @keyframes fadeIn {
      from { opacity: 0; }
      to { opacity: 1; }
    }
    #${CONTAINER_ID} * {
      box-sizing: border-box;
    }
  `;
  document.head.appendChild(style);
}

function injectUI(): void {
  if (!isRelevantPage()) {
    return;
  }

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
