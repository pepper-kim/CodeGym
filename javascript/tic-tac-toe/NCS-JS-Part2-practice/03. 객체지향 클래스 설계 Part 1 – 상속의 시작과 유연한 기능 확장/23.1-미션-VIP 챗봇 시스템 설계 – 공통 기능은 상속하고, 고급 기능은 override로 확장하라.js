// ✅ 부모 클래스: ChatBot (기본 챗봇 기능 제공)
class ChatBot {
  constructor(name) {
    this.name = name; // 챗봇 이름
    this.log = []; // 응답 기록 저장 배열
    this.responseCount = 0; // 총 응답 횟수
    this.totalResponseTime = 0; // 총 응답 시간 (ms)
  }

  // 👋 기본 인삿말 출력
  greet() {
    console.log(`안녕하세요, ${this.name}입니다. 무엇을 도와드릴까요?`);
  }

  // 💬 질문에 대한 답변 처리
  replyTo(question) {
    const start = performance.now(); // 응답 시작 시간 기록
    const answer = `질문하신 "${question}"에 대한 답변입니다.`;
    console.log(answer); // 답변 출력

    const duration = performance.now() - start; // 응답 소요 시간 측정

    // 📚 응답 기록 저장
    this.log.push({
      question, // 질문 내용
      answer, // 답변 내용
      time: new Date().toISOString(), // 응답 시간 (ISO 포맷)
    });

    this.responseCount++; // 응답 횟수 증가
    this.totalResponseTime += duration; // 총 응답 시간 누적

    // ⏱️ 응답 시간 출력
    console.log(`⏱️ 응답 시간: ${duration.toFixed(2)}ms`);
  }

  // 📊 챗봇 응답 통계 출력
  showStats() {
    const avg = this.responseCount
      ? this.totalResponseTime / this.responseCount
      : 0; // 평균 응답 시간 계산 (응답이 없으면 0)

    console.log(`총 응답 횟수: ${this.responseCount}`);
    console.log(`평균 응답 시간: ${avg.toFixed(2)}ms`);
  }
}

// 👑 자식 클래스: VIPChatBot (프리미엄 고객 전용 챗봇)
class VIPChatBot extends ChatBot {
  constructor(name, adminName) {
    super(name); // 부모 클래스의 생성자 호출 (name 초기화)
    this.adminName = adminName; // 전담 관리자 이름 저장
  }

  // 👋 VIP 고객 전용 인삿말 오버라이드
  greet() {
    console.log(`안녕하십니까, 프리미엄 고객님. ${this.name}입니다.`);
    console.log(`무엇을 도와드릴까요? 최대한 빠르게 도와드리겠습니다.`);
  }

  // 💬 질문에 대한 답변 처리 (부모 메서드 확장)
  replyTo(question) {
    super.replyTo(question); // 부모 클래스의 replyTo 호출 (기본 처리)

    // 🔒 전담 상담사 안내 추가
    console.log(`🔒 전담 상담사 ${this.adminName}님이 대응 중입니다.`);

    // 💡 비밀번호 관련 문의 이력이 있는지 확인
    const previous = this.log.find((log) => log.question.includes("비밀번호"));
    if (previous) {
      console.log(
        `💡 이전에 비밀번호 관련 문의를 하셨습니다. 기록을 참고해 빠르게 처리하겠습니다.`
      );
    }
  }
}

// ✅ 테스트 실행 (일반 챗봇)
const normalBot = new ChatBot("헬프봇");
normalBot.greet(); // 👉 "안녕하세요, 헬프봇입니다. 무엇을 도와드릴까요?"
normalBot.replyTo("배송이 언제 오나요?");
// 👉 "질문하신 '배송이 언제 오나요?'에 대한 답변입니다."
// 👉 응답 시간 출력
normalBot.showStats();
// 👉 총 응답 횟수: 1, 평균 응답 시간 출력

console.log("==============");

// ✅ 테스트 실행 (VIP 챗봇)
const vipBot = new VIPChatBot("VIP헬프봇", "홍길동");
vipBot.greet();
// 👉 "안녕하십니까, 프리미엄 고객님. VIP헬프봇입니다."
// 👉 "무엇을 도와드릴까요? 최대한 빠르게 도와드리겠습니다."

vipBot.replyTo("비밀번호를 잊었어요");
// 👉 기본 답변 + 전담 상담사 안내 + 비밀번호 문의 이력 안내

vipBot.replyTo("상품 교환하고 싶어요");
// 👉 기본 답변 + 전담 상담사 안내 + 비밀번호 문의 이력 안내 (여전히 있음)

vipBot.showStats();
// 👉 총 응답 횟수: 2, 평균 응답 시간 출력
