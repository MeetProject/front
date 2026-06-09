export const debounce = <Args extends unknown[]>(callback: (...args: Args) => void, delay: number) => {
  const state: { timer: ReturnType<typeof setTimeout> | null } = { timer: null };

  const cancel = () => {
    if (state.timer) {
      clearTimeout(state.timer);
      state.timer = null;
    }
  };

  const debounced = (...args: Args) => {
    cancel();
    state.timer = setTimeout(() => callback(...args), delay);
  };

  return Object.assign(debounced, { cancel });
};
