const fs = require('fs');
const path = require('path');

const servicesDir = path.join(__dirname, 'src', 'app', 'services');

fs.readdirSync(servicesDir).forEach(file => {
    if (!file.endsWith('.service.ts')) return;
    const filePath = path.join(servicesDir, file);
    let content = fs.readFileSync(filePath, 'utf8');
    
    let modified = false;

    // Remove const BASE_URL
    if (content.includes("const BASE_URL = 'http://localhost:3000';")) {
        content = content.replace("const BASE_URL = 'http://localhost:3000';", "");
        if (!content.includes('../enviroment/enviroment')) {
            const importLines = content.split('\n').filter(l => l.startsWith('import'));
            if (importLines.length > 0) {
                const lastImport = importLines[importLines.length - 1];
                const lastImportIndex = content.lastIndexOf(lastImport);
                const insertIndex = content.indexOf('\n', lastImportIndex) + 1;
                content = content.slice(0, insertIndex) + "import { environment } from '../enviroment/enviroment';\n" + content.slice(insertIndex);
            }
        }
        modified = true;
    }
    
    // Replace ${BASE_URL} with ${environment.apiUrl}
    if (content.includes('${BASE_URL}')) {
        content = content.replace(/\$\{BASE_URL\}/g, '${environment.apiUrl}');
        modified = true;
    }

    if (modified) {
        fs.writeFileSync(filePath, content);
        console.log(`Updated ${file}`);
    }
});
