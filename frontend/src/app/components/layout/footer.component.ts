import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="bg-gov-primary text-white mt-auto border-t-4 border-gov-gold">
      <div class="max-w-5xl mx-auto px-4 py-12">
        <div class="grid grid-cols-1 md:grid-cols-3 gap-10">
          <div>
            <div class="flex items-center space-x-3 font-bold text-xl text-gov-gold mb-4" aria-hidden="true">
              <span>MD</span>
              <span class="font-serif">e-Petiție</span>
            </div>
            <p class="text-sm text-slate-300 leading-relaxed max-w-sm">
              Sistemul Informațional Automatizat pentru gestionarea petițiilor și inițiativelor colective ale cetățenilor Republicii Moldova. Dezvoltat în conformitate cu prevederile Codului Administrativ nr. 116/2018.
            </p>
          </div>
          <div>
            <h2 class="text-base font-semibold text-white tracking-wider mb-4 font-serif">Temei Legal & Servicii</h2>
            <ul class="text-sm text-slate-300 space-y-3" aria-label="Linkuri utile">
              <li><a href="https://actelocale.gov.md" target="_blank" class="hover:text-gov-gold transition-colors focus-visible underline-offset-2">Actele Locale</a></li>
              <li><a href="https://servicii.gov.md" target="_blank" class="hover:text-gov-gold transition-colors focus-visible underline-offset-2">Portalul Serviciilor Publice</a></li>
              <li><a href="https://gov.md" target="_blank" class="hover:text-gov-gold transition-colors focus-visible underline-offset-2">Guvernul Republicii Moldova</a></li>
            </ul>
          </div>
          <div>
            <h2 class="text-base font-semibold text-white tracking-wider mb-4 font-serif">Contact & Suport</h2>
            <address class="text-sm text-slate-300 space-y-2 not-italic">
              <p>Cancelaria de Stat a Republicii Moldova</p>
              <p>Piața Marii Adunări Naționale nr. 1, Chișinău</p>
              <p class="pt-3 font-semibold text-gov-gold text-base">Suport: 0800 01 234</p>
              <p><a href="mailto:suport.petitie@gov.md" class="hover:text-gov-gold transition-colors focus-visible underline-offset-2">suport.petitie&#64;gov.md</a></p>
            </address>
          </div>
        </div>
        <div class="border-t border-slate-700 mt-10 pt-8 flex flex-col md:flex-row justify-between items-center text-sm text-slate-400 gap-4">
          <p>© 2026 Guvernul Republicii Moldova. Toate drepturile rezervate.</p>
          <p>Dezvoltat conform Standardelor Digitale GovTech.</p>
        </div>
      </div>
    </footer>
  `
})
export class FooterComponent {}
