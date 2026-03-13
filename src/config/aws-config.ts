import { Amplify, type ResourcesConfig } from "aws-amplify";
import { sessionStorage } from "aws-amplify/utils";
import { cognitoUserPoolsTokenProvider } from "aws-amplify/auth/cognito";

/**
 * See the docs here: https://docs.amplify.aws/gen1/react/build-a-backend/auth/manage-user-session/
 */

const authConfig: ResourcesConfig["Auth"] = {
  Cognito: {
    userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
    userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
  },
};

Amplify.configure({
  Auth: authConfig,
});

cognitoUserPoolsTokenProvider.setKeyValueStorage(sessionStorage);
