// Test import certificateController
console.log('Testing import...');

try {
  const controller = require('./src/controller/certificateController');
  console.log('✅ Import successful!');
  console.log('Exported functions:', Object.keys(controller));
  
  // Verify all functions exist
  const required = [
    'getPendingCertificates',
    'getAllCertificates',
    'approveCertificate',
    'rejectCertificate',
    'getMyCertificates',
    'getCertificateStatus'
  ];
  
  required.forEach(fn => {
    if (typeof controller[fn] === 'function') {
      console.log(`✅ ${fn}: OK`);
    } else {
      console.log(`❌ ${fn}: MISSING`);
    }
  });
  
} catch (error) {
  console.error('❌ Import failed:', error.message);
  console.error(error.stack);
}
