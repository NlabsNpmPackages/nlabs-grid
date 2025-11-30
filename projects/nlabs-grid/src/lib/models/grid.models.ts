/**
 * Grid Configuration Models
 */

export interface GridColumn<T = any> {
  field: keyof T | string;
  header: string;
  sortable?: boolean;
  filterable?: boolean;
  filterType?: 'text' | 'number' | 'date' | 'boolean';
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  type?: 'text' | 'number' | 'date' | 'boolean' | 'custom';
  format?: (value: any) => string;
  cellTemplate?: any; // TemplateRef for custom cell rendering
  visible?: boolean;
  frozen?: boolean;
  resizable?: boolean;
}

export interface GridConfig {
  columns: GridColumn[];
  pageSize?: number;
  pageSizeOptions?: number[];
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  multiSelect?: boolean;
  resizable?: boolean;
  reorderable?: boolean;
  showHeader?: boolean;
  showFooter?: boolean;
  loading?: boolean;
  emptyMessage?: string;
  rowHeight?: string;
  showActions?: boolean;
  actionsHeader?: string;
  actionsWidth?: string;
  showCheckboxColumn?: boolean;
  checkboxColumnWidth?: string;
}

export interface GridState {
  page: number;
  pageSize: number;
  sortField?: string;
  sortOrder?: 'asc' | 'desc';
  filters?: Map<string, any>;
  selectedRows?: any[];
}

export interface GridDataResult<T = any> {
  data: T[];
  total: number;
}

export interface GridRequest {
  skip: number;
  top: number;
  orderBy?: string;
  filter?: string;
  select?: string[];
  expand?: string[];
  globalSearch?: string;
}

export interface FilterMetadata {
  field: string;
  operator: FilterOperator;
  value: any;
  matchMode?: 'contains' | 'notContains' | 'startsWith' | 'endsWith' | 'equals' | 'notEquals' | 'lt' | 'lte' | 'gt' | 'gte' | 'isEmpty' | 'isNotEmpty';
}

export type FilterOperator = 'and' | 'or';

export interface SortMetadata {
  field: string;
  order: 'asc' | 'desc';
}

export interface PaginationMetadata {
  page: number;
  pageSize: number;
  totalRecords: number;
  totalPages: number;
}
