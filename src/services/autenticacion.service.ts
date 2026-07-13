import { ENDPOINTS_AUTENTICACION } from "@maximilian/shared/constants/endpoints/autenticacion.endpoint";
import {
  signIn,
  confirmSignIn,
  resetPassword,
  confirmResetPassword,
  signOut,
  getCurrentUser,
  fetchAuthSession,
} from "aws-amplify/auth";
import type { DatosFormularioInicioSesion } from "@maximilian/schemas";
import maximilianService from "./maximilianService";
import { ErrorRespuestaApi, type ApiResponse } from "@maximilian/shared/types/api.type";
import { MessageType } from "@maximilian/shared/types/api.type";
import type { LoginValidatorResponse } from "@maximilian/shared/types/autenticacion.type";
import { limpiarDatosSesionLocal } from "./sesion.service";

export const servicioAutenticacion = {
  login: async (credentials: DatosFormularioInicioSesion) => {
    try {
      const { isSignedIn, nextStep } = await signIn({
        username: credentials.username,
        password: credentials.password,
        options: {
          authFlowType: "USER_PASSWORD_AUTH",
        },
      });
      return { isSignedIn, nextStep };
    } catch (error) {
      console.error("Error signing in", error);
      throw error;
    }
  },
  getUserRoles: async () => {
    try {
      const { data } = await maximilianService.get<ApiResponse<LoginValidatorResponse>>(
        ENDPOINTS_AUTENTICACION.validar
      );

      if (data.idTipoMensaje !== MessageType.SUCCESS) {
        throw new ErrorRespuestaApi(data);
      }

      return data.result[0];
    } catch (error) {
      console.error("Error fetching user roles", error);
      throw error;
    }
  },
  confirmNewPassword: async (newPassword: string) => {
    try {
      const { isSignedIn, nextStep } = await confirmSignIn({
        challengeResponse: newPassword,
      });
      return { isSignedIn, nextStep };
    } catch (error) {
      console.error("Error confirming new password", error);
      throw error;
    }
  },
  resetPassword: async (username: string) => {
    try {
      const output = await resetPassword({ username });
      return output;
    } catch (error) {
      console.error("Error requesting password reset", error);
      throw error;
    }
  },
  confirmPasswordReset: async (username: string, confirmationCode: string, newPassword: string) => {
    try {
      await confirmResetPassword({ username, confirmationCode, newPassword });
    } catch (error) {
      console.error("Error confirming password reset", error);
      throw error;
    }
  },
  logout: async () => {
    try {
      await signOut();
      limpiarDatosSesionLocal();
    } catch (error) {
      console.error("Error signing out", error);
      throw error;
    }
  },
  getCurrentUser: async () => {
    try {
      return await getCurrentUser();
    } catch (error) {
      console.error("Error getting current user", error);
      throw error;
    }
  },
  getSession: async () => {
    try {
      return await fetchAuthSession();
    } catch (error) {
      console.error("Error fetching auth session", error);
      throw error;
    }
  },
};
