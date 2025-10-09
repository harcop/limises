import { Router } from 'express';
import { BaseModule } from './base/Module';
import { InventoryModule } from './inventory/InventoryModule';
import { logger } from '../utils/logger';

export interface ModuleConfig {
  name: string;
  path: string;
  module: BaseModule;
  dependencies?: string[];
}

export class ModuleRegistry {
  private modules: Map<string, ModuleConfig> = new Map();
  private router: Router;

  constructor() {
    this.router = Router();
  }

  public registerModule(config: ModuleConfig): void {
    if (this.modules.has(config.name)) {
      throw new Error(`Module ${config.name} is already registered`);
    }

    // Check dependencies
    if (config.dependencies) {
      for (const dependency of config.dependencies) {
        if (!this.modules.has(dependency)) {
          throw new Error(`Module ${config.name} depends on ${dependency} which is not registered`);
        }
      }
    }

    this.modules.set(config.name, config);
    this.router.use(config.path, config.module.getRouter());
    
    logger.info(`[ModuleRegistry] Registered module: ${config.name} at path: ${config.path}`);
  }

  public getModule(name: string): BaseModule | undefined {
    const config = this.modules.get(name);
    return config?.module;
  }

  public getAllModules(): ModuleConfig[] {
    return Array.from(this.modules.values());
  }

  public getRouter(): Router {
    return this.router;
  }

  public getModuleNames(): string[] {
    return Array.from(this.modules.keys());
  }

  public isModuleRegistered(name: string): boolean {
    return this.modules.has(name);
  }
}
