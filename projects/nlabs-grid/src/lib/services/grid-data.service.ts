import { Injectable } from '@angular/core';
import { Observable } from 'rxjs';
import { IDataAdapter } from '../adapters/data-adapter.interface';
import { FilterMetadata, GridDataResult, GridRequest, SortMetadata } from '../models/grid.models';

/**
 * Grid Data Service
 * Central service for managing grid data operations
 */
@Injectable({
  providedIn: 'root'
})
export class GridDataService<T = any> {
  private adapter?: IDataAdapter<T>;

  setAdapter(adapter: IDataAdapter<T>): void {
    this.adapter = adapter;
  }

  getData(request: GridRequest): Observable<GridDataResult<T>> {
    if (!this.adapter) {
      throw new Error('Data adapter not set. Please call setAdapter() first.');
    }
    return this.adapter.getData(request);
  }

  buildFilterString(filters: FilterMetadata[]): string {
    if (!this.adapter) {
      return '';
    }
    
    // Build OData-style filter string
    const filterParts = filters.map(filter => {
      const field = filter.field;
      const value = typeof filter.value === 'string' ? `'${filter.value}'` : filter.value;
      
      switch (filter.matchMode) {
        case 'contains':
          return `contains(${field}, ${value})`;
        case 'startsWith':
          return `startswith(${field}, ${value})`;
        case 'endsWith':
          return `endswith(${field}, ${value})`;
        case 'equals':
          return `${field} eq ${value}`;
        case 'notEquals':
          return `${field} ne ${value}`;
        case 'lt':
          return `${field} lt ${value}`;
        case 'lte':
          return `${field} le ${value}`;
        case 'gt':
          return `${field} gt ${value}`;
        case 'gte':
          return `${field} ge ${value}`;
        default:
          return `${field} eq ${value}`;
      }
    });

    return filterParts.join(' and ');
  }

  buildSortString(sorts: SortMetadata[]): string {
    return sorts.map(sort => `${sort.field} ${sort.order}`).join(', ');
  }
}
