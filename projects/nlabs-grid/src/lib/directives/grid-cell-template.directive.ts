import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[nlabsGridCellTemplate]',
  standalone: true
})
export class GridCellTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}