import { Observable ,  BehaviorSubject } from 'rxjs';
import { Injectable } from '@angular/core';
import { HttpClient, HttpResponse, HttpHeaders } from '@angular/common/http';

import { environment } from '../../../environments/environment';
import { NotificationsService } from '../notifications/notifications.service';
import { TranslateService } from '@ngx-translate/core';

@Injectable()
export class ApiService {

  private servicesEnabled = [];
  private servicesEnabledSub: BehaviorSubject<Array<string>> = new BehaviorSubject([]);

  servicesEnabledObs: Observable<Array<string>> = this.servicesEnabledSub.asObservable();

  constructor(
    private http: HttpClient,
    private notificationsService: NotificationsService,
    private translate: TranslateService
  ) {
    // Test for service availbility
    if (
      environment.config.apiServices.enabled &&
      environment.config.apiServices.key
    ) {
      if (environment.config.apiServices.clusterAnalysis.url) {
        this.servicesEnabled.push('clusterAnalysis');
      }
      if (
        environment.config.apiServices.classification.url &&
        environment.config.apiServices.classification.models.length > 0
      ) {
        this.servicesEnabled.push('classification');
      }
      if (environment.config.apiServices.translation.url) {
        this.servicesEnabled.push('translation');
      }
      this.servicesEnabledSub.next(this.servicesEnabled);
    }
  }

  post (action: string, data: object, object?: any): Promise<any> {

    if (!this.servicesEnabled.length) {
      return new Promise((resolve, reject) => {
        this.errorHandler({
          code: 405,
          message: this.translate.instant('CORE.API.DISABLE'),
          success: false,
        });
      });
    }

    let url = '';
    const headers = new HttpHeaders({'X-Api-Key': environment.config.apiServices.key});

    switch (action) {
      case 'identify':
        url = `${ environment.config.apiServices.clusterAnalysis.url }/clusteranalysis`;
        break;
      case 'classify':
        url = `${ environment.config.apiServices.classification.url }/classification`;
        break;
      case 'translate':
        url = `${ environment.config.apiServices.translation.url }/translation`;
        break;
    }

    return this.http.post(url, data, { headers: headers })
      .toPromise()
      .then((res: any) => {
        if (res.success) {
          if (res.result) {
            return res.result;
          }
        }
        this.errorHandler(res.error);
      }, (err) => {
        this.errorHandler(err.error);
      });
  }

  private errorHandler (err): Error {
    this.notificationsService.error(this.translate.instant('CORE.API.ERROR') + ` (${ err.code }): "${ err.message}"`);
    throw new Error(err.message);
  }

}
