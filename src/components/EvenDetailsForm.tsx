"use client";
import React, { useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import { postEventDetails } from "@/apiService/apiServices";
import axios, { AxiosError } from "axios";
import { Calendar } from "lucide-react";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { toast } from "react-toastify";
import { FormikHelpers } from "formik";
import { validate } from "@/utils/schema";
import { CustomErrorResponse } from "@/apiService/apiServices";
import QRCode from "react-qr-code";
import { formatDate, formatTime } from "@/utils/formatters";

export interface EventDetailsFormValues {
  title?: string;
  location?: string;
  startDate?: Date | null;
  endDate?: Date | null;
  eventId: string | number;
  mode: string;
}
interface QRCodeData {
  scanType: string;
  valetAdmin: boolean;
  startDate: string | null;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  timezone: string;
}

const EventDetailsForm = () => {
  const [qrCodeValue, setQrCodeValue] = useState<string>("");
  const [isRenderingForm, setIsRenderingForm] = useState<boolean>(true);

  const handleSubmitSuccess = (qrValue: string) => {
    setQrCodeValue(qrValue);
    setIsRenderingForm(false);
  };

  const handleFormSubmit = async (
    values: EventDetailsFormValues,
    actions: FormikHelpers<EventDetailsFormValues>
  ) => {
    try {
      const { eventId, title, location, startDate, endDate, mode } = values;
      if (!eventId || !endDate || !mode) {
        toast.error("Please fill all required fields.");
        actions.resetForm();
        return;
      }

      const response = await postEventDetails(
        eventId,
        title || "",
        location || "",
        startDate || null,
        endDate
      );
      console.log("Form submitted successfully:", response);
      const { data } = response;

      const modeBoolean: boolean = mode === "enable" ? true : false;
      const formattedStartDate: string | null = data?.startDate
        ? formatDate(data?.startDate)
        : null;
      const formattedStartTime: string | null = data?.startDate
        ? formatTime(data?.startDate)
        : null;

      const formattedEndDate: string | null = data?.endDate
        ? formatDate(data.endDate)
        : null;
      const formattedEndTime: string | null = data?.endDate
        ? formatTime(data.endDate)
        : null;

      const qrData: QRCodeData = {
        scanType: "valetAdmin",
        valetAdmin: modeBoolean,
        startDate: formattedStartDate || null,
        startTime: formattedStartTime || null,
        endDate: formattedEndDate || null,
        endTime: formattedEndTime || null,
        timezone: "America/Chicago",
      };
      const qrValue: string = JSON.stringify(qrData);
      console.log("QR Code data:", qrData);
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

  return (
    <>
      {isRenderingForm ? (
        <>
          <Formik
            initialValues={
              {
                title: "",
                location: "",
                mode: "",
                startDate: null,
                endDate: null,
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
              <Form className="max-w-lg mx-auto">
                <div className="mb-4">
                  <label
                    htmlFor="mode"
                    className="block text-gray-700 font-medium"
                  >
                    Valet Admin Mode <span className="text-red-500">*</span>
                  </label>
                  <div className="relative">
                    <Field
                      as="select"
                      name="mode"
                      id="mode"
                      className="w-full p-2 border border-[#d1e0e0] rounded focus:outline-none focus:border-[#d1e0e0] appearance-none"
                    >
                      <option value="" label="Select mode" disabled />
                      <option value="enable" label="Enable" />
                      <option value="disable" label="Disable" />
                    </Field>
                    <div className="absolute inset-y-0 right-0 flex items-center pr-3 pointer-events-none">
                      <svg
                        className="w-4 h-4 text-gray-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M19 9l-7 7-7-7"
                        />
                      </svg>
                    </div>
                  </div>
                  <ErrorMessage
                    name="mode"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
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
                    className="w-full p-2 border border-[#d1e0e0] rounded focus:outline-none focus:border-[#d1e0e0]"
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
                    className="w-full p-2 border border-[#d1e0e0] rounded focus:outline-none focus:border-[#d1e0e0]"
                  />
                  <ErrorMessage
                    name="title"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
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
                    className="w-full p-2 h-[100px] border border-[#d1e0e0] rounded focus:outline-none focus:border-[#d1e0e0]"
                  />
                  <ErrorMessage
                    name="location"
                    component="div"
                    className="text-red-500 text-sm mt-1"
                  />
                </div>
                <div className="mb-4">
                  <div className="flex flex-row justify-between gap-4">
                    {/* Start Date */}
                    <div className="w-full">
                      <label className="text-sm text-gray-700 block mb-1">
                        Start Date
                      </label>
                      <div className="relative">
                        <DatePicker
                          selected={values.startDate}
                          onChange={(date) => setFieldValue("startDate", date)}
                          icon={
                            <Calendar
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                              size={20}
                            />
                          }
                          showIcon={true}
                          placeholderText="mm/dd/yyyy"
                          dateFormat="MM/dd/yyyy"
                          minDate={new Date()}
                          className="w-full max-w-md h-11 border border-[#d1e0e0] rounded-md text-sm text-gray-700 placeholder-gray-400 pr-10 focus:outline-none focus:border-[#d1e0e0] focus:ring-0"
                        />
                      </div>
                      <ErrorMessage
                        name="startDate"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>

                    {/* End Date */}
                    <div className="w-full ml-20">
                      <label className="text-sm text-gray-700 block mb-1">
                        End Date <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <DatePicker
                          selected={values.endDate}
                          onChange={(date) => setFieldValue("endDate", date)}
                          icon={
                            <Calendar
                              className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 pointer-events-none"
                              size={20}
                            />
                          }
                          showIcon={true}
                          placeholderText="mm/dd/yyyy"
                          dateFormat="MM/dd/yyyy"
                          minDate={values.startDate || new Date()}
                          className="w-full max-w-md h-11 border border-[#d1e0e0] rounded-md text-sm text-gray-700 placeholder-gray-400 pr-10 focus:outline-none focus:border-[#d1e0e0] focus:ring-0"
                        />
                      </div>
                      <ErrorMessage
                        name="endDate"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>
                </div>

                <button
                  type="submit"
                  className="w-full bg-[#F54A00] text-white font-semibold py-2 px-4 rounded hover:bg-orange-600 transition "
                  disabled={isSubmitting}
                >
                  {isSubmitting ? "Submitting..." : "Submit"}
                </button>
              </Form>
            )}
          </Formik>
        </>
      ) : (
        <>
          {qrCodeValue && (
            <div className="mt-6 text-center relative">
              <h3 className="text-lg font-semibold mb-2">Event QR Code</h3>
              <div className="inline-block p-4 bg-white rounded">
                <QRCode
                  value={qrCodeValue}
                  size={300}
                  bgColor="#FFE6E0"
                  fgColor=" #F54A00"
                  level="H"
                  style={{
                    padding: 20,
                    borderRadius: 8,
                    background: "#FFE6E0",
                  }}
                />
              </div>
            </div>
          )}
        </>
      )}
    </>
  );
};

export default EventDetailsForm;
