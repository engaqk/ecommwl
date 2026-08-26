const fs = require('fs');
const path = require('path');

const collectionsToUpdate = ['products', 'orders', 'reviews', 'customOrders', 'suppliers'];

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir('d:/ecommwl/src', function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    collectionsToUpdate.forEach(col => {
      // Replace collection(db, "products") -> collection(db, "products") but with where clause?
      // Actually, if we use a helper: tenantCollection(db, "products")
      
      // Let's do string replacement for subcollections:
      // from: collection(db, "products")
      // to: collection(db, `stores/${window.currentStoreId || 'default'}/products`)
    });
  }
});
