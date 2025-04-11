import React from "react";
interface EventCardProps {
  event: {
    _id: string;
    eventId: string;
    title: string;
    location: string;
    startDate: string;
    endDate: string;
    createdAt: string;
  };
  handleGenerateQrCode: (event: EventCardProps["event"]) => void;
  handleUpdate: (event: EventCardProps["event"]) => void;
  handleDelete: (event: EventCardProps["event"]) => void;
}

export const EventCard: React.FC<EventCardProps> = ({
  event,
  handleGenerateQrCode,
  handleUpdate,
  handleDelete,
}) => {
  const displayDate = (date?: string) =>
    date ? new Date(date).toLocaleString() : "N/A";

  return (
    <div className="w-[90%] flex flex-col justify-center items-center max-w-md mx-auto bg-white  border-[#d1e0e0] rounded-md shadow-lg mb-4 p-4">
      <div className="grid grid-cols-2 gap-2 mb-4">
        <div className="flex flex-col gap-2 text-sm text-black font-[500]">
          <span>Event ID</span>
          <span>Title</span>
          <span>Location</span>
          <span>Start Date</span>
          <span>End Date</span>
        </div>
        <div className="flex flex-col gap-2 text-sm text-gray-700">
          <span className="text-wrap max-w-[20ch] truncate">
            {event.eventId}
          </span>
          <span>{event.title || "N/A"}</span>
          <span>{event.location || "N/A"}</span>
          <span>{displayDate(event.startDate)}</span>
          <span>{displayDate(event.endDate)}</span>
        </div>
      </div>
      <div className="flex justify-around gap-2">
        <button
          onClick={() => handleUpdate(event)}
          className="text-white text-xs bg-blue-500 px-4 py-1  rounded-sm hover:bg-gray-100"
          aria-label="Edit Event"
        >
          Edit
        </button>
        <button
          onClick={() => handleDelete(event)}
          className="bg-red-500 text-white text-xs px-4 py-1 rounded-sm hover:bg-gray-100"
          aria-label="Delete Event"
        >
          Delete
        </button>

        <button
          onClick={() => handleGenerateQrCode(event)}
          className="text-white px-4 py-1 text-xs bg-[#E84C23] rounded-sm  hover:bg-gray-100"
          aria-label="Generate QR Code"
        >
          QR Code
        </button>
      </div>
    </div>
  );
};
