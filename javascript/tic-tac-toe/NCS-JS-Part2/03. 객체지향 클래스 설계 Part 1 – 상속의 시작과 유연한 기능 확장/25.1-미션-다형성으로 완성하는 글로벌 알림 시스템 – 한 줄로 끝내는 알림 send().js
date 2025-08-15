// ✅ 추상 클래스: AbstractNotifier (직접 인스턴스화 금지, 공통 인터페이스 제공)
class AbstractNotifier {
  constructor(sender) {
    // 🚫 직접 인스턴스화 방지 (new AbstractNotifier() 금지)
    if (this.constructor === AbstractNotifier) {
      throw new Error("AbstractNotifier는 직접 인스턴스화할 수 없습니다.");
    }
    this.sender = sender; // 발신자 정보 저장
    this.log = []; // 발송 기록 저장
  }

  // 📢 공통 인터페이스: send()는 반드시 자식 클래스에서 구현해야 함
  send(to, message) {
    throw new Error("send()는 자식 클래스에서 반드시 구현해야 합니다.");
  }
}

// ✅ 이메일 알림 클래스 (AbstractNotifier 상속)
class EmailNotifier extends AbstractNotifier {
  // 📧 이메일 발송 구현
  send(to, message) {
    console.log(`[이메일] ${this.sender}@company.com → ${to}@email.com`);
    console.log(`내용: ${message}`);

    // 📚 발송 기록 저장
    this.log.push({
      to, // 수신자
      message, // 메시지 내용
      method: "email", // 발송 방식
      time: new Date().toISOString(), // 발송 시간
    });
  }
}

// ✅ SMS 알림 클래스 (AbstractNotifier 상속)
class SMSNotifier extends AbstractNotifier {
  // 📱 문자 발송 구현
  send(to, message) {
    console.log(`[문자] ${this.sender} → ${to}`);
    console.log(`내용: ${message}`);

    // 📚 발송 기록 저장
    this.log.push({
      to,
      message,
      method: "sms",
      time: new Date().toISOString(),
    });
  }
}

// ✅ 앱 푸시 알림 클래스 (AbstractNotifier 상속)
class PushNotifier extends AbstractNotifier {
  constructor(sender, appName) {
    super(sender); // 부모 생성자 호출 (sender 저장)
    this.appName = appName; // 앱 이름 저장
  }

  // 📲 앱 푸시 발송 구현
  send(to, message) {
    console.log(`[앱푸시 - ${this.appName}] 수신자: ${to}`);
    console.log(`메시지: ${message}`);

    // 📚 발송 기록 저장
    this.log.push({
      to,
      message,
      method: "push",
      time: new Date().toISOString(),
    });
  }
}

// ✅ 테스트 실행 (다형성 활용)
const notifiers = [
  new EmailNotifier("noreply"), // 이메일 알림 인스턴스
  new SMSNotifier("010-1234-5678"), // 문자 알림 인스턴스
  new PushNotifier("알림봇", "ChatApp"), // 앱 푸시 알림 인스턴스
];

// 📡 모든 알림 방식으로 동일한 메시지 전송 (다형성 활용)
for (const n of notifiers) {
  n.send("yuna", "결제가 완료되었습니다!");
  /*
    [이메일] noreply@company.com → yuna@email.com
    내용: 결제가 완료되었습니다!

    [문자] 010-1234-5678 → yuna
    내용: 결제가 완료되었습니다!

    [앱푸시 - ChatApp] 수신자: yuna
    메시지: 결제가 완료되었습니다!
  */
}
