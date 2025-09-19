import { classifyText } from '../utils/textClassifier.js'

// Home: Analizador IA solo en español (archivo limpio)
export function Home(){
  return `
  <section class="mx-auto max-w-3xl px-4 py-8">
    <div class="bg-gradient-to-r from-indigo-900 to-pink-700 text-white rounded-xl p-6">
      <h1 class="text-2xl font-bold">Analizador IA de Toxicidad (ES)</h1>
      <p class="text-sm text-zinc-200 mt-2">Introduce texto en español y pulsa Analizar. Umbral 0.85.</p>
      <div class="mt-4 bg-white rounded p-4 text-zinc-800">
        <textarea id="txt" rows="4" class="w-full p-2 border rounded" placeholder="Texto en español..."></textarea>
        <div class="flex gap-2 mt-3">
          <button id="exNice" class="px-3 py-1 rounded bg-green-100 text-green-800">Ejemplo amable</button>
          <button id="exBad" class="px-3 py-1 rounded bg-red-100 text-red-800">Ejemplo ofensivo</button>
          <button id="btn" class="ml-auto px-4 py-1 rounded bg-indigo-600 text-white">Analizar</button>
        </div>
        <div id="out" class="mt-3 text-sm"></div>
      </div>
    </div>
  </section>`
}

const EXAMPLES_NICE = ['gracias','me alegra verte','buen trabajo'];
const EXAMPLES_MEAN = ['eres un idiota','me das asco','cállate ya'];

function escapeHtml(s){ return String(s).replace(/[&<>"']/g, m=>({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":'&#39;'}[m])); }

async function ensureTF(){
  if(!window.tf){
    try{ await import('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.esm.min.js') }
    catch{ await new Promise((ok,er)=>{ const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js'; s.onload=ok; s.onerror=er; document.head.appendChild(s) }) }
  }
}

async function loadToxicity(){
  if(window.toxicity?.load) return window.toxicity.load(0.85);
  try{ const m = await import('https://cdn.jsdelivr.net/npm/@tensorflow-models/toxicity@1.2.2/dist/toxicity.esm.js'); return m.load(0.85); }
  catch{ await new Promise((ok,er)=>{ const s=document.createElement('script'); s.src='https://cdn.jsdelivr.net/npm/@tensorflow-models/toxicity@1.2.2/dist/toxicity.min.js'; s.onload=ok; s.onerror=er; document.head.appendChild(s) }); return window.toxicity.load(0.85); }
}

export function homeAfterMount(){
  const out = document.getElementById('out');
  const txt = document.getElementById('txt');
  const exNice = document.getElementById('exNice');
  const exBad = document.getElementById('exBad');

  if(!out || !txt) return;

  exNice.onclick = () => { txt.value = EXAMPLES_NICE[Math.floor(Math.random()*EXAMPLES_NICE.length)]; }
  exBad.onclick = () => { txt.value = EXAMPLES_MEAN[Math.floor(Math.random()*EXAMPLES_MEAN.length)]; }

  document.getElementById('btn').onclick = async () => {
    const text = txt.value.trim();
    if(!text){ out.innerHTML = '<div class="text-red-600">Escribe algo en español.</div>'; return }
    out.innerHTML = '<div class="text-zinc-600">Analizando...</div>';
    try{
      await ensureTF();
      await loadToxicity();
      const res = await classifyText(text);
      const langHtml = `<div class="text-xs text-zinc-500">Idioma analizado: es</div>`;
      const verdict = res.verdict === 'ok' ? 'NO tóxico' : 'TÓXICO';
      const sentHtml = `<div><strong>Sentimiento:</strong> ${escapeHtml(res.sentiment.label)} (${res.sentiment.score.toFixed(2)})</div>`;
      const badHtml = res.badWords.length ? `<div><strong>Malas palabras:</strong> ${res.badWords.map(escapeHtml).join(', ')}</div>` : '';
      const toxHtml = res.toxicity.map(p=>`<div>${p.label}: ${(p.results[0].probabilities[1]*100).toFixed(1)}% ${p.results[0].match? '⚠️':''}</div>`).join('');
      out.innerHTML = [langHtml, `<div><strong>Resultado:</strong> ${verdict}</div>`, sentHtml, badHtml, toxHtml].join('');
    }catch(e){ out.innerHTML = '<div class="text-yellow-800">Error cargando el modelo.</div>'; console.error(e) }
  }
}
