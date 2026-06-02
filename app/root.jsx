import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";

export default function App() {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width,initial-scale=1" />
        <link rel="preconnect" href="https://cdn.shopify.com/" />
        <link
          rel="stylesheet"
          href="https://cdn.shopify.com/static/fonts/inter/v4/styles.css"
        />
        <Meta />
        <Links />
        <style>{`
          .skip-link:focus {
            left: 8px !important;
            top: 8px !important;
          }
          @media (prefers-reduced-motion: reduce) {
            *, *::before, *::after {
              animation-duration: 0.01ms !important;
              animation-iteration-count: 1 !important;
              transition-duration: 0.01ms !important;
            }
          }
        `}</style>
      </head>
      <body>
        <a
          href="#main-content"
          className="skip-link"
          style={{position: "absolute", left: "-9999px", top: "auto", zIndex: 999, padding: "8px 16px", background: "#000", color: "#fff"}}
          tabIndex={0}
        >
          Skip to main content
        </a>
        <main id="main-content">
          <Outlet />
        </main>
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}
