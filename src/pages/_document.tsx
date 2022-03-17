/* eslint-disable @next/next/no-css-tags */
import { Html, Head, Main, NextScript } from 'next/document';

const MyDocument = () => {
  return (
    <Html>
      <Head>
        <link rel='stylesheet' href='/static/leaflet.css' />
        <link rel='stylesheet' href='https://use.fontawesome.com/releases/v5.6.3/css/all.css' />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
};

export default MyDocument;
