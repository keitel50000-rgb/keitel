import { store } from '../utils/storage.js'
const API='https://rickandmortyapi.com/api';
export function Detail(){return `<section class="max-w-6xl mx-auto px-4 py-6" id="detail"></section>`}
export async function detailAfterMount(id){const root=document.getElementById('detail');const r=await fetch(`${API}/character/${id}`);if(!r.ok){root.innerHTML='<p>Error.</p>';return}const ch=await r.json();const favs=new Set(store.get('rm-favs',[]));const fav=favs.has(ch.id);root.innerHTML=`
  <nav class="text-sm text-zinc-500 mb-3"><a href="#/catalogo" class="hover:underline">Catálogo</a> <span class="mx-2">›</span> <span aria-current="page">${ch.name}</span></nav>
  <div class="grid md:grid-cols-2 gap-6">
    <img src="${ch.image}" alt="${ch.name}" class="w-full rounded-3xl shadow-xl">
    <div class="space-y-3 bg-white p-4 rounded-3xl shadow-[0_10px_25px_-15px_rgba(2,6,23,.35)]">
      <div class="flex items-center justify-between">
        <h1 class="text-3xl font-bold">${ch.name}</h1>
        <div class="text-sm">
          <span class="px-3 py-1 rounded-full ${ch.status==='Alive'?'bg-green-100 text-green-700':'bg-red-100 text-red-700'}">${ch.status}</span>
        </div>
      </div>
      <div class="flex gap-2 flex-wrap text-sm text-zinc-600">
        <span class="rounded-md bg-zinc-100 px-2 py-1">${ch.gender}</span>
        <span class="rounded-md bg-zinc-100 px-2 py-1">${ch.species}</span>
      </div>
      <div class="space-y-1 mt-2 text-sm">
        <p><strong class="text-zinc-500">Origen:</strong> ${ch.origin?.name}</p>
        <p><strong class="text-zinc-500">Ubicación:</strong> ${ch.location?.name}</p>
      </div>
      <div class="flex gap-2 pt-2">
        <a href="#/catalogo" class="rounded-3xl px-3 py-2 border hover:bg-zinc-50">Volver al catálogo</a>
        <button id="fav" class="rounded-3xl px-3 py-2 ${fav?'bg-yellow-400':'bg-zinc-100'}">${fav?'★ Quitar':'☆ Favorito'}</button>
      </div>
    </div>
  </div>`;document.getElementById('fav').onclick=()=>{if(favs.has(ch.id))favs.delete(ch.id);else favs.add(ch.id);store.set('rm-favs',Array.from(favs));const b=document.getElementById('fav');b.textContent=favs.has(ch.id)?'★ Quitar':'☆ Favorito';b.classList.toggle('bg-yellow-400');b.classList.toggle('bg-zinc-100')}}
