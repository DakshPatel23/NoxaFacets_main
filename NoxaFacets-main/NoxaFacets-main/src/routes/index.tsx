import { createFileRoute } from "@tanstack/react-router";
import { useState } from "react";

export const Route = createFileRoute("/")({
  head: () => ({
    meta: [
      { title: "Custom Jewelry Pricing Calculator" },
      { name: "description", content: "Calculate custom jewelry pricing with gold, diamonds, baguettes and commission." },
    ],
  }),
  component: Calculator,
});

// =====================================================================
// EDIT PRICES HERE — change any number and the calculator updates.
// All prices are in EURO (€).
// =====================================================================

// Gold price per gram, by karat
const GOLD_PRICES: Record<string, number> = {
  "10K": 56.25,
  "14K": 78.75,
  "18K": 101.25,
};

// Labour charge added to every quote (flat €)
const LABOUR_CHARGE = 10;

// Loss percentage (7% => 0.07)
const LOSS_PERCENT = 0.07;

// Commission percentage (30% => 0.30)
const COMMISSION_PERCENT = 0.30;

// Natural round diamond prices per carat (shown as multi-quote at the bottom)
const NATURAL_ROUND_PRICES = [250, 275, 325, 400, 450, 425, 650];

// CVD / lab-grown diamond prices per carat.
// Base price is 100. Each "-2 / -3 ..." step adds +50.
const CVD_PRICES = [
  { label: "CVD",    price: 100 },
  { label: "CVD -2", price: 150 },
  { label: "CVD -3", price: 200 },
  { label: "CVD -4", price: 250 },
  { label: "CVD -5", price: 300 },
];

// Baguette diamond price per carat
const BAGUETTE_PRICE = 345.4;

// =====================================================================
// You usually don't need to edit anything below this line.
// =====================================================================

function num(v: string) {
  const n = parseFloat(v);
  return isNaN(n) ? 0 : n;
}

function Calculator() {
  const [goldKarat, setGoldKarat] = useState<keyof typeof GOLD_PRICES | string>("10K");
  const [goldPrice, setGoldPrice] = useState<number>(GOLD_PRICES["10K"]);
  const [goldWeight, setGoldWeight] = useState("");

  const [roundWeight, setRoundWeight] = useState("");
  const [roundPrice, setRoundPrice] = useState<number>(NATURAL_ROUND_PRICES[0]);

  const [cvdWeight, setCvdWeight] = useState("");
  const [cvdPrice, setCvdPrice] = useState<number>(CVD_PRICES[0].price);

  const [baguetteWeight, setBaguetteWeight] = useState("");
  const [baguettePrice, setBaguettePrice] = useState<number>(BAGUETTE_PRICE);

  const [miscWeight, setMiscWeight] = useState("");
  const [miscPrice, setMiscPrice] = useState<number>(0);

  const goldTotal = goldPrice * num(goldWeight);
  const roundTotal = roundPrice * num(roundWeight);
  const cvdTotal = cvdPrice * num(cvdWeight);
  const baguetteTotal = baguettePrice * num(baguetteWeight);
  const miscTotal = miscPrice * num(miscWeight);

  // Subtotal without round (so we can show a list of round-price quotes)
  const totalWithoutRound = goldTotal + cvdTotal + baguetteTotal + miscTotal + LABOUR_CHARGE;

  function finalQuote(roundCt: number, perCarat: number) {
    const subtotal = totalWithoutRound + roundCt * perCarat;
    // apply loss, then commission
    const withLoss = subtotal * (1 + LOSS_PERCENT);
    const withCommission = withLoss * (1 + COMMISSION_PERCENT);
    // round up to nearest 10€ like the original
    return Math.ceil(withCommission / 10) * 10;
  }

  function handleKaratChange(k: string) {
    setGoldKarat(k);
    setGoldPrice(GOLD_PRICES[k] ?? 0);
  }

  function resetForm() {
    setGoldWeight("");
    setRoundWeight("");
    setCvdWeight("");
    setBaguetteWeight("");
    setMiscWeight("");
    setRoundPrice(NATURAL_ROUND_PRICES[0]);
    setCvdPrice(CVD_PRICES[0].price);
    setBaguettePrice(BAGUETTE_PRICE);
    setMiscPrice(0);
  }

  function copyQuotes(e: React.MouseEvent) {
    e.preventDefault();
    const rWeight = num(roundWeight);
    const text = NATURAL_ROUND_PRICES.map(
      (v) => `€${v} / Ct = ${finalQuote(rWeight, v)}`
    ).join("\n");
    navigator.clipboard?.writeText(text);
  }

  const inputCls =
    "w-20 text-center text-gray-600 border-0 border-b border-black bg-transparent focus:outline-none mx-2";
  const selectCls = "text-gray-600 border border-gray-300 rounded px-2 py-1 bg-white";

  return (
    <div className="min-h-screen bg-white">
      {/* Branding bar */}
      <div className="py-4" style={{ backgroundColor: "#e7f5fe" }}>
        <h1
          className="text-center text-2xl font-bold tracking-wide text-gray-800"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Noxa Facets
        </h1>
      </div>

      <section className="mx-auto max-w-3xl p-4 md:p-10">
        <h3
          className="text-center text-2xl py-2"
          style={{ fontFamily: "Georgia, serif" }}
        >
          Custom Jewelry Pricing
        </h3>

        {/* GOLD */}
        <div className="gold-containers">
          <div className="flex items-center mb-3">
            <h4 className="me-2 m-0 text-lg font-semibold mr-2">Gold</h4>
            <input
              type="number"
              className={inputCls}
              value={goldWeight}
              onChange={(e) => setGoldWeight(e.target.value)}
              aria-label="Grams"
            />
            <span className="text-gray-500">Gr.</span>
          </div>

          <div className="flex items-center mb-3 pr-10 flex-wrap gap-2">
            <select
              className={selectCls}
              value={goldKarat}
              onChange={(e) => handleKaratChange(e.target.value)}
            >
              {Object.keys(GOLD_PRICES).map((k) => (
                <option key={k} value={k}>{k}</option>
              ))}
            </select>
            <label className="text-gray-500">&nbsp;€&nbsp;</label>
            <input
              type="number"
              className={inputCls}
              value={goldPrice}
              onChange={(e) => setGoldPrice(num(e.target.value))}
              aria-label="Price per gram"
            />
            <label className="mx-3 text-gray-500">=</label>
            <label className="text-gray-700">{goldTotal.toFixed(2)}</label>
          </div>
        </div>

        <hr className="my-4" />

        {/* ROUND DIAMONDS */}
        <div className="round-diam-container">
          <div className="flex items-center mb-3">
            <h4 className="text-lg font-semibold mr-2">Round Diamonds (Natural)</h4>
            <input
              type="number"
              className={inputCls}
              value={roundWeight}
              onChange={(e) => setRoundWeight(e.target.value)}
              aria-label="Carat weight"
            />
            <span className="text-gray-500">Ctw.</span>
          </div>
          <div className="flex items-center mb-3 pr-10 flex-wrap gap-2">
            <select
              className={selectCls}
              value={roundPrice}
              onChange={(e) => setRoundPrice(num(e.target.value))}
            >
              {NATURAL_ROUND_PRICES.map((p) => (
                <option key={p} value={p}>€{p}</option>
              ))}
            </select>
            <label className="mx-3 text-gray-500">=</label>
            <label className="text-gray-700">{roundTotal.toFixed(2)}</label>
          </div>
        </div>

        <hr className="my-4" />

        {/* CVD (Lab Grown) */}
        <div className="cvd-diam-container">
          <div className="flex items-center mb-3">
            <h4 className="text-lg font-semibold mr-2">CVD Diamonds (Lab Grown)</h4>
            <input
              type="number"
              className={inputCls}
              value={cvdWeight}
              onChange={(e) => setCvdWeight(e.target.value)}
              aria-label="Carat weight"
            />
            <span className="text-gray-500">Ctw.</span>
          </div>
          <div className="flex items-center mb-3 pr-10 flex-wrap gap-2">
            <select
              className={selectCls}
              value={cvdPrice}
              onChange={(e) => setCvdPrice(num(e.target.value))}
            >
              {CVD_PRICES.map((c) => (
                <option key={c.label} value={c.price}>
                  {c.label} — €{c.price}
                </option>
              ))}
            </select>
            <label className="mx-3 text-gray-500">=</label>
            <label className="text-gray-700">{cvdTotal.toFixed(2)}</label>
          </div>
        </div>

        <hr className="my-4" />

        {/* BAGUETTE */}
        <div className="baguette-diam-container">
          <div className="flex items-center mb-3">
            <h4 className="text-lg font-semibold mr-2">Baguette Diamonds</h4>
            <input
              type="number"
              className={inputCls}
              value={baguetteWeight}
              onChange={(e) => setBaguetteWeight(e.target.value)}
              aria-label="Carat weight"
            />
            <span className="text-gray-500">Ctw.</span>
          </div>
          <div className="flex items-center mb-3 pr-10 flex-wrap gap-2">
            <label className="text-gray-500">€</label>
            <input
              type="number"
              className={inputCls}
              value={baguettePrice}
              onChange={(e) => setBaguettePrice(num(e.target.value))}
              aria-label="Rate"
            />
            <label className="mx-3 text-gray-500">=</label>
            <label className="text-gray-700">{baguetteTotal.toFixed(2)}</label>
          </div>
        </div>

        <hr className="my-4" />

        {/* MISC DIAMOND */}
        <div className="misc-diam-container">
          <div className="flex items-center mb-3">
            <h4 className="text-lg font-semibold mr-2">Misc Diamond</h4>
            <input
              type="number"
              className={inputCls}
              value={miscWeight}
              onChange={(e) => setMiscWeight(e.target.value)}
              aria-label="Carat weight"
            />
            <span className="text-gray-500">Ctw.</span>
          </div>
          <div className="flex items-center mb-3 pr-10 flex-wrap gap-2">
            <label className="text-gray-500">€</label>
            <input
              type="number"
              className={inputCls}
              value={miscPrice}
              onChange={(e) => setMiscPrice(num(e.target.value))}
              aria-label="Rate per carat"
            />
            <label className="mx-3 text-gray-500">=</label>
            <label className="text-gray-700">{miscTotal.toFixed(2)}</label>
          </div>
        </div>

        <hr className="my-4" />
        <div className="text-sm text-gray-500 mb-3">
          Includes labour €{LABOUR_CHARGE.toFixed(2)}, loss {(LOSS_PERCENT * 100).toFixed(0)}%, commission {(COMMISSION_PERCENT * 100).toFixed(0)}%.
        </div>

        {/* TOTAL */}
        <div className="total-container">
          <div className="flex justify-between items-center">
            <h3 className="text-blue-700 text-2xl font-semibold">Grand Total</h3>
            <button
              type="button"
              onClick={resetForm}
              className="text-2xl text-gray-700 hover:text-black"
            >
              Clear
            </button>
          </div>
          <div className="p-3 mt-2 border border-gray-400 relative">
            <div>
              {NATURAL_ROUND_PRICES.map((value) => {
                const rWeight = num(roundWeight);
                return (
                  <div className="flex items-center" key={value}>
                    <span className="text-lg">€{value} / ct = </span>
                    <span className="text-lg ml-2 font-medium">
                      €{finalQuote(rWeight, value)}
                    </span>
                  </div>
                );
              })}
            </div>
            <div className="absolute right-2 top-2">
              <button
                onClick={copyQuotes}
                className="px-3 py-1 border border-gray-400 rounded hover:bg-gray-100 text-sm"
              >
                Copy
              </button>
            </div>
          </div>
        </div>
      </section>
    </div>
  );
}
