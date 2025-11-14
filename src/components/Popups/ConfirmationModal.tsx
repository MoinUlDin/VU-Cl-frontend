import { TriangleAlert } from "lucide-react";

interface props {
  title?: string;
  text?: string;
  btnText?: string;
  onConfirm: () => void;
  onCancel: () => void;
}
function ConfirmationModal({
  title = "Confim Your Action",
  text,
  btnText,
  onConfirm,
  onCancel,
}: props) {
  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/40">
      <div className="bg-white p-5 rounded-xl">
        <h1 className="text-2xl font-bold text-blue-950 mb-3 flex items-center gap-2">
          <TriangleAlert className="text-red-500" />
          {title}
        </h1>
        <div>{text ? text : "Are you sure you want to Delete this?"}</div>
        <p className="text-sm text-gray-600">
          This action will be irreversable
        </p>
        <div className="mt-5 flex items-center justify-end gap-2">
          <button className="bg-red-400 py-1 px-3 rounded " onClick={onConfirm}>
            {btnText ? btnText : "Yes"}
          </button>
          <button onClick={onCancel} className=" bg-gray-400 py-1 px-2 rounded">
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}

export default ConfirmationModal;
