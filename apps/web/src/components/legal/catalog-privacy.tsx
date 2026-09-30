import Link from "next/link";
import { LegalPage, LegalSection } from "@/components/legal/legal-page";
import { hasIdentity, HOSTING, LEGAL, legalValue } from "@/lib/legal";

const list = "list-disc space-y-2 pl-6";
const link = "font-medium text-brand-600 hover:underline";

/**
 * Política de Privacidade do site publicado sem contas (modo catálogo): o projeto não
 * coleta nem guarda dados pessoais; só existem os registros técnicos da hospedagem.
 */
export function CatalogPrivacy() {
  return (
    <LegalPage title="Política de Privacidade" updated={LEGAL.lastUpdated}>
      <p>
        Esta política explica, de forma direta, o que acontece com os seus dados quando você
        usa o Budega, conforme a Lei Geral de Proteção de Dados Pessoais (LGPD — Lei nº
        13.709/2018) e o Marco Civil da Internet (Lei nº 12.965/2014). Ela vale para o site e
        para o aplicativo do Budega.
      </p>
      <p>
        <strong>Resumo:</strong> o Budega não tem cadastro nem formulários e não guarda dados
        pessoais seus. Sua localização só é usada se você permitir, e seus favoritos ficam no
        seu próprio aparelho.
      </p>

      <LegalSection id="quem" title="1. Quem mantém o Budega">
        {hasIdentity && (
          <p>
            O Budega é mantido por <strong>{legalValue(LEGAL.controllerName)}</strong>, contato{" "}
            {legalValue(LEGAL.privacyEmail)}.
          </p>
        )}
        <p>
          {hasIdentity ? "É u" : "O Budega é u"}m projeto independente, gratuito e sem fins
          comerciais, com código aberto e público no{" "}
          <a href={LEGAL.repoUrl} target="_blank" rel="noreferrer" className={link}>
            GitHub
          </a>
          . Não vende produtos, não exibe publicidade e não comercializa dados.
        </p>
        <p>
          Dúvidas, pedidos e avisos podem ser enviados abrindo um aviso (issue) em{" "}
          <a href={`${LEGAL.repoUrl}/issues`} target="_blank" rel="noreferrer" className={link}>
            github.com/oluixs/budega/issues
          </a>
          . Os avisos são públicos: não escreva dados pessoais neles.
        </p>
      </LegalSection>

      <LegalSection id="dados" title="2. O que acontece com os seus dados">
        <div className="overflow-x-auto rounded-lg border border-neutral-300">
          <table className="w-full min-w-[36rem] text-left text-body">
            <thead className="bg-neutral-100 text-neutral-900">
              <tr>
                <th scope="col" className="p-3">Dado</th>
                <th scope="col" className="p-3">Como é usado</th>
                <th scope="col" className="p-3">Base legal (art. 7º)</th>
                <th scope="col" className="p-3">Guardamos?</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-neutral-300 bg-neutral-0">
              <tr>
                <td className="p-3">Localização do aparelho</td>
                <td className="p-3">
                  Mostrar as lojas mais próximas e as distâncias. Vai no endereço da página
                  arredondada (cerca de 100 metros) para a lista vir ordenada
                </td>
                <td className="p-3">Consentimento (I) — só com a sua permissão</td>
                <td className="p-3">Não</td>
              </tr>
              <tr>
                <td className="p-3">Favoritos</td>
                <td className="p-3">Guardar mercados e ofertas que você salvou</td>
                <td className="p-3">Não há tratamento pelo Budega: ficam só no seu navegador/aparelho</td>
                <td className="p-3">Não — ficam no seu aparelho até você apagá-los</td>
              </tr>
              <tr>
                <td className="p-3">Registros técnicos de acesso (IP, data, hora e página)</td>
                <td className="p-3">
                  Gerados automaticamente pela hospedagem para entregar o site e protegê-lo
                  contra abusos. O Budega não os usa para identificar ninguém
                </td>
                <td className="p-3">Legítimo interesse (IX) na segurança do serviço</td>
                <td className="p-3">Pela hospedagem, pelo prazo da política dela</td>
              </tr>
            </tbody>
          </table>
        </div>
        <p>
          Não usamos cookies, ferramentas de análise, publicidade ou decisões automatizadas, e
          não tratamos dados pessoais sensíveis.
        </p>
      </LegalSection>

      <LegalSection id="mercados" title="3. Informações dos mercados">
        <p>
          Endereços, horários, telefones, encartes e ofertas das lojas são informações
          comerciais públicas, obtidas nos sites oficiais dos próprios mercados. Não são dados
          pessoais de quem usa o Budega.
        </p>
      </LegalSection>

      <LegalSection id="terceiros" title="4. Serviços de terceiros">
        <ul className={list}>
          <li>
            <strong>Hospedagem:</strong> o site fica na {HOSTING.name} ({HOSTING.country}), que
            recebe os registros técnicos de acesso. Veja a{" "}
            <a href={HOSTING.privacyUrl} target="_blank" rel="noreferrer" className={link}>
              política de privacidade da {HOSTING.name}
            </a>
            . A transferência internacional desses registros segue o art. 33 da LGPD.
          </li>
          <li>
            <strong>Mapas:</strong> para desenhar o mapa, seu navegador baixa imagens do
            OpenStreetMap, que recebe o endereço IP do seu aparelho. Os botões &ldquo;Rota&rdquo; e
            &ldquo;Como chegar&rdquo; abrem o Google Maps, que passa a seguir a política do Google.
          </li>
          <li>
            <strong>Sites dos mercados e GitHub:</strong> ao abrir um encarte original, a fonte
            de uma informação ou um aviso no GitHub, você passa a usar aquele site, sob a
            política dele.
          </li>
        </ul>
      </LegalSection>

      <LegalSection id="direitos" title="5. Seus direitos">
        <p>
          A LGPD (art. 18) garante acesso, correção, eliminação e informação sobre os seus
          dados. Como o Budega não guarda dados que identifiquem você, não há cadastro para
          consultar ou apagar: os favoritos somem ao limpar os dados do navegador ou do app, e
          a permissão de localização pode ser retirada a qualquer momento nas configurações do
          aparelho. Dúvidas podem ser enviadas pelo GitHub (item 1). Você também pode falar com
          a Autoridade Nacional de Proteção de Dados (ANPD) em{" "}
          <a href="https://www.gov.br/anpd" target="_blank" rel="noreferrer" className={link}>
            gov.br/anpd
          </a>
          .
        </p>
      </LegalSection>

      <LegalSection id="criancas" title="6. Crianças e adolescentes">
        <p>
          O Budega não é direcionado a crianças, não exige cadastro e não coleta dados de
          quem o usa.
        </p>
      </LegalSection>

      <LegalSection id="alteracoes" title="7. Alterações desta política">
        <p>
          Se o Budega passar a ter contas ou a guardar qualquer dado pessoal, esta política
          será atualizada antes disso, com a identificação completa do responsável. Veja também
          os <Link href="/termos" className={link}>Termos de Uso</Link>.
        </p>
      </LegalSection>
    </LegalPage>
  );
}
