import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IDataAdapter } from './data-adapter.interface';
import { GridDataResult, GridRequest } from '../models/grid.models';

export const ODATA_BASE_URL = new InjectionToken<string>('ODATA_BASE_URL');

/**
 * OData v4 Adapter
 * Implements IDataAdapter for OData protocol
 */
export class ODataAdapter<T = any> implements IDataAdapter<T> {
  constructor(
    private http: HttpClient,
    private baseUrl: string
  ) {}

  getData(request: GridRequest): Observable<GridDataResult<T>> {
    const url = `${this.baseUrl}?${this.buildQuery(request)}`;
    
    console.log('OData Request URL:', url);
    
    return this.http.get<any>(url).pipe(
      map(response => {
        console.log('OData Response:', response);
        return {
          data: response.value || response.items || [],
          total: response['@odata.count'] || response.count || 0
        };
      })
    );
  }

  buildQuery(request: GridRequest): string {
    const params: string[] = [];

    // Pagination
    if (request.skip !== undefined) {
      params.push(`$skip=${request.skip}`);
    }
    if (request.top !== undefined) {
      params.push(`$top=${request.top}`);
    }

    // Sorting
    if (request.orderBy) {
      params.push(`$orderby=${request.orderBy}`);
    }

    // Filtering
    if (request.filter) {
      params.push(`$filter=${encodeURIComponent(request.filter)}`);
    }

    // Select specific fields
    if (request.select && request.select.length > 0) {
      params.push(`$select=${request.select.join(',')}`);
    }

    // Expand related entities
    if (request.expand && request.expand.length > 0) {
      params.push(`$expand=${request.expand.join(',')}`);
    }

    // Always include count
    params.push('$count=true');

    return params.join('&');
  }
}
