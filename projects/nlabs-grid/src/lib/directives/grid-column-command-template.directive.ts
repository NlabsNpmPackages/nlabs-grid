import { Directive, Input, TemplateRef } from '@angular/core';

@Directive({
  selector: '[nlabsGridColumnCommandTemplate]',
  standalone: true
})
export class GridColumnCommandTemplateDirective {
  @Input('nlabsGridColumnCommandTemplate') name: string = '';

  constructor(public templateRef: TemplateRef<any>) {}
}