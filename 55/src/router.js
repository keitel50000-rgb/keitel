import { Home, homeAfterMount } from './pages/Home.js'
import { Catalog, catalogAfterMount } from './pages/Catalog.js'
import { Detail, detailAfterMount } from './pages/Detail.js'
function q(){const s=new URLSearchParams(location.hash.split('?')[1]||'');return Object.fromEntries(s.entries())}
export async function router(){const view=document.getElementById('view');const h=(location.hash.split('?')[0]||'#/');if(h==='#/'||h==='#/inicio'){view.innerHTML=Home();homeAfterMount()}else if(h==='#/catalogo'){view.innerHTML=Catalog();catalogAfterMount()}else if(h==='#/detalle'){const {id}=q();view.innerHTML=Detail(id);detailAfterMount(id)}else{view.innerHTML='<section class="p-6"><h1 class="text-2xl font-bold">404</h1></section>'}}
