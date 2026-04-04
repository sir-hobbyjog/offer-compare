"use client";

import { useState, useEffect, useCallback } from "react";
import Header from "./components/Header";
import PropertySection from "./components/PropertySection";
import ComparisonTable from "./components/ComparisonTable";
import {
  ComparisonState,
  createDefaultOffer,
  createDefaultProperty,
  Offer,
  PropertyDetails,
} from "./lib/types";
import { decodeState, generateShareUrl } from "./lib/sharing";

export default function Home() {
  const [property, setProperty] = useState<PropertyDetails>(
    createDefaultProperty()
  );
  const [offers, setOffers] = useState<Offer[]>([]);
  const [readOnly, setReadOnly] = useState(false);
  const [shareUrl, setShareUrl] = useState("");
  const [copied, setCopied] = useState(false);
  const [loaded, setLoaded] = useState(false);

  // Load from URL on mount
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const data = params.get("d");
    if (data) {
      const state = decodeState(data);
      if (state) {
        setProperty(state.property);
        setOffers(state.offers);
        setReadOnly(true);
      }
    }
    setLoaded(true);
  }, []);

  const addOffer = useCallback(() => {
    setOffers((prev) => [...prev, createDefaultOffer(prev.length + 1)]);
  }, []);

  const updateOffer = useCallback((index: number, offer: Offer) => {
    setOffers((prev) => prev.map((o, i) => (i === index ? offer : o)));
  }, []);

  const removeOffer = useCallback((index: number) => {
    setOffers((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const handleShare = useCallback(() => {
    const state: ComparisonState = { property, offers };
    const url = generateShareUrl(state);
    setShareUrl(url);
    navigator.clipboard.writeText(url).then(() => {
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    });
  }, [property, offers]);

  const handleEdit = useCallback(() => {
    setReadOnly(false);
    // Clear URL params
    window.history.replaceState({}, "", window.location.pathname);
  }, []);

  const handlePrint = useCallback(() => {
    window.print();
  }, []);

  const handleReset = useCallback(() => {
    if (
      window.confirm(
        "Clear all data and start fresh? This cannot be undone."
      )
    ) {
      setProperty(createDefaultProperty());
      setOffers([]);
      setReadOnly(false);
      setShareUrl("");
      window.history.replaceState({}, "", window.location.pathname);
    }
  }, []);

  if (!loaded) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-slate-400">Loading...</div>
      </div>
    );
  }

  return (
    <>
      <Header />
      <main className="flex-1 max-w-[1400px] mx-auto w-full px-4 sm:px-6 py-6">
        {/* Action bar */}
        <div className="flex flex-wrap items-center gap-3 mb-6 no-print">
          {readOnly ? (
            <>
              <button
                onClick={handleEdit}
                className="px-4 py-2 bg-xmre-navy text-white text-sm font-medium rounded-md hover:bg-xmre-navy/90 transition-colors cursor-pointer"
              >
                Edit Comparison
              </button>
              <button
                onClick={handlePrint}
                className="px-4 py-2 bg-white border border-slate-300 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
              >
                Print / PDF
              </button>
            </>
          ) : (
            <>
              <button
                onClick={addOffer}
                className="px-4 py-2 bg-xmre-navy text-white text-sm font-medium rounded-md hover:bg-xmre-navy/90 transition-colors cursor-pointer"
              >
                + Add Offer
              </button>
              {offers.length > 0 && (
                <>
                  <button
                    onClick={handleShare}
                    className="px-4 py-2 bg-xmre-gold text-white text-sm font-medium rounded-md hover:bg-xmre-gold/90 transition-colors cursor-pointer"
                  >
                    {copied ? "Link Copied!" : "Share Link"}
                  </button>
                  <button
                    onClick={handlePrint}
                    className="px-4 py-2 bg-white border border-slate-300 text-sm font-medium rounded-md hover:bg-slate-50 transition-colors cursor-pointer"
                  >
                    Print / PDF
                  </button>
                  <button
                    onClick={handleReset}
                    className="px-4 py-2 text-slate-400 text-sm hover:text-xmre-red transition-colors cursor-pointer"
                  >
                    Reset
                  </button>
                </>
              )}
            </>
          )}
        </div>

        {/* Share URL display */}
        {shareUrl && (
          <div className="mb-6 p-3 bg-green-50 border border-green-200 rounded-md no-print">
            <div className="flex items-center gap-2">
              <span className="text-sm text-green-800 font-medium">
                Shareable link:
              </span>
              <input
                type="text"
                readOnly
                value={shareUrl}
                className="flex-1 text-xs bg-white border border-green-300 rounded px-2 py-1 text-slate-600"
                onFocus={(e) => e.target.select()}
              />
              <button
                onClick={() => {
                  navigator.clipboard.writeText(shareUrl);
                  setCopied(true);
                  setTimeout(() => setCopied(false), 2000);
                }}
                className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors cursor-pointer"
              >
                {copied ? "Copied!" : "Copy"}
              </button>
            </div>
          </div>
        )}

        {/* Property details */}
        <PropertySection
          property={property}
          onChange={setProperty}
          readOnly={readOnly}
        />

        {/* Comparison table */}
        <ComparisonTable
          offers={offers}
          property={property}
          onUpdateOffer={updateOffer}
          onRemoveOffer={removeOffer}
          readOnly={readOnly}
        />

        {/* Empty state */}
        {offers.length === 0 && !readOnly && (
          <div className="mt-6 text-center">
            <p className="text-slate-500 mb-4">
              Start by adding property details above, then add offers to
              compare.
            </p>
            <button
              onClick={addOffer}
              className="px-6 py-3 bg-xmre-navy text-white font-medium rounded-md hover:bg-xmre-navy/90 transition-colors cursor-pointer"
            >
              + Add First Offer
            </button>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="bg-slate-100 border-t border-slate-200 py-4 px-6 text-center text-xs text-slate-500 no-print">
        <p>
          Extra Mile Real Estate &mdash; Offer Compare Tool
        </p>
        <p className="mt-1">
          This is an estimate only. Actual proceeds may vary based on final
          closing costs and adjustments.
        </p>
      </footer>
    </>
  );
}
