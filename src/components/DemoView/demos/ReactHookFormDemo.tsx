"use client";

import { useState } from "react";
import { useForm, type SubmitHandler } from "react-hook-form";

interface SignupForm {
  username: string;
  email: string;
  password: string;
  confirm: string;
  role: "developer" | "designer" | "manager";
  newsletter: boolean;
}

type FieldName = keyof SignupForm;

const ROLES = ["developer", "designer", "manager"] as const;

function FieldRow({
  label,
  error,
  children,
}: {
  label: string;
  error?: string;
  children: React.ReactNode;
}) {
  return (
    <div>
      <label className="text-xs font-semibold text-slate-600 block mb-1">{label}</label>
      {children}
      {error && (
        <p className="text-xs text-rose-500 mt-1 flex items-center gap-1">
          <svg className="w-3 h-3 flex-shrink-0" fill="currentColor" viewBox="0 0 20 20">
            <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7 4a1 1 0 11-2 0 1 1 0 012 0zm-1-9a1 1 0 00-1 1v4a1 1 0 102 0V6a1 1 0 00-1-1z" />
          </svg>
          {error}
        </p>
      )}
    </div>
  );
}

export default function ReactHookFormDemo() {
  const [submitted, setSubmitted] = useState<SignupForm | null>(null);
  const [renderCount, setRenderCount] = useState(0);

  const {
    register,
    handleSubmit,
    watch,
    getValues,
    formState: { errors, touchedFields, isValid, isDirty },
  } = useForm<SignupForm>({
    mode: "onChange",
    defaultValues: { role: "developer", newsletter: false },
  });

  // Track re-renders to show isolation
  const _ = (() => { setRenderCount((n) => n); return null; })();
  void _;

  const password = watch("password");

  const onSubmit: SubmitHandler<SignupForm> = (data) => {
    setSubmitted(data);
  };

  const inputCls = (field: FieldName) =>
    `w-full text-sm border rounded-lg px-3 py-2 focus:outline-none focus:ring-2 transition-colors ${
      errors[field]
        ? "border-rose-300 focus:ring-rose-300 bg-rose-50"
        : touchedFields[field]
        ? "border-emerald-300 focus:ring-emerald-300"
        : "border-slate-200 focus:ring-indigo-300"
    }`;

  if (submitted) {
    return (
      <div className="h-full overflow-auto p-6">
        <div className="max-w-md mx-auto">
          <div className="rounded-xl border border-emerald-200 bg-emerald-50 p-6">
            <div className="flex items-center gap-2 mb-4">
              <span className="text-emerald-600 text-xl">✓</span>
              <h3 className="font-semibold text-emerald-800">Form submitted successfully</h3>
            </div>
            <pre className="text-xs font-mono text-emerald-900 bg-white/60 rounded-lg p-4 overflow-x-auto">
              {JSON.stringify({ ...submitted, password: "••••••••", confirm: "••••••••" }, null, 2)}
            </pre>
            <button
              onClick={() => setSubmitted(null)}
              className="mt-4 w-full text-sm border border-emerald-300 text-emerald-700 py-2 rounded-lg hover:bg-emerald-100 transition-colors"
            >
              Reset
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="h-full overflow-auto p-6">
      <p className="text-sm text-slate-500 mb-5">
        React Hook Form uses uncontrolled inputs — no <code className="bg-slate-100 px-1 rounded text-xs">useState</code> per field.
        It re-renders only the component that needs updating, keeping performance sharp on large forms.
      </p>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
        <form onSubmit={handleSubmit(onSubmit)} className="space-y-4 bg-white border border-slate-200 rounded-xl p-5">
          <h3 className="font-semibold text-slate-800 text-sm">Sign up</h3>

          <FieldRow label="Username" error={errors.username?.message}>
            <input
              {...register("username", {
                required: "Username is required",
                minLength: { value: 3, message: "At least 3 characters" },
                maxLength: { value: 20, message: "Max 20 characters" },
                pattern: { value: /^[a-z0-9_]+$/, message: "Lowercase, numbers, underscores only" },
              })}
              placeholder="alice_dev"
              className={inputCls("username")}
            />
          </FieldRow>

          <FieldRow label="Email" error={errors.email?.message}>
            <input
              {...register("email", {
                required: "Email is required",
                pattern: { value: /^[^\s@]+@[^\s@]+\.[^\s@]+$/, message: "Must be a valid email" },
              })}
              type="email"
              placeholder="alice@example.com"
              className={inputCls("email")}
            />
          </FieldRow>

          <FieldRow label="Password" error={errors.password?.message}>
            <input
              {...register("password", {
                required: "Password is required",
                minLength: { value: 8, message: "At least 8 characters" },
              })}
              type="password"
              placeholder="••••••••"
              className={inputCls("password")}
            />
          </FieldRow>

          <FieldRow label="Confirm password" error={errors.confirm?.message}>
            <input
              {...register("confirm", {
                required: "Please confirm your password",
                validate: (v) => v === password || "Passwords do not match",
              })}
              type="password"
              placeholder="••••••••"
              className={inputCls("confirm")}
            />
          </FieldRow>

          <FieldRow label="Role" error={errors.role?.message}>
            <select
              {...register("role", { required: "Pick a role" })}
              className="w-full text-sm border border-slate-200 rounded-lg px-3 py-2 focus:outline-none focus:ring-2 focus:ring-indigo-300"
            >
              {ROLES.map((r) => (
                <option key={r} value={r}>{r.charAt(0).toUpperCase() + r.slice(1)}</option>
              ))}
            </select>
          </FieldRow>

          <label className="flex items-center gap-2 text-sm text-slate-600">
            <input type="checkbox" {...register("newsletter")} className="accent-indigo-600" />
            Subscribe to newsletter
          </label>

          <button
            type="submit"
            disabled={!isDirty}
            className="w-full bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 text-white text-sm font-semibold py-2.5 rounded-lg transition-colors"
          >
            Create account
          </button>
        </form>

        {/* Live state panel */}
        <div className="space-y-4">
          {/* Form state */}
          <div className="bg-white border border-slate-200 rounded-xl p-4">
            <h3 className="text-xs font-semibold text-slate-500 uppercase tracking-wider mb-3">
              Form state (live)
            </h3>
            <div className="grid grid-cols-2 gap-x-4 gap-y-2 text-xs font-mono">
              <span className="text-slate-500">isValid</span>
              <span className={isValid ? "text-emerald-600 font-semibold" : "text-rose-500"}>{String(isValid)}</span>
              <span className="text-slate-500">isDirty</span>
              <span className={isDirty ? "text-amber-600 font-semibold" : "text-slate-400"}>{String(isDirty)}</span>
              <span className="text-slate-500">errors</span>
              <span className="text-rose-500">{Object.keys(errors).length} field(s)</span>
              <span className="text-slate-500">touched</span>
              <span className="text-slate-700">{Object.keys(touchedFields).length} field(s)</span>
            </div>
          </div>

          {/* Error list */}
          {Object.keys(errors).length > 0 && (
            <div className="bg-rose-50 border border-rose-200 rounded-xl p-4">
              <h3 className="text-xs font-semibold text-rose-500 uppercase tracking-wider mb-2">Errors</h3>
              <ul className="space-y-1">
                {(Object.entries(errors) as [FieldName, { message?: string }][]).map(([k, v]) => (
                  <li key={k} className="text-xs font-mono">
                    <span className="text-rose-400">{k}:</span>{" "}
                    <span className="text-rose-700">{v.message}</span>
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Live values */}
          <div className="rounded-xl bg-[#0d1117] border border-slate-700 p-4">
            <div className="text-xs text-slate-500 mb-2">// watch() — live field values</div>
            <pre className="text-xs font-mono text-slate-300 overflow-x-auto">
              {JSON.stringify(
                { ...getValues(), password: getValues("password") ? "••••••••" : "", confirm: getValues("confirm") ? "••••••••" : "" },
                null,
                2
              )}
            </pre>
          </div>
        </div>
      </div>
    </div>
  );
}
