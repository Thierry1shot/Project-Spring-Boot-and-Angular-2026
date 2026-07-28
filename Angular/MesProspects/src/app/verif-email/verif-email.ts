import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { User } from '../model/user.model';
import { ActivatedRoute, Router } from '@angular/router';
import { Auth } from '../services/auth';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-verif-email',
  standalone: true,
  imports: [FormsModule],
  templateUrl: './verif-email.html',
  styleUrl: './verif-email.css',
})

export class VerifEmail implements OnInit {
  code: string = '';
  user: User = new User();
  err = '';

  constructor(
    private route: ActivatedRoute,
    private authService: Auth,
    private router: Router,
    private cdr: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    this.user = this.authService.regitredUser;
  }

  onValidateEmail() {
    this.authService.validateEmail(this.code).subscribe({
      next: (res) => {
        alert('Login successful');
        this.authService.login(this.user).subscribe({
          next: (data) => {
            let jwToken = data.headers.get('Authorization')!;
            this.authService.saveToken(jwToken);
            this.router.navigate(['/']);
          },
          error: (err: any) => {
            console.log(err);
          },
        });
      },
      error: (err: any) => {
        if ((err.error.errorCode == "INVALID_TOKEN")) {
          this.err = "Le code de vérification est invalide. Veuillez vérifier votre email et réessayer.";
          this.cdr.detectChanges();
        }
        if ((err.error.errorCode == "EXPIRED_TOKEN")) {
          this.err = "Le code de vérification a expiré. Veuillez demander un nouveau code.";
          this.cdr.detectChanges();
        }
        console.log(err.errorCode);
      },
    });
  }
}
