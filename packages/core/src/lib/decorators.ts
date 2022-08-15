import { getGlobalEnv } from './env';

const env = getGlobalEnv();

const IdentityDecorator = () => () => {};

export const ObservableCreator = env
  ? (name?: string) =>
      (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
        descriptor.value = env.instrumentCreator(
          descriptor.value,
          name ?? propertyName
        );
      }
  : IdentityDecorator;

export const ObservableOperator = env
  ? (name?: string) =>
      (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
        descriptor.value = env.instrumentOperator(
          descriptor.value,
          name ?? propertyName
        );
      }
  : IdentityDecorator;

export const ObservableCaller = env
  ? (name?: string) =>
      (target: any, propertyName: string, descriptor: PropertyDescriptor) => {
        descriptor.value = env.instrumentCaller(
          descriptor.value,
          name ?? propertyName
        );
      }
  : IdentityDecorator;
