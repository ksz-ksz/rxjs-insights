import React from 'react';
// @ts-ignore
import logo from './logo.svg';

export const Logo = React.forwardRef<
  HTMLImageElement,
  Omit<React.ImgHTMLAttributes<any>, 'img' | 'alt'>
>(function Logo(props, forwardedRef) {
  return <img ref={forwardedRef} {...props} src={logo} alt="RxJS Insights" />;
});
