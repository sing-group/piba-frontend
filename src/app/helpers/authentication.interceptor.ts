import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';
import {AuthenticationService} from '../services/authentication.service';

@Injectable({
  providedIn: 'root'
})
export class AuthenticationInterceptor implements HttpInterceptor {

  constructor(public authenticationService: AuthenticationService) {
  }

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (this.authenticationService.isGuest() && !request.url.endsWith('role')) {
      return next.handle(request);
    }
    request = request.clone({
      setHeaders: {
        Authorization: this.authenticationService.getAuthorizationHeader()
      }
    });
    return next.handle(request);
  }
}
