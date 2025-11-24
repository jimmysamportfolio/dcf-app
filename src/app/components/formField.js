"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";

/**
 * Reusable form field component
 * @param {string} legend - The legend text for the fieldset
 * @param {Object} fields - Object where keys are field names and values are {label, placeholder, commaSeparated}
 * @param {Function} onNext - Callback function when Next button is clicked, receives form values
 * @param {string} nextRoute - Route to navigate to on Next (optional if onNext is provided)
 * @param {string} cancelRoute - Route to navigate to on Cancel (defaults to "/")
 * @param {string} storageKey - Key to use for localStorage (defaults to "formData")
 */
export default function FormField({
  legend,
  fields,
  onNext,
  nextRoute,
  cancelRoute = "/",
  storageKey = "formData",
}) {
  const router = useRouter();
  const [formValues, setFormValues] = useState({});

  const handleInputChange = (fieldName, value) => {
    const fieldConfig = fields[fieldName];
    
    // For comma-separated fields, store the raw string in state
    // We'll only parse to array when saving to localStorage
    setFormValues((prev) => ({
      ...prev,
      [fieldName]: value,
    }));
  };

  const handleNext = () => {
    // Process comma-separated fields into arrays before storing
    const valuesToStore = {};
    
    Object.entries(formValues).forEach(([fieldName, value]) => {
      const fieldConfig = fields[fieldName];
      
      if (fieldConfig?.commaSeparated && typeof value === 'string') {
        // Parse comma-separated string into array
        if (value.trim() === '') {
          valuesToStore[fieldName] = [];
        } else {
          valuesToStore[fieldName] = value
            .split(',')
            .map(item => item.trim())
            .filter(item => item !== '')
            .map(item => {
              // Try to parse as number, keep as string if not a number
              const num = parseFloat(item);
              return isNaN(num) ? item : num;
            });
        }
      } else {
        valuesToStore[fieldName] = value;
      }
    });
    
    // Save to localStorage before proceeding
    if (typeof window !== 'undefined') {
      try {
        localStorage.setItem(storageKey, JSON.stringify(valuesToStore));
      } catch (error) {
        console.error('Error saving to localStorage:', error);
      }
    }
    
    if (onNext) {
      // Pass the values (with arrays) to callback
      onNext(valuesToStore);
    } else if (nextRoute) {
      router.push(nextRoute);
    }
  };

  const handleCancel = () => {
    router.push(cancelRoute);
  };

  return (
    <main className="p-6 flex h-screen items-center justify-center">
      <fieldset className="fieldset bg-base-200 border-base-300 rounded-box w-xs border p-4">
        <legend className="fieldset-legend">{legend}</legend>

        {Object.entries(fields).map(([fieldName, fieldConfig]) => {
          // Display raw string value for all fields
          const displayValue = formValues[fieldName] || "";
          
          // Calculate array preview for comma-separated fields
          const arrayPreview = fieldConfig.commaSeparated && displayValue
            ? displayValue
                .split(',')
                .map(item => item.trim())
                .filter(item => item !== '')
            : [];
          
          return (
            <div key={fieldName} className="mb-4">
              <label className="label">
                {fieldConfig.label}
                {fieldConfig.commaSeparated && (
                  <span className="text-xs text-gray-500 ml-2">(comma-separated)</span>
                )}
              </label>
              <input
                type={fieldConfig.type || "text"}
                className="input input-bordered w-full"
                placeholder={
                  fieldConfig.placeholder || 
                  (fieldConfig.commaSeparated ? "e.g., value1, value2, value3" : "")
                }
                value={displayValue}
                onChange={(e) => handleInputChange(fieldName, e.target.value)}
              />
              {fieldConfig.commaSeparated && arrayPreview.length > 0 && (
                <div className="text-xs text-gray-600 mt-1">
                  {arrayPreview.length} value{arrayPreview.length !== 1 ? 's' : ''} entered
                </div>
              )}
            </div>
          );
        })}

        <div className="flex gap-4 mt-4">
          <button
            onClick={handleNext}
            className="btn btn-secondary flex-1"
          >
            Next
          </button>
          <button
            onClick={handleCancel}
            className="btn btn-neutral flex-1"
          >
            Cancel
          </button>
        </div>
      </fieldset>
    </main>
  );
}