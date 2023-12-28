// 두번째 버전 2 (프로그래밍 방식 ) --- extractUrlParams 메서드 && 정규식을 이용한
const ROUTE_PARAMETER_REGEXP = /:(\w+)/g; // route parameter는 루트 레지스트리의 url (기존 html a태그에서 href에 fragment 식별자로 등록한 컴포넌트를 식별하는 url (url 파라미터))
const URL_FRAGMENT_REGEXP = "([^\\/]+)"; // winodw.location.hash가 아닐끼?...

// extractUrlParam을 왜 할까? --- url파라미터를 추출하는건데, 왜 추출하는지 설명해보기!
// 애플리케이션 route 레지스트리에는 { URL: '/tech', component: <app-tech> } 형식의 데이터가 저장되어 있다.
// 현재 브라우저에서 열려있는 윈도우의 location(url)에 해당하는 route의 파라미터와
// App route Registry에 등록된 객체데이터의 URL 비교해서
// 그 두 값이 일치하는 Registry 객체의 component 값을 렌더링!하기 위해~
// ----------
// 현재 window.location의 location에 매칭된 컴포넌트를 렌더링하기 위해서는 그 두 값을 비교해야하니까
// 현재 window.location의 route(windowHash)와
// 애플리케이션 루트 데이터 객체의 route를 추출해야지!
const extractUrlParams = (route, windowHash) => {
  const params = {};

  if (route.params.length === 0) {
    return params;
  }

  const matches = windowHash.match(route.testRegExp);

  matches.shift();

  matches.forEach((paramValue, index) => {
    const paramName = route.params[index];
    params[paramName] = paramValue;
  });

  return params;
};

export default () => {
  const routes = [];
  let notFound = () => {};

  const router = {};

  const checkRoutes = () => {
    const { hash } = window.location;

    const currentRoute = routes.find((route) => {
      const { testRegExp } = route;
      return testRegExp.test(hash);
    });

    if (!currentRoute) {
      notFound();
      return;
    }

    // extractUrlParams의 첫번째 인수는 현재루트, 두번째 인수는 window.location객체의 hash값
    const urlParams = extractUrlParams(currentRoute, window.location.hash);

    currentRoute.component(urlParams);
  };

  router.addRoute = (fragment, component) => {
    const params = [];

    const parsedFragment = fragment
      .replace(ROUTE_PARAMETER_REGEXP, (match, paramName) => {
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

  router.setNotFound = (cb) => {
    notFound = cb;
    return router;
  };

  router.navigate = (fragment) => {
    window.location.hash = fragment;
  };

  router.start = () => {
    window.addEventListener("hashchange", checkRoutes);

    if (!window.location.hash) {
      window.location.hash = "#/";
    }

    checkRoutes();
  };

  return router;
};
