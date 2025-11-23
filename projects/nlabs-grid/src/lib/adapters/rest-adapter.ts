import { Inject, Injectable, InjectionToken } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IDataAdapter } from './data-adapter.interface';
import { GridDataResult, GridRequest } from '../models/grid.models';

export const REST_BASE_URL = new InjectionToken<string>('REST_BASE_URL');
export const REST_CONFIG = new InjectionToken<RestAdapterConfig>('REST_CONFIG');

/**
 * REST API Adapter
 * Implements IDataAdapter for standard REST endpoints
 */
export class RestAdapter<T = any> implements IDataAdapter<T> {
  constructor(
    private http: HttpClient,
    @Inject(REST_BASE_URL) private baseUrl: string,
    @Inject(REST_CONFIG) private config?: RestAdapterConfig
  ) {}

  getData(request: GridRequest): Observable<GridDataResult<T>> {
    const url = `${this.baseUrl}?${this.buildQuery(request)}`;
    
    return this.http.get<any>(url).pipe(
      map(response => this.mapResponse(response))
    );
  }

  buildQuery(request: GridRequest): string {
    const params: string[] = [];
    const cfg = this.config || {};

    // Pagination
    const pageParam = cfg.pageParam || 'page';
    const pageSizeParam = cfg.pageSizeParam || 'pageSize';
    const skipParam = cfg.skipParam || 'skip';
    
    if (cfg.usePagination === 'page') {
      // Page-based pagination
      const page = Math.floor(request.skip / request.top) + 1;
      params.push(`${pageParam}=${page}`);
      params.push(`${pageSizeParam}=${request.top}`);
    } else {
      // Skip/take pagination
      params.push(`${skipParam}=${request.skip}`);
      params.push(`${pageSizeParam}=${request.top}`);
    }

    // Sorting
    if (request.orderBy) {
      const sortParam = cfg.sortParam || 'sort';
      params.push(`${sortParam}=${request.orderBy}`);
    }

    // Filtering
    if (request.filter) {
      const filterParam = cfg.filterParam || 'filter';
      params.push(`${filterParam}=${encodeURIComponent(request.filter)}`);
    }

    // Select specific fields
    if (request.select && request.select.length > 0) {
      const selectParam = cfg.selectParam || 'fields';
      params.push(`${selectParam}=${request.select.join(',')}`);
    }

    return params.join('&');
  }

  private mapResponse(response: any): GridDataResult<T> {
    const cfg = this.config || {};
    const dataKey = cfg.dataKey || 'data';
    const totalKey = cfg.totalKey || 'total';

    return {
      data: response[dataKey] || response.items || response,
      total: response[totalKey] || response.count || 0
    };
  }
}

export interface RestAdapterConfig {
  usePagination?: 'page' | 'skip';
  pageParam?: string;
  pageSizeParam?: string;
  skipParam?: string;
  sortParam?: string;
  filterParam?: string;
  selectParam?: string;
  dataKey?: string;
  totalKey?: string;
}
