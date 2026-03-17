
import { Html, Head, Main, NextScript } from "next/document";

import { SEOElements } from "@/components/SEO";
export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <SEOElements />
        <link rel="icon" href="/logo-capec-mcdb23oy.png" />
      </Head>
      <body>
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
