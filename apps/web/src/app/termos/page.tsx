import type { Metadata } from "next";

export const metadata: Metadata = { title: "Termos de Uso" };

export default function TermsPage() {
  return (
    <div className="mx-auto max-w-3xl px-4 py-12 sm:px-6">
      <h1 className="font-display text-h1 font-bold text-neutral-900">Termos de Uso</h1>
      <p className="mt-2 text-caption text-neutral-500">Última atualização: 28 de setembro de 2026</p>

      <div className="prose prose-neutral mt-8 max-w-none space-y-6 text-body-lg text-neutral-700">
        <section>
          <h2 className="font-display text-h2 font-semibold text-neutral-900">1. Sobre o Budega</h2>
          <p>
            O Budega é um serviço para ajudar pessoas a localizar mercados próximos e
            consultar encartes e promoções. O uso do site e do aplicativo implica
            concordância com estes termos.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h2 font-semibold text-neutral-900">2. Preços e disponibilidade</h2>
          <p>
            As informações de preço, estoque e validade das ofertas são fornecidas pelos
            próprios mercados parceiros e podem mudar sem aviso prévio. O Budega não se
            responsabiliza por divergências entre o app e o preço praticado na loja —{" "}
            <strong>sempre confirme o preço e a disponibilidade diretamente no estabelecimento</strong>.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h2 font-semibold text-neutral-900">3. Conteúdo dos mercados</h2>
          <p>
            Mercados cadastrados são responsáveis pela veracidade dos dados que
            publicam (encartes, ofertas, endereço, horário). Usuários podem denunciar
            conteúdo incorreto ou desatualizado diretamente pelo app.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h2 font-semibold text-neutral-900">4. Conteúdo patrocinado</h2>
          <p>
            Mercados e ofertas em destaque são sinalizados com os selos &ldquo;Destaque&rdquo; ou
            &ldquo;Patrocinado&rdquo; quando aplicável, para manter a transparência com quem usa o
            Budega.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h2 font-semibold text-neutral-900">5. Uso aceitável</h2>
          <p>
            Não é permitido usar o Budega para publicar conteúdo falso, ofensivo ou
            ilegal, nem tentar acessar dados de outros usuários sem autorização.
          </p>
        </section>

        <section>
          <h2 className="font-display text-h2 font-semibold text-neutral-900">6. Alterações</h2>
          <p>
            Podemos atualizar estes termos periodicamente. Mudanças relevantes serão
            comunicadas dentro do próprio app.
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
