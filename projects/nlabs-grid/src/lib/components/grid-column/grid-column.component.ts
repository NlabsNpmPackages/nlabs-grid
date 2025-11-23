import { Component, input, signal, linkedSignal, contentChild, TemplateRef } from '@angular/core';

export type TextAlignType = 'left' | 'center' | 'right';
export type FilterType = 'text' | 'date' | 'number' | 'boolean' | 'select';
export type CurrencyFormatType = 'c' | 'n';

@Component({
  selector: 'nlabs-grid-column',
  standalone: true,
  template: '',
})
export class GridColumnComponent {
  // Basic Properties
  readonly field = input<string>('');
  readonly title = input<string>('');
  readonly header = input<string>(''); // Alias for title
  
  // Column Behavior
  readonly sortable = input<boolean>(true);
  readonly filterable = input<boolean>(true);
  readonly visible = input<boolean>(true);
  readonly resizable = input<boolean>(true);
  readonly frozen = input<boolean>(false);
  readonly locked = input<boolean>(false); // Cannot be reordered
  
  // Styling
  readonly width = input<string>('160px');
  readonly minWidth = input<string>('50px');
  readonly maxWidth = input<string>('');
  readonly textAlign = input<TextAlignType>('left');
  readonly className = input<string>('');
  readonly hideOverflow = input<boolean>(true);
  
  // Filtering
  readonly filterType = input<FilterType>('text');
  readonly filterData = input<any[]>([]);
  readonly filterValue = input<any>();
  readonly filterOperator = signal<string>('contains');
  
  // Formatting
  readonly format = input<string | CurrencyFormatType | null>(null);
  readonly symbol = input<string>('$');
  readonly fraction = input<number>(2);
  readonly showSymbolInFront = input<boolean>(true);
  
  // Boolean Display
  readonly showCheckbox = input<boolean>(false);
  readonly booleanData = input<string[]>(['Yes', 'No']);
  
  // Signals for dynamic values
  readonly visibleSignal = linkedSignal(() => this.visible());
  readonly widthSignal = linkedSignal(() => this.width());
  readonly filterValueSignal = linkedSignal(() => this.filterValue());
  
  // Template References (will be set by directives)
  cellTemplate?: TemplateRef<any>;
  headerTemplate?: TemplateRef<any>;
  footerTemplate?: TemplateRef<any>;
  
  // Unique identifier
  readonly timestamp = signal<string>(
    `${new Date().getTime()}-${Math.random().toString(36).slice(2, 11)}`
  );

  getDisplayTitle(): string {
    return this.header() || this.title() || this.capitalizeFirstLetter(this.field());
  }

  private capitalizeFirstLetter(str: string): string {
    if (!str) return '';
    return str
      .replace(/([A-Z])/g, ' $1')
      .replace(/_/g, ' ')
      .split(' ')
      .map(word => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
      .join(' ')
      .trim();
  }
}
