"use client";
import FormField from "../../components/formField";

export default function Create() {
  const fields = {
    grossMargin: {
      label: "5 Year Gross Margin (%)",
      placeholder: "",
      commaSeparated: true,
    },
    researchAndDevelopment: {
      label: "5 Year R&D (%)",
      placeholder: "",
      commaSeparated: true,
    },
    sellingGeneralAndAdministrativeExpenses: {
      label: "5 Year SG&A (%)",
      placeholder: "",
      commaSeparated: true,
    },
    taxRate: {
      label: "Tax Rate (%)",
      placeholder: "",
      commaSeparated: true,
    },
  };

  return (
    <FormField
      legend="Cost Projections"
      fields={fields}
      nextRoute="/create/free-cash-flow-projections"
      cancelRoute="/"
      storageKey="costProjections"
    />
  );
}
