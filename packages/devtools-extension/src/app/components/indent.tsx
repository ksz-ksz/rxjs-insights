import { styled } from '@mui/material';
import React, { ReactNode, useMemo } from 'react';

interface IndentProps {
  indent: number;
}

const IndentSpan = styled('span')(({ theme }) => ({
  display: 'inline-block',
  whiteSpace: 'pre',
}));

export function Indent({ indent }: IndentProps) {
  return <IndentSpan>{'  '.repeat(indent)}</IndentSpan>;
}

// const IndentSpan = styled('span')(({ theme }) => ({
//   display: 'inline-block',
//   width: '1rem',
//   height: '1.5rem',
//   borderRight: `thin solid ${theme.palette.divider}`,
//   margin: '-0.25rem 0',
// }));
//
// export function Indent({ indent }: IndentProps) {
//   const children = useMemo(() => {
//     const children: ReactNode[] = [];
//     for (let i = 0; i < indent; i++) {
//       children.push(<IndentSpan key={i} />);
//     }
//     return children;
//   }, [indent]);
//   return <>{children}</>;
// }
