import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet],
  template: `
    <div [className]="'bg-background min-h-svh'">
      <router-outlet></router-outlet>
    </div>
  `,
})
export class App {}
