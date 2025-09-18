export function Navbar(){return`
  <nav class="sticky top-0 z-20 border-b bg-white/80 backdrop-blur">
    <div class="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
      <a href="#/" class="text-xl font-semibold tracking-tight">Rick & Morty SPA</a>
      <div class="flex gap-2 items-center">
        <a href="#/" class="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-zinc-100" aria-label="Abrir Analizador IA de Toxicidad" title="Abrir Analizador IA de Toxicidad">
          <span class="text-sm">Inicio</span>
          <span class="text-xs font-medium px-2 py-0.5 rounded-md bg-purple-100 text-purple-700">IA</span>
        </a>
        <a href="#/catalogo" class="flex items-center gap-2 px-3 py-1.5 rounded-xl hover:bg-zinc-100" aria-label="Ver catálogo de personajes" title="Ver catálogo de personajes">
          <span class="text-sm">Catálogo</span>
          <span class="text-xs font-medium px-2 py-0.5 rounded-md bg-zinc-100 text-zinc-800">Lista</span>
        </a>
      </div>
    </div>
  </nav>`}