const fs = require('fs');
const path = require('path');

// List of route files to fix
const routeFiles = [
  'patients.ts',
  'appointments.ts', 
  'clinical.ts',
  'opd.ts',
  'ipd.ts',
  'laboratory.ts',
  'pharmacy.ts',
  'billing.ts',
  'staff.ts',
  'inventory.ts',
  'reports.ts'
];

function fixFile(filePath) {
  try {
    let content = fs.readFileSync(filePath, 'utf8');
    
    // Fix require statements to import statements
    content = content.replace(/const { ([^}]+) } = require\('\.\.\/middleware\/validation'\);/, "import { $1 } from '../middleware/validation';");
    content = content.replace(/const { ([^}]+) } = require\('\.\.\/utils\/helpers'\);/, "import { $1 } from '../utils/helpers';");
    
    // Fix function signatures to use AuthRequest
    content = content.replace(/async \(req: Request, res: Response\): Promise<void> => \{/g, 'async (req: AuthRequest, res: Response): Promise<void> => {');
    content = content.replace(/async \(req: Request, res: Response, next: NextFunction\): Promise<void> => \{/g, 'async (req: AuthRequest, res: Response, next: NextFunction): Promise<void> => {');
    
    // Add AuthRequest import if not present
    if (content.includes('AuthRequest') && !content.includes("import { AuthRequest")) {
      content = content.replace(
        /import { logger } from '\.\.\/utils\/logger';/,
        "import { logger } from '../utils/logger';\nimport { AuthRequest, ApiResponse } from '../types';"
      );
    }
    
    // Write fixed file
    fs.writeFileSync(filePath, content);
    
    console.log(`Fixed: ${filePath}`);
  } catch (error) {
    console.error(`Error fixing ${filePath}:`, error.message);
  }
}

// Fix all route files
routeFiles.forEach(fileName => {
  const filePath = path.join(__dirname, 'src', 'routes', fileName);
  if (fs.existsSync(filePath)) {
    fixFile(filePath);
  } else {
    console.log(`File not found: ${filePath}`);
  }
});

console.log('Import fixes completed!');
