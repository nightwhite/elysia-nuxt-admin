/**
 * 抑制Vue 3 Suspense实验性功能警告
 * 参考：https://github.com/nuxt/nuxt/discussions/25973
 */
export default defineNuxtPlugin(() => {
  if (import.meta.env.DEV) {
    const originalInfo = console.info;
    console.info = (...args) => {
      if (
        typeof args[0] === "string" &&
        args[0].includes("<Suspense> is an experimental feature")
      ) {
        return; // 终止显示该警告
      }
      originalInfo(...args);
    };
  }
}); 