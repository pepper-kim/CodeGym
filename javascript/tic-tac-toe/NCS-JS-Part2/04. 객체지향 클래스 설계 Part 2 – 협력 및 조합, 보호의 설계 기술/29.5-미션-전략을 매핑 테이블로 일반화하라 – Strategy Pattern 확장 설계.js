/* 
==========================================================
📚 OOP 개념 요약

1. ✅ 인터페이스 분리 (Interface Validation): 
   - validateDeliveryCompany로 택배사 객체가 반드시 ship 메서드를 가지도록 강제.

2. ✅ 전략 패턴 (Strategy Pattern): 
   - 다양한 배송 전략(CJ, FedEx, DHL)을 동적으로 선택.

3. ✅ 개방-폐쇄 원칙 (OCP): 
   - 전략 매핑 테이블로 신규 전략 추가 시 기존 코드를 수정하지 않음.

4. ✅ 단일 책임 원칙 (SRP): 
   - 서비스, 컨트롤러, 전략 선택, 앱 모두 명확하게 역할 분리.

5. ✅ 다형성 (Polymorphism): 
   - 배송 전략 객체는 ship 메서드를 통해 동일 인터페이스로 호출됨.

==========================================================
*/

// ✅ 1. 실행자(택배사) 객체 정의 – 인터페이스 규약: ship(packageName)
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
  // 인터페이스 강제: ship 메서드가 반드시 존재해야 함
  if (!obj || typeof obj.ship !== "function") {
    throw new Error(
      "❌ 택배사 객체는 반드시 ship(packageName) 메서드를 포함해야 합니다."
    );
  }
}

// ✅ 3. 물류 서비스 객체 – 실행자는 전략 패턴으로 주입 (OCP 실현)
function createLogisticsService(deliveryCompany) {
  validateDeliveryCompany(deliveryCompany); // 택배사 객체 유효성 검사 (인터페이스 검증)

  return {
    processDelivery(packageName) {
      console.log(`[LogisticsService] "${packageName}" 배송 준비 중...`);
      deliveryCompany.ship(packageName); // 다형성 기반 호출 (인터페이스에 의존)
    },
  };
}

// ✅ 4. 컨트롤러 객체 – SRP 실현 (요청 중계 역할만 담당)
function createLogisticsController(service) {
  return {
    send(packageName) {
      console.log(
        `[Controller] "${packageName}" 요청을 물류팀으로 전달합니다.`
      );
      service.processDelivery(packageName); // 물류 서비스에 업무 위임
    },
  };
}

// ✅ 5. 전략 매핑 테이블 – 전략 패턴 + 매핑 테이블 적용 (OCP, SRP 실현)
const courierStrategyMap = [
  {
    match: (customer) => customer.type === "vip", // VIP 고객
    strategy: FedExKorea, // FedEx Korea로 배송
  },
  {
    match: (customer) => customer.region === "international", // 해외 고객
    strategy: DHLExpress, // DHL로 배송
  },
  {
    match: () => true, // 기본 전략 (국내 일반 고객)
    strategy: CJLogistics,
  },
];

// ✅ 6. 전략 선택 함수 – 매핑 테이블 기반 실행자 결정
function selectCourierFromStrategyTable(customer) {
  for (const entry of courierStrategyMap) {
    if (entry.match(customer)) return entry.strategy; // 조건에 맞는 전략 반환
  }
  throw new Error("❌ 실행 전략을 찾지 못했습니다.");
}

// ✅ 7. 앱 생성 함수 – 전략 패턴으로 실행자 자동 주입
function createDeliveryApp(customer) {
  const courier = selectCourierFromStrategyTable(customer); // 적절한 전략 선택
  const service = createLogisticsService(courier); // 서비스 생성 (전략 주입)
  const controller = createLogisticsController(service); // 컨트롤러 생성

  return {
    requestDelivery(packageName) {
      console.log(`${customer.name}님이 "${packageName}" 배송을 요청했습니다.`);
      controller.send(packageName); // 컨트롤러에 요청 위임 (SRP 실현)
    },
  };
}

// ✅ 8. 실행 예시 – 다양한 전략 적용 테스트
const customers = [
  { name: "민지", type: "vip", region: "domestic" }, // VIP → FedEx Korea
  { name: "지훈", type: "normal", region: "international" }, // 해외 고객 → DHL Express
  { name: "유나", type: "normal", region: "domestic" }, // 국내 일반 고객 → CJ 대한통운
];

// 고객별로 앱을 생성하고 배송 요청 실행
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
