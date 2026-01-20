import { Component, Input } from '@angular/core';
import { Validator } from '@natlibfi/marc-record-validate';

@Component({
  selector: 'app-validator-list',
  templateUrl: './validator-list.component.html',
  styleUrls: ['./validator-list.component.scss'],
})
export class ValidatorListComponent {
  @Input() validators: Validator[] = [];
  @Input() validatorResults = new Map<string, boolean>();

  public getValidatorIcon(validator: Validator): string {
    const description = validator['description'] as string;
    if (!this.validatorResults.has(description)) {
      return 'help';
    }
    return this.validatorResults.get(description) ? 'verified' : 'error';
  }

  public getValidatorColor(validator: Validator): string {
    const description = validator['description'] as string;
    if (!this.validatorResults.has(description)) {
      return 'validator-icon-neutral';
    }
    return this.validatorResults.get(description)
      ? 'validator-icon-success'
      : 'validator-icon-failed';
  }
}
