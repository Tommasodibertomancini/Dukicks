import { createSlice } from '@reduxjs/toolkit';

const getInitialTheme = () => {
  const savedTheme = localStorage.getItem('theme');
  if (savedTheme) {
    return savedTheme;
  }

  return window.matchMedia &&
    window.matchMedia('(prefers-color-scheme: dark)').matches
    ? 'dark'
    : 'light';
};

const initialState = {
  theme: getInitialTheme(),
  notifications: [],
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);

      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    },
    setTheme: (state, action) => {
      state.theme = action.payload;
      localStorage.setItem('theme', state.theme);

      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark-theme');
      } else {
        document.documentElement.classList.remove('dark-theme');
      }
    },
    addNotification: (state, action) => {
      state.notifications.push({
        id: Date.now(),
        message: action.payload.message,
        type: action.payload.type || 'info',
        duration: action.payload.duration || 3000,
      });
    },
    removeNotification: (state, action) => {
      state.notifications = state.notifications.filter(
        (notification) => notification.id !== action.payload
      );
    },
  },
});

export const { toggleTheme, setTheme, addNotification, removeNotification } =
  uiSlice.actions;

export default uiSlice.reducer;
