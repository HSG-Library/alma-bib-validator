import { DemoValidatorService } from './demo-validator';
import { Demo2ValidatorService } from './demo-2-validator';
import { Field245aPresentValidatorService } from './field-245a-present-validator';
import { Field264aPresentValidatorService } from './field-264a-present-validator';
import { Field264cPresentValidatorService } from './field-264c-present-validator';
import { Field300aPresentValidatorService } from './field-300a-present-validator';
import { ThesisValidatorService } from './thesis-validator';

export * from './validator-wrapper';

export const VALIDATOR_PROVIDERS = [
  DemoValidatorService.provider,
  Demo2ValidatorService.provider,
  Field245aPresentValidatorService.provider,
  Field264aPresentValidatorService.provider,
  Field264cPresentValidatorService.provider,
  Field300aPresentValidatorService.provider,
  ThesisValidatorService.provider,
];
