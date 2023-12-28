// ! Router 구성 (Contoller Configuration)
// ! > Ver.2.1 (프로그래밍 방식 ) --- extractUrlParams 메서드 && 정규식을 이용한

const ROUTE_PARAMETER_REGEXP = /:(\w+)/g; // route parameter는 루트 레지스트리의 url (기존 html a태그에서 href에 fragment 식별자로 등록한 컴포넌트를 식별하는 url (url 파라미터))
const URL_FRAGMENT_REGEXP = "([^\\/]+)"; // winodw.location.hash가 아닐끼?...

// todo: extractUrlParams 메서드는 왜 필요할까?
// → winodw.location.hash값과 일치하는 컴포넌트를 찾기 위해
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

// todo: 이 무명 함수는 index.js(Controlling 부)에서 createRouter라는 이름으로 import되어 사용될 예정!
export default () => {
  const routes = []; // 애플리케이션 루트 레지스트리 객체들 담는 배열 (Router)
  let notFound = () => {}; // notFound 페이지 생성 메서드

  const router = {}; // 애플리케이션 루트 레지스트리 객체 { url: "/tech", component: "<app-tech>" } 이런 식

  // * 일치하는 경로 찾기 메서드
  const checkRoutes = () => {
    const { hash } = window.location; // window.location 객체에서 구조분해 할당으로 hash 값 추출

    // prettier-ignore
    // currentRoute 객체 생성 로직
    const currentRoute = routes.find((route) => { // (find는 배열 중 제공된 함수를 만족하는 첫번째 요소를 리턴하는 메서드)
      const { testRegExp } = route; // route객체에서 testRegExp값을 구조분해 할당으로 추출
      return testRegExp.test(hash); // (test는 RegExp인스턴스의 인스턴스 메서드로, boolean값 리턴)
    });
    // → testRegExp.test(hash)가 true로 평가되면,
    //   routes.find 메서드는 해당 조건을 만족하는 첫 번째 요소를 찾아 currentRoute 변수에 할당

    if (!currentRoute) {
      //                    → false로 평가되면,
      notFound(); //          notFound메서드 (notFound 페이지 생성 메서드) 실행해서
      return; //              그 결과 리턴
    }

    // url parameter 생성 로직
    // 첫번째 인수는 현재 루트, 두번째 인수는 window.location객체의 hash값
    const urlParams = extractUrlParams(currentRoute, window.location.hash);
    // 현재 루트에서 urlParams를 가진 객체의 componente값 가져오기
    currentRoute.component(urlParams);
  };

  // * 컴포넌트 교체 메서드?
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

  // prettier-ignore
  // * notFound생성함수를 router에 set하는 메서드 (cb인수는 controlling부에서 전달됨)
  router.setNotFound = (cb) => { // Controlling부에서 pages.notFound 함수 전달 시
    notFound = cb; // notFound메서드로 pages.notFound가 할당됨
    return router; // router 리턴 (즉, router에 notFound 페이지 추가된 것)
  };

  router.navigate = (fragment) => {
    window.location.hash = fragment;
  };

  // prettier-ignore
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
