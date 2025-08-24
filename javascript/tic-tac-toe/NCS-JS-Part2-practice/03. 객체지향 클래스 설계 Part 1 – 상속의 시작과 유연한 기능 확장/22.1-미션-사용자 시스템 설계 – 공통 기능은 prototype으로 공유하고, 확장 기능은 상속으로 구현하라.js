// ✅ 생성자 함수 + prototype 방식

// 👤 사용자 객체를 생성하는 생성자 함수
function User(name, email) {
  this.name = name; // 이름 속성 저장
  this.email = email; // 이메일 속성 저장
}

// 📚 introduce 메서드를 prototype에 정의 (모든 User 인스턴스가 공유)
User.prototype.introduce = function () {
  console.log(
    `안녕하세요, 제 이름은 ${this.name}이고 이메일은 ${this.email}입니다.`
  );
};

// 👑 관리자 객체를 생성하는 생성자 함수 (User를 상속)
function AdminUser(name, email, adminLevel) {
  User.call(this, name, email); // 부모(User) 생성자 호출로 name, email 초기화
  this.adminLevel = adminLevel; // 관리자 권한 레벨 저장
}

// 🔗 prototype 체인 연결 (AdminUser가 User의 메서드를 상속받도록 설정)
AdminUser.prototype = Object.create(User.prototype);
// 🛠 constructor 참조 수정 (AdminUser.prototype.constructor가 AdminUser를 가리키도록)
AdminUser.prototype.constructor = AdminUser;

// 📈 promote 메서드 추가 (관리자 권한 레벨을 증가)
AdminUser.prototype.promote = function () {
  this.adminLevel++;
  console.log(`관리자 권한이 ${this.adminLevel}로 상승했습니다!`);
};

// 🎮 테스트 실행
const u1 = new User("민수", "minsu@example.com"); // 일반 사용자 생성
const admin = new AdminUser("관리자", "admin@example.com", 1); // 관리자 생성

u1.introduce(); // 👉 "안녕하세요, 제 이름은 민수이고 이메일은 minsu@example.com입니다."
admin.introduce(); // 👉 "안녕하세요, 제 이름은 관리자이고 이메일은 admin@example.com입니다."
admin.promote(); // 👉 "관리자 권한이 2로 상승했습니다!"

/* --------------------------------------------------------- */

// ✅ class 문법 방식 (ES6 이후 문법)

// 👤 User 클래스 정의
class User {
  constructor(name, email) {
    this.name = name; // 이름 속성 저장
    this.email = email; // 이메일 속성 저장
  }

  // 📚 introduce 메서드 정의 (자동으로 prototype에 저장됨)
  introduce() {
    console.log(
      `안녕하세요, 제 이름은 ${this.name}이고 이메일은 ${this.email}입니다.`
    );
  }
}

// 👑 AdminUser 클래스 정의 (User 클래스를 상속)
class AdminUser extends User {
  constructor(name, email, adminLevel) {
    super(name, email); // 부모 클래스(User)의 생성자 호출
    this.adminLevel = adminLevel; // 관리자 권한 레벨 저장
  }

  // 📈 promote 메서드 정의 (관리자 권한 레벨 증가)
  promote() {
    this.adminLevel++;
    console.log(`관리자 권한이 ${this.adminLevel}로 상승했습니다!`);
  }
}

// 🎮 테스트 실행
const u2 = new User("영희", "younghee@example.com"); // 일반 사용자 생성
const admin2 = new AdminUser("슈퍼관리자", "admin@example.com", 3); // 관리자 생성

u2.introduce(); // 👉 "안녕하세요, 제 이름은 영희이고 이메일은 younghee@example.com입니다."
admin2.introduce(); // 👉 "안녕하세요, 제 이름은 슈퍼관리자이고 이메일은 admin@example.com입니다."
admin2.promote(); // 👉 "관리자 권한이 4로 상승했습니다!"
