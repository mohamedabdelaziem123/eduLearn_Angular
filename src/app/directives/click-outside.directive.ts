import { Directive, ElementRef, Output, EventEmitter, HostListener } from '@angular/core';

@Directive({
    selector: '[clickOutside]',
    standalone: true
})
export class ClickOutsideDirective {
    @Output() clickOutside = new EventEmitter<void>();

    constructor(private elementRef: ElementRef) { }

    @HostListener('document:click', ['$event', '$event.target'])
    public onClick(event: MouseEvent, targetElement: EventTarget | null): void {
        const targetHtmlElement = targetElement as HTMLElement;
        if (!targetHtmlElement) {
            return;
        }
        const clickedInside = this.elementRef.nativeElement.contains(targetElement);
        if (!clickedInside) {
            this.clickOutside.emit();
        }
    }
}
