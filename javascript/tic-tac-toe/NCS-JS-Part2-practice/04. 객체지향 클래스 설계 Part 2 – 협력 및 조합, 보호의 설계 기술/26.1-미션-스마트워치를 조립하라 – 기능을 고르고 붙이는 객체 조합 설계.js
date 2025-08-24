// ✅ 각 기능을 개별적인 mixin으로 정의 (필요한 기능만 골라 조합)

// ❤️ 심박수 측정 기능
const HeartRateMonitor = {
  checkHeartRate() {
    console.log(`${this.owner}님의 심박수 측정 중... 안정적인 상태입니다.`);
  },
};

// 🎵 음악 재생 기능
const MusicPlayer = {
  playMusic() {
    console.log(`${this.owner}님이 좋아하는 음악을 재생합니다: 🎵`);
  },
};

// ☀️ 날씨 표시 기능
const WeatherDisplay = {
  showWeather() {
    console.log(`${this.owner}님의 현재 지역 날씨: 맑고 기온 23도입니다.`);
  },
};

// ✅ 스마트워치 생성기 (조합 기반 설계)
function createSmartWatch(owner, features) {
  const baseWatch = { owner }; // 📌 기본 속성: 소유자 정보
  // 📚 Object.assign으로 여러 기능(mixin)을 baseWatch에 결합
  return Object.assign(baseWatch, ...features);
}

// 🎮 조합 사용 예시

// 👨‍💼 홍길동님의 스마트워치: 심박수 측정 + 날씨 표시 기능만 선택
const userWatch = createSmartWatch("홍길동", [
  HeartRateMonitor,
  WeatherDisplay,
]);

userWatch.checkHeartRate(); // 👉 "홍길동님의 심박수 측정 중... 안정적인 상태입니다."
userWatch.showWeather(); // 👉 "홍길동님의 현재 지역 날씨: 맑고 기온 23도입니다."

// 🎵 만약 음악 재생 기능도 추가하고 싶다면?
const fullFeatureWatch = createSmartWatch("김영희", [
  HeartRateMonitor,
  MusicPlayer,
  WeatherDisplay,
]);

fullFeatureWatch.checkHeartRate(); // 👉 "김영희님의 심박수 측정 중... 안정적인 상태입니다."
fullFeatureWatch.playMusic(); // 👉 "김영희님이 좋아하는 음악을 재생합니다: 🎵"
fullFeatureWatch.showWeather(); // 👉 "김영희님의 현재 지역 날씨: 맑고 기온 23도입니다."
