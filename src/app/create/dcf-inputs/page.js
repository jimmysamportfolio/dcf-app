"use client";
import FormField from "../../components/formField";

export default function Create() {
    const fields = {
      wacc: {
        label: "WACC",
        placeholder: "",
      },
      perpGrowthRate: {
        label: "Perpituity Growth Rate",
        placeholder: "",
      },
      exitMultiple: {
        label: "Exit Multiple",
        placeholder: "",
      },
      cashBalance: {
        label: "Cash Balance",
        placeholder: "",
      },
      debt: {
        label: "Debt",
        placeholder: "",
      },
    };
  
    return (
      <FormField
        legend="DCF Inputs"
        fields={fields}
        nextRoute="/create/result"
        cancelRoute="/"
        storageKey="dcfInputs"
      />
    );
}
