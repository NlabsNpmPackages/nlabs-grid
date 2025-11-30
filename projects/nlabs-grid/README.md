# nlabs-grid

A modern, feature-rich, and highly customizable Angular data grid component built for Angular 20+ with full theme support and enterprise-grade functionality.

## Features

### Core Features
- **Modern Angular**: Built with Angular 20+ using standalone components
- **TypeScript**: Full TypeScript support with type safety
- **Reactive Design**: Built with signals and reactive patterns
- **Theme Support**: Built-in light/dark theme with customizable CSS variables
- **Responsive**: Mobile-friendly and responsive design

### Data Management
- **Lazy Loading**: Server-side pagination with OData adapter
- **Local Data**: Client-side data handling
- **Sorting**: Multi-column sorting support
- **Filtering**: Per-column filtering with various filter types
- **Pagination**: Configurable page sizes and navigation

### UI Features
- **Row Selection**: Single and multi-row selection with custom checkboxes
- **Column Reordering**: Drag-and-drop column reordering
- **Column Resizing**: Interactive column width adjustment
- **Column Chooser**: Show/hide columns dynamically
- **Custom Templates**: Support for custom cell, header, footer, and action templates
- **Actions Column**: Customizable action buttons (edit, delete, view, etc.)
- **Empty State**: Customizable empty data message

### Advanced Features
- **Custom Checkbox Design**: Modern, corporate-style checkboxes with smooth animations
- **Actions Template**: Fully customizable action buttons via ng-template
- **Global Search**: Search across all columns
- **Export Options**: Excel and PDF export capabilities
- **State Management**: Preserve grid state (sorting, filtering, pagination)

## Links

- **GitHub Repository**: [https://github.com/NlabsNpmPackages/nlabs-grid](https://github.com/NlabsNpmPackages/nlabs-grid)
- **Example Usage**: [https://github.com/nlabsGlobalAngular/nlabs-grid](https://github.com/nlabsGlobalAngular/nlabs-grid)
- **npm Package**: [https://www.npmjs.com/package/nlabs-grid](https://www.npmjs.com/package/nlabs-grid)

## Installation

```bash
npm install nlabs-grid
```

## Quick Start

### 1. Import the Component

```typescript
import { Component } from '@angular/core';
import { DataGridComponent, GridConfig, ODataAdapter } from 'nlabs-grid';
import { HttpClient } from '@angular/common/http';

@Component({
  selector: 'app-root',
  standalone: true,
  imports: [DataGridComponent],
  template: `
    <nlabs-data-grid
      [config]="gridConfig"
      [adapter]="dataAdapter"
      [autoLoad]="true"
      [lazy]="true"
      [theme]="'dark'"
    />
  `
})
export class AppComponent {
  gridConfig: GridConfig = {
    columns: [
      { field: 'id', header: 'ID', sortable: true, width: '80px' },
      { field: 'name', header: 'Name', sortable: true, filterable: true },
      { field: 'email', header: 'Email', sortable: true, filterable: true }
    ],
    pageSize: 10,
    sortable: true,
    filterable: true
  };

  dataAdapter: ODataAdapter;

  constructor(private http: HttpClient) {
    this.dataAdapter = new ODataAdapter(http, 'https://api.example.com/odata/Users');
  }
}
```

### 2. Basic Configuration

```typescript
gridConfig: GridConfig = {
  columns: [
    {
      field: 'id',
      header: 'ID',
      sortable: true,
      filterable: false,
      width: '80px',
      type: 'number'
    },
    {
      field: 'name',
      header: 'Name',
      sortable: true,
      filterable: true,
      width: '200px'
    },
    {
      field: 'active',
      header: 'Active',
      type: 'boolean',
      format: (value: boolean) => value ? '✓ Active' : '✗ Inactive'
    }
  ],
  pageSize: 10,
  pageSizeOptions: [5, 10, 25, 50, 100],
  sortable: true,
  filterable: true,
  selectable: true,
  multiSelect: true,
  showCheckboxColumn: true,
  checkboxColumnWidth: '60px',
  showActions: true,
  actionsHeader: 'Actions',
  actionsWidth: '180px',
  reorderable: true,
  resizable: true,
  showHeader: true,
  showFooter: true,
  emptyMessage: 'No records found'
};
```

## Advanced Usage

### Selection with Custom Checkboxes

```typescript
// Enable selection
gridConfig: GridConfig = {
  selectable: true,
  multiSelect: true,
  showCheckboxColumn: true,
  checkboxColumnWidth: '60px',
  // ... other config
};

// Handle selection events
onRowSelect(row: any): void {
  console.log('Row selected:', row);
}

onRowUnselect(row: any): void {
  console.log('Row unselected:', row);
}
```

```html
<nlabs-data-grid
  [config]="gridConfig"
  [adapter]="dataAdapter"
  (rowSelect)="onRowSelect($event)"
  (rowUnselect)="onRowUnselect($event)"
/>
```

### Custom Actions Column

```typescript
import { GridColumnCommandTemplateDirective } from 'nlabs-grid';

@Component({
  imports: [DataGridComponent, GridColumnCommandTemplateDirective],
  // ...
})
```

```html
<nlabs-data-grid
  [config]="gridConfig"
  [adapter]="dataAdapter">

  <!-- Custom Actions Template -->
  <ng-template nlabsGridColumnCommandTemplate="actions" let-row>
    <button class="btn-edit" (click)="onEdit(row)">
      ✏️ Edit
    </button>
    <button class="btn-delete" (click)="onDelete(row)">
      🗑️ Delete
    </button>
    <button class="btn-view" (click)="onView(row)">
      👁️ View
    </button>
  </ng-template>
</nlabs-data-grid>
```

### Custom Footer Template

```typescript
import { GridFooterTemplateDirective } from 'nlabs-grid';

@Component({
  imports: [DataGridComponent, GridFooterTemplateDirective],
  // ...
})
```

```html
<nlabs-data-grid [config]="gridConfig" [adapter]="dataAdapter">
  <ng-template nlabsGridFooterTemplate let-data let-total="total">
    <div class="custom-footer">
      <span>Total Records: {{ total }}</span>
      <span>Showing {{ data.length }} items</span>
    </div>
  </ng-template>
</nlabs-data-grid>
```

### OData Integration

```typescript
import { ODataAdapter } from 'nlabs-grid';

// Create adapter
this.odataAdapter = new ODataAdapter<User>(
  this.http,
  'http://localhost:5210/odata/Users'
);

// Use with grid
<nlabs-data-grid
  [adapter]="odataAdapter"
  [lazy]="true"
  [autoLoad]="true"
/>
```

### Theme Support

```html
<!-- Light Theme -->
<nlabs-data-grid [theme]="'light'" />

<!-- Dark Theme -->
<nlabs-data-grid [theme]="'dark'" />

<!-- With Theme Selector -->
<nlabs-data-grid
  [theme]="'dark'"
  [showThemeSelector]="true"
/>
```

## Configuration Options

### GridConfig Interface

```typescript
interface GridConfig {
  // Column definitions
  columns: GridColumn[];

  // Pagination
  pageSize?: number;
  pageSizeOptions?: number[];

  // Features
  sortable?: boolean;
  filterable?: boolean;
  selectable?: boolean;
  multiSelect?: boolean;
  resizable?: boolean;
  reorderable?: boolean;

  // Checkbox column
  showCheckboxColumn?: boolean;
  checkboxColumnWidth?: string;

  // Actions column
  showActions?: boolean;
  actionsHeader?: string;
  actionsWidth?: string;

  // UI
  showHeader?: boolean;
  showFooter?: boolean;
  emptyMessage?: string;
  rowHeight?: string;
}
```

### GridColumn Interface

```typescript
interface GridColumn {
  field: string;
  header: string;
  type?: 'string' | 'number' | 'boolean' | 'date';
  width?: string;
  minWidth?: string;
  maxWidth?: string;
  sortable?: boolean;
  filterable?: boolean;
  resizable?: boolean;
  visible?: boolean;
  format?: (value: any) => string;
  cellTemplate?: TemplateRef<any>;
}
```

## Input Properties

| Property | Type | Default | Description |
|----------|------|---------|-------------|
| `config` | `GridConfig` | - | Grid configuration object |
| `adapter` | `IDataAdapter` | - | Data adapter (OData, Mock, etc.) |
| `data` | `T[]` | `[]` | Static data array |
| `totalRecords` | `number` | `0` | Total record count for pagination |
| `autoLoad` | `boolean` | `true` | Auto-load data on init |
| `lazy` | `boolean` | `true` | Enable lazy loading |
| `theme` | `'light' \| 'dark'` | `'light'` | Theme mode |
| `showThemeSelector` | `boolean` | `false` | Show theme toggle button |
| `showColumnChooser` | `boolean` | `true` | Show column visibility selector |
| `showGlobalSearch` | `boolean` | `false` | Show global search input |
| `showAddButton` | `boolean` | `false` | Show add new button |
| `addButtonText` | `string` | `'Add New'` | Add button text |
| `showExport` | `boolean` | `false` | Show export buttons |
| `exportFileName` | `string` | `'export'` | Export file name |
| `showFooter` | `boolean` | `true` | Show grid footer |

## Output Events

| Event | Payload | Description |
|-------|---------|-------------|
| `dataLoad` | `GridDataResult<T>` | Fired when data is loaded |
| `rowSelect` | `T` | Fired when a row is selected |
| `rowUnselect` | `T` | Fired when a row is unselected |
| `stateChange` | `GridState` | Fired when grid state changes |
| `addClick` | `void` | Fired when add button is clicked |
| `excelExport` | `T[]` | Fired when Excel export is requested |
| `pdfExport` | `T[]` | Fired when PDF export is requested |

## Styling

### CSS Variables

The grid uses CSS variables for theming. You can customize colors by overriding these variables:

```css
:root {
  --grid-primary-color: #4096ff;
  --grid-primary-hover: #1677ff;
  --grid-bg-primary: #ffffff;
  --grid-bg-secondary: #f5f7fa;
  --grid-bg-hover: #f5f9ff;
  --grid-text-primary: #262626;
  --grid-text-secondary: #666666;
  --grid-border-color: #d9d9d9;
  --grid-border-dark: #bfbfbf;
  --grid-radius-sm: 4px;
  --grid-radius-md: 6px;
  --grid-radius-lg: 8px;
}
```

### Dark Theme Variables

```css
[data-theme='dark'] {
  --grid-bg-primary: #1f1f1f;
  --grid-bg-secondary: #141414;
  --grid-bg-hover: #2a2a2a;
  --grid-text-primary: #e0e0e0;
  --grid-text-secondary: #a0a0a0;
  --grid-border-color: #404040;
  --grid-border-dark: #4a4a4a;
}
```

### Custom Button Styles

```css
.btn-edit {
  color: var(--grid-primary-color, #4096ff);
  border: 1px solid var(--grid-primary-color, #4096ff);
  background: var(--grid-bg-primary, #fff);
}

.btn-delete {
  color: #ef4444;
  border: 1px solid #ef4444;
  background: var(--grid-bg-primary, #fff);
}
```

## Browser Support

- Chrome (latest)
- Firefox (latest)
- Safari (latest)
- Edge (latest)

## Requirements

- Angular 20+
- TypeScript 5.8+
- RxJS 7.8+

## Building the Library

```bash
# Build the library
ng build nlabs-grid

# Watch mode
ng build nlabs-grid --watch
```

## Publishing

```bash
# Navigate to dist folder
cd dist/nlabs-grid

# Publish to npm
npm publish
```

## License

MIT License

## Author

nLabs Development Team

## Contributing

Contributions are welcome! Please feel free to submit a Pull Request.

## Support

For issues and questions, please use the GitHub issue tracker.
