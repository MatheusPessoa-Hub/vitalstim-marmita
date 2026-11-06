import { createFileRoute } from "@tanstack/react-router";

import { PlannerApp } from "@/components/vitalstim/PlannerApp";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VitalStim · Planejador de marmitas da semana" },
      {
        name: "description",
        content:
          "Escolha almoço e jantar de cada dia entre 101 marmitas com foto, peso e calorias estimadas e gere a lista de compras da semana.",
      },
      { property: "og:title", content: "VitalStim · Planejador de marmitas" },
      {
        property: "og:description",
        content: "Monte o cardápio da semana e gere a lista de compras automaticamente.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary" },
      { name: "theme-color", content: "#264D3F" },
    ],
    links: [{ rel: "manifest", href: "/manifest.webmanifest" }],
  }),
  component: PlannerApp,
});
