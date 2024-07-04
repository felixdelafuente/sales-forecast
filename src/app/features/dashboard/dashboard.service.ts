import { HttpClient, HttpResponse } from '@angular/common/http';
import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { map } from 'rxjs/internal/operators/map';

@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private baseUrl = "INSERT AZURE FUNCTIONS API"
  constructor(private http: HttpClient) { }
  
  uploadSalesData(salesData: FormData): Observable<any> {
    return this.http.post(this.baseUrl, salesData, { observe: 'response' })
      .pipe(map((response: HttpResponse<any>) => {
        return response;
    }))
  }
}
