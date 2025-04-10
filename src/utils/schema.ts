import { EventDetailsFormValues } from "@/components/EvenDetailsForm";
import { PhoneFormValues,OtpValues } from "@/components/SignInForm";

export const validate = (values: EventDetailsFormValues) => {
  const errors: { [key: string]: string } = {};

  if (!values.eventId) {
    errors.eventId = "Event ID is required.";
  }
  if (!values.endDate) {
    console.log("endDate is null:", values.endDate);
    errors.endDate = "End Date is required.";
  }

  if (values.startDate) {
    if (values.endDate && values.endDate < values.startDate) {
      errors.endDate = "End Date cannot be before Start Date.";
    }
  }

  return errors;
};

export const validateSignIn = (values: PhoneFormValues) => {
  const errors: { [key in keyof PhoneFormValues]?: string } = {};

    if (!values.countryCode) {
      errors.countryCode = 'Country code is required';
    }

    if (!values.phoneNumber) {
      errors.phoneNumber = 'Phone number is required';
    } else if (!/^[0-9]+$/.test(values.phoneNumber)) {
      errors.phoneNumber = 'Must contain only digits';
    } else if (values.phoneNumber.length < 7) {
      errors.phoneNumber = 'Too short';
    } else if (values.phoneNumber.length > 15) {
      errors.phoneNumber = 'Too long';
    }

    return errors;
};

export const validateOtp = (values: OtpValues) => {
  const errors: { [key: string]: string } = {};
  if (!values.otpNumber) {
    errors.otpNumber = 'OTP is required';
  } else if (!/^\d{4}$/.test(values.otpNumber)) {
    errors.otpNumber = 'OTP must be exactly 4 digits';
  }
  return errors;
};