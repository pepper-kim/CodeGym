// 🚚 1. 다양한 택배사 객체 정의 – 인터페이스 규약: ship(packageName)
const CJLogistics = {
  ship(packageName) {
    console.log(`📦 [CJ대한통운] "${packageName}" 배송이 시작되었습니다.`);
  },
};

const LotteCourier = {
  ship(packageName) {
    console.log(`🚚 [롯데택배] "${packageName}"을 배송 중입니다.`);
  },
};

const FedExKorea = {
  ship(packageName) {
    console.log(`✈️ [FedEx Korea] "${packageName}" 해외배송 진행 중입니다.`);
  },
};

// 🏭 2. 물류 서비스 객체 – deliveryCompany에 ship() 호출 (다형성 기반)
function createLogisticsService(deliveryCompany) {
  return {
    processDelivery(packageName) {
      console.log(
        `[LogisticsService] "${packageName}" 배송 요청을 택배사로 전달합니다.`
      );
      deliveryCompany.ship(packageName); // 택배사에 위임 (다형성 활용)
    },
  };
}

// 🧭 3. 컨트롤러 객체 – 요청을 물류 서비스로 위임
function createLogisticsController(service) {
  return {
    send(packageName) {
      console.log(
        `[Controller] "${packageName}" 요청을 물류팀으로 중계합니다.`
      );
      service.processDelivery(packageName); // 물류 서비스에 위임
    },
  };
}

// 📱 4. 앱 객체 – 고객 요청을 컨트롤러에 위임
function createDeliveryApp(controller, customerName) {
  return {
    customerName,
    requestDelivery(packageName) {
      console.log(
        `${this.customerName}님이 "${packageName}" 배송을 요청했습니다.`
      );
      controller.send(packageName); // 컨트롤러에 위임
    },
  };
}

// 🧩 5. 시스템 조립 및 실행 (객체 협력 구조)

// ✅ 앱 1: CJ대한통운 연결
const cjService = createLogisticsService(CJLogistics); // 물류 서비스: CJ대한통운
const cjController = createLogisticsController(cjService); // 컨트롤러 생성
const cjApp = createDeliveryApp(cjController, "지현"); // 앱 생성 (고객: 지현)

cjApp.requestDelivery("무선 키보드");
/*
지현님이 "무선 키보드" 배송을 요청했습니다.
[Controller] "무선 키보드" 요청을 물류팀으로 중계합니다.
[LogisticsService] "무선 키보드" 배송 요청을 택배사로 전달합니다.
📦 [CJ대한통운] "무선 키보드" 배송이 시작되었습니다.
*/

// ✅ 앱 2: FedEx Korea 연결 (해외배송)
const fedexService = createLogisticsService(FedExKorea);
const fedexController = createLogisticsController(fedexService);
const fedexApp = createDeliveryApp(fedexController, "민지");

fedexApp.requestDelivery("해외 전자책 리더기");
/*
민지님이 "해외 전자책 리더기" 배송을 요청했습니다.
[Controller] "해외 전자책 리더기" 요청을 물류팀으로 중계합니다.
[LogisticsService] "해외 전자책 리더기" 배송 요청을 택배사로 전달합니다.
✈️ [FedEx Korea] "해외 전자책 리더기" 해외배송 진행 중입니다.
*/

// ✅ 앱 3: 롯데택배 연결
const lotteService = createLogisticsService(LotteCourier);
const lotteController = createLogisticsController(lotteService);
const lotteApp = createDeliveryApp(lotteController, "수빈");

lotteApp.requestDelivery("블루투스 스피커");
/*
수빈님이 "블루투스 스피커" 배송을 요청했습니다.
[Controller] "블루투스 스피커" 요청을 물류팀으로 중계합니다.
[LogisticsService] "블루투스 스피커" 배송 요청을 택배사로 전달합니다.
🚚 [롯데택배] "블루투스 스피커"을 배송 중입니다.
*/
