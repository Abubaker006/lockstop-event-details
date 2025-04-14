"use client";
import React from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { postEventDetails } from "@/apiService/apiServices";
import axios, { AxiosError } from "axios";
import { CalendarDays } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { FormikHelpers } from "formik";
import { validate } from "@/utils/schema";
import { CustomErrorResponse } from "@/apiService/apiServices";
// import ClockClockwise from '@/assests/icons/ClockClockwise.svg'
// import QRCode from "react-qr-code";
import { formatDate } from "@/utils/formatters"; // Removed formatTime

export interface EventDetailsFormValues {
  title?: string;
  location?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  startTime?: string;
  endTime?: string;
  eventId: string | number;
}

interface QRCodeData {
  scanType: string;
  startDate: string | null;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  timezone: string;
}

interface EventDetailsFormProps {
  handleRefreshData: () => void;
  setQrCodeModalVisible: (visible: boolean) => void;
  setQrCodeValue: (value: string) => void;
  setIsAddEventFormVisible: (visible: boolean) => void;
}

const EventDetailsForm: React.FC<EventDetailsFormProps> = ({
  handleRefreshData,
  setQrCodeValue,
  setQrCodeModalVisible,
  setIsAddEventFormVisible,
}) => {
  const handleSubmitSuccess = (qrValue: string) => {
    setQrCodeValue(qrValue);
    setIsAddEventFormVisible(false);
    setQrCodeModalVisible(true);
    handleRefreshData();
  };

  const handleFormSubmit = async (
    values: EventDetailsFormValues,
    actions: FormikHelpers<EventDetailsFormValues>
  ) => {
    try {
      const {
        eventId,
        title,
        location,
        startDate,
        endDate,
        startTime,
        endTime,
      } = values;
      if (!eventId || !endDate || !endTime) {
        toast.error("Please fill all required fields.");
        actions.resetForm();
        return;
      }

      // Combine date and time for startDate
      let adjustedStartDate = startDate;
      if (startDate && startTime) {
        const [hours, minutes] = startTime.split(":").map(Number);
        adjustedStartDate = new Date(startDate);
        adjustedStartDate.setHours(hours, minutes);
      }

      // Combine date and time for endDate
      let adjustedEndDate = endDate;
      if (endDate && endTime) {
        const [hours, minutes] = endTime.split(":").map(Number);
        adjustedEndDate = new Date(endDate);
        adjustedEndDate.setHours(hours, minutes);
      }

      const response = await postEventDetails(
        eventId,
        title || "",
        location || "",
        adjustedStartDate || null,
        adjustedEndDate
      );

      const { data } = response;
      const qrData: QRCodeData = {
        scanType: "valetAdmin",
        startDate: data?.startDate ? formatDate(data.startDate) : null,
        startTime: startTime || null,
        endDate: data?.endDate ? formatDate(data.endDate) : null,
        endTime: endTime || null,
        timezone: "America/Chicago",
      };
      const qrValue: string = JSON.stringify(qrData);
      handleSubmitSuccess(qrValue);
      toast.success("Event details submitted successfully!");
      actions.resetForm();
    } catch (error) {
      if (axios.isAxiosError(error)) {
        const axiosError = error as AxiosError<CustomErrorResponse>;
        if (axiosError.response?.data?.error) {
          const customError = axiosError.response.data.error;
          console.error("Custom API Error:", customError);
          toast.error(customError.description);
        }
      } else {
        toast.error("An error occurred while submitting the form.");
      }
    }
  };
  // useEffect(() => {
  //   if (disableQRcode) return;
  //   setQrCodeValue("");
  //   setIsRenderingForm(true);
  // }, [disableQRcode]);

  return (
    <>
      <Formik
        initialValues={
          {
            title: "",
            location: "",
            startDate: null,
            endDate: null,
            startTime: "",
            endTime: "",
            eventId: "",
          } as EventDetailsFormValues
        }
        validate={validate}
        validateOnChange={true}
        validateOnBlur={true}
        validateOnMount={true}
        onSubmit={handleFormSubmit}
      >
        {({ values, isSubmitting, setFieldValue }) => (
          <Form className="w-full mx-auto">
            <div className="mb-4">
              <label
                htmlFor="eventId"
                className="block text-gray-700 font-medium"
              >
                Event Id <span className="text-red-500">*</span>
              </label>
              <Field
                type="text"
                name="eventId"
                id="eventId"
                className="w-full bg-[#FCFCFC] p-2 border border-[#d1e0e0] rounded focus:outline-none focus:border-[#d1e0e0]"
              />
              <ErrorMessage
                name="eventId"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div className="mb-4">
              <label
                htmlFor="title"
                className="block text-gray-700 font-medium"
              >
                Title
              </label>
              <Field
                type="text"
                name="title"
                id="title"
                className="w-full p-2 border border-[#d1e0e0] bg-[#FCFCFC] rounded focus:outline-none focus:border-[#d1e0e0]"
              />
              <ErrorMessage
                name="title"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <div className="mb-4 w-[100%] flex flex-row gap-6">
              <div className="w-full">
                <label className="text-sm text-gray-700 block mb-1">
                  Start Date
                </label>
                <div className="relative  flex items-stretch">
                  <DatePicker
                    selected={values.startDate}
                    onChange={(date) => setFieldValue("startDate", date)}
                    icon={
                      <CalendarDays
                        color="#E84C23"
                        className="absolute  -right-[82%] top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        size={20}
                      />
                    }
                    showIcon={true}
                    placeholderText=""
                    dateFormat="MM/dd/yyyy"
                    minDate={new Date()}
                    className="w-[100%] md:w-[187%] h-11 bg-[#FCFCFC] border border-[#d1e0e0] rounded-md text-sm text-gray-700 placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-0"
                  />
                </div>
                <ErrorMessage
                  name="startDate"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="w-full">
                <label className="text-sm text-gray-700 block mb-1">
                  End Date <span className="text-red-500">*</span>
                </label>
                <div className="relative h-11 flex items-stretch">
                  <DatePicker
                    selected={values.endDate}
                    onChange={(date) => setFieldValue("endDate", date)}
                    icon={
                      <CalendarDays
                        color="#E84C23"
                        className="absolute  -right-[82%] top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                        size={20}
                      />
                    }
                    showIcon={true}
                    placeholderText=""
                    dateFormat="MM/dd/yyyy"
                    minDate={values.startDate || new Date()}
                    className="w-[100%] sm:w-[130%] md:w-[187%] h-11 bg-[#FCFCFC] rounded-md border border-[#d1e0e0] text-sm text-gray-700 placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-0"
                  />
                </div>
                <ErrorMessage
                  name="endDate"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            </div>

            <div className="mb-4 w-[100%] flex flex-row gap-6">
              <div className="w-full">
                <label className="text-sm text-gray-700 block mb-1">
                  Start Time
                </label>
                <div className="relative h-11 flex items-stretch">
                  <input
                    type="time"
                    name="startTime"
                    value={values.startTime || ""}
                    onChange={(e) => setFieldValue("startTime", e.target.value)}
                    className="w-full h-full bg-[#FCFCFC] border border-[#d1e0e0] rounded-md text-sm text-gray-700 placeholder-gray-400 pl-3 pr-10 py-2 focus:outline-none focus:ring-0 [appearance:textfield] [&::-webkit-calendar-picker-indicator]:hidden"
                  />
                  {/* <ClockClockwise
                    className="absolute right-3 top-1/2 -translate-y-1/2 opacity-50 pointer-events-none"
                    size={20}
                    color="#E84C23"
                  /> */}
                </div>
                <ErrorMessage
                  name="startTime"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>

              <div className="w-full">
                <label className="text-sm text-gray-700 block mb-1">
                  End Time <span className="text-red-500">*</span>
                </label>
                <div className="relative h-11 flex items-stretch">
                  <input
                    type="time"
                    name="endTime"
                    value={values.endTime || ""}
                    onChange={(e) => setFieldValue("endTime", e.target.value)}
                    className="w-full h-full bg-[#FCFCFC] border border-[#d1e0e0] rounded-md text-sm text-gray-700 placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-0"
                  />
                </div>
                <ErrorMessage
                  name="endTime"
                  component="div"
                  className="text-red-500 text-sm mt-1"
                />
              </div>
            </div>

            <div className="mb-4">
              <label
                htmlFor="location"
                className="block text-gray-700 font-medium"
              >
                Location
              </label>
              <Field
                as="textarea"
                name="location"
                id="location"
                className="w-full p-2 h-[100px] bg-[#FCFCFC] border border-[#d1e0e0] rounded focus:outline-none focus:border-[#d1e0e0]"
              />
              <ErrorMessage
                name="location"
                component="div"
                className="text-red-500 text-sm mt-1"
              />
            </div>

            <button
              type="submit"
              className="w-full bg-[#F54A00] text-white font-semibold py-2 px-4 rounded hover:bg-orange-600 transition"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Submitting..." : "Submit"}
            </button>
          </Form>
        )}
      </Formik>
    </>
  );
};

export default EventDetailsForm;
