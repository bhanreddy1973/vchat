import { formatDateSeparator } from "../utils/dateUtils";

const DateSeparator = ({ date }) => {
  return (
    <div className="flex justify-center my-6">
      <div className="bg-slate-700 px-3 py-1 rounded-full shadow-sm">
        <span className="text-xs text-slate-300 font-medium">
          {formatDateSeparator(date)}
        </span>
      </div>
    </div>
  );
};

export default DateSeparator;