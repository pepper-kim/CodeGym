// 🚚 1. 택배사 객체 정의 – 인터페이스 규약: 반드시 ship(packageName) 메서드 포함
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

// ❌ 인터페이스 규약을 지키지 않는 잘못된 택배사 객체 (ship 메서드 없음)
const BrokenCourier = {
  deliver(packageName) {
    console.log(`🚫 "${packageName}"을 잘못된 방식으로 배송 시도 중입니다.`);
  },
};

// ✅ 2. 인터페이스 검증 함수 – 방어적 프로그래밍으로 OCP 보장
function validateDeliveryCompany(obj) {
  if (!obj || typeof obj.ship !== "function") {
    throw new Error(
      "❌ 택배사 객체는 반드시 ship(packageName) 메서드를 포함해야 합니다."
    );
  }
}

// 🏭 3. 물류 서비스 생성 – OCP 실현 (새로운 택배사 추가 시 코드 수정 불필요)
function createLogisticsService(deliveryCompany) {
  validateDeliveryCompany(deliveryCompany); // 택배사 인터페이스 검증

  return {
    processDelivery(packageName) {
      console.log(`[LogisticsService] "${packageName}" 배송 준비 중...`);
      deliveryCompany.ship(packageName); // 다형성으로 택배사 ship() 호출
    },
  };
}

// 🧭 4. 컨트롤러 – 요청을 물류 서비스로 중계 (SRP 실현)
function createLogisticsController(service) {
  return {
    send(packageName) {
      console.log(
        `[Controller] "${packageName}" 요청을 물류팀으로 전달합니다.`
      );
      service.processDelivery(packageName); // 물류 서비스로 위임
    },
  };
}

// 📱 5. 앱 객체 – 사용자 요청 처리 (SRP 실현)
function createDeliveryApp(controller, customerName) {
  return {
    customerName,
    requestDelivery(packageName) {
      console.log(
        `${this.customerName}님이 "${packageName}" 배송을 요청했습니다.`
      );
      controller.send(packageName); // 컨트롤러로 요청 위임
    },
  };
}

// 🧩 6. 시스템 실행 예시

// ✅ 정상 동작 - FedEx Korea 사용
const fedexService = createLogisticsService(FedExKorea); // 서비스 생성
const fedexController = createLogisticsController(fedexService); // 컨트롤러 생성
const fedexApp = createDeliveryApp(fedexController, "민지"); // 앱 생성

fedexApp.requestDelivery("전자책 리더기");
/*
민지님이 "전자책 리더기" 배송을 요청했습니다.
[Controller] "전자책 리더기" 요청을 물류팀으로 전달합니다.
[LogisticsService] "전자책 리더기" 배송 준비 중...
✈️ [FedEx Korea] "전자책 리더기" 해외배송 시작
*/

// ❌ 실패 예시 - BrokenCourier (인터페이스 검증 실패)
try {
  const brokenService = createLogisticsService(BrokenCourier); // 인터페이스 미준수 → 예외 발생
} catch (error) {
  console.log(error.message);
  // 👉 "❌ 택배사 객체는 반드시 ship(packageName) 메서드를 포함해야 합니다."
}
