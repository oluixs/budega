import type { Metadata } from "next";
import Link from "next/link";
import { CatalogPrivacy } from "@/components/legal/catalog-privacy";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { hasAccounts, LEGAL, legalValue } from "@/lib/legal";

export const metadata: Metadata = { title: "Política de Privacidade" };

const list = "list-disc space-y-2 pl-6";
const link = "font-medium text-brand-600 hover:underline";

export default function PrivacyPage() {
  // Sem contas (site publicado sem Supabase), o projeto não trata dados pessoais.
  if (!hasAccounts) return <CatalogPrivacy />;
  return (
    <LegalPage title="Política de Privacidade" updated={LEGAL.lastUpdated}>
      <p>
        Esta política explica, de forma direta, quais dados pessoais o Budega trata, por quê,
        por quanto tempo e quais são os seus direitos, conforme a Lei Geral de Proteção de
        Dados Pessoais (LGPD — Lei nº 13.709/2018) e o Marco Civil da Internet (Lei nº
        12.965/2014). Ela vale para o site e para o aplicativo do Budega.
      </p>
      <p>
        <strong>Resumo:</strong> você pode usar o Budega sem cadastro. Só usamos sua
        localização se você permitir, seus favoritos ficam no seu próprio aparelho e não
        vendemos dados pessoais.
      </p>

      <LegalSection id="controlador" title="1. Quem é o responsável pelos seus dados">
        <p>O controlador dos dados pessoais tratados no Budega é:</p>
        <ul className={list}>
          <li>
            <strong>{legalValue(LEGAL.controllerName)}</strong>, inscrito(a) sob o nº{" "}
            {legalValue(LEGAL.controllerDocument)}, com endereço em {legalValue(LEGAL.controllerAddress)}.
          </li>
          <li>
            Encarregado pelo tratamento de dados pessoais (art. 41 da LGPD):{" "}
            {legalValue(LEGAL.dpoName)} — {legalValue(LEGAL.privacyEmail)}.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="dados" title="2. Quais dados tratamos, para quê e com qual base legal">
        <div className="overflow-x-auto rounded-lg border border-neutral-300">
          <table className="w-full min-w-[36rem] text-left text-body">
            <thead className="bg-neutral-100 text-neutral-900">
              <tr>
                <th scope="col" className="p-3">Dado</th>
                <th scope="col" className="p-3">Para quê</th>
                <th scope="col" className="p-3">Base legal (art. 7º)</th>
                <th scope="col" className="p-3">Por quanto tempo</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-300 bg-neutral-0">
              <tr>
                <td className="p-3">Localização do aparelho</td>
                <td className="p-3">Mostrar mercados e lojas mais próximos e calcular distâncias</td>
                <td className="p-3">Consentimento (I) — só com a sua permissão</td>
                <td className="p-3">
                  Não guardamos: é usada na hora e só fica no endereço da página (ex.: link de
                  busca) enquanto você navega
                </td>
              </tr>
              <tr>
                <td className="p-3">Favoritos</td>
                <td className="p-3">Guardar mercados e ofertas que você salvou</td>
                <td className="p-3">Não há tratamento por nós: ficam só no armazenamento local do seu navegador/aparelho</td>
                <td className="p-3">Até você apagá-los ou limpar os dados do navegador/app</td>
              </tr>
              <tr>
                <td className="p-3">Nome, e-mail e senha (criptografada)</td>
                <td className="p-3">Criar e manter sua conta, se você optar por ter uma</td>
                <td className="p-3">Execução de contrato (V)</td>
                <td className="p-3">Enquanto a conta existir; excluída em até 30 dias após o pedido</td>
              </tr>
              <tr>
                <td className="p-3">Denúncias que você envia (motivo e descrição)</td>
                <td className="p-3">Corrigir preços, encartes e informações erradas</td>
                <td className="p-3">Legítimo interesse (IX) em manter as informações corretas</td>
                <td className="p-3">Até 12 meses após a resolução; sem conta, são anônimas</td>
              </tr>
              <tr>
                <td className="p-3">Métricas de uso agregadas (ex.: cliques em rota)</td>
                <td className="p-3">Entender o que é útil e mostrar números agregados aos mercados</td>
                <td className="p-3">Legítimo interesse (IX), sem identificar você</td>
                <td className="p-3">Até 24 meses, de forma agregada</td>
              </tr>
              <tr>
                <td className="p-3">Registros de acesso (IP, data e hora)</td>
                <td className="p-3">Segurança e cumprimento da lei</td>
                <td className="p-3">Obrigação legal (II) — art. 15 do Marco Civil da Internet</td>
                <td className="p-3">6 meses, como exige a lei</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Não usamos seus dados para publicidade direcionada, não fazemos decisões
          automatizadas sobre você e não tratamos dados pessoais sensíveis.
        </p>
      </LegalSection>

      <LegalSection id="mercados" title="3. Informações dos mercados">
        <p>
          Endereços, horários, telefones e encartes das lojas são informações comerciais
          públicas, obtidas nos sites oficiais dos próprios mercados ou enviadas por eles. Não
          são dados pessoais de quem usa o Budega.
        </p>
      </LegalSection>

      <LegalSection id="compartilhamento" title="4. Com quem compartilhamos">
        <ul className={list}>
          <li>
            <strong>Provedores de infraestrutura</strong> (hospedagem do site e banco de dados),
            que tratam os dados apenas para nos prestar o serviço, sob contrato.
          </li>
          <li>
            <strong>Mapas:</strong> para desenhar o mapa, seu navegador baixa imagens do
            OpenStreetMap, que recebe o endereço IP do seu aparelho (como em qualquer site
            que você visita). Os botões &ldquo;Rota&rdquo; e &ldquo;Como chegar&rdquo; abrem o Google Maps, que
            passa a seguir a política do Google.
          </li>
          <li>
            <strong>Mercados:</strong> recebem apenas números agregados (ex.: quantas vezes
            uma oferta foi vista), nunca dados que identifiquem você.
          </li>
          <li>
            <strong>Autoridades</strong>, quando houver ordem judicial ou obrigação legal.
          </li>
        </ul>
        <p>
          Alguns desses provedores podem armazenar dados fora do Brasil. Nesses casos, a
          transferência segue o art. 33 da LGPD (cláusulas contratuais e garantias de
          proteção equivalentes).
        </p>
      </LegalSection>

      <LegalSection id="cookies" title="5. Cookies e armazenamento local">
        <ul className={list}>
          <li>
            <strong>Necessários:</strong> cookie de sessão, só se você fizer login, para manter
            você conectado com segurança.
          </li>
          <li>
            <strong>Armazenamento local:</strong> guarda seus favoritos no próprio aparelho.
          </li>
        </ul>
        <p>Não usamos cookies de publicidade nem de rastreamento de terceiros.</p>
      </LegalSection>

      <LegalSection id="direitos" title="6. Seus direitos">
        <p>Pelo art. 18 da LGPD, você pode pedir a qualquer momento, sem custo:</p>
        <ul className={list}>
          <li>confirmação de que tratamos seus dados e acesso a eles;</li>
          <li>correção de dados incompletos, inexatos ou desatualizados;</li>
          <li>anonimização, bloqueio ou eliminação de dados desnecessários ou tratados em desacordo com a lei;</li>
          <li>portabilidade dos dados a outro fornecedor;</li>
          <li>eliminação dos dados tratados com base no seu consentimento;</li>
          <li>informação sobre com quem compartilhamos seus dados;</li>
          <li>informação sobre a possibilidade de não consentir e as consequências disso;</li>
          <li>revogação do consentimento (ex.: desligar a localização nas configurações do aparelho).</li>
        </ul>
        <p>
          Para exercer seus direitos, escreva para {legalValue(LEGAL.privacyEmail)}.
          Respondemos em até 15 dias. Se não ficar satisfeito(a), você pode reclamar à
          Autoridade Nacional de Proteção de Dados (ANPD) em{" "}
          <a href="https://www.gov.br/anpd" target="_blank" rel="noreferrer" className={link}>
            gov.br/anpd
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="seguranca" title="7. Segurança">
        <p>
          Usamos conexão criptografada (HTTPS), senhas armazenadas de forma irreversível,
          controle de acesso por perfil no banco de dados e acesso restrito da equipe. Em caso
          de incidente de segurança que possa causar risco ou dano relevante, comunicaremos
          a ANPD e as pessoas afetadas (art. 48 da LGPD).
        </p>
      </LegalSection>

      <LegalSection id="criancas" title="8. Crianças e adolescentes">
        <p>
          O Budega não é direcionado a crianças. Contas só podem ser criadas por maiores de
          18 anos ou, no caso de adolescentes, com autorização de um responsável (art. 14 da
          LGPD). Consultar mercados e ofertas não exige cadastro.
        </p>
      </LegalSection>

      <LegalSection id="alteracoes" title="9. Alterações desta política">
        <p>
          Se esta política mudar de forma relevante, avisaremos no site e no aplicativo antes
          de a mudança valer. Veja também os <Link href="/termos" className={link}>Termos de Uso</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
