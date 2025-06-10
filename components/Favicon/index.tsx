import React from 'react';

const Favicon: React.FC = () => (
  <>
    <link rel="apple-touch-icon" sizes="180x180" href="/apple-touch-icon.png" />
    <link rel="icon" type="image/png" sizes="32x32" href="/favicon-32x32.png" />
    <link rel="icon" type="image/png" sizes="16x16" href="/favicon-16x16.png" />
    <link rel="manifest" href="/manifest.json" crossOrigin="use-credentials" />
    <link rel="mask-icon" href="/safari-pinned-tab.svg" color="#6b6b6b" />
    <meta name="msapplication-TileColor" content="#ffffff" />
    <meta name="theme-color" content="#ffffff" />
  </>
);

export default Favicon;