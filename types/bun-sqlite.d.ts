declare module "bun:sqlite" {
  export class Database {
    constructor(path: string, options?: any);
    query(sql: string): {
      get(...params: any[]): any;
      all(...params: any[]): any[];
    };
    run(sql: string, params?: any[]): any;
  }
} 