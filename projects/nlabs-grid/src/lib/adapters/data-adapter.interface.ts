import { Observable } from 'rxjs';
import { GridDataResult, GridRequest } from '../models/grid.models';

/**
 * Interface for data adapters
 * Allows flexibility to work with different backend types (OData, REST, etc.)
 */
export interface IDataAdapter<T = any> {
  /**
   * Fetch data from the data source
   * @param request Grid request parameters
   * @returns Observable with data and total count
   */
  getData(request: GridRequest): Observable<GridDataResult<T>>;

  /**
   * Build query string based on the request
   * @param request Grid request parameters
   * @returns Query string
   */
  buildQuery(request: GridRequest): string;
}
