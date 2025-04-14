import axios from "axios";

const apiEndpoint = process.env.NEXT_PUBLIC_SERVER_URL;

export interface APIRESPONSE {
  status: string | number;
  message?: string;
  data?: {
    eventId: string | number;
    title: string;
    location: string;
    startDate: Date | null;
    endDate: Date | null;
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

export const postEventDetails = async (
  eventId: string | number,
  title: string,
  location: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<APIRESPONSE> => {
  try {
    const payload = {
      eventId: eventId,
      title: title,
      location: location,
      startDate: startDate,
      endDate: endDate,
    };
    const response = await axios.post<APIRESPONSE>(
      `${apiEndpoint}/api/v1/addValetEvent`,
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
    const response = await axios.get<APIRESPONSE>(
      `${apiEndpoint}/api/v1/getAllValetEvents`,
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
    const response = await axios.delete<APIRESPONSE>(
      `${apiEndpoint}/api/v1/deleteValetEvent/${id}`,
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

export const updateEvent = async (id: string, payload: UpdateEventPayload) => {
  try {
    const response = await axios.put<APIRESPONSE>(
      `${apiEndpoint}/api/v1/updateValetEvent/${id}`,
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
    const response = await axios.post<APIRESPONSELOGIN>(
      `${apiEndpoint}/api/v1/login`,
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
    const response = await axios.post<APIRESPONSELOGIN>(
      `${apiEndpoint}/api/v1/verify`,
      payload,
      { headers: { 'Content-Type': 'application/json' } }
    );
    return response.data;
  } catch (error) {
    throw error;
  }
};