declare module '@natlibfi/marc-record' {
  export interface Field {
    tag: string;
    ind1?: string;
    ind2?: string;
    subfields?: Subfield[];
    value?: string;
  }

  export interface Subfield {
    code: string;
    value?: string;
  }

  export interface ValidationOptions {
    strict?: boolean;
    noFailValidation?: boolean;
    fields?: boolean;
    subfields?: boolean;
    subfieldValues?: boolean;
    controlFieldValues?: boolean;
    leader?: boolean;
    characters?: boolean;
    noControlCharacters?: boolean;
    noAdditionalProperties?: boolean;
  }

  export interface Record {
    leader?: string;
    fields?: Field[];
  }

  export class MarcRecord {
    constructor(record?: Record, validationOptions?: ValidationOptions);

    static setValidationOptions(options: ValidationOptions): void;
    static getValidationOptions(): ValidationOptions;

    getValidationErrors(): any[];
    get(query: string | RegExp): Field[];
    pop(query: string | RegExp): Field[];
    sortFields(): this;
    removeField(field: Field): this;
    removeFields(fields: Field[]): this;
    removeSubfield(subfield: Subfield, field: Field): this;
    appendField(field: Field): this;
    appendFields(fields: Field[]): this;
    insertField(field: Field, index?: number): this;
    insertFields(fields: Field[]): this;
    findPosition(field: Field): number;
    getControlfields(): Field[];
    getDatafields(): Field[];
    getFields(tag: string, query?: string | Subfield[]): Field[];
    containsFieldWithValue(tag: string, query: string | Subfield[]): boolean;
    getTypeOfRecord(): string;
    getBibliograpicLevel(): string;
    isBK(): boolean;
    isCF(): boolean;
    isCR(): boolean;
    isMP(): boolean;
    isMU(): boolean;
    isMX(): boolean;
    isVM(): boolean;
    getTypeOfMaterial(): string | false;
    equalsTo(record: MarcRecord): boolean;
    toString(): string;
    toObject(): Record;

    static fromString(
      str: string,
      validationOptions?: ValidationOptions
    ): MarcRecord;
    static clone(
      record: Record,
      validationOptions?: ValidationOptions
    ): MarcRecord;
    static isEqual(r1: MarcRecord, r2: MarcRecord): boolean;
  }

  export class MarcRecordError extends Error {
    constructor(message: string);
  }
}

// Declarations for '@natlibfi/marc-record-validate'
declare module '@natlibfi/marc-record-validate' {
  import type {
    MarcRecord as MarcRecordClass,
    Record as MarcRecordObject,
    ValidationOptions as MarcValidationOptions,
  } from '@natlibfi/marc-record';

  // Validation error shape returned/thrown by the validator
  export interface ValidationError {
    message: string;
    code?: string;
    field?: unknown;
    subfield?: unknown;
    path?: Array<string | number>;
  }

  export interface ValidatorResult {
    valid: boolean;
    errors: ValidationError[];
  }

  // Options for validator factory; mirrors MarcRecord ValidationOptions where applicable
  export type Validator = MarcValidationOptions & {
    // Some validators support toggles; keep this extensible
    [key: string]: unknown;
  };

  // Validator function signature: validates a MarcRecord instance or plain object
  export type ValidateFn = (
    record: MarcRecordClass | MarcRecordObject
  ) => Promise<ValidatorResult> | Promise<void>;

  // Default export is a factory producing a validator function
  const validateFactory: (validators?: Validator[]) => ValidateFn;
  export default validateFactory;
}
