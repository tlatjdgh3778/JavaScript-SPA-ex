# Vanilla JavaScript로 SPA구현하기
> 본 포스트는 [
dcode - YOUTUBE](https://www.youtube.com/watch?v=6BozpmSjk-Y&t=1009s) 를 참고하였습니다.

React, Angular, Vue와 같은 프레임워크의 사용 없이 JavaScript만으로 SPA(Single Page Application)을 구현해보고자 한다.

history 또는 hash를 이용해서 SPA를 구현할 수 있는데 여기서는 history를 사용해서 만들어 보았다. 

## 1. index.html 만들기
프로젝트 폴더에 `frontend` 폴더를 만들고 폴더 안에 `index.html` 파일을 만들어주자. 화면에 보여지게 되는 파일이다.

```js
<!DOCTYPE html>
<html lang="en">
    <head>
        <meta charset="UTF-8" />
        <meta http-equiv="X-UA-Compatible" content="IE=edge" />
        <meta name="viewport" content="width=device-width, initial-scale=1.0" />
        <title>Single Page App</title>
    </head>
    <body>
        <nav class="nav">
            <a href="/" class="nav_item" data-link>Home</a>
            <a href="/posts" class="nav_item" data-link>Posts</a>
            <a href="/settings" class="nav_item" data-link>Settings</a>
        </nav>
		<div id="root"></div>
        <script type="module" src="./static/js/index.js"></script>
    </body>
</html>
```

페이지 이동을 하기위해 3개의 a태그로 구성된 메뉴를 `nav` 로 감싸주었다.

그리고 ES6의 module을 사용하기 위해서 `script` 태그에 `type=module`을 추가했다.
```js
<script type="module" src="./static/js/index.js"></script>
```


## 2. express 서버 구축하기
우선 express를 사용해서 간단하게 서버를 구축하자.


먼저 node module을 관리해주기 위해 `npm init` 명령어를 터미널에 작성 후

express를 설치해준다.
```js
npm install express
```

설치가 완료됐으면 프로젝트 폴더에 `server.js` 파일을 생성해서 서버를 만들어준다.
```js
// server.js
// express server
// express 모듈 불러오기
const express = require("express");
const path = require("path");

// express 사용
const app = express();

app.use("/static", express.static(path.resolve(__dirname, "frontend", "static")));

app.get("/*", (req, res) => {
    res.sendFile(path.resolve("frontend", "index.html"));
});

// port 생성 서버 실행
app.listen(process.env.PORT || 3000, () => console.log("Server running ...."));
```

### 2-1. express에서 정적 파일 제공
이미지, CSS 파일, JavaScript 파일과 같은 정적 파일을 제공하기 위해서 express의 기본 미들웨어 함수인 `express.static`을 사용한다.

```js
// server.js 의 실행경로 + "/static"을 localhost:port/static으로 마운트
app.use("/static", express.static(path.resolve(__dirname, "frontend", "static")));
```

`path.resolve` 를 사용해서 인자로 받은 값들을 하나의 문자열로 만들어 주고 정적 디렉토리에 대한 마운트 경로를 지정해 주면 `/static` 경로를 통해 `frontend` 디렉토리에 포함된 파일을 로드할 수 있게된다.

```js
http://localhost:8080/static/js/index.js
http://localhost:8080/static/css/index.css
```

### 2-2. app.get으로 응답하기
get요청이 오면 `frontend/index.html` 파일을 읽고 내용을 클라이언트로 전송한다.

```js
app.get("/*", (req, res) => {
    res.sendFile(path.resolve("frontend", "index.html"));
});
```

### 2-3. app.listen 포트 번호 지정하고 서버 실행하기
포트번호 3000에서 서버를 실행한다.

```js
// port 생성 서버 실행
app.listen(process.env.PORT || 3000) => console.log("Server running ...."));
```

터미널에 다음과 같이 입력하면 서버를 실행할 수 있다.
```js
node server.js
```

## 3. Router 구현하기
### 3-1. router 함수 구현

`frontend` 폴더 안에 `static` 폴더를 만들고 그 안에 다시 `js` 폴더를 만들고 !! `js` 폴더 안에 `index.js` 파일을 만들어주자.

이제 `Home`, `Posts`, `Settings` 페이지로 왔다갔다 할 수 있게끔 라우터를 구현해보자.
```js
// frontend/static/js/index.js
const router = async () => {
    const routes = [
        { path: "/", view: () => console.log("Viewing Home") },
        { path: "/posts", view: () => console.log("Viewing Posts") },
        { path: "/settings", view: () => console.log("Viewing Settings") },
    ];
// ...
```

 `view` 는 해당 경로에서 나타내는 html을 의미하는데 우선 작동이 잘 되는지 확인하기 위해서 콘솔로 먼저 확인한다.
 
```js
// ...
  const pageMatches = routes.map((route) => {
    return {
      route, // route: route
      isMatch: route.path === location.pathname,
    };
  });
// ...
```

`map` 을 이용해서 `routes` 를 `pageMatches` 에 담고 출력해보면 아래와 같이 나온다.

```js
// Home 페이지 일 때
(3) [{…}, {…}, {…}]
0: 
  isMatch: true
  route: {path: "/", view: ƒ} // view: () => console.log("Viewing Home")
1: 
  isMatch: false
  route: {path: "/posts", view: ƒ} // view: () => console.log("Viewing Posts")
2: 
  isMatch: false
  route: {path: "/settings", view: ƒ} // view: () => console.log("Viewing Settings")
// ...
```

다음은 `isMatch`가 `true` 일 때 `path` 값과 `location.pathname` 의 값이 같다면 해당 페이지를 보여주면 된다.(우선은 `console.log`)

`find` 메소드를 사용해서 구현한다.

> **Array.prototype.find()**
find() 메서드는 주어진 판별 함수를 만족하는 첫 번째 요소의 값을 반환합니다. 그런 요소가 없다면 undefined를 반환합니다. -[MDN](https://developer.mozilla.org/ko/docs/Web/JavaScript/Reference/Global_Objects/Array/find)-

```js
// ...
let match = pageMatches.find((pageMatch) => pageMatch.isMatch);

console.log(match.route.view());
```

이렇게 만들면 `pageMatch.isMatch` 인 값, 즉 `true` 인 값의 `view` 함수를 실행한 `Viewing ...` 을 보여주게 될 것이다.


### 3-2. 이벤트 구현하기
다음에 해야 할 일은 페이지가 처음 로드됐을 때, 각각의 페이지들을 클릭할 때 `router` 함수를 실행시켜 해당되는 페이지에 대한 정보를 띄워주는 것이다.

HTML 이 모두 로드됐을 때 첫 페이지를 보여주기 위해서 `DOMContentLoaded` 를 사용할 것이다.

```js
document.addEventListener("DOMContentLoaded", () => {
    document.body.addEventListener("click", (e) => {
        if (e.target.matches("[data-link]")) {
            e.preventDefault();
            history.pushState(null, null, e.target.href);
            router();
        }
    });
    router();
});
```

`click` 이벤트를 등록하고 `data-link`라는 속성(`a` 태그)이 있는 곳에서만 동작하도록 조건을 달아준다.

`history.pushState` 를 사용해서 url을 변경할 수 있게 만들어준다. 그리고 `router` 함수를 실행시켜 렌더링을 해주면된다.

여기까지 작성하고 실행해보면 다음과 같이 작동할 것이다.

<p align="center"><img src="https://images.velog.io/images/tlatjdgh3778/post/ffd2d58e-9e40-4ca1-8a62-4a5196a5ebfe/spa-console.log.gif" /></p>

하지만 한 가지 문제가 발생하는데 바로 뒤로가기 버튼이나 앞으로가기 버튼을 누를 때는 콘솔에 출력이 안 된다는 점이다.

그 이유는 `body` 에만 클릭 이벤트를 주었기 때문인데, `popstate` 이벤트를 사용해서 해결할 수 있다.

> **popstate** 이벤트는 브라우저의 백 버튼이나 (history.back() 호출) 등을 통해서만 발생된다. 그리고 그 이벤트는 같은 document에서 두 히스토리 엔트리 간의 이동이 있을 때만 발생이 된다. -[MDN](https://developer.mozilla.org/ko/docs/Web/API/WindowEventHandlers/onpopstate)-

아래와 같이 코드를 작성해주자.

```js
// 뒤로 가기 할 때 데이터 나오게 하기 위함
window.addEventListener("popstate", () => {
    router();
});
```

`popstate` 이벤트가 발생할 때(뒤로가기, 앞으로가기 등) `router` 함수를 실행시켜서 해당하는 페이지가 렌더링 될 수 있도록 해준다.

## 4. View 구현하기
다음으로는 화면에 그려지는 각 페이지들을 만들어본다.

`js` 폴더에 `pages` 폴더를 만들고 `Home.js` 파일을 생성하고 다음과 같이 작성해준다.

```js
// frontend/static/js/pages/Home.js
export default class {
    constructor() {
        document.title = "Home";
    }
    async getHtml() {
        return `
            <h1>This is Home Page</h1>
        `;
    }
}
```

제일 먼저 `constructor` 함수로 문서의 `title` 을 지정해주고 페이지에 해당하는 내용을 적어준다.

`Posts` 와 `Settings` 파일도 각각 만들어서 동일하게 작성해준다.

```js
// frontend/static/js/pages/Posts.js
export default class {
    constructor() {
        document.title = "Posts";
    }
    async getHtml() {
        return `
            <h1>This is Posts Page</h1>
        `;
    }
}
// 
```
```js
// frontend/static/js/pages/Settings.js
export default class {
    constructor() {
        document.title = "Settings";
    }
    async getHtml() {
        return `
            <h1>This is Settings Page</h1>
        `;
    }
}
```

## 5. View 렌더링하기
### 5-1. View 렌더링
이제 콘솔에 찍지 않고 만들어진 `View`를 렌더링해보자.
`index.js` 파일을 열어서 `view` 부분을 변경한다.

```js
import Home from "./pages/Home.js";
import Posts from "./pages/Posts.js";
import Settings from "./pages/Settings.js";

const router = async () => {
    const routes = [
        { path: "/", view: Home },
        { path: "/posts", view: Posts },
        { path: "/settings", view: Settings },
    ];
```

`view: () => console.log("Viewing Home")` 였던 부분을 `view: Home`과 같이 `Home.js`에서 불러온 class로 적용해준다.

다음은 해당하는 페이지의 클래스의 새 인스턴스를 만들고 `getHtml` 메소드를 실행해서 HTML파일에 추가하는 작업을 해준다.

```js
// router 함수 안
// ...
const page = new match.route.view();
    
document.querySelector("#root").innerHTML = await page.getHtml();
```

여기까지 작성해주면 다음과 같이 작동할 것이다.

<p align="center"><img src="https://images.velog.io/images/tlatjdgh3778/post/1b105c47-cd4b-4363-b57f-0567851cc3f8/spa.gif" /></p>

page title 도 잘 변경되고 안의 내용도 잘 바뀌는 것을 볼 수 있다. 

여기까지만 해도 spa의 기본적인 구현은 끝난 것이다.

### 5-2. Not Found 404
`/`, `/posts`, `/settings` 가 아닌 이상한 경로로 들어왔을 때의 설정은 어떻게 해주면 될까

우선 `NotFound.js` 파일을 `js` 폴더 안에 생성한다.

```js
// frontend/static/js/pages/NotFound.js
export default class {
    constructor() {
        document.title = "404 Not found";
    }
    async getHtml() {
        return `
            <h1>404 Not found</h1>
        `;
    }
}
```

그 다음 `index.js` 파일에서 불러온 후 설정을 해주면 된다. 다음 코드를 보자.

**기존 `router` 함수의 부분**
```js
// index.js
let match = pageMatches.find((pageMatch) => pageMatch.isMatch);

const page = new match.route.view();
document.querySelector("#root").innerHTML = await page.getHtml();
```

`find` 함수는 만족하는 요소가 없다면 `undefined` 를 반환하는데, 경로에 이상한 값이 들어오면 맞는 값이 없어서 `undefined` 를 반환하게 된다.

**변경 후 `router` 함수의 부분**
```js
let match = pageMatches.find((pageMatch) => pageMatch.isMatch);

if (!match) {
  match = {
    route: location.pathname,
    isMatch: true,
  };
  const page = new NotFound();
  document.querySelector("#root").innerHTML = await page.getHtml();
} else {
  const page = new match.route.view();
  document.querySelector("#root").innerHTML = await page.getHtml();
}
```

만약 `match` 가 `undefined` 면 `NotFound` 페이지를 렌더링하고 `undefined` 가 아닌 경우에는 해당하는 페이지를 렌더링해준다.

<p align="center"><img src="https://images.velog.io/images/tlatjdgh3778/post/a2b4a599-5be7-42e5-a1eb-4282c490c02a/image.png" /></p>

## 6. CSS 적용하기
이거는 각자 원하는 스타일링을 해주면 된다.

`static` 폴더에 `css` 폴더를 만들고 `index.css` 파일을 만들어주었다.

```css
* {
    padding: 0;
    margin: 0;
}

body {
    display: flex;
}

.nav {
    display: flex;
    flex-direction: column;
    background: #222222;
    height: 100vh;
}

.nav_item {
    padding: 12px 18px;
    text-decoration: none;
    color: #eeeeee;
    font-weight: 500;
}

.nav_item:hover {
    background: rgba(255, 255, 255, 0.05);
}

#root {
    margin: 2em;
    line-height: 1.5;
    font-weight: 500;
}

a {
    color: #009579;
}
```

HTML 파일에 CSS 파일 추가
```html
<link rel="stylesheet" href="./static/css/index.css" />
```

최종으로 완성된 모습은 다음과 같다.

<p align="center"><img src="https://images.velog.io/images/tlatjdgh3778/post/41e8f7ed-0bf8-4afc-a87a-dadcf991f19b/spa-2.gif" /></p>

Vanilla JavaScript에 대한 기본기가 많이 부족함을 느낀 공부였다고 생각한다..

앞으로 이 프로젝트에 Vanilla JavaScript로 구현할 수 있는 애들을 조금씩 만들어서 넣어봐야겠다.

## 7. 참고
* [decode - YOUTUBE](https://www.youtube.com/watch?v=6BozpmSjk-Y&t=1009s)
