import decode from 'jwt-decode';
import dotenv from 'dotenv';
dotenv.config();

import { AuthTokensRow, GoogleBearerToken } from './types';
import { loadGoogleTokens } from './lib/bigTable';
import prisma from './lib/prisma';
import fakeData from './fakeData';

const prepareWorkspaces = async (rows: AuthTokensRow[]): Promise<void> => {
  const workspaces: Array<string> = [];

  rows.forEach((row) => {
    const { hd } = decode(row.data.googleTokens.id_token[0].value) as GoogleBearerToken;

    if (hd != null && !workspaces.includes(hd)) {
      workspaces.push(hd)
    }
  });

  await prisma.workspace.createMany({
    skipDuplicates: true,
    data: workspaces.map((w) => ({
      domain: w, name: w, status: 'active',
    })),
  });
}

const insert = async (row: AuthTokensRow): Promise<void> => {
  const TOKEN_PROVIDER = 'Google';
  const googleTokens = row.data.googleTokens;
  const { email, exp, hd, name, picture, sub } = decode(row.data.googleTokens.id_token[0].value) as GoogleBearerToken;

  await prisma.token.create({
    data: {
      provider: TOKEN_PROVIDER,
      providerAccountId: sub,
      scope: googleTokens.scopes[0].value,
      tokenType: googleTokens.token_type[0].value,
      accessToken: googleTokens.access_token[0].value,
      idToken: googleTokens.id_token[0].value,
      refreshToken: googleTokens.refresh_token[0].value,
      expiresAt: new Date(exp * 1000),
      user: {
        create: {
          email,
          name,
          image: picture,
          workspace: {
            ...(hd != null && { connect: { domain: hd } }),
          },
        },
      },
    },
    include: { user: { include: { workspace: true } } },
  });
}

async function main() {
    const [rows] = process.env.USE_BIG_TABLE != null ? await loadGoogleTokens() : fakeData();

    await prepareWorkspaces(rows) // see https://stackoverflow.com/a/68582593/368026
    rows.forEach(async (row) => await insert(row));
}


main()
  .catch((e) => { throw e })
  .finally(async () => { await prisma.$disconnect() });
