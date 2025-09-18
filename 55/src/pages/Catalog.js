import { store, debounce } from '../utils/storage.js'
const API='https://rickandmortyapi.com/api';
export function Catalog(){return`
  <section class="px-4 py-6">
    <div class="max-w-6xl mx-auto space-y-4">
      <div class="bg-white rounded-3xl p-4 shadow-[0_10px_25px_-15px_rgba(2,6,23,.35)] flex flex-col md:flex-row gap-3 items-center">
        <div class="flex items-center gap-2 md:flex-1 w-full">
          <svg class="w-5 h-5 text-zinc-400 ml-2" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" stroke="currentColor" aria-hidden="true"><path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-4.35-4.35M11 19a8 8 0 100-16 8 8 0 000 16z"/></svg>
          <input id="q" class="w-full md:w-auto flex-1 rounded-3xl border px-3 py-2" placeholder="Buscar por nombre…"/>
        </div>
        <div class="flex items-center gap-3">
          <label class="flex items-center gap-2"><input id="onlyFav" type="checkbox"/> <span class="text-sm">Solo favoritos</span></label>
          <select id="episode" class="rounded-3xl border px-3 py-2 text-sm"><option value="">Todos los episodios</option></select>
          <div id="count" class="text-sm text-zinc-500">Mostrando resultados…</div>
          <button id="clearFilters" class="rounded-3xl px-3 py-2 border text-sm">Limpiar filtros</button>
        </div>
      </div>
      <div id="grid" class="grid gap-4 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4"></div>
      <div id="sentinel" class="py-6 text-center text-sm text-zinc-500">Desplázate para cargar más…</div>
    </div>
  </section>`}
let state={page:1,query:'',next:null,favs:new Set(store.get('rm-favs',[])),episode:'',onlyFav:false};
function saveFavs(){store.set('rm-favs',Array.from(state.favs))}
function card(ch){const fav=state.favs.has(ch.id);return `<article class="rounded-2xl bg-white border shadow-sm overflow-hidden hover:shadow-xl transition-transform transform hover:-translate-y-1"><div class="overflow-hidden"><img src="${ch.image}" alt="${ch.name}" class="w-full aspect-square object-cover hover:scale-105 transition-transform duration-300"></div><div class="p-3 space-y-2"><h3 class="font-medium leading-tight">${ch.name}</h3><p class="text-sm text-zinc-600">${ch.species} · <span class="inline-block mr-1 ${ch.status==='Alive'?'text-green-600':'text-red-600'}">●</span>${ch.status}</p><div class="flex gap-2"><button data-fav="${ch.id}" class="rounded-3xl px-3 py-1 ${fav?'bg-yellow-400':'bg-zinc-100'}">${fav?'★ Quitar':'☆ Favorito'}</button><a href="#/detalle?id=${ch.id}" class="rounded-3xl px-3 py-1 border hover:bg-zinc-50">Ver detalle</a></div></div></article>`}
async function loadEpisodes(){const sel=document.getElementById('episode');let url=`${API}/episode`;const opts=[];while(url){const r=await fetch(url);const d=await r.json();d.results.forEach(ep=>opts.push(`<option value="${ep.id}">${ep.episode} · ${ep.name}</option>`));url=d.info.next}sel.insertAdjacentHTML('beforeend',opts.join(''))}
async function loadPage(reset=false){const grid=document.getElementById('grid');if(reset){grid.innerHTML='';state.page=1;state.next=null}
  if(state.episode){const ep=await (await fetch(`${API}/episode/${state.episode}`)).json();const ids=ep.characters.map(u=>+u.split('/').pop());const slice=ids.slice((state.page-1)*20,state.page*20);if(slice.length===0){state.next=null;return}const data=await (await fetch(`${API}/character/${slice.join(',')}`)).json();const arr=Array.isArray(data)?data:[data];const filt=state.onlyFav?arr.filter(x=>state.favs.has(x.id)):arr;grid.insertAdjacentHTML('beforeend',filt.map(card).join(''));state.page++;state.next=(state.page-1)*20<ids.length?'more':null;return}
  const r=await fetch(`${API}/character?page=${state.page}${state.query?`&name=${encodeURIComponent(state.query)}`:''}`);const d=await r.json();state.next=d.info.next;const arr=state.onlyFav?d.results.filter(x=>state.favs.has(x.id)):d.results;grid.insertAdjacentHTML('beforeend',arr.map(card).join(''));state.page++}
export function catalogAfterMount(){const grid=document.getElementById('grid');grid.innerHTML=Array.from({length:8}).map(()=>`<div class="rounded-2xl border bg-white shadow-sm h-[320px] animate-pulse"></div>`).join('');loadEpisodes().catch(console.warn);loadPage(true).catch(e=>{grid.innerHTML='<p class="text-red-600">Error cargando datos.</p>';console.error(e)});grid.addEventListener('click',e=>{const id=e.target.closest('button')?.dataset?.fav;if(!id)return;const n=+id;if(state.favs.has(n))state.favs.delete(n);else state.favs.add(n);saveFavs();e.target.textContent=state.favs.has(n)?'★ Quitar':'☆ Favorito';e.target.classList.toggle('bg-yellow-400');e.target.classList.toggle('bg-zinc-100')});document.getElementById('onlyFav').onchange=(e)=>{state.onlyFav=e.target.checked;loadPage(true)};document.getElementById('episode').onchange=(e)=>{state.episode=e.target.value;loadPage(true)};document.getElementById('q').oninput=debounce(e=>{state.query=e.target.value.trim();loadPage(true)},400);const io=new IntersectionObserver((en)=>{if(en[0].isIntersecting&&(state.next||state.episode))loadPage().catch(()=>{})},{rootMargin:'200px'});io.observe(document.getElementById('sentinel'))}
