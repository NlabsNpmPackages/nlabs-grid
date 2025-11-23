import { Directive, TemplateRef } from '@angular/core';

@Directive({
  selector: '[nlabsGridCaptionCommandTemplate]',
  standalone: true
})
export class GridCaptionCommandTemplateDirective {
  constructor(public templateRef: TemplateRef<any>) {}
}