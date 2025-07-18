import { Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { HlmButtonDirective } from '@spartan-ng/helm/button';
import { HlmFormFieldModule } from '@spartan-ng/helm/form-field';
import { HlmInputDirective } from '@spartan-ng/helm/input';
import { HlmLabelDirective } from '@spartan-ng/helm/label';
import { provideTablerIcons, TablerIconComponent } from 'angular-tabler-icons';
import { IconBrandGoogleFilled } from 'angular-tabler-icons/icons';

@Component({
  selector: 'app-login',
  imports: [
    HlmFormFieldModule,
    HlmInputDirective,
    HlmLabelDirective,
    HlmButtonDirective,
    TablerIconComponent,
    RouterLink,
  ],
  providers: [
    provideTablerIcons({
      IconBrandGoogleFilled,
    }),
  ],
  templateUrl: './login.html',
})
export class Login {}
