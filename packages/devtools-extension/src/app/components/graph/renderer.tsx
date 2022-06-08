import {
  ForwardRefExoticComponent,
  PropsWithoutRef,
  RefAttributes,
} from 'react';

export type Renderer<PROPS, CONTROL> = ForwardRefExoticComponent<
  PropsWithoutRef<PROPS> & RefAttributes<CONTROL>
>;
