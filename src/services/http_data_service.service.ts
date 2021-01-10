import { Injectable } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable } from 'rxjs';
import {ApiResponse} from '../utils/interface';

@Injectable({
  providedIn: 'root'
})
export class HttpDataServiceService {

  constructor(private readonly httpClient: HttpClient) { }

  getData<T>(url:string): Observable<T[]>{
    return this.httpClient.get<T[]>(url);
  } 
}
