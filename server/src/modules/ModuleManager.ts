import { ModuleRegistry } from './ModuleRegistry';
import { InventoryModule } from './inventory/InventoryModule';
import { PatientsModule } from './patients/PatientsModule';
import { AppointmentsModule } from './appointments/AppointmentsModule';
import { ClinicalModule } from './clinical/ClinicalModule';
import { StaffModule } from './staff/StaffModule';
import { BillingModule } from './billing/BillingModule';
import { PharmacyModule } from './pharmacy/PharmacyModule';
import { LaboratoryModule } from './laboratory/LaboratoryModule';
import { OpdModule } from './opd/OpdModule';
import { IpdModule } from './ipd/IpdModule';
import { EmergencyModule } from './emergency/EmergencyModule';
import { OperationTheatreModule } from './operationTheatre/OperationTheatreModule';
import { RadiologyModule } from './radiology/RadiologyModule';
import { HumanResourcesModule } from './humanResources/HumanResourcesModule';
import { SystemIntegrationModule } from './systemIntegration/SystemIntegrationModule';
import { ReportsModule } from './reports/ReportsModule';
import { logger } from '../utils/logger';

export class ModuleManager {
  private registry: ModuleRegistry;

  constructor() {
    this.registry = new ModuleRegistry();
    this.initializeModules();
  }

  private initializeModules(): void {
    logger.info('[ModuleManager] Initializing modules...');

    // Register all modules
    this.registry.registerModule({
      name: 'patients',
      path: '/api/patients',
      module: new PatientsModule(),
      dependencies: []
    });

    this.registry.registerModule({
      name: 'appointments',
      path: '/api/appointments',
      module: new AppointmentsModule(),
      dependencies: ['patients']
    });

    this.registry.registerModule({
      name: 'clinical',
      path: '/api/clinical',
      module: new ClinicalModule(),
      dependencies: ['patients', 'appointments']
    });

    this.registry.registerModule({
      name: 'staff',
      path: '/api/staff',
      module: new StaffModule(),
      dependencies: []
    });

    this.registry.registerModule({
      name: 'billing',
      path: '/api/billing',
      module: new BillingModule(),
      dependencies: ['patients', 'appointments']
    });

    this.registry.registerModule({
      name: 'inventory',
      path: '/api/inventory',
      module: new InventoryModule(),
      dependencies: []
    });

    this.registry.registerModule({
      name: 'pharmacy',
      path: '/api/pharmacy',
      module: new PharmacyModule(),
      dependencies: ['clinical', 'inventory']
    });

    this.registry.registerModule({
      name: 'laboratory',
      path: '/api/lab',
      module: new LaboratoryModule(),
      dependencies: ['patients', 'clinical']
    });

    this.registry.registerModule({
      name: 'opd',
      path: '/api/opd',
      module: new OpdModule(),
      dependencies: ['patients', 'appointments', 'clinical']
    });

    this.registry.registerModule({
      name: 'ipd',
      path: '/api/ipd',
      module: new IpdModule(),
      dependencies: ['patients', 'appointments', 'clinical']
    });

    this.registry.registerModule({
      name: 'emergency',
      path: '/api/emergency',
      module: new EmergencyModule(),
      dependencies: ['patients', 'clinical']
    });

    this.registry.registerModule({
      name: 'operationTheatre',
      path: '/api/ot',
      module: new OperationTheatreModule(),
      dependencies: ['patients', 'clinical', 'inventory']
    });

    this.registry.registerModule({
      name: 'radiology',
      path: '/api/radiology',
      module: new RadiologyModule(),
      dependencies: ['patients', 'clinical']
    });

    this.registry.registerModule({
      name: 'humanResources',
      path: '/api/hr',
      module: new HumanResourcesModule(),
      dependencies: ['staff']
    });

    this.registry.registerModule({
      name: 'systemIntegration',
      path: '/api/integration',
      module: new SystemIntegrationModule(),
      dependencies: []
    });

    this.registry.registerModule({
      name: 'reports',
      path: '/api/reports',
      module: new ReportsModule(),
      dependencies: ['patients', 'appointments', 'clinical', 'billing']
    });

    logger.info(`[ModuleManager] Initialized ${this.registry.getModuleNames().length} modules`);
  }

  public getRegistry(): ModuleRegistry {
    return this.registry;
  }

  public getModuleRouter(): any {
    return this.registry.getRouter();
  }

  public getModuleInfo(): { name: string; path: string; dependencies: string[] }[] {
    return this.registry.getAllModules().map(module => ({
      name: module.name,
      path: module.path,
      dependencies: module.dependencies || []
    }));
  }
}
