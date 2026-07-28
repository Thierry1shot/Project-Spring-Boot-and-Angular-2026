import { Injectable } from '@angular/core';
import { User } from '../model/user.model';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { JwtHelperService } from '@auth0/angular-jwt';

@Injectable({
  providedIn: 'root',
})
export class Auth {
  public loggedUser!: string;
  public isloggedIn: Boolean = false;
  public roles!: string[];
  private helper = new JwtHelperService();
  public regitredUser: User = new User();


  apiURL: string = 'http://localhost:8081/utilisateur';
  token!: string;

  constructor(private router: Router,
    private http: HttpClient) { }

  setLoggedUserFromLocalStorage(login: string) {
    this.loggedUser = login;
    this.isloggedIn = true;
  }

  login(user: User) {
    return this.http.post<User>(this.apiURL + '/login', user, { observe: 'response' });
  }

  saveToken(jwt: string) {
    localStorage.setItem('jwt', jwt);
    this.token = jwt;
    this.decodeJWT();
  }

  decodeJWT() {
    if (!this.token) {
      this.isloggedIn = false;
      this.loggedUser = undefined!;
      this.roles = undefined!;
      return;
    }

    if (this.helper.isTokenExpired(this.token)) {
      this.isloggedIn = false;
      this.loggedUser = undefined!;
      this.roles = undefined!;
      localStorage.removeItem('jwt');
      this.token = undefined!;
      return;
    }

    const decodedToken = this.helper.decodeToken(this.token);
    this.roles = decodedToken.roles;
    this.loggedUser = decodedToken.sub;
    this.isloggedIn = true;
  }

  loadToken() {
    this.token = localStorage.getItem('jwt') ?? '';
    if (!this.token) {
      this.isloggedIn = false;
      this.loggedUser = undefined!;
      this.roles = undefined!;
      return;
    }

    this.decodeJWT();
  }

  getToken(): string {
    return this.token;
  }

  isAdmin(): Boolean {
    if (!this.roles)
      return false;
    return this.roles.indexOf('ADMIN') >= 0;
  }

  logout() {
    this.loggedUser = undefined!;
    this.roles = undefined!;
    this.token = undefined!;
    this.isloggedIn = false;
    localStorage.removeItem('jwt');
    this.router.navigate(['/login']);
  }

  isTokenExpired(): Boolean {
    if (!this.token) {
      return true;
    }
    return this.helper.isTokenExpired(this.token);
  }

  registerUser(user: User) {
    return this.http.post<User>(this.apiURL + '/register', user,
      { observe: 'response' });
  }

  setRegistredUser(user: User) {
    this.regitredUser = user;
  }

  getRegistredUser() {
    return this.regitredUser;
  }

  validateEmail(code: string) {
    return this.http.get<User>(this.apiURL + '/verifyEmail/' + code);
  }


}
