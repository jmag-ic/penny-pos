// CtrlCommander is an abstract class that will be used to handle keyboard ctrl commands
export abstract class CtrlCommander {

  // Define a keyMap object to map a key to a function
  private keyMap: { [key: string]: () => void };

  // Define a constructor that receives a keyMap object
  constructor(keyMap: { [key: string]: () => void }) {
    this.keyMap = keyMap;
  }

  // handleCtrlCommands is a method that receives a KeyboardEvent and executes it's respective function
  protected handleCtrlCommands(event: KeyboardEvent) {
    // Check if the ctrl key is pressed
    if (!event.ctrlKey) {
      return;
    }
    
    // Check if the key is in the keyMap object 
    const fn = this.keyMap[event.key];
    if (!fn) {
      return;
    }

    // stop the event from propagating
    event.preventDefault();

    // Execute the function
    fn();
  }

  // handleKeyDownEvent is an abstract method that needs to be implemented and decorated with the HostListener decorator.
  // The implementation should call the handleCtrlCommands method
  protected abstract handleKeyDownEvent(event: KeyboardEvent): void;
}