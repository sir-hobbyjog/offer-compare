"use client";

import { PropertyDetails } from "../lib/types";

interface Props {
  property: PropertyDetails;
  onChange: (property: PropertyDetails) => void;
  readOnly?: boolean;
}

export default function PropertySection({ property, onChange, readOnly }: Props) {
  const update = (field: keyof PropertyDetails, value: string | number) => {
    onChange({ ...property, [field]: value });
  };

  return (
    <div className="bg-white rounded-lg border border-slate-200 p-5 mb-6">
      <h2 className="text-lg font-semibold text-xmre-navy mb-4">
        Property Details
      </h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Property Address
          </label>
          <input
            type="text"
            value={property.address}
            onChange={(e) => update("address", e.target.value)}
            placeholder="123 Main St, City, UT"
            readOnly={readOnly}
            className="w-full px-3 py-2 md:py-2 py-2.5 border border-slate-300 rounded-md text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-xmre-navy/30 focus:border-xmre-navy"
          />
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            List Price
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              value={property.listPrice || ""}
              onChange={(e) => update("listPrice", Number(e.target.value))}
              placeholder="0"
              readOnly={readOnly}
              className="w-full pl-7 pr-3 py-2.5 md:py-2 border border-slate-300 rounded-md text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-xmre-navy/30 focus:border-xmre-navy"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Mortgage Balance
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              value={property.mortgageBalance || ""}
              onChange={(e) => update("mortgageBalance", Number(e.target.value))}
              placeholder="0"
              readOnly={readOnly}
              className="w-full pl-7 pr-3 py-2.5 md:py-2 border border-slate-300 rounded-md text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-xmre-navy/30 focus:border-xmre-navy"
            />
          </div>
        </div>
        <div>
          <label className="block text-xs font-medium text-slate-500 mb-1">
            Additional Payoffs (HELOC, liens)
          </label>
          <div className="relative">
            <span className="absolute left-3 top-2 text-slate-400 text-sm">$</span>
            <input
              type="number"
              value={property.additionalPayoffs || ""}
              onChange={(e) => update("additionalPayoffs", Number(e.target.value))}
              placeholder="0"
              readOnly={readOnly}
              className="w-full pl-7 pr-3 py-2.5 md:py-2 border border-slate-300 rounded-md text-base md:text-sm focus:outline-none focus:ring-2 focus:ring-xmre-navy/30 focus:border-xmre-navy"
            />
          </div>
        </div>
      </div>
    </div>
  );
}
