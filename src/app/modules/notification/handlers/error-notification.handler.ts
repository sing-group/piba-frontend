/*
 *  PIBA Frontend
 *
 * Copyright (C) 2018-2020 - Miguel Reboiro-Jato,
 * Daniel Glez-Peña, Alba Nogueira Rodríguez, Florentino Fdez-Riverola,
 * Rubén Domínguez Carbajales, Jesús Miguel Herrero Rivas,
 * Eloy Sánchez Hernández, Laura Rivas Moral,
 * Manuel Puga Jiménez de Azcárate, Joaquín Cubiella Fernández,
 * Hugo López-Fernández, Silvia Rodríguez Iglesias, Fernando Campos Tato.
 *
 *  This program is free software: you can redistribute it and/or modify
 *  it under the terms of the GNU General Public License as published by
 *  the Free Software Foundation, either version 3 of the License, or
 *  (at your option) any later version.
 *
 *  This program is distributed in the hope that it will be useful,
 *  but WITHOUT ANY WARRANTY; without even the implied warranty of
 *  MERCHANTABILITY or FITNESS FOR A PARTICULAR PURPOSE. See the
 *  GNU General Public License for more details.
 *
 *  You should have received a copy of the GNU General Public License
 *  along with this program. If not, see <http://www.gnu.org/licenses/>.
 */

import {ErrorHandler, Injectable} from '@angular/core';
import {NotificationService} from '../services/notification.service';
import {HttpErrorResponse} from '@angular/common/http';
import {PibaError} from '../entities';

@Injectable()
export class ErrorNotificationHandler implements ErrorHandler {
  constructor(
    private notificationService: NotificationService
  ) {
  }

  public handleError(error: Error | PibaError | HttpErrorResponse): void {
    if (console) {
      console.log(error);
    }

    if (error instanceof PibaError) {
      console.log('CAUSE', error.cause);
      this.notificationService.error(error.detail, error.summary);
    } else if (error instanceof HttpErrorResponse) {
      this.notificationService.error(error.error, error.statusText);
    }
  }
}
