/* 
==========================================================
📚 OOP 개념 요약

1. ✅ 캡슐화 (Encapsulation): 
   - #password, #role을 private 필드로 선언해 외부 접근 차단.

2. ✅ 정보 은닉 & 접근 제어 (Information Hiding & Access Control): 
   - 비밀번호와 역할은 공개하지 않고, getter 메서드로 읽기만 허용.

3. ✅ 책임 분리 (SRP - Single Responsibility Principle): 
   - 각 메서드는 명확한 단일 책임만 수행.

4. ✅ 권한 제어 (Access Control): 
   - 관리자만 역할 변경 가능하도록 안전한 시스템 구현.

==========================================================
*/

class UserAccount {
  // 🔐 Private Fields: 외부에서 직접 접근할 수 없음 (정보 은닉)
  #password;
  #role;

  constructor(username, email, password) {
    // 📌 공개 속성 (외부에서 자유롭게 접근 가능)
    this.username = username;
    this.email = email;

    // 🔐 민감 정보는 외부에서 직접 접근 불가 (캡슐화)
    this.#password = password;
    this.#role = "user"; // 기본 역할 설정 (일반 사용자)
  }

  // ✅ 비밀번호 검증 (비밀번호 자체 노출 없이 검증만 허용)
  checkPassword(inputPassword) {
    return this.#password === inputPassword;
  }

  // ✅ 비밀번호 변경 (캡슐화 + 방어적 프로그래밍)
  changePassword(currentPassword, newPassword) {
    // 기존 비밀번호 일치 여부 확인 (보안 검증)
    if (this.#password === currentPassword) {
      // 새 비밀번호 유효성 검사 (문자열 타입, 최소 4자리)
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

  // 📧 이메일 읽기 전용 (Setter 없음 → 외부에서 수정 불가)
  getEmail() {
    return this.email;
  }

  // 🧾 역할 반환 (읽기 전용, 외부 수정 차단)
  getRole() {
    return this.#role;
  }

  // 🛡️ 역할 변경 (권한 제어: 관리자만 가능)
  updateRole(newRole, requesterRole) {
    if (requesterRole === "admin") {
      this.#role = newRole; // 관리자 권한으로 역할 변경
      console.log(`✅ 역할이 '${newRole}'로 변경되었습니다.`);
    } else {
      console.log(
        "❌ 권한이 없습니다. 역할 변경은 관리자만 수행할 수 있습니다."
      );
    }
  }
}

// 🧪 테스트 코드: 실제 동작 검증

// 📌 사용자 인스턴스 생성
const user = new UserAccount("jiyoon", "jiyoon@email.com", "1234");

// 📌 공개 속성 확인 (정보 은닉 확인)
console.log(user.username); // "jiyoon"
console.log(user.getEmail()); // "jiyoon@email.com"
console.log(user.getRole()); // "user" (기본 역할)

// 🔐 비밀번호 검증 테스트
console.log(user.checkPassword("wrong")); // false (비밀번호 불일치)
console.log(user.checkPassword("1234")); // true (비밀번호 일치)

// 🔄 비밀번호 변경 테스트
user.changePassword("wrong", "abcd"); // ❌ 기존 비밀번호 틀림
user.changePassword("1234", "ab"); // ❌ 새 비밀번호 너무 짧음
user.changePassword("1234", "5678"); // ✅ 비밀번호 성공적으로 변경

// 🔐 변경된 비밀번호 검증
console.log(user.checkPassword("5678")); // true (변경된 비밀번호로 확인)

// 🛡️ 역할 변경 테스트 (권한 제어)
user.updateRole("admin", "user"); // ❌ 권한 없음 (일반 사용자는 변경 불가)
user.updateRole("admin", "admin"); // ✅ 관리자 권한으로 역할 변경 성공
console.log(user.getRole()); // "admin" (변경된 역할)
