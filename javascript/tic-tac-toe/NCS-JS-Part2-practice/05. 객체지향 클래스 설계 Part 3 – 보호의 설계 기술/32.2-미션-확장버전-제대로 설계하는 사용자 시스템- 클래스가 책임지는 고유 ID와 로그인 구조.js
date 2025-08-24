/* 
==========================================================
📚 OOP 개념 및 변경 사항

1. ✅ 캡슐화 (Encapsulation): 
   - Private Fields (#)로 민감 정보 보호 (#id, #password, #role)

2. ✅ 상속 (Inheritance): 
   - UserAccount → AdminAccount 상속으로 코드 재사용

3. ✅ 다형성 (Polymorphism): 
   - AdminAccount가 UserAccount 메서드 오버라이드 및 확장
   - instanceof로 다형적 객체 처리

4. ✅ 추상화 (Abstraction): 
   - AbstractUser 정의 (ES6에서는 직접적인 추상 클래스가 없어 시뮬레이션)

5. ✅ 인터페이스 패턴 (Manual Interface Simulation):
   - Role 변경을 위한 강제 메서드 구현 요구 (updateRole)

==========================================================
*/

// 📌 추상 클래스 시뮬레이션 (JS는 직접적인 추상 클래스가 없으므로 예외 처리로 강제화)
class AbstractUser {
  constructor() {
    if (new.target === AbstractUser) {
      throw new Error("❌ AbstractUser는 직접 인스턴스화할 수 없습니다.");
    }
  }

  // 📌 인터페이스 요구 강제화: 반드시 구현해야 할 메서드
  updateRole() {
    throw new Error("❌ updateRole() 메서드를 반드시 구현해야 합니다.");
  }
}

// 📌 일반 사용자 클래스
class UserAccount extends AbstractUser {
  // 📌 클래스 레벨 정적 필드 (공유 상태 관리)
  static nextId = 1;
  static totalCount = 0;
  static users = [];

  // 📌 인스턴스 전용 Private Fields (정보 은닉)
  #id;
  #password;
  #role;

  constructor(username, email, password) {
    super(); // 추상 클래스 호출
    this.username = username;
    this.email = email;
    this.createdAt = new Date(); // 가입 시각 자동 기록

    this.#password = password;
    this.#role = "user";
    this.#id = UserAccount.nextId++; // 고유 ID 자동 부여

    // 클래스 레벨 데이터 관리 (사용자 수, 목록)
    UserAccount.totalCount++;
    UserAccount.users.push(this);
  }

  // 📧 이메일 반환 (읽기 전용, 캡슐화 유지)
  getEmail() {
    return this.email;
  }

  // 🧾 역할 반환 (읽기 전용)
  getRole() {
    return this.#role;
  }

  // 🆔 고유 ID 반환 (읽기 전용, 직접 접근 불가)
  getId() {
    return this.#id;
  }

  // 🔐 비밀번호 검증 (상태 보호, 정보 은닉)
  checkPassword(inputPassword) {
    return this.#password === inputPassword;
  }

  // 🔄 비밀번호 변경 (유효성 검사 + 방어적 프로그래밍 적용)
  changePassword(currentPassword, newPassword) {
    if (this.#password === currentPassword) {
      if (typeof newPassword === "string" && newPassword.length >= 4) {
        this.#password = newPassword;
        console.log("✅ 비밀번호가 성공적으로 변경되었습니다.");
      } else {
        console.log("❌ 비밀번호는 최소 4자리 이상의 문자열이어야 합니다.");
      }
    } else {
      console.log("❌ 기존 비밀번호가 올바르지 않습니다.");
    }
  }

  // 📌 인터페이스 강제 구현 (추상 클래스 요구 사항 충족)
  updateRole(newRole, requesterRole) {
    if (requesterRole === "admin") {
      this.#role = newRole;
      console.log(`✅ 역할이 '${newRole}'로 변경되었습니다.`);
    } else {
      console.log(
        "❌ 권한이 없습니다. 역할 변경은 관리자만 수행할 수 있습니다."
      );
    }
  }

  // 📊 전체 사용자 수 반환 (클래스 메서드, 인스턴스 없이 호출)
  static getTotalUsers() {
    return `현재 가입자 수: ${UserAccount.totalCount}명`;
  }

  // 🔐 로그인 처리 (정적 메서드, 클래스 책임)
  static login(email, password) {
    const user = UserAccount.users.find((u) => u.email === email);

    if (!user) {
      console.log("❌ 사용자 이메일을 찾을 수 없습니다.");
      return null;
    }

    if (!user.checkPassword(password)) {
      console.log("❌ 비밀번호가 올바르지 않습니다.");
      return null;
    }

    console.log(`✅ ${user.username}님 로그인 성공`);
    return user;
  }
}

// 📌 관리자 계정 클래스 (상속 + 역할 고정)
class AdminAccount extends UserAccount {
  constructor(username, email, password) {
    super(username, email, password); // 부모 클래스 호출
    this.updateRole("admin", "admin"); // 생성 즉시 역할을 admin으로 고정
  }

  // 📌 관리자 전용: 다른 사용자의 역할 강제 변경 (다형성 활용)
  forceUpdateRole(targetUser, newRole) {
    if (targetUser instanceof UserAccount) {
      targetUser.updateRole(newRole, "admin"); // 관리자로서 권한 행사
    } else {
      console.log("❌ 대상 객체는 UserAccount가 아닙니다.");
    }
  }
}

// 📌 테스트 코드

// 일반 사용자 생성
const user1 = new UserAccount("철수", "chulsoo@email.com", "pass1234");
const user2 = new UserAccount("영희", "younghee@email.com", "abcd1234");

// 관리자 생성 (자동 admin 역할 부여)
const admin = new AdminAccount("관리자", "admin@email.com", "adminpass");

// 사용자 역할 확인
console.log(user1.getRole()); // user
console.log(admin.getRole()); // admin (상속과 생성자 로직으로 자동 admin 부여)

// 관리자 권한으로 역할 강제 변경 (다형성 활용)
admin.forceUpdateRole(user1, "manager"); // ✅ 역할 변경 성공
console.log(user1.getRole()); // manager

// 로그인 테스트 (정적 메서드 활용)
UserAccount.login("admin@email.com", "adminpass"); // ✅ 로그인 성공 (다형성 적용)
