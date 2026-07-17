declare module "*pagedjs/dist/paged.polyfill.js?raw" {
  const content: string;
  export default content;
}

declare module "@pagedjs-polyfill" {
  const url: string;
  export default url;
}

declare module "pagedjs" {
  export class Previewer {
    preview(
      content: string,
      stylesheets: (string | Record<string, string>)[],
      renderTo: HTMLElement,
    ): Promise<unknown>;
    destroy(): void;
  }
}
