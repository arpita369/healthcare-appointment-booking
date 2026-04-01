import * as React from "react";
import { cn } from "../../lib/utils";
import { Eye, EyeOff, X, Search, AlertCircle, Check } from "lucide-react";

const Input = React.forwardRef(
  ({ className, type, error, success, leftIcon, rightIcon, clearable, onClear, disabled, ...props }, ref) => {
    const [showPassword, setShowPassword] = React.useState(false);
    const [isFocused, setIsFocused] = React.useState(false);
    const inputRef = React.useRef(null);
    
    React.useImperativeHandle(ref, () => inputRef.current);
    
    const isPassword = type === "password";
    const actualType = isPassword && showPassword ? "text" : type;
    
    const handleClear = () => {
      if (inputRef.current) {
        inputRef.current.value = "";
        inputRef.current.focus();
        onClear?.();
      }
    };
    
    return (
      <div className="relative">
        {leftIcon && (
          <div className="absolute left-3 top-1/2 -translate-y-1/2 text-muted-foreground transition-colors">
            {leftIcon}
          </div>
        )}
        
        <input
          ref={inputRef}
          type={actualType}
          disabled={disabled}
          onFocus={() => setIsFocused(true)}
          onBlur={() => setIsFocused(false)}
          className={cn(
            "flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background file:border-0 file:bg-transparent file:text-sm file:font-medium placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 transition-all duration-200",
            leftIcon && "pl-10",
            (rightIcon || isPassword || clearable || error || success) && "pr-10",
            error && "border-red-500 focus-visible:ring-red-500",
            success && "border-green-500 focus-visible:ring-green-500",
            disabled && "cursor-not-allowed opacity-50",
            isFocused && !error && !success && "border-primary shadow-sm",
            className
          )}
          {...props}
        />
        
        {/* Right side icons */}
        <div className="absolute right-3 top-1/2 -translate-y-1/2 flex items-center gap-1">
          {error && (
            <AlertCircle className="h-4 w-4 text-red-500" />
          )}
          
          {success && (
            <Check className="h-4 w-4 text-green-500" />
          )}
          
          {clearable && props.value && !disabled && (
            <button
              type="button"
              onClick={handleClear}
              className="text-muted-foreground hover:text-foreground transition-colors"
            >
              <X className="h-4 w-4" />
            </button>
          )}
          
          {isPassword && (
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="text-muted-foreground hover:text-foreground transition-colors"
              tabIndex={-1}
            >
              {showPassword ? <EyeOff className="h-4 w-4" /> : <Eye className="h-4 w-4" />}
            </button>
          )}
          
          {rightIcon && !error && !success && !clearable && !isPassword && rightIcon}
        </div>
      </div>
    );
  }
);

Input.displayName = "Input";



export { Input };
