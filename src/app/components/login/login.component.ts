import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  login: string;
  password: string;
  return = '';

  constructor(private authenticationService: AuthenticationService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.route.queryParams
      .subscribe(params => this.return = params['return'] || '');
  }

  logIn() {
    this.authenticationService.checkCredentials(this.login, this.password).subscribe((role) => {
      this.authenticationService.logIn(this.login, this.password, role);
      this.router.navigateByUrl(this.return);
    });
  }

}
