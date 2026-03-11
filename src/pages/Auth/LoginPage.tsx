import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, Shield } from "lucide-react";

import { 
  loginSchema, 
  type LoginFormData,
  newPasswordSchema,
  type NewPasswordFormData 
} from "@maximilian/schemas";
import { authService } from "@maximilian/services/auth.service";

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  
  const [isLoading, setIsLoading] = useState(false);
  const [authError, setAuthError] = useState<string | null>(null);
  const [isNewPasswordRequired, setIsNewPasswordRequired] = useState(false);
  
  const navigate = useNavigate();

  const {
    register: loginRegister,
    handleSubmit: handleLoginSubmit,
    formState: { errors: loginErrors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const {
    register: newPasswordRegister,
    handleSubmit: handleNewPasswordSubmit,
    formState: { errors: newPasswordErrors },
  } = useForm<NewPasswordFormData>({
    resolver: zodResolver(newPasswordSchema),
    defaultValues: {
      email: "",
      newPassword: "",
      confirmPassword: "",
    },
  });

  const onLogin = async (data: LoginFormData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await authService.login(data);
      if (response.isSignedIn) {
        navigate("/select-role");
      } else if (response.nextStep?.signInStep === "CONFIRM_SIGN_IN_WITH_NEW_PASSWORD_REQUIRED") {
        setIsNewPasswordRequired(true);
      } else {
        console.log("Next step required:", response.nextStep);
      }
    } catch (err: unknown) {
      console.error("Login failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Credenciales inválidas o error de conexión.";
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  const onNewPassword = async (data: NewPasswordFormData) => {
    setIsLoading(true);
    setAuthError(null);
    try {
      const response = await authService.confirmNewPassword(data.newPassword, data.email);
      if (response.isSignedIn) {
        navigate("/select-role");
      } else {
        console.log("Next step required after confirm:", response.nextStep);
      }
    } catch (err: unknown) {
      console.error("Confirm new password failed:", err);
      const errorMessage = err instanceof Error ? err.message : "Error al actualizar la contraseña.";
      setAuthError(errorMessage);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 p-4">
      <div className="bg-brand-white w-full max-w-md p-10 rounded-3xl shadow-xl border border-gray-100 flex flex-col items-center animate-in fade-in zoom-in-95 duration-300">
        {/* Logo */}
        <div className="bg-brand-black p-4 rounded-3xl rotate-45 mb-8">
          <Shield className="text-brand-white w-10 h-10 -rotate-45" />
        </div>

        <h1 className="text-4xl font-extrabold text-brand-black mb-2">
          Safety Report
        </h1>
        <p className="text-gray-400 text-center text-sm mb-10 leading-relaxed px-4">
          {isNewPasswordRequired 
            ? "Por seguridad, debes actualizar tu contraseña temporal." 
            : "Ingresa tus credenciales para acceder a tu cuenta"}
        </p>

        {authError && (
          <div className="w-full bg-red-50 text-red-500 text-sm p-3 rounded-lg mb-6 border border-red-100 text-center">
            {authError}
          </div>
        )}

        {!isNewPasswordRequired ? (
          <form onSubmit={handleLoginSubmit(onLogin)} className="w-full space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Nombre de usuario
              </label>
              <input
                {...loginRegister("username")}
                type="text"
                placeholder="Nombre de usuario"
                disabled={isLoading}
                className={`w-full px-5 py-3 bg-brand-white border ${
                  loginErrors.username ? "border-red-500" : "border-gray-200"
                } rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all disabled:opacity-50`}
              />
              {loginErrors.username && (
                <p className="text-xs text-red-500">{loginErrors.username.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Contraseña
              </label>
              <div className="relative">
                <input
                  {...loginRegister("password")}
                  type={showPassword ? "text" : "password"}
                  placeholder="********"
                  disabled={isLoading}
                  className={`w-full px-5 py-3 bg-brand-white border ${
                    loginErrors.password ? "border-red-500" : "border-gray-200"
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
              {loginErrors.password && (
                <p className="text-xs text-red-500">{loginErrors.password.message}</p>
              )}
            </div>

            <div className="flex items-center gap-3">
              <label className="flex items-center gap-2 cursor-pointer group">
                <input
                  {...loginRegister("rememberMe")}
                  type="checkbox"
                  disabled={isLoading}
                  className="w-4 h-4 rounded border-gray-300 text-brand-black focus:ring-brand-black disabled:opacity-50"
                />
                <span className="text-sm text-gray-600 font-medium">
                  Recordar mi contraseña
                </span>
              </label>
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-brand-black text-brand-white rounded-xl text-lg font-bold hover:bg-brand-black/90 active:scale-[0.98] transition-all shadow-lg shadow-black/10 mt-4 disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-brand-white border-t-transparent rounded-full animate-spin" />
                  Ingresando...
                </>
              ) : (
                "Ingresar"
              )}
            </button>
          </form>
        ) : (
          <form onSubmit={handleNewPasswordSubmit(onNewPassword)} className="w-full space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Email
              </label>
              <input
                {...newPasswordRegister("email")}
                type="email"
                placeholder="tu@email.com"
                disabled={isLoading}
                className={`w-full px-5 py-3 bg-brand-white border ${
                  newPasswordErrors.email ? "border-red-500" : "border-gray-200"
                } rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all disabled:opacity-50`}
              />
              {newPasswordErrors.email && (
                <p className="text-xs text-red-500">{newPasswordErrors.email.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  {...newPasswordRegister("newPassword")}
                  type={showPassword ? "text" : "password"}
                  placeholder="Nueva contraseña"
                  disabled={isLoading}
                  className={`w-full px-5 py-3 bg-brand-white border ${
                    newPasswordErrors.newPassword ? "border-red-500" : "border-gray-200"
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
              {newPasswordErrors.newPassword && (
                <p className="text-xs text-red-500">{newPasswordErrors.newPassword.message}</p>
              )}
            </div>

            <div className="space-y-2">
              <label className="text-sm font-bold text-gray-700">
                Confirmar Nueva Contraseña
              </label>
              <div className="relative">
                <input
                  {...newPasswordRegister("confirmPassword")}
                  type={showConfirmPassword ? "text" : "password"}
                  placeholder="Confirma la contraseña"
                  disabled={isLoading}
                  className={`w-full px-5 py-3 bg-brand-white border ${
                    newPasswordErrors.confirmPassword ? "border-red-500" : "border-gray-200"
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
              {newPasswordErrors.confirmPassword && (
                <p className="text-xs text-red-500">{newPasswordErrors.confirmPassword.message}</p>
              )}
            </div>

            <button
              type="submit"
              disabled={isLoading}
              className="w-full py-4 bg-brand-wine text-brand-white rounded-xl text-lg font-bold hover:bg-brand-wine/90 active:scale-[0.98] transition-all shadow-lg shadow-black/10 mt-4 disabled:opacity-70 flex justify-center items-center gap-2"
            >
              {isLoading ? (
                <>
                  <div className="w-5 h-5 border-2 border-brand-white border-t-transparent rounded-full animate-spin" />
                  Actualizando...
                </>
              ) : (
                "Actualizar Contraseña"
              )}
            </button>
            <button
              type="button"
              onClick={() => setIsNewPasswordRequired(false)}
              disabled={isLoading}
              className="w-full py-4 bg-transparent text-gray-500 hover:text-brand-black rounded-xl text-sm font-bold transition-all disabled:opacity-70"
            >
               Volver a iniciar sesión
            </button>
          </form>
        )}

        {!isNewPasswordRequired && (
          <div className="mt-10 text-center">
            <p className="text-xs text-gray-500">
              Olvidaste tu contraseña?{" "}
              <Link
                to="/forgot-password"
                className="font-bold text-brand-black hover:text-brand-wine transition-colors"
              >
                Obten un enlace al correo
              </Link>
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
