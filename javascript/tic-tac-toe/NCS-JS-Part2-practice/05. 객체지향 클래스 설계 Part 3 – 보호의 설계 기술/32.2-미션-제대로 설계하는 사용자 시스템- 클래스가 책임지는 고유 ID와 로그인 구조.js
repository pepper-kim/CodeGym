/* 
==========================================================
📚 OOP 개념 요약 및 적용 사항

1. ✅ 캡슐화 (Encapsulation): 
   - Private Fields (#)로 민감 정보 보호 (#id, #password, #role)

2. ✅ 책임 분리 (SRP): 
   - UserAccount 인스턴스는 상태 관리, 클래스는 전체 관리 책임

3. ✅ 정보 은닉 (Information Hiding): 
   - Private 필드 및 getter로 필요한 정보만 안전하게 공개

4. ✅ 클래스 책임 (Class Responsibility): 
   - 정적 필드와 메서드로 전체 사용자 관리 (users, totalCount)

5. ✅ 접근 제어 (Access Control): 
   - 관리자만 역할 변경 가능, 비밀번호 변경 시 조건 검증

==========================================================
*/

class UserAccount {
  // 📌 클래스 레벨 공통 상태 (정적 필드: 모든 인스턴스가 공유)
  static nextId = 1; // 고유 ID 자동 부여용 카운터
  static totalCount = 0; // 전체 사용자 수 추적
  static users = []; // 생성된 모든 사용자 인스턴스 저장

  // 📌 인스턴스 전용 비공개 속성 (캡슐화)
  #id;
  #password;
  #role;

  // 📌 생성자: 인스턴스 초기화 책임 (생성 시점에 필요한 값 설정)
  constructor(username, email, password) {
    this.username = username; // 공개 속성
    this.email = email;
    this.createdAt = new Date(); // 가입 시각 자동 기록

    // 민감 정보는 외부 노출 차단
    this.#password = password;
    this.#role = "user"; // 기본 역할은 일반 사용자
    this.#id = UserAccount.nextId++; // 고유 ID 자동 부여

    // 클래스 레벨 정보 업데이트 (전체 사용자 관리 책임)
    UserAccount.totalCount++;
    UserAccount.users.push(this);
  }

  // 📧 이메일 반환 (공개 정보)
  getEmail() {
    return this.email;
  }

  // 🧾 역할 반환 (비공개 속성 읽기 전용 공개)
  getRole() {
    return this.#role;
  }

  // 🆔 고유 ID 반환 (비공개 속성 읽기 전용 공개)
  getId() {
    return this.#id;
  }

  // 🔐 비밀번호 검증 (외부에서는 비밀번호 자체를 알 수 없음)
  checkPassword(inputPassword) {
    return this.#password === inputPassword;
  }

  // 🔄 비밀번호 변경 (캡슐화 + 조건 검증 + 방어적 프로그래밍)
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

  // 🛡️ 역할 변경 (접근 제어: 관리자만 가능)
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

  // 📊 전체 사용자 수 반환 (정적 메서드: 클래스 책임)
  static getTotalUsers() {
    return `현재 가입자 수: ${UserAccount.totalCount}명`;
  }

  // 🔐 로그인 처리 (정적 메서드: 인스턴스 없이 로그인 관리)
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

// 🧪 테스트 코드 실행

// 📌 사용자 인스턴스 생성
const a = new UserAccount("철수", "chulsoo@email.com", "pass1234");
const b = new UserAccount("영희", "younghee@email.com", "abcd1234");

// 📌 사용자 정보 확인
console.log(a.username); // "철수" (공개 속성)
console.log(a.getEmail()); // "chulsoo@email.com"
console.log(a.getRole()); // "user"
console.log(UserAccount.getTotalUsers()); // "현재 가입자 수: 2명"

// 🔐 로그인 테스트
UserAccount.login("wrong@email.com", "1234"); // ❌ 이메일 없음
UserAccount.login("chulsoo@email.com", "wrong"); // ❌ 비밀번호 오류
UserAccount.login("chulsoo@email.com", "pass1234"); // ✅ 로그인 성공

// 🔄 비밀번호 변경 테스트
a.changePassword("pass1234", "12"); // ❌ 새 비밀번호 너무 짧음
a.changePassword("pass1234", "newpass"); // ✅ 비밀번호 변경 성공

// 🛡️ 역할 변경 테스트 (관리자 권한 필요)
a.updateRole("admin", "user"); // ❌ 권한 없음
a.updateRole("admin", "admin"); // ✅ 역할 변경 성공
console.log(a.getRole()); // "admin" (변경된 역할)
