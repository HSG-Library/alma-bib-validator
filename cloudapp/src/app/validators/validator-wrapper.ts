import { InjectionToken } from '@angular/core';
import { Validator } from '@natlibfi/marc-record-validate';

export abstract class ValidatorWrapper {
  abstract getValidator(): Validator;
}

export const VALIDATOR_TOKEN = new InjectionToken<ValidatorWrapper>(
  'Validator',
);
