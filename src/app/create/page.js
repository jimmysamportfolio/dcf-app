"use client";
import FormField from "../components/formField";

export default function Create() {
    const fields = {
      revenue: {
        label: "Revenue",
        placeholder: "",
      },
      costOfGoodsSold: {
        label: "COGS",
        placeholder: "",
      },
      SGNA: {
        label: "SGNA",
        placeholder: "",
      },
      RND: {
        label: "RND",
        placeholder: "",
      },
      shareCount: {
        label: "Share Count",
        placeholder: "",
      },
    };
  
    return (
      <FormField
        legend="Historical Data"
        fields={fields}
        nextRoute="/create/revenue-projections"
        cancelRoute="/"
        storageKey="historicalData"
      />
    );
}
