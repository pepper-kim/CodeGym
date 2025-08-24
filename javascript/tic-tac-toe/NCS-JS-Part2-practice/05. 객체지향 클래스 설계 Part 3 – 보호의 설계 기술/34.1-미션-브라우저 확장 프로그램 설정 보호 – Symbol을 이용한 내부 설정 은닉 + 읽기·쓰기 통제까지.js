/* 
==========================================================
📚 OOP 개념 및 변경 사항

1. ✅ 캡슐화 (Encapsulation): 
   - 민감 정보(testMode)를 Symbol로 숨겨 외부 접근 차단

2. ✅ 정보 은닉 (Information Hiding): 
   - Object.keys, JSON.stringify 등으로도 testMode 노출 불가

3. ✅ 접근 제어 (Access Control): 
   - 읽기/쓰기는 검증된 키와 함수로만 가능하게 설계

4. ✅ 단일 책임 원칙 (SRP): 
   - isInTestMode: 읽기 전용, setTestMode: 쓰기 전용

5. ✅ Symbol 활용: 
   - 충돌 없는 유일한 키로 외부 접근 불가

==========================================================
*/

// 🔑 Symbol을 사용한 유일한 내부 키 정의 (외부 접근 차단)
const TEST_MODE_KEY = Symbol("내부 테스트 모드 키");

// ⚙️ 확장 프로그램 설정 객체 생성 함수
function createExtensionConfig(version, isTestMode) {
  return {
    version, // 공개 속성 (Object.keys, JSON.stringify 등에서 보임)
    [TEST_MODE_KEY]: isTestMode, // 비공개 속성 (Symbol 키로 숨김)
  };
}

// 🔍 내부 상태 읽기 전용 함수 (접근 제어 적용)
function isInTestMode(config, key) {
  if (key === TEST_MODE_KEY) {
    // 올바른 키로 접근 시 내부 상태 반환
    return config[TEST_MODE_KEY];
  }
  // 잘못된 키로 접근 시 권한 없음 반환
  return "권한 없음";
}

// ✏️ 내부 상태 쓰기 전용 함수 (접근 제어 적용)
function setTestMode(config, key, value) {
  if (key === TEST_MODE_KEY) {
    // 올바른 키로 접근 시 내부 상태 변경
    config[TEST_MODE_KEY] = value;
    return "변경 완료";
  }
  // 잘못된 키로 접근 시 권한 없음 반환
  return "권한 없음";
}

// 🧪 테스트 코드 실행
const config = createExtensionConfig("2.1.0", false);

// ✅ 공개 속성 접근 테스트
console.log(config.version); // "2.1.0" (정상 노출)
console.log(config.testMode); // undefined (숨겨진 속성, 접근 불가)
console.log(Object.keys(config)); // ["version"] (Symbol 키는 열거되지 않음)
console.log(JSON.stringify(config)); // {"version":"2.1.0"} (Symbol 키 직렬화 제외)

// ✅ 잘못된 키로 읽기 시도
console.log(isInTestMode(config, Symbol("내부 테스트 모드 키"))); // "권한 없음"
// ✅ 올바른 키로 읽기 시도
console.log(isInTestMode(config, TEST_MODE_KEY)); // false

// ✅ 잘못된 키로 쓰기 시도
console.log(setTestMode(config, Symbol("내부 테스트 모드 키"), true)); // "권한 없음"
// ✅ 올바른 키로 쓰기 시도
console.log(setTestMode(config, TEST_MODE_KEY, true)); // "변경 완료"
// ✅ 값 변경 확인
console.log(isInTestMode(config, TEST_MODE_KEY)); // true
