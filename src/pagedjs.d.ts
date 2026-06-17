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
