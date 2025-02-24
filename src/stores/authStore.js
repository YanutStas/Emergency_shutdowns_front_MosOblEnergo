// src/stores/authStore.js
import { create } from "zustand";

const useAuthStore = create((set) => ({
  token: typeof window !== "undefined" ? localStorage.getItem("jwt") : null,
  loading: false,
  error: null,

  login: async (identifier, password) => {
    set({ loading: true, error: null });
    try {
      const response = await fetch("http://localhost:1337/api/auth/local", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ identifier, password }),
      });

      const data = await response.json();

      if (data.error) {
        // Переводим стандартные ошибки Strapi
        let message = data.error.message;
        if (message.includes("Invalid identifier or password")) {
          message = "Неверный email или пароль";
        }
        throw new Error(message);
      }

      localStorage.setItem("jwt", data.jwt);
      set({ token: data.jwt, loading: false });
    } catch (err) {
      set({
        error: err.message.replace("identifier", "email"), // Заменяем терминологию
        loading: false,
      });
    }
  },

  logout: () => {
    localStorage.removeItem("jwt");
    set({ token: null });
  },
}));

export default useAuthStore;

// import { create } from "zustand";

// const useAuthStore = create((set) => ({
//   token: typeof window !== "undefined" ? localStorage.getItem("jwt") : null,
//   loading: false,
//   error: null,

//   login: async (identifier, password) => {
//     set({ loading: true, error: null });
//     try {
//       const response = await fetch("http://localhost:1337/api/auth/local", {
//         method: "POST",
//         headers: { "Content-Type": "application/json" },
//         body: JSON.stringify({ identifier, password }),
//       });

//       const data = await response.json();
//       if (data.error) throw new Error(data.error.message);

//       localStorage.setItem("jwt", data.jwt);
//       set({ token: data.jwt, loading: false });
//     } catch (err) {
//       set({ error: err.message, loading: false });
//     }
//   },

//   logout: () => {
//     localStorage.removeItem("jwt");
//     set({ token: null });
//   },
// }));

// export default useAuthStore;
