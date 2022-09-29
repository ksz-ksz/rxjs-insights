export interface Route<DATA> {
  routeConfigId: number;
  path: string[];
  data?: DATA;
  params?: Record<string, string>;
}
