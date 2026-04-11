import { showAlert } from "../components/DevAlert";
// const BASE_URL = "http://localhost:3334"; // backend URL
// const BASE_URL = "http://192.168.1.2:3334"; // backend URL
// const BASE_URL = "http://192.168.1.2:3334"; // backend URL
// const BASE_SSO_AUTH_URL = "https://sso-auth-backend.onrender.com"; // backend URL

const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
const BASE_SSO_AUTH_URL = process.env.EXPO_PUBLIC_SSO_URL;

export const api = {
  login: async (email: string, password: string) => {
    try {
      const res = await fetch(`${BASE_SSO_AUTH_URL}/sso/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("data -", data);

      if (!res.ok || !data?.user) {
        showAlert("Error", data?.message || "Login failed");
        return null;
      }
      showAlert("api data come", JSON.stringify(data));
      return data;
    } catch (error) {
      showAlert("Error", "Network error. Please try again.");
      return null;
    }
  },

  // signup: async (email: string, password: string) => {
  //   const res = await fetch(`${BASE_SSO_AUTH_URL}/sso/api/auth/signup`, {
  //     method: "POST",
  //     headers: { "Content-Type": "application/json" },
  //     body: JSON.stringify({ email, password }),
  //   });

  //   return res.json();
  // },


  signup: async (name: string, email: string, password: string) => {
    try {
      const res = await fetch(`${BASE_SSO_AUTH_URL}/sso/api/auth/signup`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      // ✅ Check HTTP status first
      if (!res.ok || !data?.user) {
        showAlert("Error", data?.message || "Signup failed");
        return null;
      }

      // ✅ Success case
      showAlert("Success", "Account created successfully 🎉");
      return data;
    } catch (error) {
      // ✅ Network / unexpected error
      showAlert("Error", "Network error. Please try again.");
      return null;
    }
  },

  addDailyRecord: async (token: string | null, pushups?: number, pullups?: number) => {
    try {
      console.log("--addDailyRecord post req--");
      const body: any = {};
      if (pushups !== undefined) body.pushups = pushups;
      if (pullups !== undefined) body.pullups = pullups;

      console.log("--addDailyRecord post req body--", body);
      const res = await fetch(`${BASE_URL}/api/daily-records`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert("Error", data?.message || "Failed to save record");
        return null;
      }

      showAlert("Success", "Record saved successfully ✅");
      return data;
    } catch (error) {
      console.log("error=", error,);

      showAlert("Error", "Network error. Please try again.");
      return null;
    }
  },

  getLatestRecord: async (token: string | null) => {
    try {
      const res = await fetch(`${BASE_URL}/api/daily-records/today`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await res.json();
      console.log("data today", data);

      if (!res.ok) {
        // If no record exists, it might return 404, so don't show error
        return null;
      }
      if (!data.data) {
        return null
      }
      return data.data;
    } catch (error) {
      showAlert("Error", "Network error. Please try again.");
      return null;
    }
  },

  updateDailyRecord: async (id: string, token: string | null, pushups?: number, pullups?: number) => {
    try {
      const body: any = {};
      if (pushups !== undefined) body.pushups = pushups;
      if (pullups !== undefined) body.pullups = pullups;

      const res = await fetch(`${BASE_URL}/api/daily-records/${id}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`,
        },
        body: JSON.stringify(body),
      });

      const data = await res.json();

      if (!res.ok) {
        showAlert("Error", data?.message || "Failed to update record");
        return null;
      }

      showAlert("Success", "Record updated successfully ✅");
      return data;
    } catch (error) {
      showAlert("Error", "Network error. Please try again.");
      return null;
    }
  },
}