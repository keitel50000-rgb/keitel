// Combina el modelo 'toxicity' de TensorFlow.js con una detección sencilla
// de malas palabras y un pequeño lexicon de sentimiento.
// API:
//  - classifyText(text): Promise<{toxicity, badWords, sentiment, verdict}>

const badWordList = [
  'mierda','puta','puto','puta','idiota','imbecil','imbécil','estupido','estúpido','tonto','gilipollas'
];
const badWords = new Set(badWordList.map(w=>w.toLowerCase()));

const positiveWords = new Set(['bueno','genial','excelente','fantastico','feliz','agradable','buen']);
const negativeWords = new Set(['malo','horrible','terrible','triste','mal','odiar','odio','horrenda']);

async function ensureTF(){
  if(!window.tf){
    try{await import('https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.esm.min.js')}catch{
      await new Promise((ok,er)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@tensorflow/tfjs@4.22.0/dist/tf.min.js';s.onload=ok;s.onerror=er;document.head.appendChild(s)})
    }
  }
}

async function loadToxicity(){
  if(window.toxicity?.load) return window.toxicity.load(0.85);
  try{const m=await import('https://cdn.jsdelivr.net/npm/@tensorflow-models/toxicity@1.2.2/dist/toxicity.esm.js');return m.load(0.85)}catch{
    await new Promise((ok,er)=>{const s=document.createElement('script');s.src='https://cdn.jsdelivr.net/npm/@tensorflow-models/toxicity@1.2.2/dist/toxicity.min.js';s.onload=ok;s.onerror=er;document.head.appendChild(s)});
    return window.toxicity.load(0.85)
  }
}

function tokenize(text){
  return text
    .toLowerCase()
    .replace(/[\u00A0\n\r\t]+/g,' ')
    .replace(/[.,\/#!$%\^&\*;:{}=\-_`~()"'¿?¡!<>\[\]]/g,'')
    .split(/\s+/)
    .filter(Boolean);
}

export async function classifyText(text){
  const clean = String(text||'').trim();
  if(!clean) return {toxicity:[], badWords:[], sentiment:{score:0, label:'neutral'}, verdict:'empty'};
  await ensureTF();
  const model = await loadToxicity();
  const preds = await model.classify([clean]);

  // detectar malas palabras simples
  const tokens = tokenize(clean);
  const foundBad = Array.from(new Set(tokens.filter(t=>badWords.has(t))));

  // simple sentiment by lexicon counts
  let pos=0, neg=0;
  for(const t of tokens){ if(positiveWords.has(t)) pos++; if(negativeWords.has(t)) neg++; }
  const total = Math.max(1, tokens.length);
  const score = (pos - neg) / total; // en [-1,1]
  const sentimentLabel = score>0.05 ? 'positive' : score<-0.05 ? 'negative' : 'neutral';

  // decidir veredicto
  const toxicMatch = preds.some(p=>p.results[0].match);
  const verdict = toxicMatch || foundBad.length>0 || sentimentLabel==='negative' ? 'problematic' : 'ok';

  return {toxicity:preds, badWords:foundBad, sentiment:{score, label:sentimentLabel}, verdict};
}
