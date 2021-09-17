export interface AuthTokensRow {
  data: {
    googleTokens: {
      token_type: [{ value: string; }];
      expiry_date: [{ value: number; }];
      scopes: [{ value: string }];
      access_token: [{ value: string; }];
      refresh_token: [{ value: string; }];
      id_token: [{ value: string; }];
    };
  };
}

export interface GoogleBearerToken {
  iss: string;
  sub: string;
  hd?: string;
  email: string;
  name?: string;
  picture?: string;
  exp: number;
}
