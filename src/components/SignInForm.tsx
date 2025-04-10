"use client";
import React, { useEffect, useRef, useState } from "react";
import { Formik, Form, Field, ErrorMessage } from "formik";
import axios, { AxiosError } from "axios";
import { useRouter } from "next/navigation";
import { FormikHelpers } from "formik";
import { validateSignIn, validateOtp } from "@/utils/schema";
import {
  CustomErrorResponse,
  requestOtp,
  verifyOtp,
  APIRESPONSELOGIN,
} from "@/apiService/apiServices";
import { Modal } from "antd";
import { toast } from "react-toastify";
import Cookies from "js-cookie";

export interface PhoneFormValues {
  countryCode: string;
  phoneNumber: string;
}
export interface OtpValues {
  otpNumber: string;
}

const countries = [
  { label: "+1", value: "+1" },
  { label: "+44", value: "+44" },
  { label: "+61", value: "+61" },
  { label: "+86", value: "+86" },
  { label: "+91", value: "+91" },
  { label: "+49", value: "+49" },
  { label: "+81", value: "+81" },
  { label: "+7", value: "+7" },
  { label: "+39", value: "+39" },
  { label: "+33", value: "+33" },
  { label: "+82", value: "+82" },
  { label: "+65", value: "+65" },
  { label: "+34", value: "+34" },
  { label: "+86", value: "+86" },
  { label: "+52", value: "+52" },
  { label: "+358", value: "+358" },
  { label: "+46", value: "+46" },
  { label: "+61", value: "+61" },
  { label: "+31", value: "+31" },
  { label: "+55", value: "+55" },
  { label: "+64", value: "+64" },
  { label: "+971", value: "+971" },
  { label: "+49", value: "+49" },
  { label: "+41", value: "+41" },
  { label: "+43", value: "+43" },
  // { "label": "+92", "value": "+92" }
];

const SignInForm = () => {
  const [isOTPVisible, setisOTPVisible] = useState<boolean>(false);
  const [otp, setOtp] = useState<string[]>(Array(4).fill(""));
  const inputs = useRef<(HTMLInputElement | null)[]>(Array(4).fill(null));
  const [fullPhone, setFullPhone] = useState<string>("");
  const [resendCooldown, setResendCooldown] = useState<number>(0);
  const router = useRouter();

  const handleFormSubmit = async (
    values: PhoneFormValues,
    { resetForm }: FormikHelpers<PhoneFormValues>
  ) => {
    const phoneNumber = `${values.countryCode}${values.phoneNumber}`;
    setFullPhone(phoneNumber);
    console.log(`Submitted phone number: ${phoneNumber}`);
    try {
      const response: APIRESPONSELOGIN = await requestOtp(phoneNumber);
      if (response?.success) {
        setisOTPVisible(true);
      } else {
        toast(response.error || "Failed to send OTP.");
      }
    } catch (error) {
      console.error(error);
      toast.error("An error occurred while submitting the form.");
    } finally {
      setResendCooldown(10);
      setisOTPVisible(true);
      resetForm();
    }
  };
  // Handle single digit change
  const handleChange = (
    value: string,
    index: number,
    setFieldValue: (field: string, value: string) => void
  ) => {
    if (!/^\d*$/.test(value)) return;

    const newOtp = [...otp];
    newOtp[index] = value;
    setOtp(newOtp);

    const joined = newOtp.join("");
    setFieldValue("otpNumber", joined);

    if (value && index < 3) {
      inputs.current[index + 1]?.focus();
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent, index: number) => {
    if (e.key === "Backspace" && !otp[index] && index > 0) {
      inputs.current[index - 1]?.focus();
    }
  };

  const handleSubmitOTP = async (
    values: OtpValues,
    actions: FormikHelpers<OtpValues>
  ) => {
    if (values.otpNumber.length === 4) {
      try {
        const response: APIRESPONSELOGIN = await verifyOtp(
          fullPhone,
          values.otpNumber
        );
        if (response?.message == "Success" && response.data) {
          if (response?.data?.accessToken)
            Cookies.set("auth_token", response?.data?.accessToken, {
              expires: 1,
            });
          toast.success("OTP Verified");
          router.push("/event-details");
        }
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
      } finally {
        actions.setSubmitting(false);
      }
    } else {
      toast("Please enter all 4 digits.");
      actions.setSubmitting(false);
    }
  };
  const handleResendOtp = async () => {
    if (resendCooldown > 0) return;
    try {
      const response: APIRESPONSELOGIN = await requestOtp(fullPhone); // Reuse requestOtp for resend
      if (response.success) {
        toast("OTP resent successfully!");
        setOtp(Array(4).fill("")); // Reset OTP inputs
      } else {
        toast(response.error || "Failed to resend OTP.");
      }
    } catch (error) {
      const axiosError = error as AxiosError<{ message?: string }>;
      toast(
        axiosError.response?.data?.message ||
          "An error occurred. Please try again."
      );
    }
  };

  useEffect(() => {
    if (resendCooldown > 0) {
      const timer = setInterval(() => {
        setResendCooldown((prev) => prev - 1);
      }, 1000);
      return () => clearInterval(timer); // Cleanup on unmount or update
    }
  }, [resendCooldown]);

  return (
    <>
      <h1 className="text-3xl font-bold text-center">Sign In</h1>
      <div className="py-10">
        <>
          <Formik<PhoneFormValues>
            initialValues={
              {
                countryCode: "+1",
                phoneNumber: "",
              } as PhoneFormValues
            }
            validate={validateSignIn}
            validateOnChange={true}
            validateOnBlur={true}
            validateOnMount={true}
            onSubmit={handleFormSubmit}
          >
            {({ isSubmitting }) => (
              <Form className="max-w-lg mx-auto">
                <label
                  htmlFor="mode"
                  className="block text-gray-700 font-medium"
                >
                  Phone Number <span className="text-red-500">*</span>
                </label>
                <div className="flex space-x-2 items-stretch pt-2 pb-2">
                  <div className="">
                    <Field
                      as="select"
                      name="countryCode"
                      className="border  px-3 py-2.5 w-full  border-[#d1e0e0] rounded   focus:outline-none focus:border-[#d1e0e0]"
                    >
                      {countries.map((code, idx) => (
                        <option key={idx} value={code.value}>
                          {code.label}
                        </option>
                      ))}
                    </Field>

                    <ErrorMessage
                      name="countryCode"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
                  </div>
                  <div className="flex-5/6">
                    <Field
                      type="text"
                      name="phoneNumber"
                      placeholder="8044136719"
                      className="border px-3 py-2 w-full  border-[#d1e0e0] rounded-lg focus:outline-none focus:border-[#d1e0e0]"
                    />
                    <ErrorMessage
                      name="phoneNumber"
                      component="div"
                      className="text-red-500 text-sm mt-1"
                    />
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
      </div>
      {isOTPVisible && (
        <Modal
          className="m-auto"
          open={isOTPVisible}
          footer={false}
          onCancel={() => {
            setisOTPVisible(!isOTPVisible);
          }}
          onClose={() => {
            setisOTPVisible(!isOTPVisible);
          }}
        >
          {/* <div className="fixed inset-0 bg-opacity-50 flex items-center justify-center p-4 border-2 border-red-400"> */}

          <div className=" p-6 w-full">
            <Formik<OtpValues>
              initialValues={{ otpNumber: "" }}
              validate={validateOtp}
              onSubmit={handleSubmitOTP}
            >
              {({
                handleSubmit,
                setFieldValue,
                errors,
                touched,
                isSubmitting,
              }) => (
                <form onSubmit={handleSubmit} className="w-full">
                  <h2 className="text-2xl font-semibold mb-4 text-center">
                    Enter OTP
                  </h2>
                  <p className="text-sm text-gray-600 mb-6 text-center">
                    We&apos;ve sent a 4-digit code to your phone/email.
                  </p>

                  <div className="flex justify-center gap-6 mb-5">
                    {otp.map((digit, idx) => (
                      <input
                        key={idx}
                        type="text"
                        maxLength={1}
                        value={digit}
                        onChange={(e) =>
                          handleChange(e.target.value, idx, setFieldValue)
                        }
                        onKeyDown={(e) => handleKeyDown(e, idx)}
                        ref={(el) => {
                          inputs.current[idx] = el;
                        }}
                        className="w-10 h-12 border border-gray-300 text-center text-xl rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    ))}
                  </div>
                  {touched.otpNumber && errors.otpNumber && (
                    <div className="text-red-500 text-sm text-center mb-4">
                      {errors.otpNumber}
                    </div>
                  )}
                  <button
                    type="submit"
                    disabled={isSubmitting}
                    className="w-[70%] bg-orange-600 m-auto justify-center flex items-center text-center hover:bg-orange-700 text-white py-2 rounded-md font-semibold"
                  >
                    Verify
                  </button>

                  <div className="mt-4 text-center text-sm text-gray-500">
                    Didn&apos;t receive the code?{" "}
                    <button
                      type="button"
                      onClick={handleResendOtp}
                      disabled={resendCooldown > 0} // Disable during cooldown
                      className={`text-blue-600 hover:underline ${
                        resendCooldown > 0
                          ? "opacity-50 cursor-not-allowed"
                          : "cursor-pointer"
                      }`}
                    >
                      {resendCooldown > 0
                        ? `Resend in ${resendCooldown}s`
                        : "Resend"}
                    </button>
                  </div>
                </form>
              )}
            </Formik>
          </div>
          {/* </div> */}
        </Modal>
      )}
    </>
  );
};

export default SignInForm;
