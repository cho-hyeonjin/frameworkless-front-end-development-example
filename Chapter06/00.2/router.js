// ! Router 구성 (Contoller Configuration)
// ! > Ver.2.1 (프로그래밍 방식 ) --- extractUrlParams 메서드 && 정규식을 이용한

const ROUTE_PARAMETER_REGEXP = /:(\w+)/g;
const URL_FRAGMENT_REGEXP = "([^\\/]+)";

const extractUrlParams = (route, windowHash) => {
  const params = {};

  if (route.params.length === 0) {
    return params;
  }

  const matches = windowHash.match(route.testRegExp);

  matches.shift(); // shift는 왜 하는거?

  matches.forEach((paramValue, index) => {
    const paramName = route.params[index]; // ? paramName은 route객체의 params[index] 다. → extractUrlParams 호출부 보자.
    params[paramName] = paramValue;
  });

  return params;
};

export default () => {
  const routes = [];
  let notFound = () => {};

  const router = {};

  // * (현재 location의 hash값과) 일치하는 경로 찾기 ~ 컨테이너의 구성 요소 교체까지 담당하는 메서드
  const checkRoutes = () => {
    const { hash } = window.location;

    const currentRoute = routes.find((route) => {
      // ? currentRoute는 Router 배열(routes)에서 textRegExp정규식을 만족하는 첫번째 요소를 리턴
      const { testRegExp } = route;
      return testRegExp.test(hash);
    });

    if (!currentRoute) {
      notFound();
      return;
    }

    const urlParams = extractUrlParams(currentRoute, window.location.hash); // ? route객체는 currentRoute 다. → currentRoute 보자.
    currentRoute.component(urlParams);
  };

  // * Router 레지스트리에 route, component 매핑 객체 등록하는 메서드
  router.addRoute = (fragment, component) => {
    const params = [];

    const parsedFragment = fragment
      .replace(ROUTE_PARAMETER_REGEXP, (match, paramName) => {
        // ? paramName은 어디서 전달받는 값? → extractUrlParams 메서드 봐라
        params.push(paramName);
        return URL_FRAGMENT_REGEXP;
      })
      .replace(/\//g, "\\/");

    console.log(`^${parsedFragment}$`);

    routes.push({
      testRegExp: new RegExp(`^${parsedFragment}$`),
      component,
      params,
    });

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
