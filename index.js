import React, { useState, useRef, useImperativeHandle, forwardRef, useId } from "react";
import { Eye, EyeOff, X, Search, Mail, Lock, User, DollarSign, Hash } from "lucide-react"; 
import "us-beta-inputbox/styles.css";

/* ----------- Utils Start ---------- */
export const convertToNumber = (value) => {
  const num = Number(value);
  return isNaN(num) ? "" : num;
};

export const allowDecimal = (value, places = 2) => {
  const str = String(value ?? "");
  const regex = new RegExp(`^\\d*\\.?\\d{0,${Math.max(0, places)}}`);
  return str.match(regex)?.[0] || "";
};

export const allowIntegerOnly = (value) => {
  const str = String(value ?? "");
  return str.match(/^\d*/)?.[0] || "";
};

const sanitizeNumeric = (raw, { decimal, allowNegative }) => {
  let str = String(raw ?? "");
  if (allowNegative) {
    const neg = str.startsWith("-");
    str = str.replace(/-/g, "");
    if (neg) str = "-" + str;
  } else {
    str = str.replace(/-/g, "");
  }
  const sign = allowNegative && str.startsWith("-") ? "-" : "";
  const rest = sign ? str.slice(1) : str;

  const cleaned = decimal > 0 ? allowDecimal(rest, decimal) : allowIntegerOnly(rest);

  return sign + cleaned;
};
/* ----------- Utils Start ---------- */


/*------------- Height presets Start--------------*/                         

const HEIGHT_PRESETS = {
  sm: { box: "h-9", text: "text-sm", icon: 16, pl: "pl-2.5", pr: "pr-2.5" },
  md: { box: "h-11", text: "text-sm", icon: 18, pl: "pl-3.5", pr: "pr-3.5" },
  lg: { box: "h-13", text: "text-base", icon: 20, pl: "pl-4", pr: "pr-4" },
};


/* ----------- InputBox Component Start ---------- */
export const InputBox = forwardRef(function InputBox(
  {
    label,
    name,
    id,
    value,
    defaultValue,
    onChange,
    onBlur,
    onFocus,
    placeholder,
    type = "text",
    startIcon,
    endIcon,
    height = 40,
    disabled = false,
    readOnly = false,
    required = false,
    error,
    helperText,
    fullWidth = true,
    clearable = false,
    onClear,
    numericOnly = false,
    decimal = 0,
    allowNegative = false,
    returnAsNumber = false,
    maxLength,
    variant = "outline", // 'outline' | 'filled' | 'underline'
    className = "",
    inputClassName = "",
    ...rest
  },
  forwardedRef
) {
  const autoId = useId();
  const inputId = id || name || autoId;
  const innerRef = useRef(null);
  useImperativeHandle(forwardedRef, () => innerRef.current);

  const [isFocused, setIsFocused] = useState(false);
  const [showPassword, setShowPassword] = useState(false);

  const isPassword = type === "password";
  const isNumericMode = numericOnly || type === "number" || decimal > 0;
  const preset = HEIGHT_PRESETS[height] || HEIGHT_PRESETS.md;
  const customHeight = typeof height === "number" ? { height: `${height}px` } : undefined;

  const hasValue = value !== undefined ? String(value).length > 0 : undefined;

  const handleChange = (e) => {
    let next = e.target.value;
    if (isNumericMode) {
      next = sanitizeNumeric(next, { decimal, allowNegative });
      if (returnAsNumber) {
        onChange?.(convertToNumber(next), e);
        return;
      }
    }
    onChange?.(next, e);
  };

  const handleFocus = (e) => {
    setIsFocused(true);
    onFocus?.(e);
  };

  const handleBlur = (e) => {
    setIsFocused(false);
    onBlur?.(e);
  };

  const handleClear = () => {
    onChange?.("", { target: { value: "" } });
    onClear?.();
    innerRef.current?.focus();
  };

  const resolvedType = isPassword ? (showPassword ? "text" : "password") : isNumericMode ? "text" : type;
  const inputMode = isNumericMode ? "decimal" : undefined;

  const variantBase = {
    outline: "bg-white border",
    filled: "bg-slate-100 border border-transparent",
    underline: "bg-transparent border-0 border-b rounded-none",
  }[variant];

  const borderColor = error
    ? "border-red-400"
    : isFocused
      ? "border-indigo-500"
      : "border-slate-300";

  const showClearButton = clearable && !disabled && !readOnly && hasValue;
  const hasEndAdornment = isPassword || (!isPassword && !!endIcon) || showClearButton;
  const hasStartIcon = !!startIcon;

  return (
    <div className={`${fullWidth ? "w-full" : "inline-block"} ${className}`}>
      {label && (
        <label
          htmlFor={inputId}
          className={`mb-1.5 block text-sm font-medium ${error ? "text-red-600" : "text-slate-700"
            }`}
        >
          {label}
          {required && <span className="ml-0.5 text-red-500">*</span>}
        </label>
      )}

      <div
        className={[
          "flex items-center gap-2 transition-all duration-150 w-full px-3 py-2 text-sm rounded-lg border border-slate-200 dark:border-slate-600 dark:bg-slate-800 dark:text-slate-100 focus:border-primary-400 focus:ring-1 focus:ring-primary-400 outline-none bg-white disabled:bg-slate-50 dark:disabled:bg-slate-700",
          variant === "underline" ? "" : "rounded-lg",
          hasStartIcon ? preset.pl : "",
          hasEndAdornment ? preset.pr : "",
          variantBase,
          borderColor,
          disabled ? "cursor-not-allowed bg-slate-50 opacity-60" : "",
          fullWidth ? "w-full" : "",
        ].join(" ")}
        style={customHeight}
      >
        {startIcon && (
          <span
            className={`flex shrink-0 items-center ${error ? "text-red-400" : "text-slate-400"}`}
          >
            {React.isValidElement(startIcon)
              ? React.cloneElement(startIcon, { size: startIcon.props.size ?? preset.icon })
              : startIcon}
          </span>
        )}

        <input
          ref={innerRef}
          id={inputId}
          name={name}
          type={resolvedType}
          inputMode={inputMode}
          value={value}
          defaultValue={defaultValue}
          placeholder={placeholder}
          disabled={disabled}
          readOnly={readOnly}
          required={required}
          maxLength={maxLength}
          onChange={handleChange}
          onFocus={handleFocus}
          onBlur={handleBlur}
          className={[
            "w-full min-w-0 border-0 bg-transparent outline-none",
            "placeholder:text-slate-400 disabled:cursor-not-allowed",
            preset.text,
            hasStartIcon ? "" : preset.pl,
            hasEndAdornment ? "" : preset.pr,
            inputClassName,
          ].join(" ")}
          {...rest}
        />

        {showClearButton && (
          <button
            type="button"
            tabIndex={-1}
            onClick={handleClear}
            className="flex shrink-0 items-center text-slate-400 hover:text-slate-600"
            aria-label="Clear input"
          >
            <X size={preset.icon} />
          </button>
        )}

        {isPassword && (
          <button
            type="button"
            tabIndex={-1}
            onClick={() => setShowPassword((s) => !s)}
            className="flex shrink-0 items-center text-slate-400 hover:text-slate-600"
            aria-label={showPassword ? "Hide password" : "Show password"}
          >
            {showPassword ? <EyeOff size={preset.icon} /> : <Eye size={preset.icon} />}
          </button>
        )}

        {!isPassword && endIcon && (
          <span
            className={`flex shrink-0 items-center ${error ? "text-red-400" : "text-slate-400"}`}
          >
            {React.isValidElement(endIcon)
              ? React.cloneElement(endIcon, { size: endIcon.props.size ?? preset.icon })
              : endIcon}
          </span>
        )}
      </div>

      {(error || helperText) && (
        <p className={`mt-1.5 text-xs ${error ? "text-red-500" : "text-slate-500"}`}>
          {error || helperText}
        </p>
      )}
    </div>
  );
});


/* ----------- InputBox Component End ---------- */