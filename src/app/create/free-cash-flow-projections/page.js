"use client";
import FormField from "../../components/formField";

export default function Create() {
    const fields = {
      depreciationAndAmortization: {
        label: "5 years of Depreciation and Amortization (as a % of revenue)",
        placeholder: "",
        commaSeparated: true,
      },
      capitalExpenditures: {
        label: "5 years of Capital Expenditures (as a % of revenue)",
        placeholder: "",
        commaSeparated: true,
      },
      changesInNWC: {
        label: "Changes in Net Working Capital (as a % of revenue)",
        placeholder: "",
        commaSeparated: true,
      },
    };
  
    return (
      <FormField
        legend="Free Cash Flow Projections"
        fields={fields}
        nextRoute="/create/dcf-inputs"
        cancelRoute="/"
        storageKey="freeCashFlowProjections"
      />
    );
}
