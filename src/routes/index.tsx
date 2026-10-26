import { createFileRoute } from "@tanstack/react-router";
import { Check, Leaf, ListChecks, Salad, ShieldCheck, Sprout, Drumstick } from "lucide-react";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "@/components/ui/accordion";
import { BarraCompraCelular, BolhasCompra, BotaoCompra } from "@/components/landing/Compra";
import { MetaPixel } from "@/components/landing/MetaPixel";
import { Logo } from "@/components/vitalstim/Logo";
import { GARANTIA_DIAS, PRECO_TEXTO } from "@/lib/checkout";
import { MARMITAS, imagemDe, type Categoria, type Marmita } from "@/lib/marmitas";
import { Link } from "@tanstack/react-router";

import telaSemana from "@/assets/landing/tela-1_semana.jpg";
import telaDia from "@/assets/landing/tela-1b_semana_dia.jpg";
import telaFrango from "@/assets/landing/tela-2_frango.jpg";
import telaCarnes from "@/assets/landing/tela-3_carnes.jpg";
import telaPeixes from "@/assets/landing/tela-4_peixes.jpg";
import telaVeganas from "@/assets/landing/tela-5_veganas.jpg";
import telaCompras from "@/assets/landing/tela-6_compras.jpg";
import fotoMercado from "@/assets/landing/mercado.jpg";
import fotoMarmitas from "@/assets/landing/marmitas-prontas.jpg";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "VitalStim · Marmitas da semana sem mensalidade, R$ 39,99" },
      {
        name: "description",
        content:
          "101 marmitas com foto, peso e calorias, cardápio da semana e lista de compras automática. Pagamento único de R$ 39,99, acesso vitalício.",
      },
      { property: "og:title", content: "Uma semana mais leve, sem decidir o que comer." },
      {
        property: "og:description",
        content: "Planejador de marmitas VitalStim: 101 pratos, lista de compras com um toque. R$ 39,99 uma vez, sem mensalidade.",
      },
      { property: "og:type", content: "website" },
      { name: "twitter:card", content: "summary_large_image" },
      { name: "theme-color", content: "#264D3F" },
    ],
  }),
  component: Landing,
});

const contar = (cats: Categoria[]) => MARMITAS.filter((m) => cats.includes(m.categoria)).length;
const primeiro = (cat: Categoria, n = 0) => MARMITAS.filter((m) => m.categoria === cat)[n] as Marmita;

const SEMANA_EXEMPLO = [
  { dia: "Seg", marmita: primeiro("Frango") },
  { dia: "Ter", marmita: primeiro("Peixes") },
  { dia: "Qua", marmita: primeiro("Veganas", 1) },
  { dia: "Qui", marmita: primeiro("Carnes", 2) },
];

const TELAS = [
  { src: telaSemana, legenda: "Sua semana num relance" },
  { src: telaFrango, legenda: "Frango, além do de sempre" },
  { src: telaCarnes, legenda: "Carnes com peso e calorias" },
  { src: telaPeixes, legenda: "Peixes para variar" },
  { src: telaVeganas, legenda: "Filtro vegano e vegetariano" },
  { src: telaCompras, legenda: "Lista de compras pronta" },
];

const INCLUSO = [
  "101 marmitas de frango, carnes, suínos, peixes, vegetarianas e veganas",
  "Foto, peso e calorias estimadas de cada prato",
  "Planejamento semanal com almoço e jantar para cada dia",
  "Lista de compras gerada automaticamente",
  "Ajuste de porção para o seu apetite e a sua rotina",
  "Acesso por link enviado por e-mail, sem instalar nada",
  "Acesso vitalício, sem mensalidade",
  `Garantia de ${GARANTIA_DIAS} dias com reembolso total`,
];

// Replace each texto with the customer's own words (and add a photo only with written permission).
const DEPOIMENTOS = [
  { nome: "Leonice", papel: "", texto: "Eu passava o domingo sem saber o que fazer. Agora escolho a semana em dez minutos e vou ao mercado com a lista pronta." },
  { nome: "Alice", papel: "", texto: "Sou vegetariana e finalmente achei um app que não me empurra frango em todo cardápio." },
  { nome: "Leonardo", papel: "", texto: "Paguei uma vez e pronto. Não aguentava mais assinatura de app que eu esquecia de cancelar." },
  { nome: "Amélia", papel: "", texto: "Faço as marmitas da família inteira. O ajuste de porção já multiplica tudo na lista." },
  { nome: "José", papel: "Personal trainer", texto: "Indico para os meus alunos que enjoaram de frango com batata-doce. Tem variedade e as calorias ajudam a se organizar." },
];

const FAQ = [
  {
    p: "Tem mensalidade?",
    r: `Não. Você paga ${PRECO_TEXTO} uma única vez e usa para sempre, sem renovação automática.`,
  },
  { p: "Como recebo o acesso?", r: "Depois do pagamento, você recebe por e-mail o link do app. É só abrir no celular ou no computador." },
  { p: "Preciso instalar alguma coisa?", r: "Não. O app abre no navegador. Se quiser, dá para adicionar um atalho na tela inicial do celular." },
  {
    p: "Serve para vegetarianos e veganos?",
    r: `Sim. São ${contar(["Vegetarianas"])} marmitas vegetarianas e ${contar(["Veganas"])} veganas, com filtro próprio. As veganas não levam ovo nem laticínios.`,
  },
  { p: "Posso mudar o tamanho das porções?", r: "Pode. Em cada refeição você ajusta a quantidade de porções, e a lista de compras recalcula tudo." },
  {
    p: "As calorias são exatas?",
    r: "São estimativas feitas a partir dos ingredientes de cada prato. Elas ajudam a organizar, mas não substituem um nutricionista.",
  },
  {
    p: "E se eu não gostar?",
    r: `Você tem ${GARANTIA_DIAS} dias de garantia. Se não fizer sentido para você, devolvemos 100% do valor.`,
  },
];

function Celular({ src, alt, prioridade = false, className = "" }: { src: string; alt: string; prioridade?: boolean; className?: string }) {
  return (
    <div className={`rounded-[38px] bg-foreground p-2 shadow-[var(--shadow-lift)] ${className}`}>
      <img
        src={src}
        alt={alt}
        width={540}
        height={1080}
        loading={prioridade ? "eager" : "lazy"}
        fetchPriority={prioridade ? "high" : "auto"}
        className="block w-full rounded-[30px]"
      />
    </div>
  );
}

function SemMensalidade({ className = "" }: { className?: string }) {
  return (
    <p
      className={`inline-flex items-center gap-2 rounded-full border border-primary/15 bg-secondary px-4 py-2 text-[11px] font-semibold uppercase tracking-[0.16em] text-primary ${className}`}
    >
      <span className="size-1.5 rounded-full bg-primary" aria-hidden="true" />
      Sem mensalidade · Pagamento único de {PRECO_TEXTO}
    </p>
  );
}

function Titulo({ eyebrow, titulo, texto }: { eyebrow?: string; titulo: string; texto?: string }) {
  return (
    <div className="max-w-2xl">
      {eyebrow ? (
        <p className="text-[11px] font-semibold uppercase tracking-[0.2em] text-muted-foreground">{eyebrow}</p>
      ) : null}
      <h2 className="mt-2 text-[32px] leading-[1.08] text-primary md:text-[44px]">{titulo}</h2>
      {texto ? <p className="mt-3 text-[16px] leading-relaxed text-muted-foreground">{texto}</p> : null}
    </div>
  );
}

function Landing() {
  const totalCarne = contar(["Frango", "Carnes", "Suínos", "Peixes"]);

  return (
    <div className="min-h-dvh bg-background pb-28 md:pb-0">
      <MetaPixel />

      <header className="border-b border-border">
        <div className="mx-auto flex h-16 max-w-6xl items-center justify-between px-5">
          <Logo />
          <span className="hidden text-sm text-muted-foreground sm:inline">Acesso vitalício · {PRECO_TEXTO}</span>
        </div>
      </header>

      <main>
        {/* 1. Topo */}
        <section className="mx-auto grid max-w-6xl items-center gap-12 px-5 pb-16 pt-10 md:grid-cols-[1.15fr_1fr] md:pt-20">
          <div>
            <SemMensalidade />
            <p className="mt-6 text-sm font-medium text-muted-foreground">Para vegetarianos, veganos e carnívoros</p>
            <h1 className="mt-3 text-[42px] leading-[1.02] text-primary md:text-[64px]">
              Uma semana mais leve, sem decidir o que comer.
            </h1>
            <p className="mt-5 max-w-xl text-[17px] leading-relaxed text-muted-foreground">
              Escolha entre 101 marmitas, monte o cardápio da semana e gere a lista de compras com um toque. Você paga uma
              vez e usa para sempre.
            </p>
            <div className="mt-8 flex flex-col items-start gap-3">
              <BotaoCompra />
              <p className="flex flex-wrap gap-x-4 gap-y-1 text-sm text-muted-foreground">
                <span>Pagamento único</span>
                <span>Acesso vitalício</span>
                <span>{GARANTIA_DIAS} dias de garantia</span>
              </p>
            </div>
          </div>
          <div className="relative mx-auto w-full max-w-[300px]">
            <Celular src={telaSemana} alt="Tela Semana do app VitalStim" prioridade />
            <div className="absolute -left-10 bottom-16 hidden rounded-[20px] bg-card p-4 shadow-[var(--shadow-lift)] sm:block">
              <p className="font-serif text-3xl text-primary">101</p>
              <p className="text-xs text-muted-foreground">marmitas para escolher</p>
            </div>
          </div>
        </section>

        {/* 2. Prévia da semana */}
        <section className="bg-card py-16">
          <div className="mx-auto max-w-6xl px-5">
            <Titulo eyebrow="Sua semana" titulo="Segunda a quinta, já resolvidas." texto="Um prato por dia, almoço e jantar se quiser. No fim, a lista sai sozinha." />
            <div className="no-scrollbar -mx-5 mt-8 flex snap-x gap-3 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-5 md:overflow-visible md:px-0">
              {SEMANA_EXEMPLO.map(({ dia, marmita }) => (
                <article key={dia} className="w-[180px] shrink-0 snap-start overflow-hidden rounded-[20px] border border-border bg-background md:w-auto">
                  <img src={imagemDe(marmita)} alt={marmita.nome} width={640} height={480} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  <div className="p-3">
                    <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-muted-foreground">{dia} · Almoço</p>
                    <p className="mt-1 text-sm font-semibold leading-snug text-foreground">{marmita.nome}</p>
                    <p className="mt-1 text-xs text-muted-foreground">
                      {marmita.gramas} g · {marmita.kcal} kcal (estim.)
                    </p>
                  </div>
                </article>
              ))}
              <article className="flex w-[180px] shrink-0 snap-start flex-col justify-between rounded-[20px] bg-primary p-4 text-primary-foreground md:w-auto">
                <ListChecks className="size-7" aria-hidden="true" />
                <div>
                  <p className="font-serif text-xl leading-tight">Lista de compras gerada</p>
                  <ul className="mt-3 space-y-1 text-xs opacity-85">
                    <li>Arroz, 440 g</li>
                    <li>Peito de frango, 300 g</li>
                    <li>Brócolis, 160 g</li>
                    <li>+ 14 itens</li>
                  </ul>
                </div>
              </article>
            </div>
          </div>
        </section>

        {/* 3. Telas do app */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-5">
            <Titulo eyebrow="Por dentro" titulo="Veja o app por dentro." texto="Arraste para o lado e veja as telas de verdade." />
          </div>
          <div className="no-scrollbar mx-auto mt-8 flex max-w-6xl snap-x snap-mandatory gap-5 overflow-x-auto px-5 pb-4">
            {TELAS.map((t) => (
              <figure key={t.legenda} className="w-[220px] shrink-0 snap-center md:w-[240px]">
                <Celular src={t.src} alt={t.legenda} />
                <figcaption className="mt-3 text-center text-sm text-muted-foreground">{t.legenda}</figcaption>
              </figure>
            ))}
          </div>
          <div className="mx-auto mt-8 max-w-6xl px-5">
            <SemMensalidade />
          </div>
        </section>

        {/* 4. Do mercado à marmita */}
        <section className="bg-card py-16">
          <div className="mx-auto max-w-6xl px-5">
            <Titulo eyebrow="Na prática" titulo="Do mercado à marmita pronta." />
            <div className="mt-8 grid gap-6 md:grid-cols-2">
              {[
                { img: fotoMercado, n: "1", t: "Vá ao mercado com a lista certa", d: "Só o que os pratos da semana pedem, já somado e separado por seção. Nada sobra na geladeira." },
                { img: fotoMarmitas, n: "2", t: "Cozinhe uma vez, coma a semana toda", d: "Prepare tudo de uma vez e guarde. Cada dia já sabe o que vai comer." },
              ].map((p) => (
                <article key={p.n} className="overflow-hidden rounded-[20px] border border-border bg-background">
                  <img src={p.img} alt={p.t} width={900} height={675} loading="lazy" className="aspect-[4/3] w-full object-cover" />
                  <div className="flex gap-4 p-5">
                    <span className="flex size-9 shrink-0 items-center justify-center rounded-full bg-secondary font-serif text-lg text-primary">{p.n}</span>
                    <div>
                      <h3 className="text-xl text-primary">{p.t}</h3>
                      <p className="mt-1 text-[15px] text-muted-foreground">{p.d}</p>
                    </div>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 5. Para todo tipo de prato */}
        <section className="py-16">
          <div className="mx-auto max-w-6xl px-5">
            <Titulo eyebrow="Para quem é" titulo="Feito para todo tipo de prato." texto="E para quem já enjoou de comer frango todo dia." />
            <div className="mt-8 grid gap-4 md:grid-cols-3">
              {[
                { Icone: Salad, t: "Vegetarianos", n: contar(["Vegetarianas"]), d: "Ovos, queijos, grãos e legumes. Nenhuma carne.", m: primeiro("Vegetarianas", 1) },
                { Icone: Sprout, t: "Veganos", n: contar(["Veganas"]), d: "Tofu, grão-de-bico, lentilha e soja. Sem ovo nem laticínio.", m: primeiro("Veganas", 5) },
                { Icone: Drumstick, t: "Carnívoros", n: totalCarne, d: "Frango, carnes, suínos e peixes, bem além do peito grelhado.", m: primeiro("Carnes", 0) },
              ].map(({ Icone, t, n, d, m }) => (
                <article key={t} className="overflow-hidden rounded-[20px] bg-card shadow-[var(--shadow-soft)]">
                  <img src={imagemDe(m)} alt={m.nome} width={640} height={480} loading="lazy" className="aspect-[16/10] w-full object-cover" />
                  <div className="p-5">
                    <div className="flex items-center gap-2 text-primary">
                      <Icone className="size-5" aria-hidden="true" />
                      <h3 className="text-xl">{t}</h3>
                    </div>
                    <p className="mt-2 font-serif text-3xl text-primary">{n} marmitas</p>
                    <p className="mt-1 text-[15px] text-muted-foreground">{d}</p>
                  </div>
                </article>
              ))}
            </div>
          </div>
        </section>

        {/* 6. Como funciona */}
        <section className="bg-primary py-16 text-primary-foreground">
          <div className="mx-auto max-w-6xl px-5">
            <p className="text-[11px] font-semibold uppercase tracking-[0.2em] opacity-75">Como funciona</p>
            <h2 className="mt-2 text-[32px] leading-[1.08] md:text-[44px]">Três passos, uma semana inteira.</h2>
            <ol className="mt-10 grid gap-8 md:grid-cols-3">
              {[
                { t: "Escolha o dia", d: "De segunda a sexta, e o fim de semana se quiser." },
                { t: "Escolha as marmitas", d: "Almoço e jantar, com filtro por tipo e ajuste de porção." },
                { t: "Gere a lista", d: "Um toque soma os ingredientes de tudo. Copie ou compartilhe." },
              ].map((p, i) => (
                <li key={p.t} className="border-t border-primary-foreground/25 pt-5">
                  <span className="font-serif text-5xl opacity-60">{String(i + 1).padStart(2, "0")}</span>
                  <h3 className="mt-3 text-2xl">{p.t}</h3>
                  <p className="mt-2 text-[15px] opacity-80">{p.d}</p>
                </li>
              ))}
            </ol>
          </div>
        </section>

        {/* 7. O que está incluso */}
        <section className="py-16">
          <div className="mx-auto grid max-w-6xl items-center gap-10 px-5 md:grid-cols-2">
            <div>
              <Titulo eyebrow="Incluso" titulo="O que está incluso." />
              <ul className="mt-8 space-y-4">
                {INCLUSO.map((item) => (
                  <li key={item} className="flex gap-3 text-[16px] text-foreground">
                    <span className="mt-0.5 flex size-6 shrink-0 items-center justify-center rounded-full bg-secondary text-primary">
                      <Check className="size-4" strokeWidth={3} aria-hidden="true" />
                    </span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
            <div className="mx-auto w-full max-w-[280px]">
              <Celular src={telaDia} alt="Almoço e jantar planejados no app" />
            </div>
          </div>
        </section>

        {/* 8. Depoimentos */}
        <section className="bg-card py-16">
          <div className="mx-auto max-w-6xl px-5">
            <Titulo eyebrow="Quem usa" titulo="O que dizem por aí." />
            <div className="no-scrollbar -mx-5 mt-8 flex snap-x gap-4 overflow-x-auto px-5 pb-2 md:mx-0 md:grid md:grid-cols-3 md:overflow-visible md:px-0">
              {DEPOIMENTOS.map((d) => (
                <figure key={d.nome} className="flex w-[280px] shrink-0 snap-start flex-col justify-between rounded-[20px] border border-border bg-background p-5 md:w-auto">
                  <blockquote className="text-[15px] leading-relaxed text-foreground">“{d.texto}”</blockquote>
                  <figcaption className="mt-5 flex items-center gap-3">
                    <span className="flex size-10 items-center justify-center rounded-full bg-secondary font-serif text-lg text-primary" aria-hidden="true">
                      {d.nome[0]}
                    </span>
                    <span>
                      <span className="block text-sm font-semibold text-foreground">{d.nome}</span>
                      {d.papel ? <span className="block text-xs text-muted-foreground">{d.papel}</span> : null}
                    </span>
                  </figcaption>
                </figure>
              ))}
            </div>
          </div>
        </section>

        {/* 9. Preço e garantia */}
        <section className="py-16" id="preco">
          <div className="mx-auto max-w-xl px-5">
            <div className="rounded-[28px] bg-card p-7 text-center shadow-[var(--shadow-lift)] md:p-10">
              <SemMensalidade />
              <h2 className="mt-6 text-[30px] leading-tight text-primary md:text-[38px]">Pague uma vez. Use para sempre.</h2>
              <p className="mt-3 text-[15px] text-muted-foreground">
                Nada de cobrança todo mês como nos apps de assinatura. Um pagamento, acesso vitalício.
              </p>
              <p className="mt-8 font-serif text-[64px] leading-none text-primary">{PRECO_TEXTO}</p>
              <p className="mt-2 text-sm text-muted-foreground">pagamento único</p>
              <BotaoCompra className="mt-8 w-full" />
              <div className="mt-8 flex items-start gap-3 rounded-[20px] bg-secondary p-4 text-left">
                <ShieldCheck className="mt-0.5 size-6 shrink-0 text-primary" aria-hidden="true" />
                <p className="text-sm text-secondary-foreground">
                  <strong className="font-semibold">Garantia de {GARANTIA_DIAS} dias.</strong> Se não fizer sentido para você,
                  devolvemos 100% do valor. Sem perguntas.
                </p>
              </div>
            </div>
          </div>
        </section>

        {/* 10. FAQ */}
        <section className="pb-16">
          <div className="mx-auto max-w-2xl px-5">
            <Titulo eyebrow="Dúvidas" titulo="Perguntas frequentes." />
            <Accordion type="single" collapsible className="mt-6">
              {FAQ.map((f) => (
                <AccordionItem key={f.p} value={f.p}>
                  <AccordionTrigger className="text-left text-[16px] font-semibold">{f.p}</AccordionTrigger>
                  <AccordionContent className="text-[15px] leading-relaxed text-muted-foreground">{f.r}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </section>
      </main>

      <footer className="border-t border-border bg-card">
        <div className="mx-auto max-w-6xl px-5 py-10 text-sm text-muted-foreground">
          <div className="flex items-center gap-2 text-primary">
            <Leaf className="size-4" aria-hidden="true" />
            <span className="font-serif text-lg">VitalStim</span>
          </div>
          <p className="mt-4 max-w-2xl">
            Aviso nutricional: pesos e calorias são estimativas calculadas a partir dos ingredientes e não substituem a
            orientação de um nutricionista ou médico.
          </p>
          <p className="mt-4">
            <Link to="/privacidade" className="underline underline-offset-4">
              Política de privacidade
            </Link>
            <span className="mx-2">·</span>© {new Date().getFullYear()} VitalStim
          </p>
        </div>
      </footer>

      <BarraCompraCelular />
      <BolhasCompra />
    </div>
  );
}
