import { Component, Input, Output, EventEmitter, ElementRef, HostListener } from '@angular/core';
import { CommonModule } from '@angular/common';

export interface DropdownOption {
  value: any;
  label: string;
  icon?: string;
  onClick?: () => void;
}

@Component({
  selector: 'app-dropdown-menu',
  standalone: true,
  imports: [CommonModule],
  template: `
    <div class="relative inline-block text-left w-full min-w-[150px]">
      <button type="button" (click)="toggleDropdown()"
        [disabled]="disabled"
        class="w-full flex items-center justify-between px-4 py-2.5 bg-[#f8f9fc] hover:bg-blue-50 text-slate-700 border border-transparent hover:border-blue-100 rounded-xl transition-all duration-300 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:bg-[#f8f9fc] disabled:hover:border-transparent">
        <span class="flex items-center gap-2 text-sm font-medium">
          <ng-content></ng-content>
          <span *ngIf="iconClass" [class]="iconClass"></span>
          {{ getSelectedLabel() }}
        </span>
        <span class="material-symbols-outlined ml-2 text-[18px] text-slate-400 transition-transform duration-300 pointer-events-none" 
              [ngClass]="{'rotate-180': isOpen}">expand_more</span>
      </button>

      <!-- Dropdown Popup -->
      <div *ngIf="isOpen" 
           class="absolute right-0 z-50 min-w-max w-full mt-2 p-1 bg-white border border-gray-100 text-slate-700 rounded-xl shadow-lg flex flex-col gap-1 origin-top transition-all duration-300">
        
        <div *ngIf="options.length === 0" class="px-4 py-2 text-xs text-slate-400">No options</div>
        
        <button *ngFor="let option of options" (click)="selectOption(option)"
          class="px-3 py-2.5 cursor-pointer hover:bg-blue-50 hover:text-blue-700 font-medium text-sm rounded-lg w-full text-left flex items-center gap-2 transition-colors duration-200 whitespace-nowrap">
          <span *ngIf="option.icon" class="material-symbols-outlined text-[18px]">{{ option.icon }}</span>
          {{ option.label }}
        </button>
      </div>
    </div>
  `
})
export class DropdownMenuComponent {
  @Input() options: DropdownOption[] = [];
  @Input() selectedValue: any = null;
  @Input() iconClass?: string;
  @Input() placeholder: string = 'Menu';
  @Input() disabled: boolean = false;
  @Output() selectionChange = new EventEmitter<any>();

  isOpen = false;

  constructor(private eRef: ElementRef) {}

  toggleDropdown() {
    if (this.disabled) return;
    this.isOpen = !this.isOpen;
  }

  selectOption(option: DropdownOption) {
    this.selectedValue = option.value;
    if (option.onClick) {
        option.onClick();
    }
    this.selectionChange.emit(option.value);
    this.isOpen = false;
  }

  getSelectedLabel(): string {
    const selected = this.options.find(opt => opt.value === this.selectedValue);
    return selected ? selected.label : this.placeholder;
  }

  @HostListener('document:click', ['$event'])
  clickout(event: Event) {
    if(!this.eRef.nativeElement.contains(event.target)) {
      this.isOpen = false;
    }
  }
}
