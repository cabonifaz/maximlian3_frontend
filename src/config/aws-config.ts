import { Amplify } from "aws-amplify";
import { sessionStorage } from "aws-amplify/utils";

Amplify.configure(
  {
    Auth: {
      Cognito: {
        userPoolId: import.meta.env.VITE_COGNITO_USER_POOL_ID,
        userPoolClientId: import.meta.env.VITE_COGNITO_CLIENT_ID,
        loginWith: {
          username: true,
        },
      },
    },
  },
  {
    Auth: {
      tokenStorage: sessionStorage,
    },
  },
);
