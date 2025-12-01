import { type SQL, and, isNull } from 'drizzle-orm';
import type { PgColumn, PgSelect } from 'drizzle-orm/pg-core';

/**
 * deletedAtカラムを持つテーブルの型定義
 */
export interface TableWithSoftDelete {
  deletedAt: PgColumn<{
    name: string;
    tableName: string;
    dataType: 'date';
    columnType: 'PgTimestamp';
    data: Date | null;
    driverParam: string;
    notNull: false;
    hasDefault: false;
    isPrimaryKey: false;
    isAutoincrement: false;
    hasRuntimeDefault: false;
    enumValues: undefined;
    baseColumn: never;
    generated: undefined;
  }>;
}

/**
 * 削除されていないレコードのみを取得するフィルター
 */
export const excludeDeleted = <T extends TableWithSoftDelete>(table: T): SQL<unknown> => {
  return isNull(table.deletedAt);
};

/**
 * 既存の条件と削除フィルターを組み合わせる
 */
export const whereAndExcludeDeleted = <T extends TableWithSoftDelete>(
  table: T,
  ...conditions: (SQL<unknown> | undefined)[]
): SQL<unknown> => {
  return and(excludeDeleted(table), ...conditions) as SQL<unknown>;
};

/**
 * $dynamic()クエリに削除フィルターを適用
 */
export const withSoftDelete = <T extends PgSelect, S extends TableWithSoftDelete>(
  qb: T,
  table: S
): T => {
  return qb.where(isNull(table.deletedAt)) as T;
};
