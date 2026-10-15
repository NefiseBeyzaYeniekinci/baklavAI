declare module "node:sqlite" {
  export class DatabaseSync {
    constructor(location: string, options?: any);
    close(): void;
    exec(sql: string): void;
    prepare(sql: string): {
      run(...params: any[]): { changes: number; lastInsertRowid: number | bigint };
      get(...params: any[]): any;
      all(...params: any[]): any[];
    };
  }
}
