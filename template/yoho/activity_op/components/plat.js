let isMobile = false;
let isIOS = false;
let isAndroid = false;
let isWebView = false;

if (typeof window !== "undefined" && typeof navigator !== "undefined") {
  const ua = navigator.userAgent.toLowerCase();
  isMobile = /ios|iphone|ipod|ipad|android/.test(ua);
  isIOS = /ios|iphone|ipod|ipad/.test(ua);
  isAndroid = isMobile && !isIOS;
  isWebView = (isAndroid || isIOS) && /wv|webview/.test(ua);

  console.log("当前环境是移动设备:", isIOS ? "IOS" : "Android");
  console.log("是否是 iOS:", isIOS);
  console.log("是否是 Android:", isAndroid);
  console.log("是否是 WebView:", isWebView);
} else {
  console.log("当前环境不支持 navigator 对象，可能是在服务器端或使用不支持 navigator 的浏览器");
}

export { isMobile, isIOS, isAndroid, isWebView };
