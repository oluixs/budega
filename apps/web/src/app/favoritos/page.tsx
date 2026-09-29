import type { Metadata } from "next";
import { getActiveOffers, getMarkets } from "@/lib/data";
import { FavoritesList } from "@/components/favorites/favorites-list";

export const metadata: Metadata = { title: "Favoritos" };

// Página estática com ofertas: sem revalidar, ofertas vencidas continuariam aqui.
export const revalidate = 300;

export default async function FavoritesPage() {
  const [markets, offers] = await Promise.all([getMarkets(), getActiveOffers()]);

  return (
    <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
      <h1 className="mb-2 font-display text-h1 font-bold text-neutral-900">Favoritos</h1>
      <p className="mb-8 text-body-lg text-neutral-500">
        Mercados e ofertas que você salvou neste navegador.
      </p>
      <FavoritesList allMarkets={markets} allOffers={offers} />
    </div>
  );
}
