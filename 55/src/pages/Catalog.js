import { store, debounce } from '../utils/storage.js'
const API='https://rickandmortyapi.com/api';
export function Catalog(){return`
  <section class="px-4 py-6">
    <div class="max-w-6xl mx-auto space-y-4">
      <div class="grid gap-3 md:grid-cols-4">
        <input id="q" class="md:col-span-2 rounded-lg border px-3 py-2" placeholder="Buscar por nombre…"/>
        <label class="flex items-center gap-2"><input id="onlyFav" type="checkbox"/> Solo favoritos</label>
        <select id="episode" class="rounded-lg border px-3 py-2"><option value="">Todos los episodios</option></select>
      </div>
      <div id="grid" class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"></div>
      <div id="sentinel" class="py-6 text-center text-sm text-zinc-500">Desplázate para cargar más…</div>
    </div>
  </section>`}
let state={page:1,query:'',next:null,favs:new Set(store.get('rm-favs',[])),episode:'',onlyFav:false};
function saveFavs(){store.set('rm-favs',Array.from(state.favs))}
function card(ch){const fav=state.favs.has(ch.id);return `<article class="rounded-2xl bg-white border shadow-sm overflow-hidden"><img src="${ch.image}" alt="${ch.name}" class="w-full aspect-square object-cover"><div class="p-3 space-y-2"><h3 class="font-medium leading-tight">${ch.name}</h3><p class="text-sm text-zinc-600">${ch.species} · ${ch.status}</p><div class="flex gap-2"><button data-fav="${ch.id}" class="rounded-lg px-3 py-1 ${fav?'bg-yellow-400':'bg-zinc-100'}">${fav?'★ Quitar':'☆ Favorito'}</button><a href="#/detalle?id=${ch.id}" class="rounded-lg px-3 py-1 border hover:bg-zinc-50">Ver detalle</a></div></div></article>`}
async function loadEpisodes(){const sel=document.getElementById('episode');let url=`${API}/episode`;const opts=[];while(url){const r=await fetch(url);const d=await r.json();d.results.forEach(ep=>opts.push(`<option value="${ep.id}">${ep.episode} · ${ep.name}</option>`));url=d.info.next}sel.insertAdjacentHTML('beforeend',opts.join(''))}
async function loadPage(reset=false){const grid=document.getElementById('grid');if(reset){grid.innerHTML='';state.page=1;state.next=null}
  if(state.episode){const ep=await (await fetch(`${API}/episode/${state.episode}`)).json();const ids=ep.characters.map(u=>+u.split('/').pop());const slice=ids.slice((state.page-1)*20,state.page*20);if(slice.length===0){state.next=null;return}const data=await (await fetch(`${API}/character/${slice.join(',')}`)).json();const arr=Array.isArray(data)?data:[data];const filt=state.onlyFav?arr.filter(x=>state.favs.has(x.id)):arr;grid.insertAdjacentHTML('beforeend',filt.map(card).join(''));state.page++;state.next=(state.page-1)*20<ids.length?'more':null;return}
  const r=await fetch(`${API}/character?page=${state.page}${state.query?`&name=${encodeURIComponent(state.query)}`:''}`);const d=await r.json();state.next=d.info.next;const arr=state.onlyFav?d.results.filter(x=>state.favs.has(x.id)):d.results;grid.insertAdjacentHTML('beforeend',arr.map(card).join(''));state.page++}
export function catalogAfterMount(){const grid=document.getElementById('grid');grid.innerHTML=Array.from({length:8}).map(()=>`<div class="rounded-2xl border bg-white shadow-sm h-[320px] animate-pulse"></div>`).join('');loadEpisodes().catch(console.warn);loadPage(true).catch(e=>{grid.innerHTML='<p class="text-red-600">Error cargando datos.</p>';console.error(e)});grid.addEventListener('click',e=>{const id=e.target.closest('button')?.dataset?.fav;if(!id)return;const n=+id;if(state.favs.has(n))state.favs.delete(n);else state.favs.add(n);saveFavs();e.target.textContent=state.favs.has(n)?'★ Quitar':'☆ Favorito';e.target.classList.toggle('bg-yellow-400');e.target.classList.toggle('bg-zinc-100')});document.getElementById('onlyFav').onchange=(e)=>{state.onlyFav=e.target.checked;loadPage(true)};document.getElementById('episode').onchange=(e)=>{state.episode=e.target.value;loadPage(true)};document.getElementById('q').oninput=debounce(e=>{state.query=e.target.value.trim();loadPage(true)},400);const io=new IntersectionObserver((en)=>{if(en[0].isIntersecting&&(state.next||state.episode))loadPage().catch(()=>{})},{rootMargin:'200px'});io.observe(document.getElementById('sentinel'))}
