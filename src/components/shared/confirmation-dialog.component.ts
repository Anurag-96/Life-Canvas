import { Component, ChangeDetectionStrategy, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-confirmation-dialog',
  imports: [CommonModule],
  templateUrl: './confirmation-dialog.component.html',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class ConfirmationDialogComponent {
  title = input<string>('Are you sure?');
  message = input<string>('This action cannot be undone.');
  confirmText = input<string>('Confirm');
  cancelText = input<string>('Cancel');

  confirm = output<void>();
  cancel = output<void>();

  onConfirm(): void {
    this.confirm.emit();
  }

  onCancel(): void {
    this.cancel.emit();
  }
}
