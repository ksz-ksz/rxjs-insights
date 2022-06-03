import { ObservableRef } from '@app/protocols/refs';

export const InsightsChannel = 'InsightsChannel';

export interface Insights {
  getObservableRef(observableId: number): ObservableRef | undefined;
}
