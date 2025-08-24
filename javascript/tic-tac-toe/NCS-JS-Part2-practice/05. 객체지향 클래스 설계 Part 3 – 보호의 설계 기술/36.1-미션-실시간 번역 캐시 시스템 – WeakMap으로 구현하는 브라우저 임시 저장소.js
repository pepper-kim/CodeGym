/* 
==========================================================
📚 OOP 개념 및 변경 사항 요약

1. ✅ 캡슐화 (Encapsulation): 
   - 번역 캐시(translationCache)를 외부에서 직접 접근할 수 없도록 완전히 은닉.

2. ✅ 정보 은닉 & 책임 분리 (Information Hiding & SRP): 
   - 번역, 캐시 조회, 캐시 삭제를 각각 독립적인 메서드로 분리.

3. ✅ 자동 자원 관리 (Automatic Resource Management): 
   - WeakMap을 사용해 객체가 사라지면 캐시도 자동 삭제.

4. ✅ 성능 최적화 (Performance Optimization): 
   - 중복 번역을 방지하고, 필요할 때만 API 호출.

5. ✅ 실무 적용성: 
   - 실시간 번역, 이미지 로딩 캐시, 사용자 세션 관리 등에 활용 가능.

==========================================================
*/

// 🔐 외부 접근이 불가능한 번역 캐시 저장소 (캡슐화, 정보 은닉)
const translationCache = new WeakMap();

// 🔁 가상의 번역 처리 함수 (실제 API 대신 사용)
function mockTranslate(text) {
  // 문자열을 대문자로 변환하고 [EN] 태그 추가 (번역 시뮬레이션)
  return `[EN] ${text.toUpperCase()}`;
}

// 🌐 번역 시스템을 관리하는 Translator 클래스 (SRP 적용)
class Translator {
  // 번역 처리 메서드 (캐시 조회 → 캐시 없으면 번역 후 저장)
  translate(sentenceObj) {
    if (translationCache.has(sentenceObj)) {
      // 캐시에 이미 저장된 경우, 저장된 결과 반환 (성능 최적화)
      return translationCache.get(sentenceObj);
    }

    // 캐시에 없으면 새로 번역 수행
    const result = mockTranslate(sentenceObj.text);

    // 번역 결과를 캐시에 저장 (WeakMap 활용)
    translationCache.set(sentenceObj, result);

    return result;
  }

  // 캐시 삭제 메서드 (특정 문장에 대한 캐시를 수동으로 삭제)
  clearCacheFor(sentenceObj) {
    translationCache.delete(sentenceObj); // 필요 시 강제 캐시 삭제
  }
}

// 🧪 테스트 코드

// Translator 인스턴스 생성
const translator = new Translator();

// 테스트용 문장 객체 정의 (객체로 정의해야 WeakMap 키로 사용 가능)
const sentence1 = { text: "hello world" };
const sentence2 = { text: "good morning" };

// ✅ 첫 번역 시 캐시 없음 → 번역 수행
console.log(translator.translate(sentence1)); // [EN] HELLO WORLD
// ✅ 두 번째 호출 시 캐시 재사용 (번역 수행 없음)
console.log(translator.translate(sentence1)); // [EN] HELLO WORLD

// ✅ 다른 문장 번역
console.log(translator.translate(sentence2)); // [EN] GOOD MORNING

// ✅ 캐시 삭제 후, 다시 번역 (캐시에서 삭제됐으므로 새로 번역)
translator.clearCacheFor(sentence1);
console.log(translator.translate(sentence1)); // [EN] HELLO WORLD

// ✅ 외부 접근 방지 확인
console.log(Object.keys(sentence1)); // ["text"] (캐시 정보 노출 없음)
console.log(JSON.stringify(sentence1)); // {"text":"hello world"} (캐시 정보 직렬화 안 됨)
