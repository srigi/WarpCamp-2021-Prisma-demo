import { Bigtable, Table } from '@google-cloud/bigtable';

import { AuthTokensRow } from '../types';

export const AUTH_TOKENS_TABLE = 'AuthTokens';
export const AUTH_TOKENS_GOOGLE_TOKENS_COLUMN_FAMILY = 'googleTokens';

const bigtable = new Bigtable({
  projectId: process.env.GOOG_PROJECT_ID,
});
const instance = bigtable.instance(process.env.BIGTABLE_INSTANCE_ID!);

const checkSchema = async (tableName: string, table: Table): Promise<void> => {
  const [tableSchema] = await table.getFamilies();
  switch (tableName) {
    case AUTH_TOKENS_TABLE:
      if (!tableSchema.some(
        (f) => f.id === AUTH_TOKENS_GOOGLE_TOKENS_COLUMN_FAMILY,
      )) {
        throw new Error(`>>> checkSchema(); non-existing column family ${AUTH_TOKENS_GOOGLE_TOKENS_COLUMN_FAMILY}`);
      }
      break;

    default:
      throw new Error(`>>> checkSchema(); Unknown table name "${tableName}"`);
  }
};

export const getTable = async (tableName: string): Promise<Table> => {
  const table = instance.table(tableName);
  const [tableExists] = await table.exists();

  if (!tableExists) {
    throw new Error(`>>> getTable(); non-existing table "${tableName}"`);
  }

  await checkSchema(tableName, table);

  return table;
};

export const loadGoogleTokens = async (): Promise<AuthTokensRow[][]> => {
  const authTokensTable = await getTable(AUTH_TOKENS_TABLE);

  return  await authTokensTable.getRows({
    filter:[
      { column: { cellLimit: 1 } }, // retrieve only the most recent version of the cell
    ]
  }) as AuthTokensRow[][];
}
