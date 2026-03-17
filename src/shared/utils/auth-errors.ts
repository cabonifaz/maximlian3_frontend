/**
 * Mapea los códigos de error comunes de AWS Cognito a mensajes en español.
 */
export const translateAuthError = (error: unknown): string => {
  if (!(error instanceof Error)) {
    return "Ocurrió un error inesperado. Por favor, intenta de nuevo.";
  }

  // Cognito usually returns the error code in the 'name' property
  const errorCode = (error as { name?: string }).name || (error as Error).name;

  switch (errorCode) {
    case "NotAuthorizedException":
      return "Nombre de usuario o contraseña incorrectos.";
    case "UserNotFoundException":
      return "El usuario no existe.";
    case "PasswordResetRequiredException":
      return "Es necesario restablecer tu contraseña.";
    case "UserNotConfirmedException":
      return "El usuario aún no ha sido confirmado por correo electrónico.";
    case "InvalidPasswordException":
      return "La contraseña no cumple con los requisitos de seguridad (mínimo 8 caracteres, mayúsculas, números y símbolos).";
    case "LimitExceededException":
      return "Has excedido el límite de intentos. Por favor, espera unos minutos e intenta de nuevo.";
    case "InvalidParameterException":
      if (error.message.includes("password")) {
        return "La contraseña no es lo suficientemente fuerte.";
      }
      return "Parámetros inválidos. Por favor, revisa la información ingresada.";
    case "UsernameExistsException":
      return "Este nombre de usuario ya se encuentra registrado.";
    case "TooManyRequestsException":
      return "Demasiadas solicitudes en poco tiempo. Por favor, espera un momento.";
    case "ExpiredCodeException":
      return "El código ha expirado. Por favor, solicita uno nuevo.";
    case "CodeMismatchException":
      return "El código ingresado es incorrecto.";
    case "AuthUserPoolException":
      return "El servicio de autenticación no está disponible.";
    default:
      console.warn("Unhandled auth error code:", errorCode, error.message);
      return "Error de autenticación: " + (error.message || "Credenciales inválidas.");
  }
};
