# DOM script
### DOM이란
Document Object Model은 web document와 상호작용할 수 있는 인터페이스다. DOM은 웹페이지의 html 혹은 xml 구조를 메모리에 저장하고 있는 구조다. 스크립트 혹은 프로그래밍 언어는 DOM을 이용하여 웹페이지의 요소들과 상호작용(조회, 조작 등) 할 수 있다.

아래의 html은
```
<html lang="en">
  <head>
    <title>My Document</title>
  </head>
  <body>
    <h1>Header</h1>
    <p>Paragraph</p>
  </body>
</html>
```

이러한 dom-tree를 가진다. 웹 브라우저는 html을 파싱하여 DOM을 만들고, DOM을 이용하여 랜더링을 한다.
![dom-tree](./images/dom-tree.png)
#### Ref
- https://developer.mozilla.org/en-US/docs/Web/API/Document_Object_Model/Using_the_Document_Object_Model#what_is_a_dom_tree
- https://developer.mozilla.org/en-US/docs/Web/Performance/Guides/How_browsers_work#parsing

### Document란
- Document 인터페이스는 브라우저에 로딩된 웹 페이지를 나타낸다. Document 인터페이스를 이용하여 DOM과 같은 웹 페이지 content에 접근할 수 있다.
- ex. `document.querySelector`

### Document: querySelector method
- css selector의 패턴과 일치하는 첫번째 Element를 리턴함.
- usage: document.querySelector(css selector)

### document.querySelectorAll
- css selector의 패턴과 일치하는 Element들로 구성된 전역적인 NodeList를 리턴함.
- usage: document.querySelectorAll(css selector)

### css selector란
- 특정 css 규칙들을 따르는 요소들을 선택하기 위한 패턴을 정의한 것.
- ex. class-selector: `.class-name`, id-selector: `#id`
