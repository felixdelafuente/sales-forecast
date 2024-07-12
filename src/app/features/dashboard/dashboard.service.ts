import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';
import { UploadSalesModel } from '../../shared/models/upload-sales.model';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = "INSERT AZURE FUNCTIONS API"
  constructor(private http: HttpClient) { }
  
  uploadSalesData(data: UploadSalesModel[]): Observable<any> {
    return this.http.post(this.baseUrl, data, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
  }
}
