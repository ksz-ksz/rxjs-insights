export type Intersection<UNION> = (
  UNION extends any ? (k: UNION) => void : never
) extends (k: infer INTERSECTION) => void
  ? INTERSECTION
  : never;
