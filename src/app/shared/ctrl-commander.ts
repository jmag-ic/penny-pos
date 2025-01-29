
export abstract class CtrlCommander {
  constructor(
    private keyMap: Record<string, (event: KeyboardEvent) => void>, 
    private defaultHandler?: (event: KeyboardEvent) => void
  ) { }

  /**
   * Handles keydown events and executes the associated function from the keyMap.
   * @param event - The keyboard event to handle.
   */
  protected handleCtrlCommands(event: KeyboardEvent): void {
    // Ignore events where the `Ctrl` key is not pressed
    if (!event.ctrlKey) return;

    // Normalize the key (e.g., map digits, handle case sensitivity)
    const key = this.normalizeKey(event.key);

    // Attempt to find a matching command in the keyMap
    const handler = this.keyMap[key];
    
    if (handler) {
      // Prevent default behavior
      event.preventDefault();
      handler(event);
    
    } else if (this.defaultHandler) {
      // Optional: call default handler for unmapped keys
      this.defaultHandler(event);
    }
  }

  /**
   * Normalizes keys to handle edge cases like digits or case sensitivity.
   * @param key - The raw key from the keyboard event.
   * @returns A normalized key suitable for matching in the keyMap.
   */
  private normalizeKey(key: string): string {
    if (/^\d$/.test(key)) return 'digit'; // Map numeric keys to "digit"
    return key.toLowerCase(); // Ensure case-insensitivity
  }
}