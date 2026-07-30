import { DEBOUNCE_MS } from "@maximilian/shared/constants/hooks/use-retardo.constants";
import { useState, useEffect } from "react";

export function useRetardo<T>(valor: T, retraso = DEBOUNCE_MS): T {
  const valorLimpio = (
    typeof valor === "string" ? valor.trim() : valor
  ) as T;
  const [valorConRetardo, setValorConRetardo] = useState<T>(valorLimpio);

  useEffect(() => {
    const temporizador = setTimeout(
      () => setValorConRetardo(valorLimpio),
      retraso,
    );
    return () => clearTimeout(temporizador);
  }, [retraso, valorLimpio]);

  return valorConRetardo;
}
