import type { Metadata } from "next";
import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { LEGAL, legalValue } from "@/lib/legal";

export const metadata: Metadata = { title: "Termos de Uso" };

const list = "list-disc space-y-2 pl-6";
const link = "font-medium text-brand-600 hover:underline";

export default function TermsPage() {
  return (
    <LegalPage title="Termos de Uso" updated={LEGAL.lastUpdated}>
      <p>
        Estes termos regulam o uso do site e do aplicativo Budega. Ao usar o Budega, você
        concorda com eles. Se tiver dúvidas, fale com a gente pelos contatos abaixo.
      </p>

      <LegalSection id="quem" title="1. Quem somos e o que o Budega faz">
        <p>
          O Budega é oferecido por <strong>{legalValue(LEGAL.controllerName)}</strong> (
          {legalValue(LEGAL.controllerDocument)}), com endereço em{" "}
          {legalValue(LEGAL.controllerAddress)}, telefone {legalValue(LEGAL.contactPhone)}.
        </p>
        <p>
          O Budega é um serviço gratuito de <strong>informação</strong>: reúne, num só lugar,
          mercados, lojas, encartes e ofertas da sua região. O Budega <strong>não vende
          produtos</strong>, não intermedeia compras e não recebe pagamentos: a compra é feita
          diretamente com o mercado, na loja.
        </p>
      </LegalSection>

      <LegalSection id="fontes" title="2. De onde vêm as informações dos mercados">
        <ul className={list}>
          <li>
            Encartes, endereços, horários e telefones são obtidos nos <strong>sites oficiais
            dos próprios mercados</strong> (informações que eles publicam para o público) ou
            enviados pelos mercados parceiros pelo painel do Budega.
          </li>
          <li>
            Todo encarte mostra a <strong>fonte</strong> e um link para o original no site do
            mercado.
          </li>
          <li>
            Quando ofertas individuais (produto e preço) são <strong>lidas automaticamente da
            imagem do encarte</strong>, isso é sinalizado na oferta. A leitura automática pode
            conter erros: <strong>o encarte original do mercado sempre prevalece</strong>.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="precos" title="3. Preços, validade e disponibilidade">
        <p>
          A oferta é do mercado que a publica, e é ele quem responde por ela perante o
          consumidor, nos termos do Código de Defesa do Consumidor (arts. 30 e 35). Os preços
          podem mudar, e as promoções costumam valer &ldquo;enquanto durar o estoque&rdquo; e só nas
          lojas indicadas no encarte.
        </p>
        <p>
          O Budega mostra as datas de validade informadas pelo mercado, retira do ar encartes
          e ofertas vencidos automaticamente e corrige informações assim que é avisado. Se
          encontrar algo errado, use o botão <strong>&ldquo;Denunciar&rdquo;</strong> na página do
          mercado, da oferta ou do encarte. Para sua segurança, confirme o preço na loja antes
          de comprar.
        </p>
      </LegalSection>

      <LegalSection id="propriedade" title="4. Marcas, encartes e pedidos de remoção">
        <p>
          Marcas, logotipos, fotos e encartes pertencem aos respectivos mercados e titulares
          (Lei nº 9.610/1998 e Lei nº 9.279/1996). O Budega os exibe apenas para informar o
          consumidor, sempre com indicação da fonte e link para o original, sem alterá-los e
          sem cobrar por isso.
        </p>
        <p>
          <strong>É responsável por um mercado?</strong> Você pode pedir a correção ou a remoção
          de qualquer conteúdo do seu mercado, ou se tornar parceiro e gerenciar as informações
          diretamente pelo painel, escrevendo para {legalValue(LEGAL.contentEmail)}. Pedidos de
          remoção são atendidos em até 5 dias úteis.
        </p>
      </LegalSection>

      <LegalSection id="destaques" title="5. Destaques e conteúdo patrocinado">
        <p>
          Mercados e ofertas pagos para aparecer em destaque são sempre identificados com o
          selo &ldquo;Destaque&rdquo; ou &ldquo;Patrocinado&rdquo;, para você saber o que é publicidade (art.
          36 do CDC). A ordem &ldquo;Mais perto&rdquo; nunca é influenciada por pagamento.
        </p>
      </LegalSection>

      <LegalSection id="conta" title="6. Conta e uso aceitável">
        <ul className={list}>
          <li>Consultar mercados e ofertas não exige cadastro.</li>
          <li>
            Se você criar uma conta, mantenha seus dados de acesso em sigilo. Você pode excluí-la
            quando quiser pelo contato de privacidade.
          </li>
          <li>
            Não é permitido: enviar denúncias falsas ou ofensivas, tentar acessar áreas ou dados
            sem autorização, sobrecarregar o serviço ou copiar em massa o conteúdo do Budega.
          </li>
          <li>
            Responsáveis por mercados que usam o painel respondem pela veracidade das
            informações que publicam.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="responsabilidade" title="7. Disponibilidade do serviço">
        <p>
          Trabalhamos para manter o Budega no ar e atualizado, mas ele pode ficar
          temporariamente indisponível para manutenção ou por falhas de terceiros (como os
          sites dos mercados). Nada nestes termos afasta os direitos que você tem pelo Código
          de Defesa do Consumidor.
        </p>
      </LegalSection>

      <LegalSection id="privacidade" title="8. Privacidade">
        <p>
          O tratamento de dados pessoais segue a nossa{" "}
          <Link href="/privacidade" className={link}>
            Política de Privacidade
          </Link>
          .
        </p>
      </LegalSection>

      <LegalSection id="alteracoes" title="9. Alterações e foro">
        <p>
          Podemos atualizar estes termos; mudanças relevantes serão avisadas no site e no
          aplicativo antes de valer. Estes termos seguem a lei brasileira. Eventuais conflitos
          podem ser resolvidos no foro do seu domicílio (art. 101, I, do CDC).
        </p>
      </LegalSection>
    </LegalPage>
  );
}
