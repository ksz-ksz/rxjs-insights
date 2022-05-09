import { RouteMatcher } from './route-matcher';
import { RouteConfig } from './routing';

describe('RouteMatcher', () => {
  it('should match static route', () => {
    // given
    const routes: RouteConfig<string, void>[] = [
      {
        path: ['static'],
        data: 'static',
      },
    ];
    const matcher = new RouteMatcher(routes);

    // when
    const result = matcher.match(['static']);

    // then
    expect(result.length).toBe(1);
    expect(result[0].data).toBe('static');
  });

  it('should match dynamic route', () => {
    // given
    const routes: RouteConfig<string, void>[] = [
      {
        path: [':dynamic'],
        data: 'dynamic',
      },
    ];
    const matcher = new RouteMatcher(routes);

    // when
    const result = matcher.match(['dynamic-value']);

    // then
    expect(result.length).toBe(1);
    expect(result[0].data).toBe('dynamic');
    expect(result[0].params).toEqual({ dynamic: 'dynamic-value' });
  });

  it('should match multi segment route', () => {
    // given
    const routes: RouteConfig<string, void>[] = [
      {
        path: ['static', ':dynamic'],
        data: 'multi-segment',
      },
    ];
    const matcher = new RouteMatcher(routes);

    // when
    const result = matcher.match(['static', 'dynamic-value']);

    // then
    expect(result.length).toBe(1);
    expect(result[0].data).toBe('multi-segment');
    expect(result[0].params).toEqual({ dynamic: 'dynamic-value' });
  });

  it('should match child route', () => {
    // given
    const routes: RouteConfig<string, void>[] = [
      {
        path: ['parent-static', ':parent-dynamic'],
        data: 'parent',
        children: [{ path: ['child-static', ':child-dynamic'], data: 'child' }],
      },
    ];
    const matcher = new RouteMatcher(routes);

    // when
    const result = matcher.match([
      'parent-static',
      'parent-value',
      'child-static',
      'child-value',
    ]);

    // then
    expect(result.length).toBe(2);
    expect(result[0].data).toBe('parent');
    expect(result[0].params).toEqual({ 'parent-dynamic': 'parent-value' });
    expect(result[1].data).toBe('child');
    expect(result[1].params).toEqual({ 'child-dynamic': 'child-value' });
  });

  it('should prioritize static route over dynamic route', () => {
    // given
    const routes: RouteConfig<string, void>[] = [
      {
        path: [':dynamic'],
        data: 'dynamic',
      },
      {
        path: ['static'],
        data: 'static',
      },
    ];
    const matcher = new RouteMatcher(routes);

    // when
    const result = matcher.match(['static']);

    // then
    expect(result.length).toBe(1);
    expect(result[0].data).toBe('static');
  });
});
