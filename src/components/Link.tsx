import NextLink, { LinkProps } from 'next/link';
import React from 'react';

const Link: React.FC<React.PropsWithChildren<LinkProps>> = ({ children, ...props }) => (
  <NextLink {...props}>{children}</NextLink>
);

export default Link;
