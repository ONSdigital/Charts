import type { ChartEventBus, ChartEventMap } from "../types";

export function createEventBus(): ChartEventBus {
  const listeners = new Map<
    keyof ChartEventMap,
    Set<(payload: ChartEventMap[keyof ChartEventMap]) => void>
  >();

  return {
    emit(type, payload) {
      listeners.get(type)?.forEach((listener) => {
        listener(payload as ChartEventMap[keyof ChartEventMap]);
      });
    },
    on(type, listener) {
      const eventListeners =
        listeners.get(type) ??
        new Set<(payload: ChartEventMap[keyof ChartEventMap]) => void>();

      eventListeners.add(
        listener as (payload: ChartEventMap[keyof ChartEventMap]) => void,
      );
      listeners.set(type, eventListeners);

      return () => {
        eventListeners.delete(
          listener as (payload: ChartEventMap[keyof ChartEventMap]) => void,
        );

        if (eventListeners.size === 0) {
          listeners.delete(type);
        }
      };
    },
  };
}
