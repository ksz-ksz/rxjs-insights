declare const __super: unique symbol;
export type Super<T> = Partial<T & { [__super]: never }>;
