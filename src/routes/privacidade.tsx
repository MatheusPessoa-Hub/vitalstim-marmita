import { Link, createFileRoute } from "@tanstack/react-router";
import { Logo } from "@/components/vitalstim/Logo";

export const Route = createFileRoute("/privacidade")({
  head: () => ({
    meta: [
      { title: "Política de privacidade · VitalStim" },
      { name: "description", content: "Como o VitalStim trata os seus dados na página de vendas e no app de marmitas." },
      { property: "og:title", content: "Política de privacidade · VitalStim" },
      { property: "og:description", content: "Como o VitalStim trata os seus dados." },
      { property: "og:type", content: "article" },
      { name: "twitter:card", content: "summary" },
    ],
  }),
  component: Privacidade,
});

function Privacidade() {
  return (
    <div className="min-h-dvh bg-background">
      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-2xl items-center px-5">
          <Link to="/">
            <Logo />
          </Link>
        </div>
      </header>
      <main className="mx-auto max-w-2xl px-5 py-12 text-[15px] leading-relaxed text-foreground">
        <h1 className="text-4xl text-primary">Política de privacidade</h1>
        <p className="mt-4 text-muted-foreground">Última atualização: outubro de 2026.</p>

        <h2 className="mt-10 text-2xl text-primary">O que fica no seu aparelho</h2>
        <p className="mt-3">
          O app VitalStim guarda o seu cardápio, as porções e a lista de compras apenas no seu próprio navegador. Nós
          não recebemos essas informações.
        </p>

        <h2 className="mt-10 text-2xl text-primary">Compra e atendimento</h2>
        <p className="mt-3">
          Ao clicar em comprar, você é levado ao nosso atendimento pelo WhatsApp. Lá pedimos apenas o necessário para
          concluir o pagamento e enviar o link de acesso por e-mail, como nome e e-mail.
        </p>

        <h2 className="mt-10 text-2xl text-primary">Medição de anúncios</h2>
        <p className="mt-3">
          Esta página pode usar o Pixel da Meta para entender quais anúncios trouxeram visitas e compras. Ele registra
          informações como páginas vistas e cliques no botão de compra. Os parâmetros de campanha do endereço (por
          exemplo, utm_source) são repassados ao link de compra para sabermos de onde veio cada pedido.
        </p>

        <h2 className="mt-10 text-2xl text-primary">Seus direitos</h2>
        <p className="mt-3">
          Você pode pedir acesso, correção ou exclusão dos seus dados a qualquer momento pelo mesmo canal de
          atendimento, conforme a Lei Geral de Proteção de Dados (LGPD).
        </p>

        <h2 className="mt-10 text-2xl text-primary">Aviso nutricional</h2>
        <p className="mt-3">
          Pesos e calorias são estimativas e não substituem a orientação de um nutricionista ou médico.
        </p>

        <Link to="/" className="mt-12 inline-flex font-semibold text-primary underline underline-offset-4">
          Voltar para a página inicial
        </Link>
      </main>
    </div>
  );
}
