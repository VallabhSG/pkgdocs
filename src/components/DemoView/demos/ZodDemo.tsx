"use client";

import { useState } from "react";
import { z } from "zod";

const schema = z.object({
  username: z.string().min(3, "At least 3 characters").max(20, "Max 20 characters").regex(/^[a-z0-9_]+$/, "Lowercase, numbers, underscores only"),
  email: z.string().email("Must be a valid email address"),
  age: z.coerce.number().int("Must be a whole number").min(13, "Must be at least 13").max(120, "Must be under 120"),
  website: z.string().url("Must be a valid URL (include https://)").optional().or(z.literal("")),
});

type FormData = { username: string; email: string; age: string; website: string };
type Errors = Partial<Record<keyof FormData, string>>;

const INITIAL: FormData = { username: "", email: "", age: "", website: "" };

export default function ZodDemo() {
  const [form, setForm] = useState<FormData>(INITIAL);
  const [errors, setErrors] = useState<Errors>({});
  const [parsed, setParsed] = useState<z.infer<typeof schema> | null>(null);
  const [submitted, setSubmitted] = useState(false);

  function validate(field: keyof FormData, value: string) {
    const partial = { ...form, [field]: value };
    const result = schema.safeParse(partial);
    if (!result.success) {
      const fieldError = result.error.flatten().fieldErrors[field]?.[0];
      setErrors((e) => ({ ...e, [field]: fieldError }));
    } else {
      setErrors((e) => ({ ...e, [field]: undefined }));
    }
  }

  function handleChange(field: keyof FormData, value: string) {
    setForm((f) => ({ ...f, [field]: value }));
    if (submitted) validate(field, value);
  }

  function handleSubmit() {
    setSubmitted(true);
    const result = schema.safeParse(form);
    if (result.success) {
      setParsed(result.data);
      setErrors({});
    } else {
      const fieldErrors = result.error.flatten().fieldErrors;
      setErrors(Object.fromEntries(
        Object.entries(fieldErrors).map(([k, v]) => [k, v?.[0]])
      ) as Errors);
      setParsed(null);
    }
  }

  const fields: { id: keyof FormData; label: string; type: string; placeholder: string }[] = [
    { id: "username", label: "Username", type: "text", placeholder: "alice_dev" },
    { id: "email", label: "Email", type: "email", placeholder: "alice@example.com" },
    { id: "age", label: "Age", type: "text", placeholder: "25" },
    { id: "website", label: "Website (optional)", type: "text", placeholder: "https://alice.dev" },
  ];

  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        Zod validates at runtime and infers TypeScript types from the same schema.
        Submit the form to see validation errors, or fill it correctly to see the parsed output.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <div className="bg-white border border-slate-200 rounded-xl p-5 space-y-4">
          <h3 className="font-semibold text-slate-800 text-sm">Registration form</h3>
          {fields.map(({ id, label, type, placeholder }) => (
            <div key={id}>
              <label className="text-xs font-medium text-slate-600 block mb-1">{label}</label>
              <input
                type={type}
                value={form[id]}
                onChange={(e) => handleChange(id, e.target.value)}
                placeholder={placeholder}
                className={`w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-colors ${
                  errors[id]
                    ? "border-rose-300 focus:ring-rose-300 bg-rose-50"
                    : "border-slate-200 focus:ring-indigo-400"
                }`}
              />
              {errors[id] && (
                <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
                  <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
                  </svg>
                  {errors[id]}
                </p>
              )}
            </div>
          ))}
          <button
            onClick={handleSubmit}
            className="w-full bg-indigo-600 hover:bg-indigo-700 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            Validate & Parse
          </button>
        </div>

        {/* Schema + output */}
        <div className="space-y-4">
          {/* Schema */}
          <div className="rounded-xl bg-[#0d1117] border border-slate-700 overflow-hidden">
            <div className="px-4 py-2 bg-[#161b22] border-b border-slate-700 text-xs text-slate-500 font-mono">
              schema.ts
            </div>
            <pre className="p-4 text-xs font-mono text-slate-300 overflow-x-auto leading-relaxed">
{`const schema = z.object({
  username: z.string()
    .min(3).max(20)
    .regex(/^[a-z0-9_]+$/),
  email: z.string().email(),
  age: z.coerce.number()
    .int().min(13).max(120),
  website: z.string().url()
    .optional().or(z.literal("")),
});

// Inferred type — same source:
type User = z.infer<typeof schema>;`}
            </pre>
          </div>

          {/* Result */}
          {submitted && (
            <div className={`rounded-xl border overflow-hidden ${parsed ? "border-emerald-200 bg-emerald-50" : "border-rose-200 bg-rose-50"}`}>
              <div className={`px-4 py-2 border-b text-xs font-semibold ${parsed ? "border-emerald-200 text-emerald-700 bg-emerald-100" : "border-rose-200 text-rose-700 bg-rose-100"}`}>
                {parsed ? "✓ Validation passed — parsed data" : "✗ Validation failed"}
              </div>
              <pre className={`p-4 text-xs font-mono leading-relaxed ${parsed ? "text-emerald-800" : "text-rose-700"}`}>
                {parsed
                  ? JSON.stringify(parsed, null, 2)
                  : Object.entries(errors)
                      .filter(([, v]) => v)
                      .map(([k, v]) => `${k}: ${v}`)
                      .join("\n") || "Fix the highlighted fields above"}
              </pre>
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
