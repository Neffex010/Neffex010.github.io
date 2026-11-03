import './styles/main.css';
import './styles/components.css';

import { UIManager } from './ui/UIManager.js';

const root = document.querySelector('#app');

if (root) {
  new UIManager(root);
} else {
  console.error('No se encontró el contenedor #app en index.html.');
}