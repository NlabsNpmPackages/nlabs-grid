import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[nlabsGridFooterTemplate]',
  standalone: true
})
export class GridFooterTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}