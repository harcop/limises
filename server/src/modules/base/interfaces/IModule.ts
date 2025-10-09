import { Router } from 'express';

export interface IModule {
  getRouter(): Router;
  getModuleName(): string;
}

export interface IModuleConfig {
  name: string;
  path: string;
  dependencies?: string[];
}
