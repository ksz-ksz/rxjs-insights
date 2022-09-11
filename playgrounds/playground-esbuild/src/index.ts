import { playground } from './playground';

import { connect } from '@rxjs-insights/devtools/connect';

connect().then(playground);

const btn = document.createElement('button');
btn.textContent = 'run';
btn.addEventListener('click', playground);
document.body.append(btn);
