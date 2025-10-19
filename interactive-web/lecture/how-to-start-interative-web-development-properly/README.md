# What i learned
### html이란
웹페이지의 구조와 서식을 표현할 수 있는 마크업 언어다. 

프로그래밍 언어가 아니라 마크업 언어이기에, 문서의 구조와 서식만을 포함한다. '마크업' 단어 뜻을 알면 html에 대해 더 잘 이해할 수 있다. 'markup' 단어 자체는 '표시하다'를 의미한다. 그 어원은 본래 출판 업계에 있다. 원고를 받은 출판사가 내부 구조와 서식을 고칠 때 '이 부분은 굵게 표시'를 나타내는 표식들을 사용 했는데, 여기서 마크업이 시작했다. html은 문서와 데이터의 구조 혹은 문서의 서식을 표현하는데 사용되기에 마크업 언어다.

html은 컴퓨터 언어지만, 프로그래밍 언어가 아니라 마크업 언어다. 프로그래밍 언어가 되려면 튜링 완전해야 한다. if문을 이용하여 분기를 타고 and or를 이용하여 논리적인 연산을 할 수 있어야 한다. 하지만 마크업 언어는 데이터의 구조만 표현하기에 절차적인 로직을 표현할 수 없다. 웹사이트에서 html은 문서의 구조를 표현하는 역할만 하고, 절차적인 로직과 논리적인 연산을 진행하는 것은 javascript가 대신 한다.

### css란
html로 작성된 문서가 웹사이트에 표현될 방법(디자인)을 정해주는 stylesheet 언어. 

css 또한 프로그래밍 언어가 아니라 stylesheet 언어다. 문서가 표현되는 방식을 선언적으로 정의할 수 있는 언어를 stylesheet 언어라고 한다. if문 같은 분기를 만들어 절차적인 표현을 할 수 없기에 stylesheet 또한 튜링 완전하지 않아 프로그래밍 언어가 아니다. 컴퓨터 언어의 일종이다.

css는 html로 작성된 웹사이트 문서가 표현될 방법을 정의한다. html 특정 요소의 모양과 위치가 어디인지, 배경 색깔은 어떻게 될지, 애니메이션이 있는지 등을 표현할 수 있다. 웹페이지에서 사용자와 인터렉션이 일어나는 요소들은 모두 css 값이 바뀌는 것이라고 생각하면 된다.

### DOM이란
프로그래밍 언어가 문서의 구조와 통신할 수 있는 인터페이스. 

Document Object Model라는 이름에서 알 수 있듯이, 문서를 메모리로 표현한 모델이다. Javascript는 DOM을 이용하여 문서를 조작할 수 있게 됐다. 결국 문서의 구조를 동적으로 변경하려면 DOM이 필수다. 

# What i thought
### 1. css는 그것을 사용할 html 요소를 생성하는 클래스와 함께 존재 해야 한다. 
```
/src
  /character
    /chracter.js
    /character.css
```
### 2. 공통적으로 자주 사용되는 css 요소는 common으로 분리돼야 한다.
```
/src
  /common
    /button.css
  /character
    /character.js
  /stage
    /stage.js
```
### 3. React의 컴포넌트는 마크업 언어를 표현할 수 있는 js 함수다.
아래는 Profile 컴포넌트를 사용하여 Gallery 컴포넌트를 표현하는 코드다. 내부에선 JSX를 이용하여 컴포넌트의 구조를 나타낸다. 이 코드는 결국 html로 바뀔 것.
```
function Profile() {
  return (
    <img
      src="https://i.imgur.com/MK3eW3As.jpg"
      alt="Katherine Johnson"
    />
  );
}

export default function Gallery() {
  return (
    <section>
      <h1>Amazing scientists</h1>
      <Profile />
      <Profile />
      <Profile />
    </section>
  );
}
```
