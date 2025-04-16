import axios from "axios";
import Cookies from "js-cookie";

const apiEndpoint = process.env.NEXT_PUBLIC_SERVER_URL;


export interface APIRESPONSE {
  status: string | number;
  message?: string;
  data?: {
    eventId: string | number;
    title: string;
    location: string;
    startDate: string | null;
    endDate: string | null;
  };
}
export interface APIRESPONSELOGIN {
  success: boolean;
  message?: string;
  data?: {
    accessToken?: string | undefined; // Assuming a token is returned on successful verification
    userId?: string;
  };
  error?: string;
}

export interface CustomErrorResponse {
  error: {
    status: number;
    header: string;
    description: string;
    timestamp: string;
    path: string;
  };
}
export interface UpdateEventPayload {
  eventId: string | number;
  title: string;
  location: string;
  startDate: Date | null;
  endDate: Date | null;
}

const api = axios.create({
  baseURL: `${apiEndpoint}/api/v1`,
  headers: {
    "Content-Type": "application/json",
  },
});
api.interceptors.request.use(
  (config) => {
    const token = Cookies.get("auth_token");
    if (token) {
      config.headers["Authorization"] = `Bearer ${token}`;
    }
    return config;
  },
  (error) => Promise.reject(error)
);

export const postEventDetails = async (
  eventId: string | number,
  title: string,
  location: string,
  startDate: string | null,
  endDate: string | null
): Promise<APIRESPONSE> => {
  try {
    const payload = {
      eventId: eventId,
      title: title,
      location: location,
      startDate: startDate,
      endDate: endDate,
    };
    const response = await api.post<APIRESPONSE>(
      `/addValetEvent`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const getAllEvents = async () => {
  try {
    const response = await api.get<APIRESPONSE>(
      "/getAllValetEvents",
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );

    return response.data;
  } catch (error) {
    throw error;
  }
};

export const deleteEvent = async (id: string) => {
  try {
    const response = await api.delete<APIRESPONSE>(
      `/deleteValetEvent/${id}`,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};
export const deleteEventsBulk = async (ids: string[]) => {
  try {
    const response = await api.delete<APIRESPONSE>(
      `/deleteValetEvents`,
      {
        headers: {
          "Content-Type": "application/json",
        },
        data: { ids }, // <- this is important for api DELETE with body
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};


export const updateEvent = async (id: string, payload: UpdateEventPayload) => {
  try {
    const response = await api.put<APIRESPONSE>(
      `/updateValetEvent/${id}`,
      payload,
      {
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const requestOtp = async (phoneNumber: string): Promise<APIRESPONSELOGIN> => {
  try {
    const payload = { phone_number: phoneNumber };
    const response = await api.post<APIRESPONSELOGIN>(
      `/login`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};

export const verifyOtp = async (
  phoneNumber: string,
  otp: string
): Promise<APIRESPONSELOGIN> => {
  try {
    const payload = { phone_number: phoneNumber, otp };
    const response = await api.post<APIRESPONSELOGIN>(
      `/verify`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};