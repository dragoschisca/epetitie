import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './components/layout/header.component';
import { FooterComponent } from './components/layout/footer.component';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [RouterOutlet, HeaderComponent, FooterComponent],
  template: `
    <div class="min-h-screen flex flex-col bg-evo-bg selection:bg-evo-cobalt selection:text-white">
      <a href="#main-content" class="sr-only focus:not-sr-only focus:absolute focus:top-4 focus:left-4 z-50 bg-white text-evo-navy px-4 py-2 font-bold shadow-md rounded-xl border border-evo-border">
        Treci la conținutul principal
      </a>
      <app-header></app-header>
      <main id="main-content" class="flex-grow flex flex-col max-w-6xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8">
        <router-outlet></router-outlet>
      </main>
      <app-footer></app-footer>
    </div>
  `
})
export class AppComponent {
  title = 'e-Petiție GovTech EVO Platform';
}
