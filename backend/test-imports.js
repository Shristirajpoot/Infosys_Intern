// Test admin controller imports
console.log('Testing admin controller imports...');

try {
  const adminController = require('./controllers/admin.controller.js');
  console.log('✅ Admin controller imported successfully');
  console.log('Available functions:', Object.keys(adminController));
} catch (error) {
  console.log('❌ Error importing admin controller:', error.message);
}

try {
  const protectRoute = require('./middleware/protectRoute.js');
  console.log('✅ ProtectRoute middleware imported successfully');
} catch (error) {
  console.log('❌ Error importing protectRoute:', error.message);
}

try {
  const adminRoutes = require('./routes/admin.routes.js');
  console.log('✅ Admin routes imported successfully');
} catch (error) {
  console.log('❌ Error importing admin routes:', error.message);
}
