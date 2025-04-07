import axios from "axios";

const apiEndpoint = process.env.NEXT_PUBLIC_SERVER_URL;

interface APIRESPONSE {
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

export interface CustomErrorResponse {
  error: {
    status: number;
    header: string;
    description: string;
    timestamp: string;
    path: string;
  };
}

export const postEventDetails = async (
  eventId: string | number,
  eventTitle: string,
  eventLocation: string,
  startDate: Date | null,
  endDate: Date | null
): Promise<APIRESPONSE> => {
  try {
    const payload = {
      eventId: eventId,
      title: eventTitle,
      location: eventLocation,
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

export interface UpdateEventPayload {
  eventId: string | number;
  eventTitle: string;
  eventLocation: string;
  startDate: Date | null;
  endDate: Date | null;
}

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
