import { createFileRoute, redirect } from "@tanstack/react-router";

// Temporary: the sales page will live here. For now "/" opens the planner app.
export const Route = createFileRoute("/")({
  beforeLoad: () => {
    throw redirect({ to: "/app" });
  },
});
