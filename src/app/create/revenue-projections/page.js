"use client";
import FormField from "../../components/formField";

export default function Create() {
    const fields = {
      commercialProjections: {
        label: "5 YoY Commercial Revenue Growth Rates (CSV)",
        placeholder: "",
        commaSeparated: true,
      },
      governmentProjections: {
        label: "5 YoY Government Revenue Growth Rates (CSV)",
        placeholder: "",
        commaSeparated: true,
      },
    };
  
    return (
      <FormField
        legend="Revenue Projections"
        fields={fields}
        nextRoute="/create/cost-projections"
        cancelRoute="/"
        storageKey="reveuneProjections"
      />
    );
}
