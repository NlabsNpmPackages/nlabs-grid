import {
  Component,
  Input,
  Output,
  EventEmitter,
  OnInit,
  OnChanges,
  SimpleChanges,
  TemplateRef,
  ContentChildren,
  QueryList,
  AfterContentInit,
  AfterViewInit,
  ElementRef,
  ViewChild,
  contentChild,
  input
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import {
  GridConfig,
  GridColumn,
  GridState,
  GridDataResult,
  GridRequest,
  SortMetadata,
  FilterMetadata,
  PaginationMetadata
} from '../../models/grid.models';
import { IDataAdapter } from '../../adapters/data-adapter.interface';
import { GridDataService } from '../../services/grid-data.service';
import { GridColumnComponent } from '../grid-column/grid-column.component';
import { ThemeService } from '../../services/theme.service';
import { ThemeSelectorComponent } from '../theme-selector/theme-selector.component';


import { GridCellTemplateDirective } from '../../directives/grid-cell-template.directive';
import { GridHeaderTemplateDirective } from '../../directives/grid-header-template.directive';
import { GridColumnCommandTemplateDirective } from '../../directives/grid-column-command-template.directive';
import { GridCaptionCommandTemplateDirective } from '../../directives/grid-caption-command-template.directive';
import { GridFooterTemplateDirective } from '../../directives/grid-footer-template.directive';


@Component({
  selector: 'nlabs-data-grid',
  standalone: true,
  imports: [CommonModule, FormsModule, GridColumnComponent, ThemeSelectorComponent],
  templateUrl: 'data-grid.component.html',
  styleUrls: ['./data-grid.component.scss']
})
export class DataGridComponent<T = any> implements OnInit, OnChanges, AfterContentInit, AfterViewInit {
  @Input() config?: GridConfig;
  @Input() adapter!: IDataAdapter<T>;
  @Input() autoLoad = true;
  @Input() lazy = true;
  @Input() data?: T[];
  @Input() totalRecords?: number;

  @ViewChild('gridHeader', { read: ElementRef }) gridHeader?: ElementRef;
  @ViewChild('gridBody', { read: ElementRef }) gridBody?: ElementRef;

  // Theme inputs
  readonly theme = input<'light' | 'dark' | 'auto'>('auto');
  readonly showThemeSelector = input<boolean>(true);

  // Feature flags
  readonly showColumnChooser = input<boolean>(true);
  readonly showGlobalSearch = input<boolean>(true);
  readonly showAddButton = input<boolean>(false);
  readonly addButtonText = input<string>('Add New');
  readonly addButtonUrl = input<string | undefined>(undefined);
  readonly showExport = input<boolean>(true);
  readonly exportFileName = input<string>('export');
  readonly showFooter = input<boolean>(true);

  // Events
  @Output() addClick = new EventEmitter<void>();
  @Output() excelExport = new EventEmitter<T[]>();
  @Output() pdfExport = new EventEmitter<T[]>();
  @Output() onRefresh = new EventEmitter<void>();

  // Template references from content projection
  @ContentChildren(GridColumnComponent) columnComponents!: QueryList<GridColumnComponent>;
  
  // Command templates
  columnCommandTemplate = contentChild(GridColumnCommandTemplateDirective, { read: TemplateRef });
  captionCommandTemplate = contentChild(GridCaptionCommandTemplateDirective, { read: TemplateRef });
  footerTemplate = contentChild(GridFooterTemplateDirective, { read: TemplateRef });

  @Output() dataLoad = new EventEmitter<GridDataResult<T>>();
  @Output() rowSelect = new EventEmitter<T>();
  @Output() rowUnselect = new EventEmitter<T>();
  @Output() stateChange = new EventEmitter<GridState>();

  gridData: T[] = [];
  loading = false;
  Math = Math;
  globalSearchTerm = '';
  
  state: GridState = {
    page: 0,
    pageSize: 10,
    filters: new Map()
  };

  pagination: PaginationMetadata = {
    page: 0,
    pageSize: 10,
    totalRecords: 0,
    totalPages: 0
  };

  selectedRows: Set<T> = new Set();
  sortMetadata: SortMetadata[] = [];
  filterMetadata: FilterMetadata[] = [];

  // Column management
  displayedColumns: GridColumn[] = [];
  draggedColumn?: GridColumn;
  dropTargetIndex?: number;
  resizingColumn?: GridColumn;
  resizeStartX = 0;
  resizeStartWidth = 0;
  showColumnChooserModal = false;

  // Filter Modal
  showFilterModal = false;
  currentFilterColumn: GridColumn | null = null;
  currentFilterOperator: 'contains' | 'notContains' | 'equals' | 'notEquals' | 'startsWith' | 'endsWith' | 'lt' | 'lte' | 'gt' | 'gte' | 'isEmpty' | 'isNotEmpty' = 'contains';
  filterValue = '';

  constructor(
    private gridDataService: GridDataService<T>,
    public themeService: ThemeService
  ) {}

  ngAfterContentInit(): void {
    // Process column components from content projection
    this.processColumnComponents();
    
    // Watch for column changes
    this.columnComponents.changes.subscribe(() => {
      this.processColumnComponents();
    });
  }

  ngOnInit(): void {
    this.initializeGrid();
    
    if (this.autoLoad && this.lazy && this.adapter) {
      this.loadData();
    } else if (!this.lazy && this.data) {
      this.gridData = this.data;
      this.pagination.totalRecords = this.totalRecords || this.data.length;
      this.updatePagination();
    }
  }

  ngOnChanges(changes: SimpleChanges): void {
    if (changes['data'] && !changes['data'].firstChange && !this.lazy) {
      this.gridData = this.data || [];
      this.pagination.totalRecords = this.totalRecords || this.gridData.length;
      this.updatePagination();
    }
  }

  ngAfterViewInit(): void {
    // Sync horizontal scroll between header and body
    if (this.gridBody?.nativeElement && this.gridHeader?.nativeElement) {
      const bodyEl = this.gridBody.nativeElement;
      const headerEl = this.gridHeader.nativeElement;
      
      bodyEl.addEventListener('scroll', () => {
        headerEl.scrollLeft = bodyEl.scrollLeft;
      });
    }
  }

  private initializeGrid(): void {
    // Initialize pagination from config or use defaults
    const configPageSize = this.config?.pageSize || 10;
    this.state.pageSize = configPageSize;
    this.pagination.pageSize = this.state.pageSize;

    // Initialize displayed columns (will be overridden if using content projection)
    if (this.config?.columns && this.config.columns.length > 0) {
      this.displayedColumns = this.config.columns.map(col => ({
        ...col,
        visible: col.visible !== false,
        resizable: col.resizable !== false
      }));
    }

    if (this.adapter) {
      this.gridDataService.setAdapter(this.adapter);
    }

    // Apply theme from input
    if (this.theme()) {
      this.themeService.setTheme(this.theme());
    }
  }

  private processColumnComponents(): void {
    if (!this.columnComponents || this.columnComponents.length === 0) {
      return;
    }

    // Convert column components to GridColumn format
    this.displayedColumns = this.columnComponents.map(comp => {
      // Get cell template from directive
      const cellDirective = comp.cellTemplate;
      const headerDirective = comp.headerTemplate;
      const footerDirective = comp.footerTemplate;

      const column: GridColumn = {
        field: comp.field(),
        header: comp.getDisplayTitle(),
        sortable: comp.sortable(),
        filterable: comp.filterable(),
        visible: comp.visible(),
        resizable: comp.resizable(),
        width: comp.width(),
        minWidth: comp.minWidth(),
        maxWidth: comp.maxWidth(),
        type: comp.filterType() as any,
        cellTemplate: cellDirective,
        frozen: comp.frozen(),
        format: comp.format() as any
      };

      return column;
    });
  }

  loadData(): void {
    if (!this.lazy) {
      return;
    }

    this.loading = true;

    const request: GridRequest = {
      skip: this.state.page * this.state.pageSize,
      top: this.state.pageSize,
      orderBy: this.buildOrderBy(),
      filter: this.buildFilter()
    };

    this.gridDataService.getData(request).subscribe({
      next: (result) => {
        this.gridData = result.data;
        this.pagination.totalRecords = result.total;
        this.updatePagination();
        this.loading = false;
        this.dataLoad.emit(result);
      },
      error: (error) => {
        console.error('Error loading grid data:', error);
        this.loading = false;
      }
    });
  }

  onPageChange(page: number): void {
    this.state.page = page;
    this.pagination.page = page;
    this.emitStateChange();
    
    if (this.lazy) {
      this.loadData();
    }
  }

  onPageSizeChange(pageSize: number): void {
    this.state.pageSize = pageSize;
    this.pagination.pageSize = pageSize;
    this.state.page = 0;
    this.pagination.page = 0;
    this.emitStateChange();
    
    if (this.lazy) {
      this.loadData();
    }
  }

  onSort(column: GridColumn): void {
    if (!column.sortable) {
      return;
    }

    const existingSort = this.sortMetadata.find(s => s.field === column.field);
    
    if (existingSort) {
      existingSort.order = existingSort.order === 'asc' ? 'desc' : 'asc';
    } else {
      this.sortMetadata = [{ field: column.field as string, order: 'asc' }];
    }

    this.state.sortField = column.field as string;
    this.state.sortOrder = this.sortMetadata[0].order;
    
    this.emitStateChange();
    
    if (this.lazy) {
      this.loadData();
    } else {
      this.sortLocal();
    }
  }

  onFilter(column: GridColumn, value: any): void {
    if (!column.filterable) {
      return;
    }

    if (value && value.trim()) {
      this.filterMetadata = this.filterMetadata.filter(f => f.field !== column.field);
      this.filterMetadata.push({
        field: column.field as string,
        operator: 'and',
        value: value,
        matchMode: 'contains'
      });
      this.state.filters?.set(column.field as string, value);
    } else {
      this.filterMetadata = this.filterMetadata.filter(f => f.field !== column.field);
      this.state.filters?.delete(column.field as string);
    }

    this.state.page = 0;
    this.pagination.page = 0;
    
    this.emitStateChange();
    
    if (this.lazy) {
      this.loadData();
    } else {
      this.filterLocal();
    }
  }

  onRowSelect(row: T, event: Event): void {
    if (!this.config?.selectable) {
      return;
    }

    if (this.config?.multiSelect) {
      if (this.selectedRows.has(row)) {
        this.selectedRows.delete(row);
        this.rowUnselect.emit(row);
      } else {
        this.selectedRows.add(row);
        this.rowSelect.emit(row);
      }
    } else {
      this.selectedRows.clear();
      this.selectedRows.add(row);
      this.rowSelect.emit(row);
    }

    this.state.selectedRows = Array.from(this.selectedRows);
  }

  isRowSelected(row: T): boolean {
    return this.selectedRows.has(row);
  }

  private buildOrderBy(): string | undefined {
    if (this.sortMetadata.length === 0) {
      return undefined;
    }
    return this.gridDataService.buildSortString(this.sortMetadata);
  }

  private buildFilter(): string | undefined {
    if (this.filterMetadata.length === 0) {
      return undefined;
    }
    return this.gridDataService.buildFilterString(this.filterMetadata);
  }

  private sortLocal(): void {
    if (this.sortMetadata.length === 0) {
      return;
    }

    const sort = this.sortMetadata[0];
    this.gridData = [...this.gridData].sort((a: any, b: any) => {
      const aVal = a[sort.field];
      const bVal = b[sort.field];
      
      if (aVal === bVal) return 0;
      
      const result = aVal < bVal ? -1 : 1;
      return sort.order === 'asc' ? result : -result;
    });
  }

  private filterLocal(): void {
    if (!this.data) {
      return;
    }

    let filtered = [...this.data];

    this.filterMetadata.forEach(filter => {
      filtered = filtered.filter((item: any) => {
        const value = item[filter.field];
        const filterValue = filter.value?.toLowerCase() || '';
        
        // Handle isEmpty and isNotEmpty
        if (filter.matchMode === 'isEmpty') {
          return value === null || value === undefined || value === '';
        }
        if (filter.matchMode === 'isNotEmpty') {
          return value !== null && value !== undefined && value !== '';
        }
        
        if (value === null || value === undefined) {
          return false;
        }

        const strValue = String(value).toLowerCase();
        const numValue = Number(value);
        const numFilterValue = Number(filter.value);
        
        // Date comparison
        const dateValue = value instanceof Date ? value : new Date(value);
        const dateFilterValue = new Date(filter.value);
        const isValidDate = dateValue instanceof Date && !isNaN(dateValue.getTime());
        const isValidFilterDate = dateFilterValue instanceof Date && !isNaN(dateFilterValue.getTime());
        
        switch (filter.matchMode) {
          case 'contains':
            return strValue.includes(filterValue);
          case 'notContains':
            return !strValue.includes(filterValue);
          case 'startsWith':
            return strValue.startsWith(filterValue);
          case 'endsWith':
            return strValue.endsWith(filterValue);
          case 'equals':
            // For dates, compare date parts only
            if (isValidDate && isValidFilterDate) {
              return dateValue.toDateString() === dateFilterValue.toDateString();
            }
            return strValue === filterValue || value === filter.value;
          case 'notEquals':
            // For dates, compare date parts only
            if (isValidDate && isValidFilterDate) {
              return dateValue.toDateString() !== dateFilterValue.toDateString();
            }
            return strValue !== filterValue && value !== filter.value;
          case 'lt':
            if (isValidDate && isValidFilterDate) {
              return dateValue.getTime() < dateFilterValue.getTime();
            }
            return !isNaN(numValue) && !isNaN(numFilterValue) && numValue < numFilterValue;
          case 'lte':
            if (isValidDate && isValidFilterDate) {
              return dateValue.getTime() <= dateFilterValue.getTime();
            }
            return !isNaN(numValue) && !isNaN(numFilterValue) && numValue <= numFilterValue;
          case 'gt':
            if (isValidDate && isValidFilterDate) {
              return dateValue.getTime() > dateFilterValue.getTime();
            }
            return !isNaN(numValue) && !isNaN(numFilterValue) && numValue > numFilterValue;
          case 'gte':
            if (isValidDate && isValidFilterDate) {
              return dateValue.getTime() >= dateFilterValue.getTime();
            }
            return !isNaN(numValue) && !isNaN(numFilterValue) && numValue >= numFilterValue;
          default:
            return strValue.includes(filterValue);
        }
      });
    });

    this.gridData = filtered;
    this.pagination.totalRecords = filtered.length;
    this.updatePagination();
  }

  private updatePagination(): void {
    this.pagination.totalPages = Math.ceil(
      this.pagination.totalRecords / this.pagination.pageSize
    );
  }

  private emitStateChange(): void {
    this.stateChange.emit({ ...this.state });
  }

  getCellValue(row: any, column: GridColumn): any {
    const value = row[column.field];
    // Format is now just a hint string (like 'c', 'd', 'p'), not a function
    // Actual formatting should be done via pipes in template
    return value;
  }

  getSortIcon(column: GridColumn): string {
    if (!column.sortable) {
      return '';
    }

    const sort = this.sortMetadata.find(s => s.field === column.field);
    
    if (!sort) {
      return '⇅';
    }
    
    return sort.order === 'asc' ? '↑' : '↓';
  }

  getFilterValue(column: GridColumn): string {
    const filter = this.filterMetadata.find(f => f.field === column.field);
    return filter ? filter.value : '';
  }

  // Filter Modal Methods
  openFilterModal(column: GridColumn, event: Event): void {
    event.stopPropagation();
    
    if (column.filterable === false) {
      return;
    }

    this.currentFilterColumn = column;
    
    // Load existing filter
    const existingFilter = this.filterMetadata.find(f => f.field === column.field);
    if (existingFilter) {
      this.filterValue = existingFilter.value;
      this.currentFilterOperator = existingFilter.matchMode as any;
    } else {
      this.filterValue = '';
      // Set default operator based on filterType
      const filterType = column.filterType || 'text';
      if (filterType === 'number' || filterType === 'date') {
        this.currentFilterOperator = 'equals';
      } else {
        this.currentFilterOperator = 'contains';
      }
    }

    this.showFilterModal = true;
  }

  closeFilterModal(): void {
    this.showFilterModal = false;
    this.currentFilterColumn = null;
    this.filterValue = '';
  }

  applyFilterModal(): void {
    if (!this.currentFilterColumn) return;

    const field = this.currentFilterColumn.field as string;

    // Remove existing filter for this field
    this.filterMetadata = this.filterMetadata.filter(f => f.field !== field);

    // For isEmpty and isNotEmpty, no value is needed
    const needsValue = this.currentFilterOperator !== 'isEmpty' && this.currentFilterOperator !== 'isNotEmpty';

    // Add new filter if value is not empty OR if operator doesn't need value
    if (!needsValue || (this.filterValue && this.filterValue.trim())) {
      this.filterMetadata.push({
        field: field,
        operator: 'and',
        value: needsValue ? this.filterValue.trim() : '',
        matchMode: this.currentFilterOperator
      });
      this.state.filters?.set(field, needsValue ? this.filterValue.trim() : this.currentFilterOperator);
    } else {
      this.state.filters?.delete(field);
    }

    this.state.page = 0;
    this.pagination.page = 0;
    
    this.emitStateChange();
    
    if (this.lazy) {
      this.loadData();
    } else {
      this.filterLocal();
    }

    this.closeFilterModal();
  }

  clearFilterModal(): void {
    if (!this.currentFilterColumn) return;

    const field = this.currentFilterColumn.field as string;
    this.filterMetadata = this.filterMetadata.filter(f => f.field !== field);
    this.state.filters?.delete(field);

    this.state.page = 0;
    this.pagination.page = 0;
    
    this.emitStateChange();
    
    if (this.lazy) {
      this.loadData();
    } else {
      this.filterLocal();
    }

    this.closeFilterModal();
  }

  isFilterActive(column: GridColumn): boolean {
    return this.filterMetadata.some(f => f.field === column.field);
  }

  getPageNumbers(): number[] {
    const pages: number[] = [];
    const total = this.pagination.totalPages;
    const current = this.pagination.page;
    
    if (total <= 7) {
      for (let i = 0; i < total; i++) {
        pages.push(i);
      }
    } else {
      if (current <= 3) {
        for (let i = 0; i < 5; i++) pages.push(i);
        pages.push(-1);
        pages.push(total - 1);
      } else if (current >= total - 4) {
        pages.push(0);
        pages.push(-1);
        for (let i = total - 5; i < total; i++) pages.push(i);
      } else {
        pages.push(0);
        pages.push(-1);
        for (let i = current - 1; i <= current + 1; i++) pages.push(i);
        pages.push(-1);
        pages.push(total - 1);
      }
    }
    
    return pages;
  }

  // Column Management Methods
  toggleColumnVisibility(column: GridColumn): void {
    column.visible = !column.visible;
    this.displayedColumns = [...this.displayedColumns];
  }

  getVisibleColumns(): GridColumn[] {
    return this.displayedColumns.filter(col => col.visible !== false);
  }

  // Drag & Drop Methods
  onDragStart(event: DragEvent, column: GridColumn, index: number): void {
    if (!this.config?.reorderable) return;
    
    this.draggedColumn = column;
    event.dataTransfer!.effectAllowed = 'move';
    event.dataTransfer!.setData('text/html', (event.target as HTMLElement).innerHTML);
  }

  onColumnDragOver(event: DragEvent, index: number): void {
    if (!this.config?.reorderable || !this.draggedColumn) return;
    
    event.preventDefault();
    event.dataTransfer!.dropEffect = 'move';
    this.dropTargetIndex = index;
  }

  onColumnDrop(event: DragEvent, targetIndex: number): void {
    if (!this.config?.reorderable || !this.draggedColumn) return;
    
    event.preventDefault();
    
    const visibleColumns = this.getVisibleColumns();
    const draggedIndex = visibleColumns.indexOf(this.draggedColumn);
    
    if (draggedIndex !== targetIndex) {
      const allColumns = [...this.displayedColumns];
      const draggedCol = allColumns.splice(draggedIndex, 1)[0];
      allColumns.splice(targetIndex, 0, draggedCol);
      this.displayedColumns = allColumns;
    }
    
    this.draggedColumn = undefined;
    this.dropTargetIndex = undefined;
  }

  onColumnDragEnd(): void {
    this.draggedColumn = undefined;
    this.dropTargetIndex = undefined;
  }

  // Resize Methods
  onResizeStart(event: MouseEvent, column: GridColumn): void {
    if (!column.resizable) return;
    
    event.preventDefault();
    event.stopPropagation();
    
    this.resizingColumn = column;
    this.resizeStartX = event.pageX;
    
    // Get the header cell element
    const resizeHandle = event.target as HTMLElement;
    const headerCell = resizeHandle.closest('.header-cell') as HTMLElement;
    
    if (headerCell) {
      headerCell.classList.add('resizing');
      this.resizeStartWidth = headerCell.offsetWidth;
    } else {
      this.resizeStartWidth = 100;
    }
    
    document.addEventListener('mousemove', this.onResize);
    document.addEventListener('mouseup', this.onResizeEnd);
  }

  private onResize = (event: MouseEvent): void => {
    if (!this.resizingColumn) return;
    
    event.preventDefault();
    
    const diff = event.pageX - this.resizeStartX;
    const minWidth = parseInt(this.resizingColumn.minWidth || '50', 10);
    const maxWidth = this.resizingColumn.maxWidth ? parseInt(this.resizingColumn.maxWidth, 10) : Infinity;
    let newWidth = Math.max(minWidth, this.resizeStartWidth + diff);
    
    if (maxWidth !== Infinity) {
      newWidth = Math.min(newWidth, maxWidth);
    }
    
    // Update column width directly
    this.resizingColumn.width = `${newWidth}px`;
  }

  private onResizeEnd = (): void => {
    // Remove resizing class
    const resizingElement = document.querySelector('.header-cell.resizing');
    if (resizingElement) {
      resizingElement.classList.remove('resizing');
    }
    
    this.resizingColumn = undefined;
    document.removeEventListener('mousemove', this.onResize);
    document.removeEventListener('mouseup', this.onResizeEnd);
  }

  // Global Search
  onGlobalSearch(term: string): void {
    this.globalSearchTerm = term;
    
    if (!term.trim()) {
      this.loadData();
      return;
    }

    // Filter data locally or trigger server-side search
    if (this.lazy && this.adapter) {
      // Server-side search - reload data with global search term
      this.state.page = 0;
      this.loadData();
    } else {
      // Client-side search
      const filteredData = this.gridData.filter((row: any) => {
        return this.getVisibleColumns().some(col => {
          const value = row[col.field];
          return value?.toString().toLowerCase().includes(term.toLowerCase());
        });
      });
      this.gridData = filteredData;
    }
  }

  // Add Button Handler
  onAddButtonClick(): void {
    if (this.addButtonUrl()) {
      window.location.href = this.addButtonUrl()!;
    } else {
      this.addClick.emit();
    }
  }

  onRefreshClick(): void {
    this.onRefresh.emit();
  }

  // Export to Excel
  exportToExcel(): void {
    const dataToExport = this.gridData;
    this.excelExport.emit(dataToExport);
    
    // Generate professional Excel file
    this.generateExcelFile(dataToExport);
  }

  private generateExcelFile(data: T[]): void {
    if (data.length === 0) {
      console.warn('No data to export');
      return;
    }

    const columns = this.getVisibleColumns();
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const timeStr = today.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    // Create Excel XML with enhanced styling
    let excelContent = `<?xml version="1.0"?>
<?mso-application progid="Excel.Sheet"?>
<Workbook xmlns="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:o="urn:schemas-microsoft-com:office:office"
 xmlns:x="urn:schemas-microsoft-com:office:excel"
 xmlns:ss="urn:schemas-microsoft-com:office:spreadsheet"
 xmlns:html="http://www.w3.org/TR/REC-html40">
 <DocumentProperties xmlns="urn:schemas-microsoft-com:office:office">
  <Title>${this.exportFileName()}</Title>
  <Author>Nlabs Data Grid</Author>
  <Created>${today.toISOString()}</Created>
  <Company>Your Company</Company>
 </DocumentProperties>
 <Styles>
  <Style ss:ID="Title">
   <Font ss:Bold="1" ss:Size="16" ss:Color="#1F2937"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Subtitle">
   <Font ss:Size="11" ss:Color="#6B7280"/>
   <Alignment ss:Horizontal="Left" ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Header">
   <Font ss:Bold="1" ss:Size="11" ss:Color="#FFFFFF"/>
   <Interior ss:Color="#4F46E5" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Center" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#4338CA"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#4338CA"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#4338CA"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#4338CA"/>
   </Borders>
  </Style>
  <Style ss:ID="DataEven">
   <Interior ss:Color="#F9FAFB" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="DataOdd">
   <Interior ss:Color="#FFFFFF" ss:Pattern="Solid"/>
   <Borders>
    <Border ss:Position="Bottom" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Left" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Right" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="1" ss:Color="#E5E7EB"/>
   </Borders>
   <Alignment ss:Vertical="Center"/>
  </Style>
  <Style ss:ID="Footer">
   <Font ss:Bold="1" ss:Size="10" ss:Color="#6B7280"/>
   <Interior ss:Color="#F3F4F6" ss:Pattern="Solid"/>
   <Alignment ss:Horizontal="Right" ss:Vertical="Center"/>
   <Borders>
    <Border ss:Position="Top" ss:LineStyle="Continuous" ss:Weight="2" ss:Color="#D1D5DB"/>
   </Borders>
  </Style>
 </Styles>
 <Worksheet ss:Name="Data Export">
  <Table>
   <!-- Title Row -->
   <Row ss:Height="24">
    <Cell ss:StyleID="Title" ss:MergeAcross="${columns.length - 1}">
     <Data ss:Type="String">📊 ${this.exportFileName()}</Data>
    </Cell>
   </Row>
   <!-- Date/Time Row -->
   <Row ss:Height="18">
    <Cell ss:StyleID="Subtitle" ss:MergeAcross="${columns.length - 1}">
     <Data ss:Type="String">Generated: ${dateStr} at ${timeStr} | Records: ${data.length}</Data>
    </Cell>
   </Row>
   <!-- Empty Row -->
   <Row ss:Height="10"/>
   <!-- Header Row -->
   <Row ss:Height="20">
${columns.map(col => `    <Cell ss:StyleID="Header"><Data ss:Type="String">${this.escapeXml(col.header)}</Data></Cell>`).join('\n')}
   </Row>
   <!-- Data Rows -->
${data.map((row, idx) => {
  const styleId = idx % 2 === 0 ? 'DataEven' : 'DataOdd';
  return `   <Row ss:Height="18" ss:StyleID="${styleId}">
${columns.map(col => {
  const value = (row as any)[col.field];
  const type = typeof value === 'number' ? 'Number' : 'String';
  const displayValue = this.formatCellValue(value, col);
  return `    <Cell><Data ss:Type="${type}">${this.escapeXml(displayValue)}</Data></Cell>`;
}).join('\n')}
   </Row>`;
}).join('\n')}
   <!-- Empty Row -->
   <Row ss:Height="10"/>
   <!-- Footer Row -->
   <Row ss:Height="18">
    <Cell ss:StyleID="Footer" ss:MergeAcross="${columns.length - 1}">
     <Data ss:Type="String">Total Records: ${data.length} | Exported from NLabs Data Grid</Data>
    </Cell>
   </Row>
  </Table>
 </Worksheet>
</Workbook>`;

    const blob = new Blob([excelContent], { 
      type: 'application/vnd.ms-excel;charset=utf-8;' 
    });
    const link = document.createElement('a');
    link.href = URL.createObjectURL(blob);
    link.download = `${this.exportFileName()}_${dateStr.replace(/\//g, '-')}.xls`;
    link.click();
    URL.revokeObjectURL(link.href);
  }

  private formatCellValue(value: any, column: GridColumn): string {
    if (value == null || value === '') return '';
    
    // Use the column's format function if available
    if (column.format && typeof column.format === 'function') {
      try {
        return column.format(value);
      } catch (e) {
        console.warn('Error formatting value:', e);
      }
    }
    
    // Date formatting
    if (column.type === 'date') {
      if (value instanceof Date) {
        return value.toLocaleDateString('en-GB');
      }
      // Try to parse string date
      const date = new Date(value);
      if (!isNaN(date.getTime())) {
        return date.toLocaleDateString('en-GB');
      }
    }
    
    // Number formatting
    if (column.type === 'number' && typeof value === 'number') {
      return value.toLocaleString('en-US', { 
        minimumFractionDigits: 0,
        maximumFractionDigits: 2 
      });
    }
    
    // Boolean formatting
    if (column.type === 'boolean') {
      return value ? 'Yes' : 'No';
    }
    
    return String(value);
  }

  private escapeXml(text: string): string {
    return text
      .replace(/&/g, '&amp;')
      .replace(/</g, '&lt;')
      .replace(/>/g, '&gt;')
      .replace(/"/g, '&quot;')
      .replace(/'/g, '&apos;');
  }

  // Export to PDF / Print
  exportToPDF(): void {
    this.pdfExport.emit(this.gridData);
    
    // Generate professional print layout
    this.generatePrintablePDF();
  }

  private generatePrintablePDF(): void {
    if (this.gridData.length === 0) {
      console.warn('No data to export');
      return;
    }

    const columns = this.getVisibleColumns();
    const today = new Date();
    const dateStr = today.toLocaleDateString('en-GB', { 
      day: '2-digit', 
      month: '2-digit', 
      year: 'numeric' 
    });
    const timeStr = today.toLocaleTimeString('en-GB', { 
      hour: '2-digit', 
      minute: '2-digit' 
    });

    const printWindow = window.open('', '_blank');
    if (!printWindow) {
      console.error('Failed to open print window');
      return;
    }

    const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <meta name="viewport" content="width=device-width, initial-scale=1.0">
        <title>${this.exportFileName()} - PDF Export</title>
        <style>
          * { 
            margin: 0; 
            padding: 0; 
            box-sizing: border-box; 
          }
          
          body { 
            font-family: 'Segoe UI', Arial, sans-serif;
            padding: 30px;
            background: white;
            color: #1f2937;
          }
          
          .header {
            margin-bottom: 30px;
            border-bottom: 3px solid #4f46e5;
            padding-bottom: 20px;
          }
          
          .header h1 { 
            color: #4f46e5; 
            font-size: 28px; 
            margin-bottom: 8px;
            font-weight: 600;
            display: flex;
            align-items: center;
            gap: 10px;
          }
          
          .export-info {
            display: flex;
            justify-content: space-between;
            color: #6b7280;
            font-size: 13px;
            margin-top: 8px;
          }
          
          .export-date {
            font-weight: 500;
          }
          
          .export-stats {
            font-weight: 500;
          }
          
          table { 
            border-collapse: collapse; 
            width: 100%; 
            margin-top: 20px;
            box-shadow: 0 1px 3px rgba(0,0,0,0.1);
          }
          
          thead {
            background: linear-gradient(135deg, #4f46e5 0%, #6366f1 100%);
          }
          
          th { 
            color: white; 
            padding: 14px 12px; 
            text-align: left; 
            font-weight: 600;
            font-size: 12px;
            text-transform: uppercase;
            letter-spacing: 0.5px;
            border-right: 1px solid rgba(255,255,255,0.1);
          }
          
          th:last-child {
            border-right: none;
          }
          
          td { 
            border: 1px solid #e5e7eb; 
            padding: 12px;
            font-size: 13px;
          }
          
          tbody tr:nth-child(even) { 
            background: #f9fafb; 
          }
          
          tbody tr:hover { 
            background: #f3f4f6; 
          }
          
          .footer {
            margin-top: 30px;
            padding-top: 20px;
            border-top: 2px solid #e5e7eb;
            text-align: center;
            color: #9ca3af;
            font-size: 12px;
          }
          
          .footer-stats {
            display: flex;
            justify-content: center;
            gap: 30px;
            margin-top: 10px;
          }
          
          .footer-stat {
            display: flex;
            align-items: center;
            gap: 5px;
          }
          
          .footer-stat strong {
            color: #4f46e5;
          }
          
          @media print {
            body { 
              padding: 20px; 
            }
            
            .header { 
              page-break-after: avoid; 
            }
            
            table { 
              page-break-inside: auto; 
            }
            
            tr { 
              page-break-inside: avoid; 
              page-break-after: auto; 
            }
            
            thead { 
              display: table-header-group; 
            }
            
            tfoot { 
              display: table-footer-group; 
            }
            
            tbody tr:hover {
              background: inherit;
            }
          }
          
          @page {
            margin: 20mm;
            size: A4 landscape;
          }
        </style>
      </head>
      <body>
        <div class="header">
          <h1>
            <span>📊</span>
            <span>${this.exportFileName()}</span>
          </h1>
          <div class="export-info">
            <div class="export-date">
              Generated: ${dateStr} at ${timeStr}
            </div>
            <div class="export-stats">
              Total Records: ${this.gridData.length} | Columns: ${columns.length}
            </div>
          </div>
        </div>
        
        <table>
          <thead>
            <tr>
              ${columns.map(col => `<th>${this.escapeHtml(col.header)}</th>`).join('')}
            </tr>
          </thead>
          <tbody>
            ${this.gridData.map((row, idx) => `
              <tr>
                ${columns.map(col => {
                  const value = (row as any)[col.field];
                  const formattedValue = this.formatCellValue(value, col);
                  return `<td>${this.escapeHtml(formattedValue)}</td>`;
                }).join('')}
              </tr>
            `).join('')}
          </tbody>
        </table>
        
        <div class="footer">
          <div>Exported from NLabs Data Grid | © ${today.getFullYear()}</div>
          <div class="footer-stats">
            <div class="footer-stat">
              <span>📄 Pages:</span>
              <strong>Auto</strong>
            </div>
            <div class="footer-stat">
              <span>📊 Records:</span>
              <strong>${this.gridData.length}</strong>
            </div>
            <div class="footer-stat">
              <span>📅 Date:</span>
              <strong>${dateStr}</strong>
            </div>
          </div>
        </div>
        
        <script>
          window.onload = function() {
            // Auto-print after a short delay
            setTimeout(function() {
              window.print();
            }, 500);
          };
        </script>
      </body>
      </html>
    `;

    printWindow.document.write(htmlContent);
    printWindow.document.close();
  }

  private escapeHtml(text: string): string {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}
