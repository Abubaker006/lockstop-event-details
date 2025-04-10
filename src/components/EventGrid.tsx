"use client";
import { toast } from "react-toastify";
import {
  FormikHelpers,
  Formik,
  Field,
  ErrorMessage,
  Form as FormikForm,
} from "formik";
import { validate } from "@/utils/schema";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { Calendar } from "lucide-react";
import { Modal, Button } from "antd";
import { formatDate, formatTime } from "@/utils/formatters";
import QRCode from "react-qr-code";
import { Trash2, Pencil, QrCode } from "lucide-react";
import { useEffect, useState } from "react";
import EventDetailsForm from "@/components/EvenDetailsForm";
import {
  getAllEvents,
  deleteEvent,
  updateEvent,
  UpdateEventPayload,
} from "@/apiService/apiServices";
import { AgGridReact } from "ag-grid-react";
import {
  AllCommunityModule,
  ModuleRegistry,
  GridApi,
  GridReadyEvent,
  ICellRendererParams,
  ColDef,
} from "ag-grid-community";
import "ag-grid-community/styles/ag-theme-alpine.css";
interface Event {
  _id: string;
  eventId: string;
  title: string;
  location: string;
  startDate: string;
  endDate: string;
  createdAt: string;
}

interface EventDetailsFormValues {
  title: string;
  location: string;
  startDate: Date | null;
  endDate: Date | null;
  eventId: string;
}

interface QRCodeData {
  scanType: string;
  startDate: string | null;
  startTime: string | null;
  endDate: string | null;
  endTime: string | null;
  timezone: string;
}

ModuleRegistry.registerModules([AllCommunityModule]);

const EventGrid = () => {
  const [rowData, setRowData] = useState<Event[]>([]);
  const [gridApi, setGridApi] = useState<GridApi | null>(null);
  const [selectedRow, setSelectedRow] = useState<Event | null>(null);
  const [isUpdateModalVisible, setIsUpdateModalVisible] =
    useState<boolean>(false);
  const [qrCodeValue, setQrCodeValue] = useState<string>("");
  const [isQrCodeModalVisible, setIsQrCodeModalVisible] =
    useState<boolean>(false);
  const [isAddEventFormVisible, setIsAddEventFormVisible] =
    useState<boolean>(false);

  const isEventExpired = (endDate: string | Date): boolean => {
    if (!endDate) return true;
    const today = new Date();
    const eventEndDate = new Date(endDate);
    return eventEndDate < today;
  };

  const columnDefs: ColDef<Event>[] = [
    {
      headerName: "Event ID",
      field: "eventId",
      sortable: true,
      filter: true,
    },
    { headerName: "Title", field: "title", sortable: true, filter: true },
    {
      headerName: "Location",
      field: "location",
      sortable: false,
      filter: false,
    },
    {
      headerName: "Start Date",
      field: "startDate",
      valueFormatter: ({ value }: { value: string }) =>
        value ? new Date(value).toLocaleString() : "N/A",
      sortable: false,
      filter: false,
    },
    {
      headerName: "End Date",
      field: "endDate",
      valueFormatter: ({ value }: { value: string }) =>
        value ? new Date(value).toLocaleString() : "N/A",
      sortable: false,
      filter: false,
    },
    {
      headerName: "Actions",
      field: "_id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Event>) => {
        return (
          <div className="flex gap-2">
            <button
              className="text-center"
              onClick={() => {
                if (!params.data) return;
                handleDelete(params.data);
              }}
            >
              <Trash2
                className="text-[15px] text-red-500 hover:text-red-600"
                strokeWidth={1}
              />
            </button>
            <button
              className="text-center"
              onClick={() => {
                if (!params.data) return;
                handleUpdate(params.data);
              }}
            >
              <Pencil className="text-[15px] text-black" strokeWidth={1} />
            </button>
          </div>
        );
      },
    },
    {
      headerName: "Gen QR Code",
      field: "_id",
      sortable: false,
      filter: false,
      cellRenderer: (params: ICellRendererParams<Event>) => {
        return (
          <button
            className="text-center"
            onClick={() => {
              if (!params.data) return;
              handleGenerateQrCode(params.data);
            }}
          >
            <QrCode strokeWidth={1} />
          </button>
        );
      },
    },
  ];

  const fetchData = async () => {
    try {
      const response = await getAllEvents();
      if (Array.isArray(response.data)) {
        setRowData(response.data as Event[]);
      }
    } catch (error) {
      console.error("Error fetching events:", error);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onGridReady = (params: GridReadyEvent) => {
    setGridApi(params.api);
  };

  const onSelectionChanged = () => {
    if (gridApi) {
      const selectedNodes = gridApi.getSelectedRows();
      setSelectedRow(selectedNodes.length > 0 ? selectedNodes[0] : null);
    }
  };

  const handleDelete = async (row: Event) => {
    if (!row) {
      toast.error("Please select an event to delete.");
      return;
    }

    try {
      console.log("Deleting event:", row);
      const response = await deleteEvent(row._id);
      if (response.status === 200) {
        toast.success("Event deleted successfully.");
        const updatedRowData = rowData.filter(
          (row) => row.eventId !== row.eventId
        );
        setRowData(updatedRowData);
        gridApi?.deselectAll();
        setSelectedRow(null);
      } else {
        toast.error("Failed to delete event.");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Error deleting event.");
    }
  };

  const handleUpdate = (row: Event) => {
    if (!row) {
      toast.error("Please select an event to update.");
      return;
    }
    if (isEventExpired(row.endDate)) {
      toast.error("The Event has been expired.");
      return;
    }
    const updatedSelectedRow = rowData.find(
      (row) => row.eventId === row.eventId
    );
    if (updatedSelectedRow) {
      setSelectedRow(row);
    }
    setIsUpdateModalVisible(true);
  };

  const handleFormSubmit = async (
    values: EventDetailsFormValues,
    actions: FormikHelpers<EventDetailsFormValues>
  ) => {
    if (!selectedRow) return;

    try {
      const updatedEventData: UpdateEventPayload = {
        eventId: values.eventId,
        eventTitle: values.title,
        eventLocation: values.location,
        startDate: values.startDate ?? null,
        endDate: values.endDate ?? null,
      };

      console.log("Updating event with data:", updatedEventData);

      const response = await updateEvent(selectedRow._id, updatedEventData);
      if (response.status === 200) {
        toast.success("Event updated successfully.");
        await fetchData();
        setIsUpdateModalVisible(false);
        gridApi?.deselectAll();
        setSelectedRow(null);
        actions.resetForm();
      } else {
        toast.error("Failed to update event.");
      }
    } catch (error) {
      console.error("Error updating event:", error);
      toast.error("Error updating event.");
    } finally {
      actions.setSubmitting(false);
    }
  };

  const handleModalCancel = () => {
    setIsUpdateModalVisible(false);
    gridApi?.deselectAll();
    setSelectedRow(null);
  };

  const handleGenerateQrCode = (row: Event) => {
    const formattedStartDate = row?.startDate
      ? formatDate(row?.startDate)
      : null;
    const formattedStartTime = row?.startDate
      ? formatTime(row?.startDate)
      : null;
    const formattedEndDate = row?.endDate ? formatDate(row?.endDate) : null;
    const formattedEndTime = row?.endDate ? formatTime(row?.endDate) : null;

    const qrData: QRCodeData = {
      scanType: "valetAdmin",
      startDate: formattedStartDate,
      startTime: formattedStartTime,
      endDate: formattedEndDate,
      endTime: formattedEndTime,
      timezone: "America/Chicago",
    };

    const qrCodeString = JSON.stringify(qrData);
    setQrCodeValue(qrCodeString);
    setIsQrCodeModalVisible(true);
  };

  const handleQRModalCancel = () => {
    setIsQrCodeModalVisible(false);
    setQrCodeValue("");
  };

  const handleAddEventModal = () => {
    setIsAddEventFormVisible(true);
  };

  const handleCancelAddEventModal = () => {
    setIsAddEventFormVisible(false);
  };

  useEffect(() => {
    if (selectedRow) {
      setSelectedRow((prevSelectedRow) => {
        if (
          prevSelectedRow?._id !== selectedRow._id ||
          prevSelectedRow?.eventId !== selectedRow.eventId ||
          prevSelectedRow?.title !== selectedRow.title ||
          prevSelectedRow?.location !== selectedRow.location ||
          prevSelectedRow?.startDate !== selectedRow.startDate ||
          prevSelectedRow?.endDate !== selectedRow.endDate ||
          prevSelectedRow?.createdAt !== selectedRow.createdAt
        ) {
          return {
            _id: selectedRow._id,
            eventId: selectedRow.eventId,
            title: selectedRow.title || "",
            location: selectedRow.location || "",
            startDate: selectedRow.startDate ?? null,
            endDate: selectedRow.endDate ?? null,
            createdAt: selectedRow.createdAt,
          };
        }
        return prevSelectedRow;
      });
    }
  }, [selectedRow]);
  return (
    <>
      <div className="max-w-6xl mx-auto w-full pb-12">
        <div className="flex flex-wrap justify-end mb-4 gap-3">
          <button
            onClick={() => {
              handleAddEventModal();
            }}
            className="bg-[#F54A00] text-white px-4 py-2 rounded-md hover:bg-[#EA580C] transition sm:px-5 sm:py-3 lg:px-6 lg:py-3 w-full sm:w-auto"
          >
            Add Event
          </button>
        </div>

        <div
          className="ag-theme-alpine ag-theme-custom rounded-lg"
          style={{
            width: "100%",
            height: "580px",
          }}
        >
          <AgGridReact<Event>
            rowData={rowData}
            columnDefs={columnDefs}
            pagination={true}
            paginationPageSize={11}
            rowSelection={{ mode: "singleRow" }}
            onGridReady={onGridReady}
            onSelectionChanged={onSelectionChanged}
            paginationPageSizeSelector={[10, 20, 50]}
          />
        </div>
      </div>

      <Modal
        title="Update Event"
        open={isUpdateModalVisible}
        onCancel={handleModalCancel}
        footer={null}
        centered
      >
        {selectedRow && (
          <Formik
            enableReinitialize={true}
            initialValues={{
              eventId: selectedRow.eventId,
              title: selectedRow.title || "",
              location: selectedRow.location || "",
              startDate: selectedRow.startDate
                ? new Date(selectedRow.startDate)
                : null,
              endDate: selectedRow.endDate
                ? new Date(selectedRow.endDate)
                : null,
            }}
            validate={validate}
            validateOnChange={true}
            validateOnBlur={true}
            validateOnMount={true}
            onSubmit={handleFormSubmit}
          >
            {({ values, isSubmitting, setFieldValue }) => (
              <FormikForm className="max-w-lg mx-auto">
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
                    type="text"
                    name="location"
                    id="location"
                    className="w-full p-2 border border-[#d1e0e0] rounded focus:outline-none focus:border-[#d1e0e0]"
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
                    <div className="w-full">
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

                <div className="flex justify-end gap-2">
                  <Button onClick={handleModalCancel}>Cancel</Button>
                  <Button
                    type="primary"
                    htmlType="submit"
                    disabled={isSubmitting}
                    className="bg-[#F54A00] hover:bg-orange-600"
                  >
                    {isSubmitting ? "Updating..." : "Update"}
                  </Button>
                </div>
              </FormikForm>
            )}
          </Formik>
        )}
      </Modal>

      <Modal
        title="QR Code For Event"
        open={isQrCodeModalVisible}
        onCancel={handleQRModalCancel}
        footer={null}
        centered
      >
        <hr className="opacity-40 py-3" />
        <div className="flex justify-center items-center py-10 ">
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
      </Modal>

      <Modal
        title="Add Event"
        open={isAddEventFormVisible}
        onCancel={handleCancelAddEventModal}
        footer={null}
        centered
      >
        <hr className="opacity-40 py-3" />
        <div className="w-full">
          <EventDetailsForm />
        </div>
      </Modal>
    </>
  );
};

export default EventGrid;
