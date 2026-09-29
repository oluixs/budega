// Reexports explícitos (em vez de `export * from`) porque o bundler Turbopack usado
// pelo Next.js 16 falha silenciosamente em resolver alguns nomes vindos de `export *`
// encadeado entre vários arquivos deste pacote (ver .audit/errors/ para o registro
// completo). Reexports nomeados são resolvidos de forma confiável.
export type {
  UserRole,
  Profile,
  OpeningHours,
  Market,
  Branch,
  Category,
  FlyerFileType,
  FlyerStatus,
  Flyer,
  Offer,
  Favorite,
  ReportReason,
  ReportStatus,
  Report,
  AnalyticsEventName,
  AnalyticsEvent,
  MarketWithDistance,
  Coordinates,
} from "./types/index";

export {
  openingHoursSchema,
  marketFormSchema,
  type MarketFormValues,
  branchFormSchema,
  type BranchFormValues,
  flyerFormSchema,
  type FlyerFormValues,
  offerFormSchema,
  type OfferFormValues,
  reportFormSchema,
  type ReportFormValues,
  locationSearchSchema,
  type LocationSearchValues,
  authSchema,
  type AuthValues,
  signUpSchema,
  type SignUpValues,
  MAX_UPLOAD_SIZE_BYTES,
  ALLOWED_IMAGE_TYPES,
  ALLOWED_FLYER_TYPES,
  validateUpload,
} from "./schemas/index";

export {
  calculateDistanceKm,
  formatDistance,
  withDistance,
  sortMarkets,
  type MarketSortOrder,
} from "./business/distance";

export {
  isOfferActive,
  isFlyerActive,
  filterActiveOffers,
  filterActiveFlyers,
  canPublishOffer,
  daysUntilExpiration,
  isExpiringSoon,
} from "./business/validity";

export {
  formatPriceBRL,
  formatPercentOff,
  formatDateBR,
  formatRelativeUpdate,
} from "./business/format";

export { isOpenNow, formatOpeningHoursToday, weekdayLabel } from "./business/hours";

export {
  addLocalFavorite,
  removeLocalFavorite,
  isFavorited,
  toggleLocalFavorite,
  mergeFavorites,
  type LocalFavorite,
} from "./business/favorites";

export {
  buildMarketShareUrl,
  buildOfferShareUrl,
  buildFlyerShareUrl,
  buildMarketDeepLink,
  buildOfferDeepLink,
  buildExternalRouteUrl,
  buildWhatsAppUrl,
} from "./business/links";

export * as mock from "./mock/index";
