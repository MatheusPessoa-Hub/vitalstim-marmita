/**
 * WhatsApp sales conversation (pure logic, no I/O) — menu with fixed buttons up to the Pix.
 */
import { APP_URL, GARANTIA_DIAS, PRECO_TEXTO } from "@/lib/checkout";

export type Estado = "menu" | "pedir_nome" | "pedir_cpf" | "aguardando_pix" | "pago";

export type Botao = { id: string; title: string };

export type Acao =
  | { tipo: "texto"; texto: string }
  | { tipo: "botoes"; texto: string; botoes: Botao[] }
  | { tipo: "gerar_pix" }
  | { tipo: "conferir_pix" };

export type Entrada = { botaoId?: string | undefined; texto?: string | undefined };

export type Resultado = {
  estado: Estado;
  acoes: Acao[];
  nome?: string;
  cpf?: string;
};

export const BOTOES = {
  conhecer: { id: "conhecer", title: "Conhecer o app" },
  comprar: { id: "comprar", title: "Quero comprar" },
  duvidas: { id: "duvidas", title: "Tirar dúvidas" },
  jaPaguei: { id: "ja_paguei", title: "Já paguei" },
  novoPix: { id: "novo_pix", title: "Gerar novo Pix" },
} satisfies Record<string, Botao>;

export const TEXTOS = {
  boasVindas: `Olá! 👋 Aqui é o *VitalStim*, o planejador de marmitas da semana.\n\nUma semana mais leve, sem decidir o que comer. *Pagamento único de ${PRECO_TEXTO}*, acesso vitalício e *sem mensalidade*.\n\nComo posso te ajudar?`,
  conhecer: `🥗 *O que vem no VitalStim*\n\n• 101 marmitas com foto, peso e calorias estimadas (frango, carnes, suínos, peixes, vegetarianas e veganas)\n• Cardápio da semana com almoço e jantar\n• Lista de compras gerada com um toque\n• Ajuste de porções\n• Abre no navegador do celular, sem instalar nada\n\n💰 ${PRECO_TEXTO} uma única vez — sem mensalidade.\n🛡️ Garantia de ${GARANTIA_DIAS} dias com reembolso total.`,
  duvidas: `❓ *Dúvidas frequentes*\n\n*Tem mensalidade?* Não. Você paga ${PRECO_TEXTO} uma vez e usa para sempre.\n\n*Como recebo?* Assim que o Pix for confirmado, mando o link do app aqui mesmo no WhatsApp.\n\n*Precisa instalar?* Não, abre no navegador.\n\n*E se eu não gostar?* Garantia de ${GARANTIA_DIAS} dias com reembolso total.\n\n*As calorias são exatas?* São estimativas e não substituem um nutricionista.`,
  pedirNome: "Ótimo! 🎉 Para gerar seu Pix, me diga seu *nome completo*:",
  nomeInvalido: "Por favor, envie seu *nome completo* (nome e sobrenome).",
  pedirCpf: "Obrigado! Agora envie seu *CPF* (só os números). O banco exige para emitir o Pix.",
  cpfInvalido: "Esse CPF não parece válido. Confira e envie de novo, só os 11 números.",
  aguardando: "Seu Pix já foi gerado. Assim que o pagamento cair, eu te mando o link do app automaticamente. 😉",
  naoEntendi: "Não entendi 😅 Escolha uma das opções:",
  acessoLiberado: (link = APP_URL) =>
    `✅ *Pagamento confirmado!* Obrigado pela compra.\n\nAqui está seu acesso vitalício ao VitalStim:\n${link}\n\nDica: abra no celular e use "Adicionar à tela inicial" para ter o app sempre à mão. Bom planejamento! 🥗`,
  jaComprou: (link = APP_URL) => `Você já tem acesso ao VitalStim! 🥗\n\nSeu link: ${link}`,
};

const menuInicial: Acao = {
  tipo: "botoes",
  texto: TEXTOS.boasVindas,
  botoes: [BOTOES.conhecer, BOTOES.comprar, BOTOES.duvidas],
};

export function cpfValido(valor: string): boolean {
  const cpf = valor.replace(/\D/g, "");
  if (cpf.length !== 11 || /^(\d)\1{10}$/.test(cpf)) return false;
  const digito = (base: string, pesoInicial: number) => {
    let soma = 0;
    for (let i = 0; i < base.length; i++) soma += Number(base[i]) * (pesoInicial - i);
    const resto = (soma * 10) % 11;
    return resto === 10 ? 0 : resto;
  };
  return digito(cpf.slice(0, 9), 10) === Number(cpf[9]) && digito(cpf.slice(0, 10), 11) === Number(cpf[10]);
}

export function nomeValido(valor: string): boolean {
  const partes = valor.trim().split(/\s+/).filter((p) => /\p{L}{2,}/u.test(p));
  return partes.length >= 2 && valor.trim().length <= 80;
}

/** Decide the next step of the conversation from the current state and the customer's input. */
export function proximoPasso(estado: Estado, entrada: Entrada): Resultado {
  const botao = entrada.botaoId;
  const texto = (entrada.texto ?? "").trim();

  if (estado === "pago") {
    return { estado, acoes: [{ tipo: "texto", texto: TEXTOS.jaComprou() }] };
  }

  if (botao === BOTOES.conhecer.id) {
    return { estado: "menu", acoes: [{ tipo: "botoes", texto: TEXTOS.conhecer, botoes: [BOTOES.comprar, BOTOES.duvidas] }] };
  }
  if (botao === BOTOES.duvidas.id) {
    return { estado: "menu", acoes: [{ tipo: "botoes", texto: TEXTOS.duvidas, botoes: [BOTOES.comprar, BOTOES.conhecer] }] };
  }
  if (botao === BOTOES.comprar.id || botao === BOTOES.novoPix.id) {
    return { estado: "pedir_nome", acoes: [{ tipo: "texto", texto: TEXTOS.pedirNome }] };
  }
  if (botao === BOTOES.jaPaguei.id) {
    return { estado, acoes: [{ tipo: "conferir_pix" }] };
  }

  if (estado === "pedir_nome" && texto) {
    if (!nomeValido(texto)) return { estado, acoes: [{ tipo: "texto", texto: TEXTOS.nomeInvalido }] };
    return { estado: "pedir_cpf", nome: texto.replace(/\s+/g, " "), acoes: [{ tipo: "texto", texto: TEXTOS.pedirCpf }] };
  }
  if (estado === "pedir_cpf" && texto) {
    if (!cpfValido(texto)) return { estado, acoes: [{ tipo: "texto", texto: TEXTOS.cpfInvalido }] };
    return { estado: "aguardando_pix", cpf: texto.replace(/\D/g, ""), acoes: [{ tipo: "gerar_pix" }] };
  }
  if (estado === "aguardando_pix") {
    return {
      estado,
      acoes: [{ tipo: "botoes", texto: TEXTOS.aguardando, botoes: [BOTOES.jaPaguei, BOTOES.novoPix, BOTOES.duvidas] }],
    };
  }

  if (botao) return { estado: "menu", acoes: [{ ...menuInicial, texto: TEXTOS.naoEntendi } as Acao] };
  return { estado: "menu", acoes: [menuInicial] };
}
