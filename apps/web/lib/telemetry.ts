export function logUnknownSection(componentUid: string): void {
  console.warn("[section-renderer] Unknown section", {
    componentUid,
  });
}
