declare const _subtype: unique symbol;
export type Subtype<T> = Partial<T & { [_subtype]: never }>;
