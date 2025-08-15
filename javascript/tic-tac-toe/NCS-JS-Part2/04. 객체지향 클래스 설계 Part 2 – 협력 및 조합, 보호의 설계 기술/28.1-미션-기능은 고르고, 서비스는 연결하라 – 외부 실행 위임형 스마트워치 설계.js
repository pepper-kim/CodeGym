// 🎵 외부 음악 서비스 (위임 대상)
const SpotifyService = {
  stream(musicName) {
    console.log(`🎶 Spotify에서 "${musicName}" 재생 중입니다.`);
  },
};

const MelonService = {
  stream(musicName) {
    console.log(`🎧 멜론에서 "${musicName}" 재생 중입니다.`);
  },
};

// ☀️ 외부 날씨 서비스 (위임 대상)
const OpenWeatherService = {
  getForecast(location) {
    console.log(`🌤 OpenWeather: ${location}의 날씨는 맑음, 24도입니다.`);
  },
};

const NaverWeatherService = {
  getForecast(location) {
    console.log(`🌧 NaverWeather: ${location}의 날씨는 흐림, 19도입니다.`);
  },
};

// 🎛 음악 제어 Mixin (재사용 가능한 기능)
const MusicControlMixin = {
  playMusic(musicName) {
    console.log(`${this.owner}님이 "${musicName}" 음악을 재생 요청했습니다.`);
    this.musicPlayer.stream(musicName); // 음악 재생 위임
  },
};

// 🌦 날씨 확인 Mixin
const WeatherCheckMixin = {
  checkWeather(location) {
    console.log(`${this.owner}님이 ${location}의 날씨 확인을 요청했습니다.`);
    this.weatherService.getForecast(location); // 날씨 조회 위임
  },
};

// ⌚ 스마트워치 생성기 (조합 + 위임 구조)
function createSmartWatch(owner, features, services) {
  const baseWatch = {
    owner, // 소유자 정보
    musicPlayer: services.musicPlayer, // 외부 음악 서비스 위임
    weatherService: services.weatherService, // 외부 날씨 서비스 위임
  };
  // 필요한 기능을 Mixin으로 조합
  return Object.assign(baseWatch, ...features);
}

// ✅ 테스트 1: 수빈 - Spotify + OpenWeather 사용
const subinWatch = createSmartWatch(
  "수빈",
  [MusicControlMixin, WeatherCheckMixin], // 음악 + 날씨 기능 추가
  {
    musicPlayer: SpotifyService, // Spotify 위임
    weatherService: OpenWeatherService, // OpenWeather 위임
  }
);

subinWatch.playMusic("밤양갱"); // 👉 "수빈님이 '밤양갱' 음악을 재생 요청했습니다." + Spotify 재생
subinWatch.checkWeather("서울"); // 👉 "수빈님이 서울의 날씨 확인을 요청했습니다." + OpenWeather 날씨 출력

// ✅ 테스트 2: 민지 - Melon + NaverWeather 사용
const minjiWatch = createSmartWatch(
  "민지",
  [MusicControlMixin, WeatherCheckMixin], // 음악 + 날씨 기능 추가
  {
    musicPlayer: MelonService, // Melon 위임
    weatherService: NaverWeatherService, // NaverWeather 위임
  }
);

minjiWatch.playMusic("Love Dive"); // 👉 "민지님이 'Love Dive' 음악을 재생 요청했습니다." + Melon 재생
minjiWatch.checkWeather("부산"); // 👉 "민지님이 부산의 날씨 확인을 요청했습니다." + NaverWeather 날씨 출력
