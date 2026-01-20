export interface MyRecord {
  leader: string;
  fields: Entry[];
}

export interface Entry {
  tag: string;
  ind1?: string;
  ind2?: string;
  value?: Value[];
  subfields?: Value[];
}

export interface Value {
  code: string;
  value: string;
}
