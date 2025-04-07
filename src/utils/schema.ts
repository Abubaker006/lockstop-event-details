import { EventDetailsFormValues } from "@/components/EvenDetailsForm";

export const validate = (values: EventDetailsFormValues) => {
  const errors: { [key: string]: string } = {};

  if (!values.mode) {
    errors.mode = "Mode is required.";
  }
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
