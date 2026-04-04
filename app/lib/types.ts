export interface PropertyDetails {
  address: string;
  listPrice: number;
  mortgageBalance: number;
  additionalPayoffs: number; // liens, HELOC, etc.
}

export interface Offer {
  id: string;
  buyerName: string;
  offerPrice: number;
  earnestMoney: number;
  downPaymentPercent: number;
  loanType: "conventional" | "fha" | "va" | "cash" | "usda" | "other";
  sellerConcessions: number;
  listingAgentCommissionPercent: number;
  buyerAgentCommissionPercent: number;
  titleEscrowFees: number;
  homeWarranty: number;
  closingDate: string;
  inspectionContingency: boolean;
  appraisalContingency: boolean;
  financingContingency: boolean;
  saleContingency: boolean;
  otherCredits: number;
  otherDebits: number;
  notes: string;
}

export interface ComparisonState {
  property: PropertyDetails;
  offers: Offer[];
}

let _idCounter = 0;

export function createDefaultOffer(index: number): Offer {
  _idCounter++;
  return {
    id: `offer-${Date.now()}-${_idCounter}`,
    buyerName: `Offer ${index}`,
    offerPrice: 0,
    earnestMoney: 0,
    downPaymentPercent: 20,
    loanType: "conventional",
    sellerConcessions: 0,
    listingAgentCommissionPercent: 3,
    buyerAgentCommissionPercent: 3,
    titleEscrowFees: 2000,
    homeWarranty: 0,
    closingDate: "",
    inspectionContingency: true,
    appraisalContingency: true,
    financingContingency: true,
    saleContingency: false,
    otherCredits: 0,
    otherDebits: 0,
    notes: "",
  };
}

export function createDefaultProperty(): PropertyDetails {
  return {
    address: "",
    listPrice: 0,
    mortgageBalance: 0,
    additionalPayoffs: 0,
  };
}

export interface NetCalculation {
  grossProceeds: number;
  listingCommission: number;
  buyerAgentCommission: number;
  totalCommissions: number;
  sellerConcessions: number;
  titleEscrowFees: number;
  homeWarranty: number;
  otherDebits: number;
  otherCredits: number;
  totalClosingCosts: number;
  mortgagePayoff: number;
  additionalPayoffs: number;
  netProceeds: number;
}

export function calculateNet(
  offer: Offer,
  property: PropertyDetails
): NetCalculation {
  const grossProceeds = offer.offerPrice;
  const listingCommission =
    offer.offerPrice * (offer.listingAgentCommissionPercent / 100);
  const buyerAgentCommission =
    offer.offerPrice * (offer.buyerAgentCommissionPercent / 100);
  const totalCommissions = listingCommission + buyerAgentCommission;

  const totalClosingCosts =
    totalCommissions +
    offer.sellerConcessions +
    offer.titleEscrowFees +
    offer.homeWarranty +
    offer.otherDebits -
    offer.otherCredits;

  const mortgagePayoff = property.mortgageBalance;
  const additionalPayoffs = property.additionalPayoffs;

  const netProceeds =
    grossProceeds - totalClosingCosts - mortgagePayoff - additionalPayoffs;

  return {
    grossProceeds,
    listingCommission,
    buyerAgentCommission,
    totalCommissions,
    sellerConcessions: offer.sellerConcessions,
    titleEscrowFees: offer.titleEscrowFees,
    homeWarranty: offer.homeWarranty,
    otherDebits: offer.otherDebits,
    otherCredits: offer.otherCredits,
    totalClosingCosts,
    mortgagePayoff,
    additionalPayoffs,
    netProceeds,
  };
}
