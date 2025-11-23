import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[nlabsGridColumnCommandTemplate]',
  standalone: true
})
export class GridColumnCommandTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}