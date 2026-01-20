import { Injectable } from '@angular/core';
import { MarcRecord } from '@natlibfi/marc-record';
import { Validator, ValidatorResult } from '@natlibfi/marc-record-validate';
import { ValidatorWrapper, VALIDATOR_TOKEN } from './validator-wrapper';

@Injectable()
export class ThesisValidatorService extends ValidatorWrapper {
  public getValidator(): Validator {
    return {
      description: `If field 502 is present, 655$a must be 'Hochschulschrift/Thèses et écrits académiques/Tesi'`,
      validate: this.validateThesis,
    };
  }

  private validateThesis(record: MarcRecord): ValidatorResult {
    const has502 = record.get(/^502$/)?.length;

    if (has502) {
      const is655Correct = record
        .get(/^655$/)
        .some((field) =>
          field.subfields
            ?.find((subfield) => subfield.code === 'a')
            ?.value?.match(
              /(Hochschulschrift|Thèses et écrits académiques|Tesi)/,
            ),
        );

      return { valid: is655Correct, errors: [] };
    }

    return { valid: true, errors: [] };
  }

  static provider = {
    provide: VALIDATOR_TOKEN,
    useClass: ThesisValidatorService,
    multi: true,
  };
}
