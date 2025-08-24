// ✅ 위임 대상 객체 정의 (고객센터 서비스)

// 📞 일반 고객센터 기능
const CustomerServiceCenter = {
  // 고객센터 상담원 연결
  connectToHuman() {
    console.log("📞 고객센터 상담원에게 연결 중입니다... 잠시만 기다려주세요.");
  },
  // 오류 신고 처리
  reportBug(message) {
    console.log(`🐞 오류가 접수되었습니다: "${message}"`);
  },
};

// ✅ 스마트워치 생성기 (Delegation: 위임 구조)
function createSmartWatch(owner, customerService) {
  return {
    owner, // 워치 소유자 정보
    customerService, // 위임할 고객센터 객체

    // 고객센터 연결 요청 (행동을 customerService에 위임)
    requestCustomerSupport() {
      console.log(`${this.owner}님이 고객센터 연결을 요청했습니다.`);
      this.customerService.connectToHuman(); // 위임 호출
    },

    // 오류 신고 요청 (행동을 customerService에 위임)
    reportIssue(message) {
      console.log(`${this.owner}님이 오류를 신고했습니다.`);
      this.customerService.reportBug(message); // 위임 호출
    },
  };
}

// 🎮 테스트 예시 (일반 고객센터 사용)
const watch = createSmartWatch("혜진", CustomerServiceCenter);
watch.requestCustomerSupport();
// 👉 "혜진님이 고객센터 연결을 요청했습니다."
// 👉 "📞 고객센터 상담원에게 연결 중입니다... 잠시만 기다려주세요."

watch.reportIssue("날씨 정보가 업데이트되지 않아요.");
// 👉 "혜진님이 오류를 신고했습니다."
// 👉 "🐞 오류가 접수되었습니다: "날씨 정보가 업데이트되지 않아요.""

// 👑 VIP 고객센터 정의
const vipCenter = {
  connectToHuman() {
    console.log("🎧 VIP 전용 상담원에게 바로 연결합니다. 환영합니다.");
  },
  reportBug(message) {
    console.log(`📋 VIP 오류 접수 완료: "${message}"`);
  },
};

// 🎮 VIP 고객 테스트 예시
const jihoonWatch = createSmartWatch("지훈", vipCenter);
jihoonWatch.requestCustomerSupport();
// 👉 "지훈님이 고객센터 연결을 요청했습니다."
// 👉 "🎧 VIP 전용 상담원에게 바로 연결합니다. 환영합니다."

jihoonWatch.reportIssue("심박수 기능이 멈췄어요.");
// 👉 "지훈님이 오류를 신고했습니다."
// 👉 "📋 VIP 오류 접수 완료: "심박수 기능이 멈췄어요.""
