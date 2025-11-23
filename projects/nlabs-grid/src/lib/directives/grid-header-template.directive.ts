import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[nlabsGridHeaderTemplate]',
  standalone: true
})
export class GridHeaderTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}