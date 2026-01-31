import { createRoot } from 'react-dom/client';
import { ClauseGuardUI } from '../components/ClauseGuardUI';

const CONTAINER_ID = 'clause-guard-extension-root';

function injectUI(): void {
  if (document.getElementById(CONTAINER_ID)) {
    return;
  }

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
