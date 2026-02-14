import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { IDataAdapter } from './data-adapter.interface';
import { GridDataResult, GridRequest } from '../models/grid.models';

/**
 * REST API Adapter
 * Implements IDataAdapter for standard REST endpoints
 *
 * @example
 * ```typescript
 * const adapter = new RestAdapter(http, 'https://api.example.com/users', {
 *   dataKey: 'items',
 *   totalKey: 'totalCount',
 *   usePagination: 'page'
 * });
 * ```
 */
export class RestAdapter<T = any> implements IDataAdapter<T> {
  constructor(
    private http: HttpClient,
    private baseUrl: string,
    private config?: RestAdapterConfig
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
    const skip = request.skip ?? 0;
    const top = request.top ?? 10;
    const pageParam = cfg.pageParam || 'page';
    const pageSizeParam = cfg.pageSizeParam || 'pageSize';
    const skipParam = cfg.skipParam || 'skip';

    if (cfg.usePagination === 'page') {
      // Page-based pagination
      const page = top > 0 ? Math.floor(skip / top) + 1 : 1;
      params.push(`${pageParam}=${page}`);
      params.push(`${pageSizeParam}=${top}`);
    } else {
      // Skip/take pagination (default)
      params.push(`${skipParam}=${skip}`);
      params.push(`${pageSizeParam}=${top}`);
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

    // Global search
    if (request.globalSearch) {
      const searchParam = cfg.searchParam || 'search';
      params.push(`${searchParam}=${encodeURIComponent(request.globalSearch)}`);
    }

    // Extra custom parameters
    if (cfg.extraParams) {
      for (const [key, value] of Object.entries(cfg.extraParams)) {
        if (value !== undefined && value !== null && value !== '') {
          params.push(`${key}=${encodeURIComponent(String(value))}`);
        }
      }
    }

    return params.join('&');
  }

  private mapResponse(response: any): GridDataResult<T> {
    const cfg = this.config || {};

    // Custom mapper function takes priority
    if (cfg.responseMapper) {
      return cfg.responseMapper(response);
    }

    // If response is an array, use it directly
    if (Array.isArray(response)) {
      return {
        data: response,
        total: response.length
      };
    }

    const dataKey = cfg.dataKey || 'data';
    const totalKey = cfg.totalKey || 'total';

    // Extract data - support nested keys like 'result.items'
    let data = this.getNestedValue(response, dataKey) ||
               response.items ||
               response.results ||
               response.records ||
               [];

    // Extract total
    let total = this.getNestedValue(response, totalKey) ??
                response.count ??
                response.totalCount ??
                response.totalRecords ??
                (Array.isArray(data) ? data.length : 0);

    return { data, total };
  }

  private getNestedValue(obj: any, path: string): any {
    return path.split('.').reduce((current, key) => current?.[key], obj);
  }
}

export interface RestAdapterConfig {
  /** Pagination style: 'page' (page/pageSize) or 'skip' (skip/take). Default: 'skip' */
  usePagination?: 'page' | 'skip';
  /** Query param name for page number. Default: 'page' */
  pageParam?: string;
  /** Query param name for page size. Default: 'pageSize' */
  pageSizeParam?: string;
  /** Query param name for skip count. Default: 'skip' */
  skipParam?: string;
  /** Query param name for sorting. Default: 'sort' */
  sortParam?: string;
  /** Query param name for filtering. Default: 'filter' */
  filterParam?: string;
  /** Query param name for field selection. Default: 'fields' */
  selectParam?: string;
  /** Response property containing data array. Supports nested paths like 'result.items'. Default: 'data' */
  dataKey?: string;
  /** Response property containing total count. Supports nested paths. Default: 'total' */
  totalKey?: string;
  /** Custom response mapper function for complex response structures */
  responseMapper?: <T>(response: any) => { data: T[]; total: number };
  /** Additional custom query parameters to append to every request */
  extraParams?: Record<string, string | number | boolean | undefined>;
  /** Query param name for global search. Default: 'search' */
  searchParam?: string;
}
