import { Injectable } from '@angular/core';
import { MarcRecord } from '@natlibfi/marc-record';
import { Validator } from '@natlibfi/marc-record-validate';
import { ValidatorWrapper, VALIDATOR_TOKEN } from './validator-wrapper';

@Injectable()
export class Field264aPresentValidatorService extends ValidatorWrapper {
  getValidator(): Validator {
    return {
      description: 'Field 264$a present',
      validate: (record: MarcRecord) => ({
        valid: record
          .get(/^264$/)
          .every((field) =>
            field.subfields?.find((subfield) => subfield.code === 'a'),
          ),
      }),
    };
  }

  static provider = {
    provide: VALIDATOR_TOKEN,
    useClass: Field264aPresentValidatorService,
    multi: true,
  };
}
