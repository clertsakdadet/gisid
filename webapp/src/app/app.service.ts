import { Injectable } from '@angular/core';
import { Http, Headers, RequestOptions, Response } from '@angular/http';
import { Observable } from 'rxjs/Observable';
import { map } from 'rxjs/operators';

@Injectable()
export class AppService {

  constructor(private http: Http) { }

  /**
   * Get application host name.
   * 
   * `const host = this.appService.hostName;`
   */
  get hostName(): string {
    let host = window.location.href;
    if (host.indexOf('?') != -1) {
      host = host.substring(0, host.indexOf('?'));
    }
    if (host.indexOf('#') != -1) {
      host = host.substring(0, host.indexOf('#'));
    }
    host = host.substring(0, host.lastIndexOf('/'));

    return host;
  }

  /**
   * Request web service with url
   * 
   * `const req: Promise<any> = this.appServicce.reqUrl('http://example.com/api/..');`
   * 
   * @param url Url for web service
   * @param params (Optional) Parameters with JSON data format
   * @param responseType (Optional) Response type, default: ResponseType.text
   */
  reqUrl(url: string, params: any = {}, responseType: ResponseType = ResponseType.text): Promise<any> {
    return this._reqUrl(url, params, responseType).toPromise();
  }

  /**
   * Request stored procedure
   * 
   * `const req: Promise<any> = this.appServicce.reqSP('USER_Q', {...});`
   * 
   * @param storeName Procedure name
   * @param params (Optional) Parameters with JSON data format
   */
  reqSP(storeName: string, params: any = {}): Promise<any> {
    let paramsToSend = this.softCopyJSON(params);
    paramsToSend['APP_DATA_PROCEDURE'] = storeName;

    return this._reqUrl(`${this.hostName}/Handlers/AppData.ashx`, paramsToSend, ResponseType.json).pipe(
      map((jsonResponse: any) => {
        if (jsonResponse == null)
          throw new Error('request return empty response');
        else if (jsonResponse.success == null)
          throw new Error(`json response does not contain 'success' parameter`);
        else if (jsonResponse.success != true)
          throw new Error(jsonResponse.message);
        else
          return jsonResponse;
      })
    ).toPromise();
  }


  /**
   * Get cookie value with name reference
   * 
   * `const csrf: string = this.appService.getCookie('CSRF_TOKEN');`
   * 
   * @param name ชื่อของ cookie
   */
  getCookie(name): string {
    let value = '; ' + document.cookie;
    let parts = value.split('; ' + name + '=');
    if (parts.length == 2) return parts.pop().split(';').shift();
  }

  /**
   * Soft copy JSON data
   * 
   * `let myJson: object = this.appService.softCopyJSON({...});`
   * 
   * @param data JSON data format
   */
  softCopyJSON(data: any): object {
    let cloned: object = {};
    for (let key in data)
      cloned[key] = data[key];

    return cloned;
  }

  /**
   * Get domain name from url
   * 
   * `const domain: string = this.appService.getDomainName('http://example.com/path/to/service');`
   * 
   * @param url Url
   */
  getDomainName(url: string): string {
    let domainNameStartIndex = url.indexOf('//');
    let domainName = '';

    if (domainNameStartIndex >= 0)
      domainName = url.substring(domainNameStartIndex + 2);
    else
      domainName = url;

    let domainNameEndIndex = domainName.indexOf('/');

    if (domainNameEndIndex >= 0)
      domainName = domainName.substring(0, domainNameEndIndex);

    return domainName;
  }


  private _reqUrl(url: string, params: any, responseType: ResponseType = ResponseType.text): Observable<any> {
    let headers = new Headers({ 'Content-Type': 'application/json' });
    let options = new RequestOptions({ headers: headers });

    let paramsToSend = this.softCopyJSON(params);
    let domainName = this.getDomainName(url);
    console.log(domainName);
    if (domainName.toLowerCase() == window.location.host.toLowerCase())
      paramsToSend['CSRF_TOKEN'] = this.getCookie('CSRF_TOKEN');

    let response = this.http.post(url, paramsToSend, options);

    if (responseType == ResponseType.json)
      return response.pipe(map((res: Response) => res.json()));
    else if (responseType == ResponseType.arrayBuffer)
      return response.pipe(map((res: Response) => res.arrayBuffer()));
    else
      return response.pipe(map((res: Response) => res.text()));
  }
}

enum ResponseType {
  json,
  text,
  arrayBuffer
}