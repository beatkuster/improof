"use client";

import type { NextPage } from "next";

const Home: NextPage = () => {
  return (
    <>
      <div className="flex items-center flex-col flex-grow pt-10">
        <div className="px-5">
          <h1 className="text-left">
            <span className="block text-4xl font-bold">ImProof – Impact, but with proof</span>
          </h1>

          <p className="text-left text-lg">
            ImProof enables people to save small amounts of money daily - not just to accumulate savings but to create
            real, verifiable impact. Unlike traditional donations, funds are only released when predefined, objective
            conditions are met. This ensures that donations trigger actual change and reach their intended impact.
            <br />
            <br />
            ImProof enables micro-donations that are only released when verifiable impact is proven through independent,
            publicly available data sources. We combine smart contracts, Chainlink oracles, and ENS identities to create
            transparent and accountable charitable giving.
            <br />
            <br />
            To drive meaningful change, we rely on independent, publicly available data sources that confirm whether a
            project meets its goals, which then triggers the release of funds. Crucially, these data sources are not
            controlled by the donation recipients, guaranteeing transparency and trust.
            <br />
            <br />
          </p>
        </div>
      </div>
    </>
  );
};

export default Home;
