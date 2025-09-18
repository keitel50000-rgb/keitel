export function Home(){return`
  <section class="mx-auto max-w-6xl px-4 py-8">
    <div class="rounded-3xl overflow-hidden shadow-[0_10px_25px_-15px_rgba(2,6,23,.35)] bg-gradient-to-r from-indigo-900 via-purple-800 to-pink-700 text-white p-8">
      <div class="flex flex-col md:flex-row items-start gap-6">
        <div class="flex-1">
          <h1 class="text-4xl md:text-5xl font-extrabold tracking-tight">Analizador IA de Toxicidad</h1>
          <ul class="mt-4 space-y-2 text-sm text-zinc-200">
            <li>• Escribe un texto cualquiera.</li>
            <li>• Pulsa <strong>Analizar</strong>.</li>
            <li>• Lee el veredicto y las categorías activadas.</li>
          </ul>
          <p class="mt-4 text-xs text-zinc-200">Análisis local (navegador). Umbral: <strong>0.85</strong>.</p>
          <div class="mt-6">
            <a id="visitCatalog" href="#/catalogo" class="inline-block transform hover:scale-105 transition rounded-3xl bg-gradient-to-r from-cyan-400 to-indigo-600 text-indigo-900 font-bold px-8 py-4 shadow-xl text-lg">Visitar catálogo</a>
          </div>
        </div>
        <div class="w-full md:w-1/2 bg-white rounded-3xl p-6 text-zinc-800 shadow-[0_10px_25px_-15px_rgba(2,6,23,.35)]">
          <div class="flex items-center justify-between gap-3">
            <h2 class="text-xl font-semibold">Analizador IA de Toxicidad <span class="ml-2 text-xs px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">IA</span></h2>
            <p class="text-xs text-zinc-500">Modelo client-side · Umbral 0.85</p>
          </div>
          <div class="mt-3">
            <textarea id="txt" class="w-full rounded-2xl border px-3 py-3 focus:ring-4 focus:ring-primary-200 outline-none" rows="4" placeholder="Escribe un texto para analizar..."></textarea>
            <div class="flex gap-2 mt-3">
              <button id="exampleKind" class="rounded-2xl px-4 py-2 bg-green-100 text-green-800">Ejemplo amable</button>
              <button id="exampleOff" class="rounded-2xl px-4 py-2 bg-red-100 text-red-800">Ejemplo ofensivo</button>
            </div>
            <div class="flex gap-2 mt-4">
              <button id="btn" class="rounded-3xl px-6 py-3 bg-indigo-600 text-white hover:bg-indigo-700 focus-visible:ring-4 focus-visible:ring-primary-200">Analizar</button>
              <button id="clear" class="rounded-3xl px-6 py-3 border">Limpiar</button>
            </div>
            <div id="out" class="mt-4 grid gap-2"></div>
          </div>
        </div>
      </div>
    </div>
  </section>`}
async function ensureTF(){if(!window.tf){try{await import('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.esm.min.js')}catch{await new Promise((ok,er)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';s.onload=ok;s.onerror=er;document.head.appendChild(s)})}}}
async function loadToxicity(){if(window.toxicity?.load)return window.toxicity.load(0.85);try{const m=await import('https://cdn.jsdelivr.net/npm/@tensorflow-models/toxicity@1.2.2/dist/toxicity.esm.js');return m.load(0.85)}catch{await new Promise((ok,er)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@tensorflow-models/toxicity@1.2.2/dist/toxicity.min.js';s.onload=ok;s.onerror=er;document.head.appendChild(s)});return window.toxicity.load(0.85)}}
import { classifyText } from '../utils/textClassifier.js'

export function homeAfterMount(){
  const out=document.getElementById('out');
  document.getElementById('clear').onclick=()=>{document.getElementById('txt').value='';out.innerHTML=''};
  document.getElementById('btn').onclick=async()=>{
    const text=document.getElementById('txt').value.trim();
    if(!text){out.innerHTML=`<p class="text-red-600">Escribe algo.</p>`;return}
    out.innerHTML=`<div class="animate-pulse text-zinc-600">Analizando…</div>`;
    try{
      const res = await classifyText(text);
      const toxHtml = res.toxicity.map(p=>{
        const prob=(p.results[0].probabilities[1]*100).toFixed(2);
        const flag=p.results[0].match;
        return `<div class="rounded-xl border p-3 bg-white shadow-sm flex items-center justify-between"><span class="font-medium">${p.label}</span><span class="text-sm ${flag?'text-red-600':'text-green-600'}">${prob}% ${flag?'<strong>tóxico</strong>':'ok'}</span></div>`
      }).join('');

      const badHtml = res.badWords.length?`<div class="rounded-xl border p-3 bg-white shadow-sm"><strong>Malas palabras:</strong> ${res.badWords.join(', ')}</div>`:'';
      const sentHtml = `<div class="rounded-xl border p-3 bg-white shadow-sm"><strong>Sentimiento:</strong> ${res.sentiment.label} (score: ${res.sentiment.score.toFixed(2)})</div>`;
      const verdictHtml = `<div class="rounded-xl p-3 ${res.verdict==='ok'?'bg-green-50 border-green-200 text-green-800':'bg-red-50 border-red-200 text-red-800'}">Veredicto: <strong>${res.verdict}</strong></div>`;

      out.innerHTML = [verdictHtml, sentHtml, badHtml, toxHtml].join('');
    }catch(e){out.innerHTML='<p class="text-red-600">No se pudo analizar el texto.</p>';console.error(e)}
  }
}
