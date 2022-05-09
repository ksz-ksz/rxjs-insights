export interface Route<DATA> {
  routeConfigId: number;
  data?: DATA;
  params?: Record<string, string>;
}
