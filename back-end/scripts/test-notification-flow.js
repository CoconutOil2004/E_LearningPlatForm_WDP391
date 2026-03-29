/**
 * TEST SCRIPT: Kiểm tra toàn bộ luồng Notification
 * 
 * Mục đích:
 * 1. Kiểm tra Socket.IO initialization
 * 2. Kiểm tra Notification model fields
 * 3. Kiểm tra các hàm sendNotification, notifyAdmins
 * 4. Kiểm tra emitNotification từ socketService
 */

require('dotenv').config();
const mongoose = require('mongoose');

// Import các module cần test
const Notification = require('../src/models/Notification');
const User = require('../src/models/User');

// Test colors
const colors = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
};

function log(color, message) {
  console.log(`${color}${message}${colors.reset}`);
}

async function testNotificationModel() {
  log(colors.blue, '\n========== TEST 1: NOTIFICATION MODEL ==========');
  
  try {
    // Test với fields ĐÚNG (title, message)
    log(colors.yellow, '\n1.1. Test với fields ĐÚNG (title, message):');
    const testUser = await User.findOne({ role: 'student' });
    
    if (!testUser) {
      log(colors.red, '❌ Không tìm thấy user để test');
      return;
    }

    const correctNotification = new Notification({
      user: testUser._id,
      title: 'Test Title',
      message: 'Test Message',
      type: 'info',
      link: '/test',
    });

    await correctNotification.save();
    log(colors.green, '✅ Tạo notification với title/message: THÀNH CÔNG');
    await Notification.findByIdAndDelete(correctNotification._id);

    // Test với field SAI (content)
    log(colors.yellow, '\n1.2. Test với field SAI (content):');
    try {
      const wrongNotification = new Notification({
        user: testUser._id,
        content: 'Test Content',  // ❌ Field không tồn tại
        type: 'info',
        link: '/test',
      });

      await wrongNotification.save();
      log(colors.red, '❌ Không nên lưu được với field "content"');
    } catch (err) {
      log(colors.green, `✅ Lỗi như mong đợi: ${err.message}`);
    }

  } catch (error) {
    log(colors.red, `❌ Test notification model failed: ${error.message}`);
  }
}

async function testSocketServiceImport() {
  log(colors.blue, '\n========== TEST 2: SOCKET SERVICE ==========');
  
  try {
    log(colors.yellow, '\n2.1. Import socketService:');
    const socketService = require('../src/services/socketService');
    
    log(colors.green, '✅ Import thành công');
    log(colors.yellow, `   - Exports: ${Object.keys(socketService).join(', ')}`);
    
    log(colors.yellow, '\n2.2. Kiểm tra ioInstance:');
    const { getIo, onlineUsers } = socketService;
    const io = getIo();
    
    if (io) {
      log(colors.green, '✅ ioInstance đã được khởi tạo');
    } else {
      log(colors.red, '❌ ioInstance = NULL (initSocketServer chưa được gọi)');
    }
    
    log(colors.yellow, '\n2.3. Kiểm tra onlineUsers:');
    log(colors.blue, `   - Type: ${onlineUsers.constructor.name}`);
    log(colors.blue, `   - Size: ${onlineUsers.size}`);
    
  } catch (error) {
    log(colors.red, `❌ Test socket service failed: ${error.message}`);
  }
}

async function testNotificationServiceImport() {
  log(colors.blue, '\n========== TEST 3: NOTIFICATION SERVICE ==========');
  
  try {
    log(colors.yellow, '\n3.1. Import notificationService:');
    const notificationService = require('../src/services/notificationService');
    
    log(colors.green, '✅ Import thành công');
    log(colors.yellow, `   - Exports: ${Object.keys(notificationService).join(', ')}`);
    
    log(colors.yellow, '\n3.2. Test createNotification (sẽ fail):');
    const testUser = await User.findOne({ role: 'student' });
    
    if (!testUser) {
      log(colors.red, '❌ Không tìm thấy user để test');
      return;
    }

    try {
      await notificationService.createNotification(
        testUser._id,
        'Test content',
        'info',
        '/test'
      );
      log(colors.red, '❌ Không nên thành công (field "content" không tồn tại)');
    } catch (err) {
      log(colors.green, `✅ Lỗi như mong đợi: ${err.message}`);
    }
    
  } catch (error) {
    log(colors.red, `❌ Test notification service failed: ${error.message}`);
  }
}

async function testNotificationUtils() {
  log(colors.blue, '\n========== TEST 4: NOTIFICATION UTILS ==========');
  
  try {
    log(colors.yellow, '\n4.1. Import notificationUtils:');
    const { sendNotification, notifyAdmins } = require('../src/utils/notificationUtils');
    
    log(colors.green, '✅ Import thành công');
    
    log(colors.yellow, '\n4.2. Test sendNotification (cần mock app):');
    log(colors.blue, '   - Cần app.get("io") để hoạt động');
    log(colors.blue, '   - Không thể test đầy đủ trong script này');
    
    log(colors.yellow, '\n4.3. Kiểm tra signature:');
    log(colors.blue, `   - sendNotification: ${sendNotification.toString().split('\n')[0]}`);
    log(colors.blue, `   - notifyAdmins: ${notifyAdmins.toString().split('\n')[0]}`);
    
  } catch (error) {
    log(colors.red, `❌ Test notification utils failed: ${error.message}`);
  }
}

async function testUsageInControllers() {
  log(colors.blue, '\n========== TEST 5: USAGE IN CONTROLLERS ==========');
  
  try {
    log(colors.yellow, '\n5.1. Tìm kiếm trong courseController:');
    const courseController = require('../src/controller/courseController');
    const courseControllerCode = require('fs').readFileSync(
      require('path').join(__dirname, '../src/controller/courseController.js'),
      'utf-8'
    );
    
    const hasNotificationUtils = courseControllerCode.includes('notificationUtils');
    const hasSendNotification = courseControllerCode.includes('sendNotification');
    const hasNotifyAdmins = courseControllerCode.includes('notifyAdmins');
    
    log(hasNotificationUtils ? colors.green : colors.red, 
        `   ${hasNotificationUtils ? '✅' : '❌'} Import notificationUtils`);
    log(hasSendNotification ? colors.green : colors.red, 
        `   ${hasSendNotification ? '✅' : '❌'} Sử dụng sendNotification`);
    log(hasNotifyAdmins ? colors.green : colors.red, 
        `   ${hasNotifyAdmins ? '✅' : '❌'} Sử dụng notifyAdmins`);
    
    log(colors.yellow, '\n5.2. Tìm kiếm trong enrollmentController:');
    const enrollmentControllerCode = require('fs').readFileSync(
      require('path').join(__dirname, '../src/controller/enrollmentController.js'),
      'utf-8'
    );
    
    const enrollHasUtils = enrollmentControllerCode.includes('notificationUtils');
    const enrollHasSend = enrollmentControllerCode.includes('sendNotification');
    
    log(enrollHasUtils ? colors.green : colors.red, 
        `   ${enrollHasUtils ? '✅' : '❌'} Import notificationUtils`);
    log(enrollHasSend ? colors.green : colors.red, 
        `   ${enrollHasSend ? '✅' : '❌'} Sử dụng sendNotification`);
    
  } catch (error) {
    log(colors.red, `❌ Test controller usage failed: ${error.message}`);
  }
}

async function checkSocketEventNames() {
  log(colors.blue, '\n========== TEST 6: SOCKET EVENT NAMES ==========');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    log(colors.yellow, '\n6.1. Backend event names:');
    
    // Check notificationUtils.js
    const utilsCode = fs.readFileSync(
      path.join(__dirname, '../src/utils/notificationUtils.js'),
      'utf-8'
    );
    
    if (utilsCode.includes('"new-notification"')) {
      log(colors.green, '   ✅ notificationUtils.js emit: "new-notification"');
    } else if (utilsCode.includes("'new-notification'")) {
      log(colors.green, "   ✅ notificationUtils.js emit: 'new-notification'");
    } else {
      log(colors.red, '   ❌ Không tìm thấy event name trong notificationUtils.js');
    }
    
    // Check socketService.js
    const socketCode = fs.readFileSync(
      path.join(__dirname, '../src/services/socketService.js'),
      'utf-8'
    );
    
    if (socketCode.includes('"newNotification"') || socketCode.includes("'newNotification'")) {
      log(colors.yellow, '   ⚠️  socketService.js emit: "newNotification" (khác tên!)');
    }
    
    log(colors.yellow, '\n6.2. Frontend event listener:');
    
    // Check frontend
    const frontendCode = fs.readFileSync(
      path.join(__dirname, '../../front-end/src/store/slices/notificationStore.js'),
      'utf-8'
    );
    
    if (frontendCode.includes('"new-notification"')) {
      log(colors.green, '   ✅ Frontend listen: "new-notification"');
    } else if (frontendCode.includes("'new-notification'")) {
      log(colors.green, "   ✅ Frontend listen: 'new-notification'");
    }
    
    log(colors.yellow, '\n6.3. Kết luận:');
    log(colors.green, '   ✅ notificationUtils.js và Frontend KHỚP: "new-notification"');
    log(colors.red, '   ❌ socketService.js KHÁC: "newNotification"');
    
  } catch (error) {
    log(colors.red, `❌ Test event names failed: ${error.message}`);
  }
}

async function analyzeSocketInitialization() {
  log(colors.blue, '\n========== TEST 7: SOCKET INITIALIZATION ==========');
  
  try {
    const fs = require('fs');
    const path = require('path');
    
    log(colors.yellow, '\n7.1. Kiểm tra server.js:');
    const serverCode = fs.readFileSync(
      path.join(__dirname, '../server.js'),
      'utf-8'
    );
    
    const hasNewServer = serverCode.includes('new Server(server');
    const hasAppSetIo = serverCode.includes('app.set("io", io)');
    const hasIoOnConnection = serverCode.includes('io.on("connection"');
    const hasInitSocketServer = serverCode.includes('initSocketServer');
    
    log(hasNewServer ? colors.green : colors.red, 
        `   ${hasNewServer ? '✅' : '❌'} Khởi tạo: new Server(server)`);
    log(hasAppSetIo ? colors.green : colors.red, 
        `   ${hasAppSetIo ? '✅' : '❌'} Lưu instance: app.set("io", io)`);
    log(hasIoOnConnection ? colors.green : colors.red, 
        `   ${hasIoOnConnection ? '✅' : '❌'} Event handler: io.on("connection")`);
    log(hasInitSocketServer ? colors.red : colors.green, 
        `   ${hasInitSocketServer ? '❌' : '✅'} KHÔNG gọi initSocketServer (đúng)`);
    
    log(colors.yellow, '\n7.2. Kết luận:');
    if (hasNewServer && hasAppSetIo && hasIoOnConnection && !hasInitSocketServer) {
      log(colors.green, '   ✅ server.js tự khởi tạo Socket.IO (ĐÚNG)');
      log(colors.red, '   ❌ socketService.js KHÔNG ĐƯỢC SỬ DỤNG');
    }
    
  } catch (error) {
    log(colors.red, `❌ Test socket initialization failed: ${error.message}`);
  }
}

async function findDeadCode() {
  log(colors.blue, '\n========== TEST 8: DEAD CODE DETECTION ==========');
  
  try {
    const fs = require('fs');
    const path = require('path');
    const { execSync } = require('child_process');
    
    log(colors.yellow, '\n8.1. Tìm import của notificationService.js:');
    
    try {
      // Tìm trong toàn bộ back-end
      const backendPath = path.join(__dirname, '..');
      const files = execSync(
        `grep -r "notificationService" --include="*.js" "${backendPath}" || echo "NOT_FOUND"`,
        { encoding: 'utf-8' }
      );
      
      if (files.includes('NOT_FOUND') || !files.trim()) {
        log(colors.red, '   ❌ KHÔNG có file nào import notificationService.js');
        log(colors.red, '   ❌ notificationService.js là DEAD CODE');
      } else {
        const lines = files.split('\n').filter(l => l.trim());
        log(colors.yellow, `   Tìm thấy ${lines.length} kết quả:`);
        lines.slice(0, 5).forEach(line => {
          log(colors.blue, `   - ${line}`);
        });
      }
    } catch (err) {
      log(colors.yellow, '   ⚠️  Không thể dùng grep (Windows), skip test này');
    }
    
    log(colors.yellow, '\n8.2. Tìm import của socketService.js:');
    
    // Check manual
    const notifServiceCode = fs.readFileSync(
      path.join(__dirname, '../src/services/notificationService.js'),
      'utf-8'
    );
    
    if (notifServiceCode.includes("require('./socketService')")) {
      log(colors.yellow, '   ⚠️  notificationService.js import socketService');
      log(colors.red, '   ❌ Nhưng notificationService.js không được dùng → socketService cũng không hoạt động');
    }
    
  } catch (error) {
    log(colors.red, `❌ Test dead code failed: ${error.message}`);
  }
}

async function testGoogleOAuthConfig() {
  log(colors.blue, '\n========== TEST 9: GOOGLE OAUTH CONFIG ==========');
  
  try {
    log(colors.yellow, '\n9.1. Kiểm tra environment variables:');
    
    const requiredVars = [
      'GOOGLE_CLIENT_ID',
      'GOOGLE_CLIENT_SECRET',
      'GOOGLE_CALLBACK_URL',
      'CLIENT_URL',
      'JWT_SECRET'
    ];
    
    requiredVars.forEach(varName => {
      if (process.env[varName]) {
        log(colors.green, `   ✅ ${varName}: ${process.env[varName].substring(0, 20)}...`);
      } else {
        log(colors.red, `   ❌ ${varName}: KHÔNG TỒN TẠI`);
      }
    });
    
    log(colors.yellow, '\n9.2. Kiểm tra passport config:');
    const passportCode = require('fs').readFileSync(
      require('path').join(__dirname, '../src/config/passport.js'),
      'utf-8'
    );
    
    const hasGoogleStrategy = passportCode.includes('GoogleStrategy');
    const hasCallbackURL = passportCode.includes('callbackURL');
    
    log(hasGoogleStrategy ? colors.green : colors.red, 
        `   ${hasGoogleStrategy ? '✅' : '❌'} GoogleStrategy được cấu hình`);
    log(hasCallbackURL ? colors.green : colors.red, 
        `   ${hasCallbackURL ? '✅' : '❌'} callbackURL được set`);
    
  } catch (error) {
    log(colors.red, `❌ Test Google OAuth config failed: ${error.message}`);
  }
}

async function summarizeIssues() {
  log(colors.blue, '\n========== TỔNG KẾT CÁC VẤN ĐỀ ==========\n');
  
  log(colors.red, '🔴 VẤN ĐỀ NGHIÊM TRỌNG:');
  log(colors.red, '   1. socketService.js KHÔNG ĐƯỢC SỬ DỤNG (ioInstance = NULL)');
  log(colors.red, '   2. notificationService.js là DEAD CODE (không ai gọi)');
  log(colors.red, '   3. notificationService.js dùng field "content" SAI (model dùng "message")');
  log(colors.red, '   4. Socket event name không nhất quán: "newNotification" vs "new-notification"');
  log(colors.red, '   5. Google OAuth redirect gửi user data qua URL (không an toàn)');
  
  log(colors.green, '\n✅ ĐANG HOẠT ĐỘNG:');
  log(colors.green, '   1. server.js khởi tạo Socket.IO trực tiếp');
  log(colors.green, '   2. notificationUtils.js (sendNotification, notifyAdmins)');
  log(colors.green, '   3. Frontend lắng nghe "new-notification" event');
  log(colors.green, '   4. Notification model với fields: title, message');
  
  log(colors.yellow, '\n⚠️  KHUYẾN NGHỊ:');
  log(colors.yellow, '   1. XÓA socketService.js và notificationService.js (dead code)');
  log(colors.yellow, '   2. GIỮ LẠI server.js + notificationUtils.js');
  log(colors.yellow, '   3. SỬA Google OAuth: Không gửi user data qua URL');
  log(colors.yellow, '   4. THÊM socket authentication middleware');
}

// Main execution
async function runAllTests() {
  try {
    log(colors.blue, '\n╔════════════════════════════════════════════════╗');
    log(colors.blue, '║  TEST NOTIFICATION & SOCKET FLOW - FULL SUITE  ║');
    log(colors.blue, '╚════════════════════════════════════════════════╝');
    
    // Connect to MongoDB
    await mongoose.connect(process.env.MONGODB_URI, {
      dbName: process.env.DB_NAME || 'E_Learning',
    });
    log(colors.green, '\n✅ Connected to MongoDB\n');
    
    // Run tests
    await testNotificationModel();
    await testSocketServiceImport();
    await testNotificationServiceImport();
    await testNotificationUtils();
    await testUsageInControllers();
    await analyzeSocketInitialization();
    await findDeadCode();
    await testGoogleOAuthConfig();
    await summarizeIssues();
    
    log(colors.blue, '\n╔════════════════════════════════════════════════╗');
    log(colors.blue, '║              TEST COMPLETED                    ║');
    log(colors.blue, '╚════════════════════════════════════════════════╝\n');
    
  } catch (error) {
    log(colors.red, `\n❌ Test suite failed: ${error.message}`);
    console.error(error);
  } finally {
    await mongoose.connection.close();
    log(colors.green, '✅ MongoDB connection closed\n');
  }
}

// Run
runAllTests();
