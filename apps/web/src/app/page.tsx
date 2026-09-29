import Link from "next/link";
import { ArrowRight, ShieldCheck, Sparkles, Store, Wallet } from "lucide-react";
import { getActiveFlyers, getActiveOffers, getCategories, getFeaturedMarkets, getMarkets } from "@/lib/data";
import { FlyerCard } from "@/components/flyer/flyer-card";
import { HeroSearch } from "@/components/home/hero-search";
import { MarketCard } from "@/components/market/market-card";
import { OfferCard } from "@/components/offer/offer-card";
import { CategoryPills } from "@/components/shared/category-pills";
import { EmptyState } from "@/components/shared/empty-state";
import { Button } from "@/components/ui/button";

// A home é gerada estaticamente; sem revalidação, uma oferta que vence depois do deploy
// continuaria aparecendo aqui. Regera no máximo a cada 5 minutos (e na hora, quando o
// admin altera algo — revalidatePath em admin-actions.ts).
export const revalidate = 300;

const VALUE_PROPS = [
  {
    icon: Wallet,
    title: "Economize de verdade",
    description: "Compare preços e ache as melhores promoções perto de você antes de sair de casa.",
  },
  {
    icon: ShieldCheck,
    title: "Mercados verificados",
    description: "Selo de verificação para mercados com informações conferidas pela equipe Budega.",
  },
  {
    icon: Sparkles,
    title: "Ofertas sempre atuais",
    description: "Encartes e promoções vencidos somem automaticamente — só vê o que vale a pena.",
  },
];

export default async function HomePage() {
  const [marketsToShow, activeOffers, categories, allMarkets, flyers] = await Promise.all([
    getFeaturedMarkets(8),
    getActiveOffers(),
    getCategories(),
    getMarkets(),
    getActiveFlyers(),
  ]);

  const hasFeaturedMarkets = marketsToShow.some((market) => market.is_featured);
  const marketsWithDistance = marketsToShow.map((market) => ({ ...market, distance_km: null }));
  const featuredOffers = activeOffers.filter((offer) => offer.is_featured);
  const offersToShow = (featuredOffers.length ? featuredOffers : activeOffers).slice(0, 8);
  const marketNameById = new Map(allMarkets.map((market) => [market.id, market.name]));
  // Encartes que vencem antes primeiro: são os que o cliente precisa ver logo.
  const weeklyFlyers = [...flyers].sort((a, b) => a.valid_until.localeCompare(b.valid_until)).slice(0, 8);

  return (
    <div>
      <section className="border-b border-neutral-300/60 bg-gradient-to-b from-brand-50 to-neutral-50">
        <div className="mx-auto flex max-w-6xl flex-col gap-8 px-4 py-14 sm:px-6 sm:py-20">
          <div className="max-w-2xl">
            <h1 className="font-display text-display font-bold leading-tight text-neutral-900">
              Os melhores mercados e ofertas do seu bairro, num só lugar.
            </h1>
            <p className="mt-4 text-body-lg text-neutral-700">
              O Budega ajuda você a localizar mercados próximos e consultar encartes e
              promoções — sem precisar sair procurando de loja em loja.
            </p>
          </div>
          <HeroSearch />
        </div>
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-6 sm:grid-cols-3">
          {VALUE_PROPS.map((item) => (
            <div key={item.title} className="flex flex-col gap-2 rounded-xl border border-neutral-300 bg-neutral-0 p-5">
              <item.icon className="h-6 w-6 text-brand-600" aria-hidden="true" />
              <h2 className="font-display text-h3 font-semibold text-neutral-900">{item.title}</h2>
              <p className="text-body text-neutral-500">{item.description}</p>
            </div>
          ))}
        </div>
      </section>

      {categories.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-4 sm:px-6">
          <h2 className="mb-4 font-display text-h2 font-semibold text-neutral-900">Categorias</h2>
          <CategoryPills categories={categories} />
        </section>
      )}

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6 flex items-center justify-between">
          <h2 className="font-display text-h2 font-semibold text-neutral-900">
            {hasFeaturedMarkets ? "Mercados em destaque" : "Mercados da região"}
          </h2>
          <Button variant="ghost" render={<Link href="/explorar" />}>
            Ver todos <ArrowRight className="h-4 w-4" />
          </Button>
        </div>

        {marketsWithDistance.length === 0 ? (
          <EmptyState
            icon={Store}
            title="Nenhum mercado cadastrado ainda"
            description="Assim que mercados forem cadastrados, eles aparecem aqui."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {marketsWithDistance.map((market) => (
              <MarketCard key={market.id} market={market} />
            ))}
          </div>
        )}
      </section>

      <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="mb-6">
          <h2 className="font-display text-h2 font-semibold text-neutral-900">Encartes da semana</h2>
          <p className="text-body text-neutral-500">Direto dos sites oficiais dos mercados, atualizados várias vezes ao dia.</p>
        </div>
        {weeklyFlyers.length === 0 ? (
          <EmptyState
            icon={Sparkles}
            title="Nenhum encarte vigente agora"
            description="Os mercados publicam novos encartes toda semana — volte em breve."
          />
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {weeklyFlyers.map((flyer) => (
              <FlyerCard key={flyer.id} flyer={flyer} marketName={marketNameById.get(flyer.market_id)} />
            ))}
          </div>
        )}
      </section>

      {offersToShow.length > 0 && (
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="mb-6 flex items-center justify-between">
            <h2 className="font-display text-h2 font-semibold text-neutral-900">
              {featuredOffers.length ? "Ofertas em destaque" : "Ofertas da semana"}
            </h2>
            <Button variant="ghost" render={<Link href="/explorar" />}>
              Ver todas <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            {offersToShow.map((offer) => (
              <OfferCard key={offer.id} offer={offer} />
            ))}
          </div>
        </section>
      )}

      <section className="border-t border-neutral-300/60 bg-brand-700">
        <div className="mx-auto flex max-w-6xl flex-col items-start gap-4 px-4 py-14 sm:px-6">
          <h2 className="font-display text-h1 font-bold text-neutral-0">
            Pronto para economizar no mercado?
          </h2>
          <p className="max-w-xl text-body-lg text-brand-100">
            Explore mercados próximos, veja encartes atualizados e favorite suas ofertas
            preferidas — tudo sem precisar criar uma conta.
          </p>
          <Button size="lg" className="bg-neutral-0 text-brand-700 hover:bg-neutral-100" render={<Link href="/explorar" />}>
            Explorar mercados
          </Button>
        </div>
      </section>
    </div>
  );
}
