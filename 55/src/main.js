import { Navbar } from './components/Navbar.js'
import { router } from './router.js'
const app=document.getElementById('app');
app.innerHTML=`${Navbar()}<main id="view" class="mx-auto max-w-6xl px-4 py-6"></main>`;
if(!location.hash)location.hash='#/';
addEventListener('hashchange',router);
router();
