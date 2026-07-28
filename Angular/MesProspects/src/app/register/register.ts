import { ChangeDetectorRef, Component, OnInit } from '@angular/core';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AbstractControl, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { User } from '../model/user.model';
import { Auth } from '../services/auth';
import { ToastrService } from 'ngx-toastr';

@Component({
  selector: 'app-register',
  imports: [FormsModule, ReactiveFormsModule, RouterLink],
  templateUrl: './register.html',
  styleUrl: './register.css',
})
export class Register implements OnInit {
  public user = new User();
  confirmPassword?: string;
  myForm!: FormGroup;
  err: any;
  loading: boolean = false;
  constructor(private formBuilder: FormBuilder, private AuthService: Auth, private cdr: ChangeDetectorRef, private router: Router,
    private toastr: ToastrService
  ) { }
  ngOnInit(): void {
    this.myForm = this.formBuilder.group({
      username: ['', [Validators.required]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', [Validators.required]]
    });
  }
  onRegister() {
    this.loading = true;
    this.cdr.detectChanges();
    this.AuthService.registerUser(this.user).subscribe({
      next: (res) => {
        this.AuthService.setRegistredUser(this.user);
        this.loading = false;
        this.cdr.detectChanges();
        //alert("veillez confirmer votre email");
        this.toastr.success('veillez confirmer votre email', 'Confirmation');
        this.router.navigate(["/verifEmail"]);
      },
      error: (err: any) => {
        this.loading = false;
        if (err.status = 400) {
          this.err = err.error.message;
          this.cdr.detectChanges();
        }
      }
    }
    )
  }
}