import {
  Links,
  Meta,
  Outlet,
  Scripts,
  ScrollRestoration,
} from "@remix-run/react";
import { cssBundleHref } from "@remix-run/css-bundle";
import type { LinksFunction } from "@remix-run/node";
import tw from "./tailwind.css?url";
// import atomic from "./static.css?url";
import system from "@wwwares/ui-react/static.css?url";
import { Fragment } from "react/jsx-runtime";
import { Header } from "./components/header";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { CoreGrid } from "./components/layout-positions";
import { Flex } from "../styled-system/jsx";
export const links: LinksFunction = () => [
  ...(cssBundleHref ? [{ rel: "stylesheet", href: cssBundleHref }] : []),
  { rel: "stylesheet", href: tw },
  { rel: "stylesheet", href: system },
  // { rel: "stylesheet", href: atomic },
];

const queryClient = new QueryClient();

export function Layout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <Meta />
        <Links />
      </head>
      <body>
        {children}
        <ScrollRestoration />
        <Scripts />
      </body>
    </html>
  );
}

export default function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Flex
        height="100%"
        width="100%"
        justifyContent="center"
        alignItems="center"
      >
        <CoreGrid>
          <Header />
          <Outlet />
        </CoreGrid>
      </Flex>
    </QueryClientProvider>
  );
}

export function HydrateFallback() {
  return <p>Loading...</p>;
}
