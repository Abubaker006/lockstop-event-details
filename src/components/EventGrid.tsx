"use client";
import { toast } from "react-toastify";
import { FormikHelpers, Formik, Field, ErrorMessage, Form } from "formik";
import { validate } from "@/utils/schema";
import DatePicker from "react-datepicker";
import "react-datepicker/dist/react-datepicker.css";
import { CalendarDays, History } from "lucide-react";
import { Modal } from "antd";
// import { formatDate, formatTime } from "@/utils/formatters";
import QRCode from "react-qr-code";
import {
  Trash2,
  Pencil,
  QrCode,
  ChevronRight,
  ChevronLeft,
} from "lucide-react";
import React, { useEffect, useState } from "react";
import EventDetailsForm from "@/components/EvenDetailsForm";
import {
  getAllEvents,
  deleteEvent,
  updateEvent,
  UpdateEventPayload,
  deleteEventsBulk,
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
import { MobileTimePicker } from "@mui/x-date-pickers";
import { LocalizationProvider } from "@mui/x-date-pickers";
import { AdapterDayjs } from "@mui/x-date-pickers/AdapterDayjs";
import dayjs from "dayjs";
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
  endTime: string;
  startTime?: string;
}

interface QRCodeData {
  scanType: string;
  startDate: string | null;
  // startTime: string | null;
  endDate: string | null;
  // endTime: string | null;
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
  const [screenWidth, setScreenWidth] = useState<number | null>(null);
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 10;
  const indexOfLastItem = currentPage * itemsPerPage;
  const indexOfFirstItem = indexOfLastItem - itemsPerPage;
  const currentItems = rowData.slice(indexOfFirstItem, indexOfLastItem);
  const totalPages = Math.ceil(rowData.length / itemsPerPage);
  const [isDeleteAllModalVisible, setIsDeleteAllModalVisible] =
    useState<boolean>(false);
  const [selectedRowsCount, setSelectedRowsCount] = useState<number>(0);

  const paginate = (pageNumber: number) => setCurrentPage(pageNumber);

  const handleSetQrCodeModalVisible = (visible: boolean, qrValue?: string) => {
    setIsQrCodeModalVisible(visible);
    if (qrValue) {
      setQrCodeValue(qrValue);
    }
  };

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
      initialWidth: 180,
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

  // const onSelectionChanged = () => {
  //   if (gridApi) {
  //     const selectedNodes = gridApi.getSelectedRows();
  //     setTimeout(() => {
  //       setSelectedRow(selectedNodes.length > 0 ? selectedNodes[0] : null);
  //       gridApi.clearFocusedCell();
  //     }, 0);
  //   }
  // };
  const onSelectionChanged = () => {
    if (gridApi) {
      setTimeout(() => {
        setSelectedRowsCount(gridApi.getSelectedRows().length);
        gridApi.clearFocusedCell();
      }, 0);
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
        const updatedRowData = rowData.filter(
          (dataRow: Event) => dataRow.eventId !== row.eventId
        );
        gridApi?.clearFocusedCell();
        setRowData(updatedRowData as Event[]);
        setTimeout(() => {
          gridApi?.deselectAll();
          setSelectedRow(null);
        }, 0);
        toast.success("Event deleted successfully.");
      } else {
        toast.error("Failed to delete event.");
      }
    } catch (error) {
      console.error("Error deleting event:", error);
      toast.error("Error deleting event.");
    }
  };

  const handleDeleteAll = async () => {
    if (!gridApi) return;
    const selectedRows = gridApi.getSelectedRows();
    try {
      await deleteEventsBulk(selectedRows.map((row) => row._id));
      setRowData(
        rowData.filter((row) => !selectedRows.includes(row))
      );
      gridApi.deselectAll();
      setSelectedRow(null);
      toast.success("All selected events deleted successfully.");
    } catch (error) {
      console.error("Error deleting events:", error);
      toast.error("Failed to delete some events.");
    }
    setIsDeleteAllModalVisible(false);
  }

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
      // let adjustedStartDate = values.startDate;
      // if (values.startDate && values.startTime) {
      //   const [hours, minutes] = values.startTime.split(":").map(Number);
      //   adjustedStartDate = new Date(values.startDate);
      //   adjustedStartDate.setHours(hours, minutes);
      // }

      // let adjustedEndDate = values.endDate;
      // if (values.endDate && values.endTime) {
      //   const [hours, minutes] = values.endTime.split(":").map(Number);
      //   adjustedEndDate = new Date(values.endDate);
      //   adjustedEndDate.setHours(hours, minutes);
      // }

      const updatedEventData: UpdateEventPayload = {
        eventId: values.eventId,
        title: values.title,
        location: values.location,
        startDate: values.startDate ?? null,
        endDate: values.endDate ?? null,
      };

      const response = await updateEvent(selectedRow._id, updatedEventData);
      if (response.status === 200) {
        toast.success("Event updated successfully.");
        await fetchData();
        setIsUpdateModalVisible(false);
        setTimeout(() => {
          gridApi?.deselectAll();
          setSelectedRow(null);
        }, 0);
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
    setTimeout(() => {
      gridApi?.deselectAll();
      setSelectedRow(null);
    }, 0);
  };

  const handleGenerateQrCode = (row: Event) => {
    const formattedStartDate = row?.startDate ? row?.startDate : null;
    // const formattedStartTime = row?.startDate
    //   ? new Date(row.startDate).toTimeString().slice(0, 5)
    //   : null;
    // const formattedEndTime = row?.endDate
    //   ? new Date(row.endDate).toTimeString().slice(0, 5)
    //   : null;
    // const formattedStartTime = row?.startDate?row?.startDate:null;
    // const formattedEndTime = row?.endDate ? row?.endDate : null;
    const formattedEndDate = row?.endDate ? row?.endDate : null;

    const qrData: QRCodeData = {
      scanType: "valetAdmin",
      startDate: formattedStartDate,
      // startTime: formattedStartDate,
      endDate: formattedEndDate,
      // endTime: formattedEndTime,
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
    // setIsFormQrCodeVisible(false);
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
              className="bg-[#F54A00] text-white px-4 py-2 rounded-md hover:bg-[#EA580C] transition my-4 sm:px-5 sm:py-3 lg:px-6 lg:py-3 w-full sm:w-auto"
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
              rowSelection={{ mode: "multiRow" }}
              onGridReady={onGridReady}
              onSelectionChanged={onSelectionChanged}
              paginationPageSizeSelector={[10, 20, 50]}
            />
          </div>
          <div className="flex justify-end mt-4">
            <button
              onClick={() => setIsDeleteAllModalVisible(true)}
              className="bg-[#F54A00] text-white px-4 py-2 rounded-md hover:cursor-pointer transition disabled:bg-gray-300"
              disabled={selectedRowsCount === 0}
            >
              Delete All
            </button>
          </div>
        </div>
      ) : (
        <>
          <div className="flex flex-wrap justify-center mb-4 gap-3">
            <button
              onClick={() => {
                handleAddEventModal();
              }}
              className="bg-[#F54A00] text-white text-md px-4 py-2 rounded-md hover:bg-[#EA580C] transition sm:px-5 sm:py-3 my-4 w-[90%] sm:w-auto"
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
        width={"800px"}
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
                // startTime: selectedRow.startDate
                //   ? new Date(selectedRow.startDate).toLocaleTimeString(
                //       "en-US",
                //       {
                //         hour12: false,
                //         hour: "2-digit",
                //         minute: "2-digit",
                //         timeZone: "America/Chicago",
                //       }
                //     )
                //   : "",
                // endTime: selectedRow.endDate
                //   ? new Date(selectedRow.endDate).toLocaleTimeString("en-US", {
                //       hour12: false,
                //       hour: "2-digit",
                //       minute: "2-digit",
                //       timeZone: "America/Chicago",
                //     })
                //   : "",
                // startTime: selectedRow.startDate
                //   ? new Date(selectedRow.startDate).toTimeString().slice(0, 5)
                //   : "",
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
                      {/* <input
                        type="time"
                        name="startTime"
                        value={values.startTime || ""}
                        onChange={(e) =>
                          setFieldValue("startTime", e.target.value)
                        }
                        className="accent-[#E84C23] w-full h-full bg-[#FCFCFC] border border-[#d1e0e0] rounded-md text-sm text-gray-700 placeholder-gray-400 pl-6 pr-3 py-2 focus:outline-none focus:ring-0 [appearance:textfield]"
                      /> */}
                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <MobileTimePicker
                          disabled={!values.startDate}
                          value={
                            values.startDate ? dayjs(values.startDate) : null
                          }
                          onChange={(value) => {
                            if (value && values.startDate) {
                              const updatedDateTime = dayjs(values.startDate)
                                .hour(value.hour())
                                .minute(value.minute())
                                .second(0)
                                .millisecond(0);

                              setFieldValue(
                                "startDate",
                                updatedDateTime.toISOString()
                              );
                              setFieldValue(
                                "startTime",
                                updatedDateTime.toISOString()
                              );
                            } else {
                              setFieldValue(
                                "startDate",
                                value ? value.toISOString() : ""
                              );
                              setFieldValue(
                                "startTime",
                                value ? value.toISOString() : ""
                              );
                            }
                          }}
                          slotProps={{
                            textField: {
                              variant: "outlined",
                              fullWidth: true,
                              placeholder: "Select a time",
                              size: "small",
                              InputProps: {
                                sx: {
                                  backgroundColor: "#FCFCFC",
                                  height: 44,
                                  fontSize: 14,
                                  borderRadius: "6px",
                                  paddingLeft:2,
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                      <History
                        className="absolute right-3 top-1/2 -translate-y-1/2 pointer-events-none bg-[#FCFCFC] scale-x-[-1]"
                        size={18}
                        color={values.startDate ? "#E84C23" : "#9CA3AF"}
                      />
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
                      {/* <input
                        type="time"
                        name="endTime"
                        value={values.endTime || ""}
                        onChange={(e) =>
                          setFieldValue("endTime", e.target.value)
                        }
                        className="accent-[#E84C23] w-full h-full bg-[#FCFCFC] border border-[#d1e0e0] rounded-md text-sm text-gray-700 placeholder-gray-400 pl-6 pr-3 py-2 focus:outline-none focus:ring-0 appearence-none"
                      /> */}

                      <LocalizationProvider dateAdapter={AdapterDayjs}>
                        <MobileTimePicker
                          disabled={!values.endDate}
                          value={values.endDate ? dayjs(values.endDate) : null}
                          onChange={(value) => {
                            if (value && values.endDate) {
                              const updatedDateTime = dayjs(values.endDate)
                                .hour(value.hour())
                                .minute(value.minute())
                                .second(0)
                                .millisecond(0);

                              setFieldValue(
                                "endDate",
                                updatedDateTime.toISOString()
                              );
                              setFieldValue(
                                "endTime",
                                updatedDateTime.toISOString()
                              );
                            } else {
                              setFieldValue(
                                "endDate",
                                value ? value.toISOString() : null
                              );
                              setFieldValue(
                                "endTime",
                                value ? value.toISOString() : null
                              );
                            }
                          }}
                          slotProps={{
                            textField: {
                              variant: "outlined",
                              fullWidth: true,
                              placeholder: "Select a time",
                              size: "small",
                              InputProps: {
                                sx: {
                                  backgroundColor: "#FCFCFC",
                                  height: 44,
                                  fontSize: 14,
                                  borderRadius: "6px",
                                  paddingLeft:2,
                                },
                              },
                            },
                          }}
                        />
                      </LocalizationProvider>
                      <History
                        className="absolute right-3 top-1/2 -translate-y-1/2 bg-[#FCFCFC] pointer-events-none"
                        size={18}
                        color={values.endDate ? "#E84C23" : "#9CA3AF"}
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
            setQrCodeModalVisible={handleSetQrCodeModalVisible}
            setIsAddEventFormVisible={setIsAddEventFormVisible}
            setQrCodeValue={setQrCodeValue}
            handleRefreshData={fetchData}
          />
        </div>
      </Modal>

      <Modal
        title="Confirm Delete All"
        open={isDeleteAllModalVisible}
        onCancel={() => setIsDeleteAllModalVisible(false)}
        footer={null}
        centered
      >
        <p className="mt-4">
          Are you sure you want to delete all selected events?
        </p>
        <div className="flex justify-end gap-2 mt-4">
          <button
            onClick={() => setIsDeleteAllModalVisible(false)}
            className="px-4 py-2 bg-gray-300 text-gray-700 rounded-md hover:bg-gray-400"
          >
            No
          </button>
          <button
            onClick={handleDeleteAll}
            className="px-4 py-2 bg-[#F54A00] text-white rounded-md hover:cursor-pointer"
          >
            Yes
          </button>
        </div>
      </Modal>
    </>
  );
};

export default EventGrid;
