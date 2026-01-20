import { Component, Input } from '@angular/core';
import { MarcRecord } from '@natlibfi/marc-record';

@Component({
  selector: 'app-marc-record-table',
  templateUrl: './marc-record-table.component.html',
  styleUrls: ['./marc-record-table.component.scss'],
})
export class MarcRecordTableComponent {
  @Input() marcRecord: MarcRecord | null = null;
  public isExpanded = false;

  public formatLeader(leader: string): string {
    return leader.replace(/ /g, '#');
  }

  public formatControlFieldValue(value: string): string {
    return value.replace(/ /g, '#');
  }

  public isControlField(field: any): boolean {
    return field['value'] !== undefined;
  }

  public getLeader(): string {
    return this.marcRecord ? (this.marcRecord as any).leader : '';
  }

  public getFields(): any[] {
    return this.marcRecord ? (this.marcRecord as any).fields || [] : [];
  }
}
