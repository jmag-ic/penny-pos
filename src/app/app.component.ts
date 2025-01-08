import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { NzButtonModule } from 'ng-zorro-antd/button';
import { NzInputModule } from 'ng-zorro-antd/input';

@Component({
  selector: 'app-root',
  imports: [RouterOutlet, NzButtonModule, NzInputModule],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
}
