// 🚚 외부 실행자 – 택배사 객체 (배송을 실제로 실행하는 주체)
const CJLogistics = {
  ship(packageName) {
    console.log(`📦 CJ대한통운에서 "${packageName}" 배송을 시작합니다.`);
  },
};

const LotteCourier = {
  ship(packageName) {
    console.log(`🚚 롯데택배에서 "${packageName}" 배송이 시작됩니다.`);
  },
};

// 🏭 물류 서비스 – 실제 처리자 (택배사에 업무를 위임)
function createLogisticsService(deliveryCompany) {
  return {
    processDelivery(packageName) {
      console.log(`[LogisticsService] "${packageName}" 배송 처리 시작`);
      deliveryCompany.ship(packageName); // 외부 실행자(택배사)에게 배송 위임
    },
  };
}

// 🧭 컨트롤러 – 흐름을 조율하는 관리자 (앱과 물류팀 사이에서 요청 전달)
function createLogisticsController(service) {
  return {
    send(packageName) {
      console.log(`[Controller] "${packageName}" 요청 접수 → 물류팀으로 전달`);
      service.processDelivery(packageName); // 물류 서비스에 위임
    },
  };
}

// 📱 앱 – 사용자 인터페이스 객체 (고객이 직접 사용하는 앱)
function createDeliveryApp(controller, customerName) {
  return {
    customerName,
    requestDelivery(packageName) {
      console.log(
        `${this.customerName}님이 "${packageName}" 배송을 요청했습니다.`
      );
      controller.send(packageName); // 컨트롤러에 요청 위임
    },
  };
}

// 🧩 객체 조립 및 실행 예시 (위임 구조로 협력)

// ✅ 테스트 1: CJ대한통운으로 연결
const service1 = createLogisticsService(CJLogistics); // 물류 서비스에 CJ대한통운 연결
const controller1 = createLogisticsController(service1); // 컨트롤러 생성
const jihyunApp = createDeliveryApp(controller1, "지현"); // 지현 고객 앱 생성

jihyunApp.requestDelivery("무선 키보드");
// 👉 "지현님이 '무선 키보드' 배송을 요청했습니다."
// 👉 "[Controller] '무선 키보드' 요청 접수 → 물류팀으로 전달"
// 👉 "[LogisticsService] '무선 키보드' 배송 처리 시작"
// 👉 "📦 CJ대한통운에서 '무선 키보드' 배송을 시작합니다."

// ✅ 테스트 2: 롯데택배로 연결
const service2 = createLogisticsService(LotteCourier); // 물류 서비스에 롯데택배 연결
const controller2 = createLogisticsController(service2); // 컨트롤러 생성
const minjiApp = createDeliveryApp(controller2, "민지"); // 민지 고객 앱 생성

minjiApp.requestDelivery("무선 이어폰");
// 👉 "민지님이 '무선 이어폰' 배송을 요청했습니다."
// 👉 "[Controller] '무선 이어폰' 요청 접수 → 물류팀으로 전달"
// 👉 "[LogisticsService] '무선 이어폰' 배송 처리 시작"
// 👉 "🚚 롯데택배에서 '무선 이어폰' 배송이 시작됩니다."
