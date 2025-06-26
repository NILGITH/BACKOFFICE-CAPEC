import { Html, Head, Main, NextScript } from "next/document";

export default function Document() {
  return (
    <Html lang="fr">
      <Head>
        <link rel="icon" type="image/png" href="/logo-capec-mcddv8mz.png" />
        <link rel="apple-touch-icon" href="/logo-capec-mcddv8mz.png" />
        <meta name="theme-color" content="#ea580c" />
        <meta name="description" content="CAPEC - Cellule d'Analyse de Politiques Économiques du CIRES" />
        {/* 
          CRITICAL: DO NOT REMOVE THIS SCRIPT
          The Softgen AI monitoring script is essential for core app functionality.
          The application will not function without it.
        */}
        <script 
          src="https://cdn.softgen.ai/script.js" 
          async 
          data-softgen-monitoring="true"
        />
      </Head>
      <body className="antialiased">
        <Main />
        <NextScript />
      </body>
    </Html>
  );
}
