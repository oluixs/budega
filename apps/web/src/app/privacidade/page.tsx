import type { Metadata } from "next";

export const metadata: Metadata = { title: "Política de Privacidade" };

export default function PrivacyPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-h1 font-bold text-neutral-900">Política de Privacidade</h1>
      <p className="mt-2 text-caption text-neutral-500">Última atualização: 28 de setembro de 2026</p>

      <div className="prose prose-neutral mt-8 max-w-none space-y-6 text-body-lg text-neutral-700">
        <p>
          Esta Política de Privacidade descreve como o Budega (&ldquo;nós&rdquo;) coleta, usa e
          protege as informações de quem usa nosso site e aplicativo, em conformidade
          com a Lei Geral de Proteção de Dados (LGPD — Lei nº 13.709/2018).
        </p>

        <section>
          <h2 className="font-display text-h2 font-semibold text-neutral-900">1. Quais dados coletamos</h2>
          <ul className="list-disc space-y-1 pl-6">
            <li>Localização aproximada ou exata, apenas quando você autoriza, para mostrar mercados próximos.</li>
            <li>Favoritos salvos localmente no seu navegador ou aplicativo (não exige cadastro).</li>
            <li>Nome e e-mail, caso você crie uma conta para sincronizar favoritos entre aparelhos.</li>
            <li>Dados de uso agregados (ex.: cliques em rota, visualizações de ofertas) para melhorar o produto.</li>
          </ul>
        </section>

        <section>
          <h2 className="font-display text-h2 font-semibold text-neutral-900">2. Como usamos seus dados</h2>
          <p>
            Usamos os dados para exibir mercados e ofertas relevantes perto de você,
            manter seus favoritos, e entender quais funcionalidades são mais úteis.
            Não vendemos seus dados pessoais a terceiros.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h2 font-semibold text-neutral-900">3. Compartilhamento com mercados parceiros</h2>
          <p>
            Mercados cadastrados podem ver métricas agregadas (visualizações, cliques),
            nunca dados pessoais individuais de quem consulta ofertas sem se identificar.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h2 font-semibold text-neutral-900">4. Seus direitos</h2>
          <p>
            Você pode solicitar acesso, correção ou exclusão dos seus dados pessoais a
            qualquer momento, além de revogar permissões de localização diretamente nas
            configurações do seu navegador ou aparelho.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h2 font-semibold text-neutral-900">5. Contato</h2>
          <p>
            Dúvidas sobre privacidade podem ser enviadas para{" "}
            <a href="mailto:privacidade@budega.app" className="text-brand-600 hover:underline">
              privacidade@budega.app
            </a>
            .
          </p>
        </section>

        <p className="rounded-lg border border-warning/30 bg-warning/10 p-4 text-body text-neutral-700">
          Este texto é um modelo de MVP e deve ser revisado por um profissional jurídico
          antes do lançamento em produção.
        </p>
      </div>
    </div>
  );
}
