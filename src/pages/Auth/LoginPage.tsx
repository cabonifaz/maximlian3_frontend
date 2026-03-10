import { useState } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import * as z from "zod";
import { useNavigate, Link } from "react-router";
import { Eye, EyeOff, Shield } from "lucide-react";

const loginSchema = z.object({
  username: z.string().min(1, "El nombre de usuario es requerido"),
  password: z.string().min(1, "La contraseña es requerida"),
  rememberMe: z.boolean(),
});

type LoginFormData = z.infer<typeof loginSchema>;

export default function LoginPage() {
  const [showPassword, setShowPassword] = useState(false);
  const navigate = useNavigate();

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      username: "",
      password: "",
      rememberMe: false,
    },
  });

  const onSubmit = async (data: LoginFormData) => {
    console.log("Login attempt:", data);
    // After successful login simulation, go to role selection
    navigate("/select-role");
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
          Ingresa tus credenciales para acceder a tu cuenta
        </p>

        <form onSubmit={handleSubmit(onSubmit)} className="w-full space-y-6">
          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Nombre de usuario
            </label>
            <input
              {...register("username")}
              type="text"
              placeholder="Nombre de usuario"
              className={`w-full px-5 py-3 bg-brand-white border ${
                errors.username ? "border-red-500" : "border-gray-200"
              } rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all`}
            />
            {errors.username && (
              <p className="text-xs text-red-500">{errors.username.message}</p>
            )}
          </div>

          <div className="space-y-2">
            <label className="text-sm font-bold text-gray-700">
              Contraseña
            </label>
            <div className="relative">
              <input
                {...register("password")}
                type={showPassword ? "text" : "password"}
                placeholder="********"
                className={`w-full px-5 py-3 bg-brand-white border ${
                  errors.password ? "border-red-500" : "border-gray-200"
                } rounded-xl text-sm focus:ring-4 focus:ring-brand-wine/10 focus:border-brand-wine outline-none transition-all pr-12`}
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-4 top-1/2 -translate-y-1/2 text-gray-400 hover:text-brand-black transition-colors"
              >
                {showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-500">{errors.password.message}</p>
            )}
          </div>

          <div className="flex items-center gap-3">
            <label className="flex items-center gap-2 cursor-pointer group">
              <input
                {...register("rememberMe")}
                type="checkbox"
                className="w-4 h-4 rounded border-gray-300 text-brand-black focus:ring-brand-black"
              />
              <span className="text-sm text-gray-600 font-medium">
                Recordar mi contraseña
              </span>
            </label>
          </div>

          <button
            type="submit"
            className="w-full py-4 bg-brand-black text-brand-white rounded-xl text-lg font-bold hover:bg-brand-black/90 active:scale-[0.98] transition-all shadow-lg shadow-black/10 mt-4"
          >
            Ingresar
          </button>
        </form>

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
      </div>
    </div>
  );
}
