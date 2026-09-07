import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-evo-navy text-white mt-auto border-t border-slate-800 pb-16 md:pb-0">
      <div class="max-w-6xl mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div class="flex items-center gap-3 font-bold text-xl text-white mb-4" aria-hidden="true">
              <div class="w-8 h-8 rounded-lg bg-evo-cobalt flex items-center justify-center text-xs font-black">
                EVO
              </div>
              <span class="font-display">e-Petiție GovTech</span>
            </div>
            <p class="text-sm text-slate-400 leading-relaxed max-w-sm">
              Modul integrat al ecosistemului de servicii digitale EVO Moldova. Asigură exercitarea dreptului la petiționare directă și inițiative publice conform Codului Administrativ al R. Moldova.
            </p>
          </div>
          <div>
            <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 font-display">Temei Legal & Servicii</h2>
            <ul class="text-sm text-slate-400 space-y-2.5" aria-label="Linkuri utile">
              <li><a href="https://evo.gov.md" target="_blank" class="hover:text-evo-cyan transition-colors focus-visible flex items-center gap-1.5"><span class="w-1.5 h-1.5 rounded-full bg-evo-cyan"></span>Ecosistemul EVO Moldova</a></li>
              <li><a href="https://actelocale.gov.md" target="_blank" class="hover:text-evo-cyan transition-colors focus-visible">Actele Locale R. Moldova</a></li>
              <li><a href="https://servicii.gov.md" target="_blank" class="hover:text-evo-cyan transition-colors focus-visible">Portalul Serviciilor Publice (MCatalog)</a></li>
              <li><a href="https://mpass.gov.md" target="_blank" class="hover:text-evo-cyan transition-colors focus-visible">MPass - Autentificare Digitală</a></li>
            </ul>
          </div>
          <div>
            <h2 class="text-sm font-semibold uppercase tracking-wider text-slate-300 mb-4 font-display">Contact & Asistență</h2>
            <address class="text-sm text-slate-400 space-y-2.5 not-italic">
              <p class="text-slate-300 font-medium">Cancelaria de Stat a Republicii Moldova</p>
              <p>Piața Marii Adunări Naționale nr. 1, Chișinău</p>
              <div class="pt-2">
                <span class="text-xs text-slate-500 uppercase tracking-wide block">Linia Verde Asistență</span>
                <span class="font-bold text-evo-cyan text-base">0800 01 234</span>
              </div>
              <p><a href="mailto:suport.petitie@gov.md" class="hover:text-evo-cyan transition-colors focus-visible">suport.petitie&#64;gov.md</a></p>
            </address>
          </div>
        </div>
        <div class="border-t border-slate-800 mt-10 pt-6 flex flex-col sm:flex-row justify-between items-center text-xs text-slate-500 gap-4">
          <p>© 2026 Guvernul Republicii Moldova • Ecosistemul Guvernamental EVO</p>
          <p class="flex items-center gap-2">
            <span class="w-2 h-2 rounded-full bg-emerald-500"></span>
            Sistem Operațional • Standard Security Level III
          </p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
