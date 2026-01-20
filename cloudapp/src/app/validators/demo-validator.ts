import { Injectable } from '@angular/core';
import { MarcRecord } from '@natlibfi/marc-record';
import { Validator } from '@natlibfi/marc-record-validate';
import { ValidatorWrapper, VALIDATOR_TOKEN } from './validator-wrapper';

@Injectable()
export class DemoValidatorService extends ValidatorWrapper {
  getValidator(): Validator {
    return {
      description: 'Demo Validator: Title contains "Climate"',
      validate: (record: MarcRecord) => ({
        valid: record.get(/^245$/u).every((field) =>
          field.subfields
            ?.find((subfield) => subfield.code === 'a')
            ?.value?.toLocaleLowerCase()
            .includes('climate'),
        ),
      }),
    };
  }

  static provider = {
    provide: VALIDATOR_TOKEN,
    useClass: DemoValidatorService,
    multi: true,
  };
}
