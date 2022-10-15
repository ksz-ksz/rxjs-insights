import { Console } from '@app/protocols/console';
import { RefsService } from './refs-service';

let tempVarId = 1;

function getTempVarName() {
  for (let i = tempVarId; i < Number.MAX_SAFE_INTEGER; i++) {
    const tempVarName = `temp${i}`;
    if (!(window as any)[tempVarName]) {
      tempVarId = i;
      return tempVarName;
    }
  }
  throw new Error();
}

export class ConsoleService implements Console {
  constructor(private readonly refs: RefsService) {}

  printObject(objectId: number): void {
    const object = this.refs.getObject(objectId);
    console.log(object);
  }

  printValue(value: any): void {
    console.log(value);
  }

  storeObject(objectId: number): void {
    const object = this.refs.getObject(objectId);
    const tempVarName = getTempVarName();
    (window as any)[tempVarName] = object;
    console.log(tempVarName, object);
  }

  storeValue(value: any): void {
    const tempVarName = getTempVarName();
    (window as any)[tempVarName] = value;
    console.log(tempVarName, value);
  }
}
