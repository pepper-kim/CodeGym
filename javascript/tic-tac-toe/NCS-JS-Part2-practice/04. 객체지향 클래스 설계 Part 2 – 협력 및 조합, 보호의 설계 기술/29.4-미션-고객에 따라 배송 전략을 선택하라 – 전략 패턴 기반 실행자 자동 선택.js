// ✅ 1. 택배사(실행자) 객체 정의 – 인터페이스 규약: ship(packageName)
const CJLogistics = {
  ship(packageName) {
    console.log(`📦 [CJ대한통운] "${packageName}" 배송을 시작합니다.`);
  },
};

const FedExKorea = {
  ship(packageName) {
    console.log(`✈️ [FedEx Korea] "${packageName}" 해외배송 시작`);
  },
};

const DHLExpress = {
  ship(packageName) {
    console.log(`🚀 [DHL] "${packageName}" 국제 특송 시작`);
  },
};

// ✅ 2. 인터페이스 검증 함수 (방어적 프로그래밍)
function validateDeliveryCompany(obj) {
  if (!obj || typeof obj.ship !== "function") {
    throw new Error(
      "❌ 택배사 객체는 반드시 ship(packageName) 메서드를 포함해야 합니다."
    );
  }
}

// ✅ 3. 물류 서비스 객체 – OCP 실현 (새 택배사 추가 시 수정 없음)
function createLogisticsService(deliveryCompany) {
  validateDeliveryCompany(deliveryCompany); // 인터페이스 검증
  return {
    processDelivery(packageName) {
      console.log(`[LogisticsService] "${packageName}" 배송 준비 중...`);
      deliveryCompany.ship(packageName); // 다형성 기반 실행
    },
  };
}

// ✅ 4. 컨트롤러 객체 – 요청 중계 (SRP 실현)
function createLogisticsController(service) {
  return {
    send(packageName) {
      console.log(
        `[Controller] "${packageName}" 요청을 물류팀으로 전달합니다.`
      );
      service.processDelivery(packageName); // 물류 서비스에 위임
    },
  };
}

// ✅ 5. 전략 선택 함수 – Strategy 패턴 적용 (OCP, SRP 실현)
function selectCourierStrategy(customer) {
  if (customer.type === "vip") {
    return FedExKorea; // VIP 고객 → FedEx Korea
  }
  if (customer.region === "international") {
    return DHLExpress; // 해외 배송 → DHL Express
  }
  return CJLogistics; // 기본 → CJ대한통운
}

// ✅ 6. 앱 생성 함수 – 전략 패턴 기반 실행자 자동 선택
function createDeliveryApp(customer) {
  const courier = selectCourierStrategy(customer); // 전략 선택
  const service = createLogisticsService(courier);
  const controller = createLogisticsController(service);

  return {
    requestDelivery(packageName) {
      console.log(`${customer.name}님이 "${packageName}" 배송을 요청했습니다.`);
      controller.send(packageName); // 컨트롤러에 요청 위임
    },
  };
}

// ✅ 7. 실행 예시 – 다양한 전략 시나리오 테스트
const customers = [
  { name: "민지", type: "vip", region: "domestic" }, // VIP → FedExKorea
  { name: "지훈", type: "normal", region: "international" }, // 해외 → DHLExpress
  { name: "유나", type: "normal", region: "domestic" }, // 일반 → CJLogistics
];

for (const customer of customers) {
  const app = createDeliveryApp(customer);
  app.requestDelivery("스마트워치");
}

/*
📝 실행 결과:

민지님이 "스마트워치" 배송을 요청했습니다.
[Controller] "스마트워치" 요청을 물류팀으로 전달합니다.
[LogisticsService] "스마트워치" 배송 준비 중...
✈️ [FedEx Korea] "스마트워치" 해외배송 시작

지훈님이 "스마트워치" 배송을 요청했습니다.
[Controller] "스마트워치" 요청을 물류팀으로 전달합니다.
[LogisticsService] "스마트워치" 배송 준비 중...
🚀 [DHL] "스마트워치" 국제 특송 시작

유나님이 "스마트워치" 배송을 요청했습니다.
[Controller] "스마트워치" 요청을 물류팀으로 전달합니다.
[LogisticsService] "스마트워치" 배송 준비 중...
📦 [CJ대한통운] "스마트워치" 배송을 시작합니다.
*/
