import { Injectable } from '@angular/core';
import { MarcRecord } from '@natlibfi/marc-record';
import { Validator } from '@natlibfi/marc-record-validate';
import { ValidatorWrapper, VALIDATOR_TOKEN } from './validator-wrapper';

@Injectable()
export class Field300aPresentValidatorService extends ValidatorWrapper {
  getValidator(): Validator {
    return {
      description: 'Field 300$a present',
      validate: (record: MarcRecord) => ({
        valid: record
          .get(/^300$/)
          .every((field) =>
            field.subfields?.find((subfield) => subfield.code === 'a'),
          ),
      }),
    };
  }

  static provider = {
    provide: VALIDATOR_TOKEN,
    useClass: Field300aPresentValidatorService,
    multi: true,
  };
}
