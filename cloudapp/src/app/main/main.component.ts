import {
  Component,
  effect,
  Inject,
  OnDestroy,
  OnInit,
  signal,
} from '@angular/core';
import {
  AlertService,
  CloudAppEventsService,
  CloudAppRestService,
  Entity,
  EntityType,
  HttpMethod,
} from '@exlibris/exl-cloudapp-angular-lib';
import { Observable, of } from 'rxjs';
import {
  catchError,
  filter,
  shareReplay,
  switchMap,
  tap,
} from 'rxjs/operators';
import { BibRecord } from '../models/bib-record';
import { LoadingIndicatorService } from '../services/loading-indicator.service';
import { LogService } from '../services/log.service';
import { StatusMessageService } from '../services/status-message.service';
import { MarcRecord, Record, Field, Subfield } from '@natlibfi/marc-record';
import validateFactory, {
  Validator,
  ValidatorResult,
} from '@natlibfi/marc-record-validate';
import { ValidatorWrapper, VALIDATOR_TOKEN } from '../validators';

@Component({
  selector: 'app-main',
  templateUrl: './main.component.html',
  styleUrls: ['./main.component.scss'],
})
export class MainComponent implements OnInit, OnDestroy {
  public entities: Entity[] = [];
  public selectedEntity: BibRecord | null = null;
  public xml: string = '';
  public xmlRecord: Document | null = null;
  public marcRecord: MarcRecord | null = null;
  public entities$: Observable<Entity[]>;
  public validationMessage = signal('');
  public autoSelecting = false;

  public availableValidators: Validator[] = [];
  public result = signal<ValidatorResult | void | null>(null);
  public validatorResults = new Map<string, boolean>();

  public constructor(
    private log: LogService,
    private restService: CloudAppRestService,
    private eventsService: CloudAppEventsService,
    private alert: AlertService,
    private _status: StatusMessageService,
    private _loader: LoadingIndicatorService,
    @Inject(VALIDATOR_TOKEN) private validatorWrappers: ValidatorWrapper[],
  ) {
    this.entities$ = this.eventsService.entities$.pipe(
      tap(() => this.reset()),
      filter((entities) =>
        entities.every((entity) => entity.type === EntityType.BIB_MMS),
      ),
    );
    effect(() => {
      console.log('result', this.result());
    });
    this.availableValidators = this.validatorWrappers.map((w) =>
      w.getValidator(),
    );
  }

  public get loader(): LoadingIndicatorService {
    return this._loader;
  }

  public get status(): StatusMessageService {
    return this._status;
  }

  public ngOnInit(): void {
    this.loader.show();
    this.status.set('loading');

    this.entities$.subscribe(
      (entities) => {
        this.entities = entities;
        console.log(entities);

        // Auto-select if only one entity
        if (entities.length === 1) {
          this.autoSelecting = true;
          this.selectRecord(entities[0]);
        } else {
          this.autoSelecting = false;
          this.loader.hide();
        }
      },
      (error) => {
        this.log.error('ngOnInit failed:', error);
        this.loader.hide();
      },
    );
  }

  public ngOnDestroy(): void {}

  public selectRecord(entity: Entity): void {
    this.log.info(entity);
    this.loader.show();
    this.status.set('selecting record');
    this.getBibRecord(entity).subscribe(
      (bibRecord) => {
        this.log.info('selectRecord successful:', bibRecord);
        this.selectedEntity = bibRecord;
        this.log.info('selected', this.selectedEntity);
        this.xmlRecord = new DOMParser().parseFromString(
          this.selectedEntity.anies[0],
          'application/xml',
        );
        this.marcRecord = this.createMarcRecord();
        this.autoSelecting = false;
        this.loader.hide();
      },
      (error) => {
        this.log.error('selectRecord failed:', error);
        this.loader.hide();
      },
    );
  }

  public reset(): void {
    this.selectedEntity = null;
    this.marcRecord = null;
    this.validatorResults.clear();
  }

  public async validate(): Promise<void> {
    if (!this.marcRecord) {
      this.log.info('No MARC record available for validation');
      return;
    }

    this.log.info('validate');
    this.log.info('record', this.marcRecord);

    // Clear previous results
    this.validatorResults.clear();

    // Run each validator individually to track results
    for (const validator of this.availableValidators) {
      try {
        const validateFn = (validator as any)['validate'];
        const result = validateFn(this.marcRecord);
        const description = validator['description'] as string;
        const isValid = result && result.valid === true;
        this.validatorResults.set(description, isValid);
        this.log.info(
          `Validator "${description}": ${isValid ? 'PASS' : 'FAIL'}`,
        );
      } catch (error) {
        const description = validator['description'] as string;
        this.validatorResults.set(description, false);
        this.log.error(`Validator "${description}" error:`, error);
      }
    }

    // Run the overall validation for the result signal
    const validate = validateFactory(this.availableValidators);
    await validate(this.marcRecord).then((r: ValidatorResult | void) =>
      this.result.set(r),
    );
  }

  private createMarcRecord(): MarcRecord {
    if (this.xmlRecord == null) {
      return new MarcRecord();
    }

    const record: Element = this.xmlRecord.getElementsByTagName('record')[0];
    const fields: Element[] = Array.from(record.childNodes).filter(
      (node): node is Element => node.nodeType === Node.ELEMENT_NODE,
    );

    const convertedRecord: Record = {} as Record;
    convertedRecord.leader = '';
    convertedRecord.fields = [];

    fields.forEach((field) => {
      if (field.tagName == 'leader') {
        convertedRecord.leader = field.textContent ?? '';
      }
      if (field.tagName == 'controlfield') {
        const tag: string = field.getAttribute('tag') ?? '';
        const entry: Field = {} as Field;
        entry['tag'] = tag;
        entry['value'] = field.textContent ?? '';
        convertedRecord.fields?.push(entry);
      }
      if (field.tagName == 'datafield') {
        const tag: string = field.getAttribute('tag') ?? '';
        const entry: Field = {} as Field;
        entry['tag'] = tag;
        entry['ind1'] = field.getAttribute('ind1') ?? '';
        entry['ind2'] = field.getAttribute('ind2') ?? '';
        const valueMap: Subfield[] = [];
        Array.from(field.childNodes)
          .filter(
            (node): node is Element => node.nodeType === Node.ELEMENT_NODE,
          )
          .forEach((subfield: Element) => {
            const key: string = subfield.getAttribute('code') ?? '';
            const value: string = subfield.textContent ?? '';
            valueMap.push({ code: key, value: value });
          });
        entry['subfields'] = valueMap;
        convertedRecord.fields?.push(entry);
      }
    });

    return new MarcRecord(convertedRecord);
  }

  private getBibRecord(entity: Entity): Observable<BibRecord> {
    return this.getNzMmsIdFromEntity(entity).pipe(
      switchMap((id) => {
        return this.restService.call({
          method: HttpMethod.GET,
          url: `/bibs/?nz_mms_id=${id}`,
        });
      }),
      switchMap((response) => {
        if (response.bib) {
          const bibRecord: BibRecord = response.bib[0];
          bibRecord.entity = entity;
          return of(bibRecord);
        } else {
          const bibRecord: BibRecord = response;
          bibRecord.entity = entity;
          return of(response);
        }
      }),
    );
  }

  private getNzMmsIdFromEntity(entity: Entity): Observable<string> {
    const id = entity.id;
    if (entity.link.indexOf('?nz_mms_id') >= 0) {
      return of(id);
    }
    return this.restService
      .call({
        method: HttpMethod.GET,
        url: entity.link,
        queryParams: { view: 'brief' },
      })
      .pipe(
        switchMap((response) => {
          const nzMmsId: string = response?.linked_record_id?.value;
          this.log.info('nzMmsId', nzMmsId);
          return of(nzMmsId);
        }),
        catchError((error) => {
          this.log.error(
            'Cannot get NZ MMSID from API. Assuming the MMSID is already from NZ.',
            error,
          );
          return of(entity.id);
        }),
        shareReplay(1),
      );
  }
}
