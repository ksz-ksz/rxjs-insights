export interface Route<DATA> {
  id: number;
  data?: DATA;
  params?: Record<string, string>;
}
