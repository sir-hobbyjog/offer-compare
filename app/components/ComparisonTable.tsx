"use client";

import {
  Offer,
  PropertyDetails,
  calculateNet,
  NetCalculation,
} from "../lib/types";
import MobileOfferCard from "./MobileOfferCard";

interface Props {
  offers: Offer[];
  property: PropertyDetails;
  onUpdateOffer: (index: number, offer: Offer) => void;
  onRemoveOffer: (index: number) => void;
  readOnly?: boolean;
}

const LOAN_TYPES = [
  { value: "conventional", label: "Conventional" },
  { value: "fha", label: "FHA" },
  { value: "va", label: "VA" },
  { value: "cash", label: "Cash" },
  { value: "usda", label: "USDA" },
  { value: "other", label: "Other" },
] as const;

function fmt(n: number): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: "USD",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(n);
}

function fmtPct(n: number): string {
  return `${n.toFixed(2)}%`;
}

export default function ComparisonTable({
  offers,
  property,
  onUpdateOffer,
  onRemoveOffer,
  readOnly,
}: Props) {
  const calculations: NetCalculation[] = offers.map((o) =>
    calculateNet(o, property)
  );

  // Find the best net
  const bestNetIndex = calculations.reduce(
    (best, calc, i) =>
      calc.netProceeds > (calculations[best]?.netProceeds ?? -Infinity)
        ? i
        : best,
    0
  );

  const updateField = (
    index: number,
    field: keyof Offer,
    value: string | number | boolean
  ) => {
    onUpdateOffer(index, { ...offers[index], [field]: value });
  };

  const labelClass =
    "sticky left-0 z-10 bg-slate-50 px-4 py-2.5 text-xs font-medium text-slate-600 border-b border-r border-slate-200 whitespace-nowrap min-w-[200px]";
  const cellClass =
    "px-3 py-2 border-b border-slate-200 min-w-[200px]";
  const inputClass =
    "w-full px-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-xmre-navy/30 focus:border-xmre-navy bg-white";
  const dollarInputClass =
    "w-full pl-6 pr-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-xmre-navy/30 focus:border-xmre-navy bg-white";
  const pctInputClass =
    "w-full pr-6 pl-2 py-1.5 border border-slate-300 rounded text-sm focus:outline-none focus:ring-2 focus:ring-xmre-navy/30 focus:border-xmre-navy bg-white";
  const calcClass =
    "px-3 py-2.5 border-b border-slate-200 min-w-[200px] text-sm font-medium";

  if (offers.length === 0) {
    return (
      <div className="bg-white rounded-lg border border-slate-200 p-8 text-center text-slate-500">
        Add offers to start comparing.
      </div>
    );
  }

  return (
    <>
      {/* Mobile: stacked cards */}
      <div className="md:hidden space-y-4">
        {offers.map((offer, i) => (
          <MobileOfferCard
            key={offer.id}
            offer={offer}
            index={i}
            property={property}
            isBest={calculations.length > 1 && i === bestNetIndex}
            totalOffers={offers.length}
            onUpdate={onUpdateOffer}
            onRemove={onRemoveOffer}
            readOnly={readOnly}
          />
        ))}
      </div>

      {/* Desktop: spreadsheet table */}
      <div className="hidden md:block bg-white rounded-lg border border-slate-200 overflow-hidden">
      <div className="overflow-x-auto offer-scroll">
        <table className="w-full border-collapse">
          {/* Header row with offer names */}
          <thead>
            <tr className="bg-xmre-navy text-white">
              <th className="sticky left-0 z-10 bg-xmre-navy px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider border-r border-white/10 min-w-[200px]">
                &nbsp;
              </th>
              {offers.map((offer, i) => (
                <th
                  key={offer.id}
                  className={`px-3 py-3 text-center text-sm font-semibold min-w-[200px] ${
                    !readOnly && offers.length > 1
                      ? "border-r border-white/10"
                      : ""
                  } ${
                    calculations.length > 1 && i === bestNetIndex
                      ? "bg-xmre-green/20"
                      : ""
                  }`}
                >
                  <div className="flex items-center justify-center gap-2">
                    {readOnly ? (
                      <span>{offer.buyerName || `Offer ${i + 1}`}</span>
                    ) : (
                      <input
                        type="text"
                        value={offer.buyerName}
                        onChange={(e) =>
                          updateField(i, "buyerName", e.target.value)
                        }
                        className="bg-transparent border-b border-white/40 text-white text-center text-sm font-semibold w-32 focus:outline-none focus:border-white placeholder-white/50"
                        placeholder={`Offer ${i + 1}`}
                      />
                    )}
                    {!readOnly && (
                      <button
                        onClick={() => onRemoveOffer(i)}
                        className="text-white/50 hover:text-white/90 text-lg leading-none cursor-pointer"
                        title="Remove offer"
                      >
                        &times;
                      </button>
                    )}
                  </div>
                  {calculations.length > 1 && i === bestNetIndex && (
                    <div className="text-[10px] mt-1 text-green-300 font-normal uppercase tracking-widest">
                      Best Net
                    </div>
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {/* OFFER TERMS */}
            <SectionHeader
              label="Offer Terms"
              colSpan={offers.length + 1}
            />
            {/* Offer Price */}
            <tr>
              <td className={labelClass}>Offer Price</td>
              {offers.map((offer, i) => (
                <td key={offer.id} className={cellClass}>
                  {readOnly ? (
                    <span className="text-sm">{fmt(offer.offerPrice)}</span>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-slate-400 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={offer.offerPrice || ""}
                        onChange={(e) =>
                          updateField(i, "offerPrice", Number(e.target.value))
                        }
                        className={dollarInputClass}
                      />
                    </div>
                  )}
                </td>
              ))}
            </tr>
            {/* vs List Price */}
            <tr>
              <td className={labelClass}>vs. List Price</td>
              {offers.map((offer, i) => {
                const diff = offer.offerPrice - property.listPrice;
                const pct =
                  property.listPrice > 0
                    ? ((diff / property.listPrice) * 100).toFixed(1)
                    : "0";
                return (
                  <td key={offer.id} className={calcClass}>
                    <span
                      className={
                        diff >= 0 ? "text-xmre-green" : "text-xmre-red"
                      }
                    >
                      {diff >= 0 ? "+" : ""}
                      {fmt(diff)} ({diff >= 0 ? "+" : ""}
                      {pct}%)
                    </span>
                  </td>
                );
              })}
            </tr>
            {/* Earnest Money */}
            <tr>
              <td className={labelClass}>Earnest Money</td>
              {offers.map((offer, i) => (
                <td key={offer.id} className={cellClass}>
                  {readOnly ? (
                    <span className="text-sm">{fmt(offer.earnestMoney)}</span>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-slate-400 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={offer.earnestMoney || ""}
                        onChange={(e) =>
                          updateField(
                            i,
                            "earnestMoney",
                            Number(e.target.value)
                          )
                        }
                        className={dollarInputClass}
                      />
                    </div>
                  )}
                </td>
              ))}
            </tr>
            {/* Down Payment */}
            <tr>
              <td className={labelClass}>Down Payment %</td>
              {offers.map((offer, i) => (
                <td key={offer.id} className={cellClass}>
                  {readOnly ? (
                    <span className="text-sm">
                      {fmtPct(offer.downPaymentPercent)}
                    </span>
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        value={offer.downPaymentPercent || ""}
                        onChange={(e) =>
                          updateField(
                            i,
                            "downPaymentPercent",
                            Number(e.target.value)
                          )
                        }
                        className={pctInputClass}
                        step="0.5"
                      />
                      <span className="absolute right-2 top-2 text-slate-400 text-sm">
                        %
                      </span>
                    </div>
                  )}
                </td>
              ))}
            </tr>
            {/* Loan Type */}
            <tr>
              <td className={labelClass}>Loan Type</td>
              {offers.map((offer, i) => (
                <td key={offer.id} className={cellClass}>
                  {readOnly ? (
                    <span className="text-sm capitalize">
                      {LOAN_TYPES.find((t) => t.value === offer.loanType)
                        ?.label ?? offer.loanType}
                    </span>
                  ) : (
                    <select
                      value={offer.loanType}
                      onChange={(e) =>
                        updateField(i, "loanType", e.target.value)
                      }
                      className={inputClass}
                    >
                      {LOAN_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>
                          {t.label}
                        </option>
                      ))}
                    </select>
                  )}
                </td>
              ))}
            </tr>
            {/* Closing Date */}
            <tr>
              <td className={labelClass}>Closing Date</td>
              {offers.map((offer, i) => (
                <td key={offer.id} className={cellClass}>
                  {readOnly ? (
                    <span className="text-sm">
                      {offer.closingDate
                        ? new Date(offer.closingDate).toLocaleDateString()
                        : "—"}
                    </span>
                  ) : (
                    <input
                      type="date"
                      value={offer.closingDate}
                      onChange={(e) =>
                        updateField(i, "closingDate", e.target.value)
                      }
                      className={inputClass}
                    />
                  )}
                </td>
              ))}
            </tr>

            {/* CONTINGENCIES */}
            <SectionHeader
              label="Contingencies"
              colSpan={offers.length + 1}
            />
            {(
              [
                ["inspectionContingency", "Inspection"],
                ["appraisalContingency", "Appraisal"],
                ["financingContingency", "Financing"],
                ["saleContingency", "Sale of Home"],
              ] as const
            ).map(([field, label]) => (
              <tr key={field}>
                <td className={labelClass}>{label}</td>
                {offers.map((offer, i) => {
                  const val = offer[field] as boolean;
                  return (
                    <td key={offer.id} className={cellClass}>
                      {readOnly ? (
                        <span
                          className={`text-sm font-medium ${
                            val ? "text-amber-600" : "text-xmre-green"
                          }`}
                        >
                          {val ? "Yes" : "No"}
                        </span>
                      ) : (
                        <button
                          onClick={() => updateField(i, field, !val)}
                          className={`px-3 py-1.5 rounded text-sm font-medium cursor-pointer transition-colors ${
                            val
                              ? "bg-amber-100 text-amber-700 hover:bg-amber-200"
                              : "bg-green-100 text-green-700 hover:bg-green-200"
                          }`}
                        >
                          {val ? "Yes" : "No"}
                        </button>
                      )}
                    </td>
                  );
                })}
              </tr>
            ))}

            {/* COSTS & CREDITS */}
            <SectionHeader
              label="Costs & Credits"
              colSpan={offers.length + 1}
            />
            {/* Seller Concessions */}
            <tr>
              <td className={labelClass}>Seller Concessions</td>
              {offers.map((offer, i) => (
                <td key={offer.id} className={cellClass}>
                  {readOnly ? (
                    <span className="text-sm">
                      {fmt(offer.sellerConcessions)}
                    </span>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-slate-400 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={offer.sellerConcessions || ""}
                        onChange={(e) =>
                          updateField(
                            i,
                            "sellerConcessions",
                            Number(e.target.value)
                          )
                        }
                        className={dollarInputClass}
                      />
                    </div>
                  )}
                </td>
              ))}
            </tr>
            {/* Listing Agent Commission */}
            <tr>
              <td className={labelClass}>Listing Agent Commission</td>
              {offers.map((offer, i) => (
                <td key={offer.id} className={cellClass}>
                  {readOnly ? (
                    <span className="text-sm">
                      {fmtPct(offer.listingAgentCommissionPercent)} (
                      {fmt(calculations[i].listingCommission)})
                    </span>
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        value={offer.listingAgentCommissionPercent || ""}
                        onChange={(e) =>
                          updateField(
                            i,
                            "listingAgentCommissionPercent",
                            Number(e.target.value)
                          )
                        }
                        className={pctInputClass}
                        step="0.25"
                      />
                      <span className="absolute right-2 top-2 text-slate-400 text-sm">
                        %
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-slate-400 mt-1">
                    = {fmt(calculations[i].listingCommission)}
                  </div>
                </td>
              ))}
            </tr>
            {/* Buyer Agent Commission */}
            <tr>
              <td className={labelClass}>Buyer Agent Commission</td>
              {offers.map((offer, i) => (
                <td key={offer.id} className={cellClass}>
                  {readOnly ? (
                    <span className="text-sm">
                      {fmtPct(offer.buyerAgentCommissionPercent)} (
                      {fmt(calculations[i].buyerAgentCommission)})
                    </span>
                  ) : (
                    <div className="relative">
                      <input
                        type="number"
                        value={offer.buyerAgentCommissionPercent || ""}
                        onChange={(e) =>
                          updateField(
                            i,
                            "buyerAgentCommissionPercent",
                            Number(e.target.value)
                          )
                        }
                        className={pctInputClass}
                        step="0.25"
                      />
                      <span className="absolute right-2 top-2 text-slate-400 text-sm">
                        %
                      </span>
                    </div>
                  )}
                  <div className="text-xs text-slate-400 mt-1">
                    = {fmt(calculations[i].buyerAgentCommission)}
                  </div>
                </td>
              ))}
            </tr>
            {/* Title/Escrow */}
            <tr>
              <td className={labelClass}>Title & Escrow Fees</td>
              {offers.map((offer, i) => (
                <td key={offer.id} className={cellClass}>
                  {readOnly ? (
                    <span className="text-sm">
                      {fmt(offer.titleEscrowFees)}
                    </span>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-slate-400 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={offer.titleEscrowFees || ""}
                        onChange={(e) =>
                          updateField(
                            i,
                            "titleEscrowFees",
                            Number(e.target.value)
                          )
                        }
                        className={dollarInputClass}
                      />
                    </div>
                  )}
                </td>
              ))}
            </tr>
            {/* Home Warranty */}
            <tr>
              <td className={labelClass}>Home Warranty</td>
              {offers.map((offer, i) => (
                <td key={offer.id} className={cellClass}>
                  {readOnly ? (
                    <span className="text-sm">{fmt(offer.homeWarranty)}</span>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-slate-400 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={offer.homeWarranty || ""}
                        onChange={(e) =>
                          updateField(
                            i,
                            "homeWarranty",
                            Number(e.target.value)
                          )
                        }
                        className={dollarInputClass}
                      />
                    </div>
                  )}
                </td>
              ))}
            </tr>
            {/* Other Credits */}
            <tr>
              <td className={labelClass}>Other Credits (to seller)</td>
              {offers.map((offer, i) => (
                <td key={offer.id} className={cellClass}>
                  {readOnly ? (
                    <span className="text-sm text-xmre-green">
                      {fmt(offer.otherCredits)}
                    </span>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-slate-400 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={offer.otherCredits || ""}
                        onChange={(e) =>
                          updateField(
                            i,
                            "otherCredits",
                            Number(e.target.value)
                          )
                        }
                        className={dollarInputClass}
                      />
                    </div>
                  )}
                </td>
              ))}
            </tr>
            {/* Other Debits */}
            <tr>
              <td className={labelClass}>Other Debits</td>
              {offers.map((offer, i) => (
                <td key={offer.id} className={cellClass}>
                  {readOnly ? (
                    <span className="text-sm">{fmt(offer.otherDebits)}</span>
                  ) : (
                    <div className="relative">
                      <span className="absolute left-2 top-2 text-slate-400 text-sm">
                        $
                      </span>
                      <input
                        type="number"
                        value={offer.otherDebits || ""}
                        onChange={(e) =>
                          updateField(
                            i,
                            "otherDebits",
                            Number(e.target.value)
                          )
                        }
                        className={dollarInputClass}
                      />
                    </div>
                  )}
                </td>
              ))}
            </tr>
            {/* Notes */}
            <tr>
              <td className={labelClass}>Notes</td>
              {offers.map((offer, i) => (
                <td key={offer.id} className={cellClass}>
                  {readOnly ? (
                    <span className="text-sm text-slate-600">
                      {offer.notes || "—"}
                    </span>
                  ) : (
                    <textarea
                      value={offer.notes}
                      onChange={(e) =>
                        updateField(i, "notes", e.target.value)
                      }
                      rows={2}
                      className={`${inputClass} resize-none`}
                      placeholder="Additional notes..."
                    />
                  )}
                </td>
              ))}
            </tr>

            {/* NET PROCEEDS */}
            <SectionHeader
              label="Net Proceeds"
              colSpan={offers.length + 1}
              highlight
            />
            <tr>
              <td className={labelClass}>Gross Proceeds (Offer Price)</td>
              {calculations.map((calc, i) => (
                <td key={offers[i].id} className={calcClass}>
                  {fmt(calc.grossProceeds)}
                </td>
              ))}
            </tr>
            <tr>
              <td className={labelClass}>Total Commissions</td>
              {calculations.map((calc, i) => (
                <td
                  key={offers[i].id}
                  className={`${calcClass} text-xmre-red`}
                >
                  -{fmt(calc.totalCommissions)}
                </td>
              ))}
            </tr>
            <tr>
              <td className={labelClass}>Total Closing Costs</td>
              {calculations.map((calc, i) => (
                <td
                  key={offers[i].id}
                  className={`${calcClass} text-xmre-red`}
                >
                  -{fmt(calc.totalClosingCosts)}
                </td>
              ))}
            </tr>
            <tr>
              <td className={labelClass}>Mortgage Payoff</td>
              {calculations.map((calc, i) => (
                <td
                  key={offers[i].id}
                  className={`${calcClass} text-xmre-red`}
                >
                  -{fmt(calc.mortgagePayoff)}
                </td>
              ))}
            </tr>
            {property.additionalPayoffs > 0 && (
              <tr>
                <td className={labelClass}>Additional Payoffs</td>
                {calculations.map((calc, i) => (
                  <td
                    key={offers[i].id}
                    className={`${calcClass} text-xmre-red`}
                  >
                    -{fmt(calc.additionalPayoffs)}
                  </td>
                ))}
              </tr>
            )}
            {/* NET TO SELLER - highlighted */}
            <tr className="bg-slate-50">
              <td className="sticky left-0 z-10 bg-slate-50 px-4 py-4 text-sm font-bold text-xmre-navy border-r border-slate-200 min-w-[200px]">
                NET TO SELLER
              </td>
              {calculations.map((calc, i) => (
                <td
                  key={offers[i].id}
                  className={`px-3 py-4 min-w-[200px] text-center ${
                    calculations.length > 1 && i === bestNetIndex
                      ? "bg-green-50"
                      : ""
                  }`}
                >
                  <div
                    className={`text-2xl font-bold ${
                      calc.netProceeds >= 0
                        ? "text-xmre-green"
                        : "text-xmre-red"
                    }`}
                  >
                    {fmt(calc.netProceeds)}
                  </div>
                  {property.listPrice > 0 && (
                    <div className="text-xs text-slate-500 mt-1">
                      {((calc.netProceeds / property.listPrice) * 100).toFixed(
                        1
                      )}
                      % of list price
                    </div>
                  )}
                </td>
              ))}
            </tr>
          </tbody>
        </table>
      </div>
    </div>
    </>
  );
}

function SectionHeader({
  label,
  colSpan,
  highlight,
}: {
  label: string;
  colSpan: number;
  highlight?: boolean;
}) {
  return (
    <tr>
      <td
        colSpan={colSpan}
        className={`px-4 py-2 text-xs font-bold uppercase tracking-wider border-b border-slate-200 ${
          highlight
            ? "bg-xmre-navy/5 text-xmre-navy"
            : "bg-slate-100 text-slate-500"
        }`}
      >
        {label}
      </td>
    </tr>
  );
}
