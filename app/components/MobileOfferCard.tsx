"use client";

import {
  Offer,
  PropertyDetails,
  calculateNet,
  NetCalculation,
} from "../lib/types";

interface Props {
  offer: Offer;
  index: number;
  property: PropertyDetails;
  isBest: boolean;
  totalOffers: number;
  onUpdate: (index: number, offer: Offer) => void;
  onRemove: (index: number) => void;
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

export default function MobileOfferCard({
  offer,
  index,
  property,
  isBest,
  totalOffers,
  onUpdate,
  onRemove,
  readOnly,
}: Props) {
  const calc: NetCalculation = calculateNet(offer, property);

  const update = (field: keyof Offer, value: string | number | boolean) => {
    onUpdate(index, { ...offer, [field]: value });
  };

  const diff = offer.offerPrice - property.listPrice;
  const diffPct =
    property.listPrice > 0
      ? ((diff / property.listPrice) * 100).toFixed(1)
      : "0";

  const inputClass =
    "w-full px-3 py-2.5 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-xmre-navy/30 focus:border-xmre-navy bg-white";
  const dollarInputClass =
    "w-full pl-8 pr-3 py-2.5 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-xmre-navy/30 focus:border-xmre-navy bg-white";
  const pctInputClass =
    "w-full pr-8 pl-3 py-2.5 border border-slate-300 rounded-lg text-base focus:outline-none focus:ring-2 focus:ring-xmre-navy/30 focus:border-xmre-navy bg-white";

  return (
    <div
      className={`bg-white rounded-xl border-2 ${
        isBest && totalOffers > 1
          ? "border-xmre-green shadow-md"
          : "border-slate-200"
      } overflow-hidden`}
    >
      {/* Card header */}
      <div className="bg-xmre-navy text-white px-4 py-3 flex items-center justify-between">
        <div>
          {readOnly ? (
            <span className="font-semibold">
              {offer.buyerName || `Offer ${index + 1}`}
            </span>
          ) : (
            <input
              type="text"
              value={offer.buyerName}
              onChange={(e) => update("buyerName", e.target.value)}
              className="bg-transparent border-b border-white/40 text-white font-semibold text-base focus:outline-none focus:border-white placeholder-white/50 w-40"
              placeholder={`Offer ${index + 1}`}
            />
          )}
          {isBest && totalOffers > 1 && (
            <span className="ml-2 text-[10px] bg-green-500/30 text-green-200 px-2 py-0.5 rounded-full uppercase tracking-wider font-medium">
              Best Net
            </span>
          )}
        </div>
        {!readOnly && (
          <button
            onClick={() => onRemove(index)}
            className="text-white/50 hover:text-white text-xl cursor-pointer p-1"
          >
            &times;
          </button>
        )}
      </div>

      {/* Net to seller - prominent at top */}
      <div
        className={`px-4 py-4 text-center ${
          isBest && totalOffers > 1 ? "bg-green-50" : "bg-slate-50"
        } border-b border-slate-200`}
      >
        <div className="text-xs text-slate-500 uppercase tracking-wider mb-1">
          Net to Seller
        </div>
        <div
          className={`text-3xl font-bold ${
            calc.netProceeds >= 0 ? "text-xmre-green" : "text-xmre-red"
          }`}
        >
          {fmt(calc.netProceeds)}
        </div>
        {property.listPrice > 0 && (
          <div className="text-xs text-slate-500 mt-1">
            {((calc.netProceeds / property.listPrice) * 100).toFixed(1)}% of
            list price
          </div>
        )}
      </div>

      <div className="px-4 py-3 space-y-4">
        {/* Offer Terms */}
        <Section label="Offer Terms">
          <Field label="Offer Price">
            {readOnly ? (
              <Value>{fmt(offer.offerPrice)}</Value>
            ) : (
              <DollarInput
                value={offer.offerPrice}
                onChange={(v) => update("offerPrice", v)}
                className={dollarInputClass}
              />
            )}
            {property.listPrice > 0 && (
              <div
                className={`text-xs mt-1 ${
                  diff >= 0 ? "text-xmre-green" : "text-xmre-red"
                }`}
              >
                {diff >= 0 ? "+" : ""}
                {fmt(diff)} ({diff >= 0 ? "+" : ""}
                {diffPct}% vs list)
              </div>
            )}
          </Field>
          <Field label="Earnest Money">
            {readOnly ? (
              <Value>{fmt(offer.earnestMoney)}</Value>
            ) : (
              <DollarInput
                value={offer.earnestMoney}
                onChange={(v) => update("earnestMoney", v)}
                className={dollarInputClass}
              />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Down Payment %">
              {readOnly ? (
                <Value>{fmtPct(offer.downPaymentPercent)}</Value>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    value={offer.downPaymentPercent || ""}
                    onChange={(e) =>
                      update("downPaymentPercent", Number(e.target.value))
                    }
                    className={pctInputClass}
                    step="0.5"
                  />
                  <span className="absolute right-3 top-3 text-slate-400 text-sm">
                    %
                  </span>
                </div>
              )}
            </Field>
            <Field label="Loan Type">
              {readOnly ? (
                <Value>
                  {LOAN_TYPES.find((t) => t.value === offer.loanType)?.label ??
                    offer.loanType}
                </Value>
              ) : (
                <select
                  value={offer.loanType}
                  onChange={(e) => update("loanType", e.target.value)}
                  className={inputClass}
                >
                  {LOAN_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              )}
            </Field>
          </div>
          <Field label="Closing Date">
            {readOnly ? (
              <Value>
                {offer.closingDate
                  ? new Date(offer.closingDate).toLocaleDateString()
                  : "—"}
              </Value>
            ) : (
              <input
                type="date"
                value={offer.closingDate}
                onChange={(e) => update("closingDate", e.target.value)}
                className={inputClass}
              />
            )}
          </Field>
        </Section>

        {/* Contingencies */}
        <Section label="Contingencies">
          <div className="grid grid-cols-2 gap-2">
            {(
              [
                ["inspectionContingency", "Inspection"],
                ["appraisalContingency", "Appraisal"],
                ["financingContingency", "Financing"],
                ["saleContingency", "Sale of Home"],
              ] as const
            ).map(([field, label]) => {
              const val = offer[field] as boolean;
              return (
                <div key={field}>
                  {readOnly ? (
                    <div className="flex items-center justify-between py-2">
                      <span className="text-sm text-slate-600">{label}</span>
                      <span
                        className={`text-sm font-medium ${
                          val ? "text-amber-600" : "text-xmre-green"
                        }`}
                      >
                        {val ? "Yes" : "No"}
                      </span>
                    </div>
                  ) : (
                    <button
                      onClick={() => update(field, !val)}
                      className={`w-full px-3 py-2.5 rounded-lg text-sm font-medium cursor-pointer transition-colors text-center ${
                        val
                          ? "bg-amber-100 text-amber-700"
                          : "bg-green-100 text-green-700"
                      }`}
                    >
                      {label}: {val ? "Yes" : "No"}
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </Section>

        {/* Costs & Credits */}
        <Section label="Costs & Credits">
          <Field label="Seller Concessions">
            {readOnly ? (
              <Value>{fmt(offer.sellerConcessions)}</Value>
            ) : (
              <DollarInput
                value={offer.sellerConcessions}
                onChange={(v) => update("sellerConcessions", v)}
                className={dollarInputClass}
              />
            )}
          </Field>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Listing Commission">
              {readOnly ? (
                <Value>
                  {fmtPct(offer.listingAgentCommissionPercent)}
                </Value>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    value={offer.listingAgentCommissionPercent || ""}
                    onChange={(e) =>
                      update(
                        "listingAgentCommissionPercent",
                        Number(e.target.value)
                      )
                    }
                    className={pctInputClass}
                    step="0.25"
                  />
                  <span className="absolute right-3 top-3 text-slate-400 text-sm">
                    %
                  </span>
                </div>
              )}
              <div className="text-xs text-slate-400 mt-1">
                = {fmt(calc.listingCommission)}
              </div>
            </Field>
            <Field label="Buyer Commission">
              {readOnly ? (
                <Value>
                  {fmtPct(offer.buyerAgentCommissionPercent)}
                </Value>
              ) : (
                <div className="relative">
                  <input
                    type="number"
                    value={offer.buyerAgentCommissionPercent || ""}
                    onChange={(e) =>
                      update(
                        "buyerAgentCommissionPercent",
                        Number(e.target.value)
                      )
                    }
                    className={pctInputClass}
                    step="0.25"
                  />
                  <span className="absolute right-3 top-3 text-slate-400 text-sm">
                    %
                  </span>
                </div>
              )}
              <div className="text-xs text-slate-400 mt-1">
                = {fmt(calc.buyerAgentCommission)}
              </div>
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Title & Escrow">
              {readOnly ? (
                <Value>{fmt(offer.titleEscrowFees)}</Value>
              ) : (
                <DollarInput
                  value={offer.titleEscrowFees}
                  onChange={(v) => update("titleEscrowFees", v)}
                  className={dollarInputClass}
                />
              )}
            </Field>
            <Field label="Home Warranty">
              {readOnly ? (
                <Value>{fmt(offer.homeWarranty)}</Value>
              ) : (
                <DollarInput
                  value={offer.homeWarranty}
                  onChange={(v) => update("homeWarranty", v)}
                  className={dollarInputClass}
                />
              )}
            </Field>
          </div>
          <div className="grid grid-cols-2 gap-3">
            <Field label="Other Credits">
              {readOnly ? (
                <Value className="text-xmre-green">
                  {fmt(offer.otherCredits)}
                </Value>
              ) : (
                <DollarInput
                  value={offer.otherCredits}
                  onChange={(v) => update("otherCredits", v)}
                  className={dollarInputClass}
                />
              )}
            </Field>
            <Field label="Other Debits">
              {readOnly ? (
                <Value>{fmt(offer.otherDebits)}</Value>
              ) : (
                <DollarInput
                  value={offer.otherDebits}
                  onChange={(v) => update("otherDebits", v)}
                  className={dollarInputClass}
                />
              )}
            </Field>
          </div>
          <Field label="Notes">
            {readOnly ? (
              <Value>{offer.notes || "—"}</Value>
            ) : (
              <textarea
                value={offer.notes}
                onChange={(e) => update("notes", e.target.value)}
                rows={2}
                className={`${inputClass} resize-none`}
                placeholder="Additional notes..."
              />
            )}
          </Field>
        </Section>

        {/* Breakdown */}
        <Section label="Net Breakdown">
          <div className="space-y-1.5">
            <BreakdownRow label="Gross Proceeds" value={fmt(calc.grossProceeds)} />
            <BreakdownRow
              label="Total Commissions"
              value={`-${fmt(calc.totalCommissions)}`}
              negative
            />
            <BreakdownRow
              label="Total Closing Costs"
              value={`-${fmt(calc.totalClosingCosts)}`}
              negative
            />
            <BreakdownRow
              label="Mortgage Payoff"
              value={`-${fmt(calc.mortgagePayoff)}`}
              negative
            />
            {property.additionalPayoffs > 0 && (
              <BreakdownRow
                label="Additional Payoffs"
                value={`-${fmt(calc.additionalPayoffs)}`}
                negative
              />
            )}
          </div>
        </Section>
      </div>
    </div>
  );
}

function Section({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <div className="text-[11px] font-bold uppercase tracking-wider text-slate-400 mb-2">
        {label}
      </div>
      <div className="space-y-3">{children}</div>
    </div>
  );
}

function Field({
  label,
  children,
}: {
  label: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="block text-xs font-medium text-slate-500 mb-1">
        {label}
      </label>
      {children}
    </div>
  );
}

function Value({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <div className={`text-sm font-medium text-slate-800 py-1 ${className}`}>
      {children}
    </div>
  );
}

function DollarInput({
  value,
  onChange,
  className,
}: {
  value: number;
  onChange: (v: number) => void;
  className: string;
}) {
  return (
    <div className="relative">
      <span className="absolute left-3 top-3 text-slate-400 text-sm">$</span>
      <input
        type="number"
        value={value || ""}
        onChange={(e) => onChange(Number(e.target.value))}
        className={className}
      />
    </div>
  );
}

function BreakdownRow({
  label,
  value,
  negative,
}: {
  label: string;
  value: string;
  negative?: boolean;
}) {
  return (
    <div className="flex justify-between items-center py-1">
      <span className="text-xs text-slate-600">{label}</span>
      <span
        className={`text-sm font-medium ${
          negative ? "text-xmre-red" : "text-slate-800"
        }`}
      >
        {value}
      </span>
    </div>
  );
}
