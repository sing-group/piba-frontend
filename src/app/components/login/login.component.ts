import {Component, OnInit} from '@angular/core';
import {AuthenticationService} from '../../services/authentication.service';
import {ActivatedRoute, Router} from '@angular/router';
import {UsersService} from '../../services/users.service';
import {NotificationService} from '../../modules/notification/services/notification.service';
import {NewPassword} from '../../models/NewPassword';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  login: string;
  password: string;
  confirmPassword: string;
  return = '';
  recovery = false;
  userRecovery: string;
  newPassword: NewPassword = new NewPassword();

  constructor(private authenticationService: AuthenticationService,
              private usersService: UsersService,
              private notificationService: NotificationService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  ngOnInit() {
    this.newPassword.uuid = this.route.snapshot.queryParamMap.get('uuid');
    this.route.queryParams
      .subscribe(params => this.return = params['return'] || '');
  }

  logIn() {
    this.authenticationService.checkCredentials(this.login, this.password).subscribe((role) => {
      this.authenticationService.logIn(this.login, this.password, role);
      this.router.navigateByUrl(this.return);
    });
  }

  isTryingToLogin(): boolean {
    return !this.recovery && this.newPassword.uuid === null;
  }

  isTryingToRecoverPassword(): boolean {
    return !this.recovery && this.newPassword.uuid !== null;
  }

  isWantingToRecoverPassword(): boolean {
    return this.recovery;
  }

  goToLogin() {
    this.recovery = false;
  }

  goToPasswordRecovery() {
    this.recovery = true;
  }

  recoverPassword() {
    this.usersService.recoverPassword(this.userRecovery).subscribe(
      () => {
        this.recovery = false;
        this.router.navigateByUrl('/');
      }
    );
  }

  updatePassword() {
    this.usersService.updatePassword(this.newPassword).subscribe(
      () => {
        this.notificationService.success('Password changed successfully.', 'Password changed');
      },
      response => {
        this.notificationService.error('Password not changed. ' + response.error, 'Error.');
      });

    this.router.navigateByUrl('/');
  }

}
