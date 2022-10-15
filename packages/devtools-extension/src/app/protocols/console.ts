export const ConsoleChannel = 'ConsoleChannel';

export interface Console {
  printObject(objectId: number): void;
  storeObject(objectId: number): void;
  printValue(value: any): void;
  storeValue(value: any): void;
}
