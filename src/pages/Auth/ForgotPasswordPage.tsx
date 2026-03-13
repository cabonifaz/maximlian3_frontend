import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link, useLocation } from "react-router";
import { Eye, EyeOff, ArrowLeft } from "lucide-react";

import { 
  forgotPasswordSchema, 
  type ForgotPasswordFormData,
  resetPasswordSchema,
  type ResetPasswordFormData
} from "@maximilian/schemas";
import { authService } from "@maximilian/services/auth.service";
import { translateAuthError } from "@maximilian/shared/utils/auth-errors";

type Step = "REQUEST_CODE" | "RESET_PASSWORD";

export default function ForgotPasswordPage() {
  const [step, setStep] = useState<Step>("REQUEST_CODE");
  const [username, setUsername] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [successMessage, setSuccessMessage] = useState<string | null>(null);
  
  const navigate = useNavigate();
  const location = useLocation();

  const {
    register: requestRegister,
    handleSubmit: handleRequestSubmit,
    setValue: setRequestValue,
    formState: { errors: requestErrors },
  } = useForm<ForgotPasswordFormData>({
    resolver: zodResolver(forgotPasswordSchema),
    defaultValues: {
      username: "",
    },
  });

  useEffect(() => {
    if (location.state?.username) {
      setRequestValue("username", location.state.username, { shouldValidate: true });
    }
  }, [location.state, setRequestValue]);

  const {
    register: resetRegister,
    handleSubmit: handleResetSubmit,
    formState: { errors: resetErrors },
  } = useForm<ResetPasswordFormData>({
    resolver: zodResolver(resetPasswordSchema),
    defaultValues: {
      code: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onRequestCode = async (data: ForgotPasswordFormData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const output = await authService.resetPassword(data.username);
      setUsername(data.username);
      
      const { nextStep } = output;
      
      if (nextStep.resetPasswordStep === "CONFIRM_RESET_PASSWORD_WITH_CODE") {
        setStep("RESET_PASSWORD");
        setSuccessMessage(`Hemos enviado un código de confirmación a ${nextStep.codeDeliveryDetails?.destination || "tu correo"}.`);
      } else {
        // Handle other steps if necessary (e.g. DONE)
        console.log("Reset password next step:", nextStep);
      }
    } catch (err: unknown) {
      console.error("Password reset request failed:", err);
      setAuthError(translateAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  const onResetPassword = async (data: ResetPasswordFormData) => {
    setIsLoading(true);
    setAuthError(null);
    setSuccessMessage(null);
    try {
      await authService.confirmPasswordReset(username, data.code, data.newPassword);
      // Success: redirect to login
      navigate("/login", { state: { message: "Contraseña actualizada exitosamente. Inicia sesión con tu nueva contraseña." } });
    } catch (err: unknown) {
      console.error("Password reset confirm failed:", err);
      setAuthError(translateAuthError(err));
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-brand-white w-full max-w-md p-10 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
        {/* Logo */}
        <div className="mb-8">
          <img 
            src="/safety-logo.jpg" 
            alt="Safety Report Logo" 
            className="h-24 object-contain"
          />
        </div>

        <h1 className="text-2xl font-bold text-brand-black mb-2 text-center">
          {step === "REQUEST_CODE" ? "¿Olvidaste tu contraseña?" : "Restablecer contraseña"}
        </h1>
        <p className="text-gray-500 text-center text-sm mb-8 leading-relaxed px-4">
          {step === "REQUEST_CODE" 
            ? "Ingresa tu nombre de usuario y enviaremos un código para reestablecer tu contraseña" 
            : "Ingresa el código que recibiste y tu nueva contraseña"}
        </p>

        {authError && (
          <div className="w-full bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-6 border border-red-100 text-center">
            {authError}
          </div>
        )}

        {successMessage && (
          <div className="w-full bg-green-50 text-green-600 text-sm p-3 rounded-lg mb-6 border border-green-100 text-center">
            {successMessage}
          </div>
        )}

        {step === "REQUEST_CODE" ? (
          <form onSubmit={handleRequestSubmit(onRequestCode)} className="w-full space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Nombre de usuario
              </label>
              <input
                {...requestRegister("username")}
                type="text"
                placeholder="Nombre de usuario"
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-brand-white border ${
                  requestErrors.username ? "border-red-500" : "border-gray-200"
                } rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all disabled:opacity-50`}
              />
              {requestErrors.username && (
                <p className="text-xs text-red-500">{requestErrors.username.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-brand-black text-brand-white rounded-xl text-base font-bold hover:bg-brand-black/90 active:scale-[0.98] transition-all shadow-lg shadow-black/10 mt-2 disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-brand-white border-t-transparent rounded-full animate-spin" />
                  Enviando...
                </>
              ) : (
                "Enviar Código"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleResetSubmit(onResetPassword)} className="w-full space-y-5">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Código de confirmación
              </label>
              <input
                {...resetRegister("code")}
                type="text"
                placeholder="Ingresa el código"
                disabled={isLoading}
                className={`w-full px-4 py-3 bg-brand-white border ${
                  resetErrors.code ? "border-red-500" : "border-gray-200"
                } rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all disabled:opacity-50`}
              />
              {resetErrors.code && (
                <p className="text-xs text-red-500">{resetErrors.code.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  {...resetRegister("newPassword")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Nueva contraseña"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 bg-brand-white border ${
                    resetErrors.newPassword ? "border-red-500" : "border-gray-200"
                  } rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all pr-12 disabled:opacity-50`}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-black transition-colors disabled:opacity-50"
                >
                  {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {resetErrors.newPassword && (
                <p className="text-xs text-red-500">{resetErrors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  {...resetRegister("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirma la contraseña"
                  disabled={isLoading}
                  className={`w-full px-4 py-3 bg-brand-white border ${
                    resetErrors.confirmPassword ? "border-red-500" : "border-gray-200"
                  } rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all pr-12 disabled:opacity-50`}
                />
                <button
                  type="button"
                  onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                  disabled={isLoading}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-black transition-colors disabled:opacity-50"
                >
                  {showConfirmPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                </button>
              </div>
              {resetErrors.confirmPassword && (
                <p className="text-xs text-red-500">{resetErrors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-3.5 bg-brand-black text-brand-white rounded-xl text-base font-bold hover:bg-brand-black/90 active:scale-[0.98] transition-all shadow-lg shadow-black/10 mt-4 disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-brand-white border-t-transparent rounded-full animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Restablecer Contraseña"
              )}
            </button>
          </form>
        )}

        <div className="mt-8 text-center">
          <Link
            to="/login"
            className="inline-flex items-center gap-2 text-sm font-bold text-gray-500 hover:text-brand-black transition-colors"
          >
            <ArrowLeft size={16} />
            <span>Volver al inicio</span>
          </Link>
        </div>
      </div>
    </div>
  );
}
