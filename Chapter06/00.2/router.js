// ! Router 구성 (Contoller Configuration)
// ! > Ver.2.1 (프로그래밍 방식 ) --- extractUrlParams 메서드 && 정규식을 이용한

const ROUTE_PARAMETER_REGEXP = /:(\w+)/g; // ":"로 시작하는 문자열을 찾아서 ":"을 제외한 문자열을 나타냄. (라우팅에서 동적으로 변하는 Route Parameter)
const URL_FRAGMENT_REGEXP = "([^\\/]+)"; // "/"를 제외한 모든 문자열

// todo: extractUrlParams 메서드는 왜 필요할까?
// → winodw.location.hash값과 일치하는 url에 매핑된 컴포넌트를 찾기 위해
const extractUrlParams = (route, windowHash) => {
  const params = {};

  if (route.params.length === 0) {
    return params;
  }

  const matches = windowHash.match(route.testRegExp);

  matches.shift();

  matches.forEach((paramValue, index) => {
    const paramName = route.params[index]; // ? paramName은 route객체의 params[index] 다. → extractUrlParams 호출부 보자.
    params[paramName] = paramValue;
  });

  return params;
};

// todo: 이 무명 함수는 index.js(Controlling 부)에서 createRouter라는 이름으로 import되어 사용될 예정!
export default () => {
  const routes = [];
  let notFound = () => {};

  const router = {};

  // * (현재 location의 hash값과) 일치하는 경로 찾기 ~ 컨테이너의 구성 요소 교체까지 담당하는 메서드
  const checkRoutes = () => {
    const { hash } = window.location;

    // 일치하는 경로 찾는 로직
    const currentRoute = routes.find((route) => {
      // ? currentRoute는 Router 배열(routes)에서 textRegExp정규식을 만족하는 첫번째 요소를 리턴
      const { testRegExp } = route;
      return testRegExp.test(hash);
    });
    // 분기처리
    // 1(N). 先 예외 처리 - 일치하는 경로 발견 X → notFound메서드 실행 & 리턴
    if (!currentRoute) {
      notFound();
      return;
    }

    const urlParams = extractUrlParams(currentRoute, window.location.hash); // ? route객체는 currentRoute 다. → currentRoute 보자.
    // 2(Y). 일치하는 경로 발견 O → 라우터 컨테이너의 component 교체
    currentRoute.component(urlParams);
  };

  // * Router 레지스트리에 route, component 매핑 객체 등록하는 메서드
  router.addRoute = (fragment, component) => {
    const params = [];

    // index.js > router.addRoute(fragment, 컴포넌트)의 fragment를 정규식으로 파싱
    const parsedFragment = fragment
      // fragment에서 ROUTE_PARAMETER_REGEXP 정규식과 일치하는 문자열 🔄 콜백함수가 리턴한 URL_FRAGMENT_REGEXP 정규식(동적인 값)
      .replace(ROUTE_PARAMETER_REGEXP, (match, paramName) => {
        // ? paramName은 어디서 전달받는 값? → extractUrlParams 메서드 봐라
        params.push(paramName);
        return URL_FRAGMENT_REGEXP;
      })
      .replace(/\//g, "\\/"); // 그 문자열에서 "/\//g"과 일치하는 문자열 🔄 "\\/"로 변경

    console.log(`^${parsedFragment}$`);

    routes.push({
      testRegExp: new RegExp(`^${parsedFragment}$`),
      component,
      params,
    });
    // Router 배열의 객체 데이터 모양
    // → {
    //     testRegExp: 정규식,
    //     component: pages.컴포넌트명에 매핑된 값(현재 기준 문자열)
    //     params: [ paramName들, ... ]
    //   }

    return router;
  };
  // * notFound생성함수를 router에 set하는 메서드 (cb인수는 controlling부에서 전달됨)
  router.setNotFound = (cb) => {
    notFound = cb;
    return router;
  };

  router.navigate = (fragment) => {
    window.location.hash = fragment;
  };

  // * 초기 route 설정 메서드 (route 초기화 메서드)
  router.start = () => {
    window.addEventListener("hashchange", checkRoutes);

    if (!window.location.hash) {
      window.location.hash = "#/";
    }

    checkRoutes();
  };

  return router;
};
