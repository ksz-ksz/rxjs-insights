import { createRoute, Route } from './route';
import { z } from 'zod';
import { Params } from './params';
import { Param } from './param';

type ExtractSearch<TRoute extends Route<unknown, unknown, unknown>> =
  TRoute extends Route<unknown, infer TSearch, unknown> ? TSearch : never;

const commonSearchParams = createUrlEncodedParams({
  params: {
    dev: Param(z.coerce.boolean()),
  },
});

const route = createRoute({
  path: '',
  search: Params({
    dev: z.coerce.boolean(),
  }),
  hash: Param(z.coerce.boolean()),
});

const midRoute = createRoute({
  parent: route,
  path: 'tups',
});

const childRoute = createRoute({
  parent: midRoute,
  path: 'target/asd',
  params: {
    asd: Params({
      haha: z.coerce.number(),
    }),
  },
  search: Params({
    time: z.coerce.number(),
  }),
});

childRoute({
  params: {
    asd: {
      haha: '2',
    },
  },
  search: {
    dev: true,
    time: 7,
  },
  hash: true,
});

//
// route({ params: { asd: 'asd' } });
//
// route.searchType;
//
// type ExtractSearch<T> = T extends R<any, infer TSearch> ? TSearch : never;
//
// interface R<TParent = any, TSearch = any> {
//   parent?: TParent;
//   search?: TSearch;
// }
//
// function createR<TParent = any, TSearch = any>(opts: {
//   parent?: TParent;
//   search: (parentSearch: ExtractSearch<TParent>) => TSearch;
// }): R<TParent, TSearch> {
//   return undefined as any;
// }
//
// const root = createR({
//   search: () => ({
//     asd: 'asd',
//   }),
// });
//
// type A = typeof root;
//
// type C = ExtractSearch<typeof root>;
//
// function Encoder<TParent, TChild>(c: TChild): (x: TParent) => TParent & TChild {
//   return undefined as any;
// }
//
// const child = createR({
//   parent: root,
//   search: Encoder({ zxc: 'zxc' }),
// });
//
// type X = ExtractSearch<typeof child>;
