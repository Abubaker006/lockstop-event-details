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
import {
  Trash2,
  Pencil,
  QrCode,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
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
import { EventCard } from "./EventCard";
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
  endTime?: string;
  startTime?: string;
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
  const [isFormQrCodeVisible, setIsFormQrCodeVisible] = useState<boolean>(true);
  const [screenWidth, setScreenWidth] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  // Calculate paginated data
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = rowData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(rowData.length / itemsPerPage);

  // Pagination handler
  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

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
      // wrapText:true,
      initialWidth: 180,
      // maxWidth: 100,
    },
    {
      headerName: "Title",
      field: "title",
      sortable: true,
      filter: true,
      initialWidth: 180,
    },
    {
      headerName: "Location",
      field: "location",
      sortable: false,
      filter: false,
      initialWidth: 150,
    },
    {
      headerName: "Start Date",
      field: "startDate",
      valueFormatter: ({ value }: { value: string }) =>
        value ? new Date(value).toLocaleString() : "N/A",
      sortable: false,
      filter: false,
      initialWidth: 190,
    },
    {
      headerName: "End Date",
      field: "endDate",
      valueFormatter: ({ value }: { value: string }) =>
        value ? new Date(value).toLocaleString() : "N/A",
      sortable: false,
      filter: false,
      initialWidth: 190,
    },
    {
      headerName: "Actions",
      field: "_id",
      sortable: false,
      filter: false,
      initialWidth: 100,
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
      headerName: "QR Code",
      field: "_id",
      sortable: false,
      filter: false,
      initialWidth: 100,
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
      toast.error("Error fetching events.");
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
      const response = await deleteEvent(row._id);
      if (response) {
        toast.success("Event deleted successfully.");
        const updatedRowData = rowData.filter(
          (dataRow: Event) => dataRow.eventId !== row.eventId
        );
        setRowData(updatedRowData as Event[]);
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
    setIsFormQrCodeVisible(false);
  };
  useEffect(() => {
    if (typeof window !== "undefined") {
      setScreenWidth(window.innerWidth);

      const handleResize = () => setScreenWidth(window.innerWidth);
      window.addEventListener("resize", handleResize);

      return () => window.removeEventListener("resize", handleResize);
    }
  }, []);
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
  if (screenWidth === null) return null;
  return (
    <>
      {screenWidth > 768 ? (
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
      ) : (
        <>
          <div className="flex flex-wrap justify-end mb-4 gap-3">
            <button
              onClick={() => {
                handleAddEventModal();
              }}
              className="bg-[#F54A00] text-white text-md px-4 py-2 rounded-md hover:bg-[#EA580C] transition sm:px-5 sm:py-3 w-full sm:w-auto"
            >
              Add Event
            </button>
          </div>
          <div className="flex flex-col justify-center items-center gap-4">
            {currentItems.map((event) => (
              <EventCard
                key={event._id}
                event={event}
                handleGenerateQrCode={handleGenerateQrCode}
                handleUpdate={handleUpdate}
                handleDelete={handleDelete}
              />
            ))}
            {/* Pagination Controls */}
            <div className="flex gap-2 py-4 ">
              <button
                onClick={() => paginate(currentPage - 1)}
                disabled={currentPage === 1}
                className="px-3 py-1 bg-[#e84c23] text-white rounded disabled:bg-gray-300"
              >
                <ChevronLeft size={16} />
              </button>
              {Array.from({ length: totalPages }, (_, i) => i + 1).map(
                (page) => (
                  <button
                    key={page}
                    onClick={() => paginate(page)}
                    className={`px-3 py-1 rounded ${
                      currentPage === page
                        ? "bg-[#e84c23] text-white"
                        : "bg-gray-200 text-gray-700"
                    }`}
                  >
                    {page}
                  </button>
                )
              )}
              <button
                onClick={() => paginate(currentPage + 1)}
                disabled={currentPage === totalPages}
                className="px-3 py-1 bg-[#e84c23] text-white rounded disabled:bg-gray-300"
              >
                <ChevronRight size={16} />
              </button>
            </div>
          </div>
        </>
      )}

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
            initialValues={
              {
                eventId: selectedRow.eventId,
                title: selectedRow.title || "",
                location: selectedRow.location || "",
                startDate: selectedRow.startDate
                  ? new Date(selectedRow.startDate)
                  : null,
                endDate: selectedRow.endDate
                  ? new Date(selectedRow.endDate)
                  : null,
                startTime: selectedRow.startDate
                  ? new Date(selectedRow.startDate).toTimeString().slice(0, 5)
                  : "",
                endTime: selectedRow.endDate
                  ? new Date(selectedRow.endDate).toTimeString().slice(0, 5)
                  : "",
              } as EventDetailsFormValues
            }
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
                    {/* Start Time */}
                    <div className="w-full">
                      <label className="text-sm text-gray-700 block mb-1">
                        Start Time
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          name="startTime"
                          value={values.startTime || ""}
                          onChange={(e) =>
                            setFieldValue("startTime", e.target.value)
                          }
                          className="w-full h-11 border border-[#d1e0e0] rounded-md text-sm text-gray-700 placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-0"
                        />
                      </div>
                      <ErrorMessage
                        name="startTime"
                        component="div"
                        className="text-red-500 text-sm mt-1"
                      />
                    </div>
                  </div>
                </div>
                <div className="mb-4">
                  <div className="flex flex-row justify-between gap-4">
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
                    {/* End Time */}
                    <div className="w-full">
                      <label className="text-sm text-gray-700 block mb-1">
                        End Time <span className="text-red-500">*</span>
                      </label>
                      <div className="relative">
                        <input
                          type="time"
                          name="endTime"
                          value={values.endTime || ""}
                          onChange={(e) =>
                            setFieldValue("endTime", e.target.value)
                          }
                          className="w-full h-11 border border-[#d1e0e0] rounded-md text-sm text-gray-700 placeholder-gray-400 px-3 py-2 focus:outline-none focus:ring-0"
                        />
                      </div>
                      <ErrorMessage
                        name="endTime"
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
        width={"800px"}
      >
        <hr className="opacity-40 py-3" />
        <div className="w-full">
          <EventDetailsForm
            disableQRcode={isFormQrCodeVisible}
            handleRefreshData={fetchData}
          />
        </div>
      </Modal>
    </>
  );
};

export default EventGrid;
