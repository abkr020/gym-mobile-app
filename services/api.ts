import AsyncStorage from "@react-native-async-storage/async-storage";
import { showAlert } from "../components/DevAlert";

// const BASE_URL = "http://localhost:3334"; // backend URL
// const BASE_URL = "http://192.168.1.2:3334"; // backend URL
// const BASE_URL = "http://192.168.1.2:3334"; // backend URL
// const BASE_SSO_AUTH_URL = "https://sso-auth-backend.onrender.com"; // backend URL

// const BASE_URL = process.env.EXPO_PUBLIC_BASE_URL;
// const BASE_SSO_AUTH_URL = process.env.EXPO_PUBLIC_SSO_URL;

// const BASE_SSO_AUTH_URL = Constants.expoConfig?.extra?.SSO_URL;
const BASE_SSO_AUTH_URL = "https://sso-auth-backend.onrender.com";
const BASE_URL = "https://gym-mobile-app-backend.onrender.com";
// const BASE_URL = Constants.expoConfig?.extra?.BASE_URL;
// const BASE_URL = "http://192.168.1.14:3334";
const PENDING_RECORDS_KEY = "pendingDailyRecords";
const CACHED_RECORDS_KEY = "cachedDailyRecords";

const isSameDay = (d1: Date, d2: Date): boolean => {
  return (
    d1.getFullYear() === d2.getFullYear() &&
    d1.getMonth() === d2.getMonth() &&
    d1.getDate() === d2.getDate()
  );
};
const fetchWithTimeout = async (url: string, options: RequestInit = {}, timeout = 8000) => {
  const controller = new AbortController();
  const id = setTimeout(() => controller.abort(), timeout);
  try {
    const response = await fetch(url, { ...options, signal: controller.signal });
    return response;
  } finally {
    clearTimeout(id);
  }
};

const isServerReachable = async () => {
  try {
    const response = await fetchWithTimeout(`${BASE_URL}/`, {
      method: "GET",
      headers: { "Content-Type": "application/json" },
    }, 8000);

    return response.ok || response.status === 404 || response.status === 500;
  } catch (error) {
    return false;
  }
};

const normalizeRecords = (raw: any[]) =>
  raw.map((item: any) => ({
    id: item.id?.toString() || `${Date.now()}`,
    date: item.createdAt || item.date || new Date().toISOString(),
    ...item,
  }));

const loadPendingRecords = async () => {
  const raw = await AsyncStorage.getItem(PENDING_RECORDS_KEY);
  return raw ? JSON.parse(raw) : [];
};

const savePendingRecords = async (records: any[]) => {
  await AsyncStorage.setItem(PENDING_RECORDS_KEY, JSON.stringify(records));
};

const loadCachedRecords = async () => {
  const raw = await AsyncStorage.getItem(CACHED_RECORDS_KEY);
  return raw ? JSON.parse(raw) : [];
};

const saveCachedRecords = async (records: any[]) => {
  await AsyncStorage.setItem(CACHED_RECORDS_KEY, JSON.stringify(records));
};

const createLocalId = () => `local-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
const isLocalId = (id: any) => typeof id === 'string' && id.startsWith("local-");

export const api = {
  wakeServer: async () => {
    try {
      await Promise.allSettled([
        fetch(`${BASE_URL}/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
        fetch(`${BASE_SSO_AUTH_URL}/`, {
          method: "GET",
          headers: { "Content-Type": "application/json" },
        }),
      ]);
    } catch (error) {
      console.log("wakeServer failed:", error);
    }
  },

  syncPendingRecords: async (token: string | null) => {
    if (!token) return [];

    const pendingRecords = await loadPendingRecords();
    if (pendingRecords.length === 0) return [];
    if (!(await isServerReachable())) return pendingRecords;

    const successfullySynced: string[] = [];

    for (const record of pendingRecords) {
      try {
        let response: Response | null = null;
        if (record.action === "create") {
          response = await fetch(`${BASE_URL}/api/daily-records`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(record.body),
          });
        } else if (record.action === "update" && record.remoteId) {
          response = await fetch(`${BASE_URL}/api/daily-records/${record.remoteId}`, {
            method: "PUT",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(record.body),
          });
        } else if (record.action === "update") {
          response = await fetch(`${BASE_URL}/api/daily-records`, {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`,
            },
            body: JSON.stringify(record.body),
          });
        }

        if (response && response.ok) {
          successfullySynced.push(record.localId);
        }
      } catch (error) {
        console.log("sync record failed", record.localId, error);
      }
    }

    if (successfullySynced.length > 0) {
      const remaining = pendingRecords.filter(
        (record: any) => !successfullySynced.includes(record.localId)
      );
      await savePendingRecords(remaining);

      try {
        await api.getAllRecords(token, 30);
      } catch (error) {
        console.log("cache refresh after sync failed", error);
      }
    }

    return successfullySynced;
  },

  login: async (email: string, password: string) => {
    try {
      showAlert("SSO_URL", BASE_SSO_AUTH_URL || "undefined");
      const res = await fetch(`${BASE_SSO_AUTH_URL}/sso/api/auth/login`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, password }),
      });

      const data = await res.json();
      console.log("data -", data);

      if (!res.ok || !data?.user) {
        await showAlert("Error", data?.message || "Login failed");
        return null;
      }
      await showAlert("api data come", JSON.stringify(data));
      return data;
    } catch (error) {
      await showAlert("Error", "Network error. Please try again.");
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
        await showAlert("Error", data?.message || "Signup failed");
        return null;
      }

      // ✅ Success case
      await showAlert("Success", "Account created successfully 🎉");
      return data;
    } catch (error) {
      // ✅ Network / unexpected error
      await showAlert("Error", "Network error. Please try again.");
      return null;
    }
  },

  addDailyRecord: async (token: string | null, pushups?: number, pullups?: number) => {
    console.log("--addDailyRecord post req--");
    await showAlert("BASE_URL", BASE_URL || "undefined");

    const body: any = {};
    if (pushups !== undefined) body.pushups = pushups;
    if (pullups !== undefined) body.pullups = pullups;

    console.log("--addDailyRecord post req body--", body);
    const pendingRecord = {
      localId: createLocalId(),
      date: new Date().toISOString(),
      action: "create",
      ...body,
      createdAt: new Date().toISOString(),
    };

    try {
      if (!(await isServerReachable())) {
        const existing = await loadPendingRecords();
        await savePendingRecords([...existing, pendingRecord]);
        const cached = await loadCachedRecords();
        await saveCachedRecords([...cached, { id: pendingRecord.localId, ...pendingRecord }]);
        await showAlert("Offline", "Record saved locally and will sync once online.");
        return pendingRecord;
      }

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
        const existing = await loadPendingRecords();
        await savePendingRecords([...existing, pendingRecord]);
        const cached = await loadCachedRecords();
        await saveCachedRecords([...cached, { id: pendingRecord.localId, date: pendingRecord.date, ...body }]);
        await showAlert("Offline", data?.message || "Could not save to server, record stored locally.");
        return pendingRecord;
      }

      const serverRecord = {
        id: data?.data?.id?.toString() || data?.id?.toString() || createLocalId(),
        date: data?.data?.createdAt || data?.createdAt || pendingRecord.date,
        ...body,
      };
      const cached = await loadCachedRecords();
      await saveCachedRecords([...cached, serverRecord]);
      await showAlert("Success", "Record saved successfully ✅");
      return serverRecord;
    } catch (error) {
      const existing = await loadPendingRecords();
      await savePendingRecords([...existing, pendingRecord]);
      const cached = await loadCachedRecords();
      await saveCachedRecords([...cached, { id: pendingRecord.localId, date: pendingRecord.date, ...body }]);
      await showAlert("Offline", "Network error. Record saved locally and will sync later.");
      return pendingRecord;
    }
  },

  getTodaysRecord: async (token: string | null) => {
    try {
      if (!(await isServerReachable())) {
        const cached = await loadCachedRecords();
        // const cached: DailyRecord[] = await loadCachedRecords();
        if (!cached.length) return null;
        const today = new Date();

        const todayRecord = cached.find((item: any) =>
          isSameDay(new Date(item.createdAt), today)
        );

        // const latest = cached[0];
        console.log("getTodaysRecord cached", cached);

        // latest.createdAt === 
        return todayRecord || null;
      }

      // Sync pending records first
      await api.syncPendingRecords(token);

      const res = await fetch(`${BASE_URL}/api/daily-records/today`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return null;
      }
      if (!data.data) {
        return null;
      }
      return data.data;
    } catch (error) {
      const cached = await loadCachedRecords();
      if (!cached.length) return null;
      return cached[cached.length - 1];
    }
  },

  updateDailyRecord: async (id: string, token: string | null, pushups?: number, pullups?: number) => {
    if (!id) {
      await showAlert("updateDailyRecord", id)
      console.error("updateDailyRecord called with invalid id:", id);
      return null;
    }
    const body: any = {};
    if (pushups !== undefined) body.pushups = pushups;
    if (pullups !== undefined) body.pullups = pullups;
    console.log("update body", body);

    if (isLocalId(id)) {
      const existingPending = await loadPendingRecords();
      const createIndex = existingPending.findIndex(
        (record: any) => record.localId === id && record.action === "create"
      );

      if (createIndex >= 0) {
        existingPending[createIndex] = {
          ...existingPending[createIndex],
          body,
          date: new Date().toISOString(),
          createdAt: new Date().toISOString(),
        };
        await savePendingRecords(existingPending);

        const cached = await loadCachedRecords();
        const updatedCache = cached.map((record: any) =>
          record.id == id ? { ...record, ...body, date: new Date().toISOString() } : record
        );
        await saveCachedRecords(updatedCache);
        await showAlert(`Offline ${isLocalId(id)}`, `Update saved locally and will sync once online.`);
        return existingPending[createIndex];
      }
    }

    const pendingRecord = {
      localId: createLocalId(),
      date: new Date().toISOString(),
      action: "update",
      remoteId: id,
      body,
      createdAt: new Date().toISOString(),
    };

    try {
      if (!(await isServerReachable())) {
        const existing = await loadPendingRecords();
        await savePendingRecords([...existing, pendingRecord]);
        const cached = await loadCachedRecords();
        // const cached: DailyRecord[] = await loadCachedRecords();
        await showAlert("cached before update", JSON.stringify(cached));
        console.log("cached before update", cached);

        const updatedCache = cached.map((record: any) =>{
console.log("id type",typeof(id) , typeof(record.id));

          return(

            record.id == id ? { ...record, ...body } : record
          )
        }
        );
        await saveCachedRecords(updatedCache);
        await showAlert("cached after update", JSON.stringify(updatedCache));
        console.log("cached after update", cached);

        await showAlert("Offline- save", "Update saved locally and will sync once online.");
        return pendingRecord;
      }

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
        const existing = await loadPendingRecords();
        await savePendingRecords([...existing, pendingRecord]);
        const cached = await loadCachedRecords();
        const updatedCache = cached.map((record: any) =>
          record.id == id ? { ...record, ...body } : record
        );
        await saveCachedRecords(updatedCache);
        await showAlert("Offline", data?.message || "Could not update server, update stored locally.");
        return pendingRecord;
      }

      const cached = await loadCachedRecords();
      const updatedCache = cached.map((record: any) =>
        record.id == id ? { ...record, ...body } : record
      );
      await saveCachedRecords(updatedCache);
      await showAlert("Success", "Record updated successfully ✅");
      return data;
    } catch (error) {
      const existing = await loadPendingRecords();
      await savePendingRecords([...existing, pendingRecord]);
      const cached = await loadCachedRecords();
      const updatedCache = cached.map((record: any) =>
        record.id == id ? { ...record, ...body } : record
      );
      await saveCachedRecords(updatedCache);
      await showAlert("Offline", "Network error. Update saved locally and will sync later.");
      return pendingRecord;
    }
  },

  getAllRecords: async (token: string | null, days: number = 30) => {
    const cached = await loadCachedRecords();
    if (!(await isServerReachable())) {
      // await showAlert("dev", JSON.stringify(cached))
      return cached;
    }

    // Sync pending records first
    await api.syncPendingRecords(token);

    try {
      const res = await fetch(`${BASE_URL}/api/daily-records/all?days=${days}`, {
        method: "GET",
        headers: {
          "Authorization": `Bearer ${token}`,
        },
      });

      const data = await res.json();
      if (!res.ok) {
        return cached;
      }

      const normalized = Array.isArray(data.data)
        ? normalizeRecords(data.data)
        : data.data
          ? normalizeRecords([data.data])
          : [];

      await saveCachedRecords(normalized);
      return normalized;
      // return data.data || [];
    } catch (error) {
      await showAlert("dev error", JSON.stringify(error))
      console.log("getAllRecords error:", error);
      return cached;
    }
  },

  // getPendingRecordsCount: async () => {
  //   const pending = await loadPendingRecords();
  //   return pending.length;
  // },
};
