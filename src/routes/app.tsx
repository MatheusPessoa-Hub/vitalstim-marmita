import { createFileRoute, redirect } from "@tanstack/react-router";

// O app passou a morar em "/". Este endereço antigo continua funcionando.
export const Route = createFileRoute("/app")({
  beforeLoad: () => {
    throw redirect({ to: "/" });
  },
  component: () => null,
});
