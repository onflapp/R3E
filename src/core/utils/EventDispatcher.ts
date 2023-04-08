class EventDispatcher {
  private _eventHandlers = {};
  private static _global = null;

  public addEventListener(evt: string, handler: any) {
    this._eventHandlers[evt] = this._eventHandlers[evt] || [];
    this._eventHandlers[evt].push(handler);
  }

  public removeEventListener(evt: string, handler: any) {
    let handlers = this._eventHandlers[evt];
    if (handlers) {
      for (let i = 0; i < handlers.length; i += 1) {
        if (handlers[i] === handler) handlers.splice(i, 1);
      }
    }
  }

  public removeEventListeners(evt: string) {
    delete this._eventHandlers[evt];
  }

  public dispatchAllEvents(evt: string, ...args: any[]) {
    let handlers = this._eventHandlers[evt];
    if (handlers) {
      for (let i = 0; i < handlers.length; i += 1) {
        handlers[i](evt, ...args);
      }
    }
  }

  public dispatchAllEventsAsync(evt: string, ...args: any[]) {
    let self = this;
    setTimeout(function () {
      self.dispatchAllEvents(evt, ...args);
    }, 0);
  }

  static global() : EventDispatcher {
    if (!EventDispatcher._global) {
      EventDispatcher._global = new EventDispatcher();
    }
    return EventDispatcher._global;
  }
}
