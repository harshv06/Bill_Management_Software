import React from "react";

const ConfirmationModal = ({ isOpen, onClose, onConfirm, title, message }) => {
  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center overflow-x-hidden overflow-y-auto outline-none focus:outline-none">
      <div className="relative w-auto max-w-sm mx-auto my-6">
        <div className="relative flex flex-col w-full bg-white border-0 rounded-lg shadow-lg outline-none focus:outline-none">
          {/* Header */}
          <div className="flex items-start justify-between p-5 border-b border-solid rounded-t border-blueGray-200">
            <h3 className="text-lg font-semibold">{title}</h3>
            <button
              className="float-right p-1 ml-auto text-3xl font-semibold leading-none text-black bg-transparent border-0 outline-none opacity-5 focus:outline-none"
              onClick={onClose}
            >
              ×
            </button>
          </div>

          {/* Body */}
          <div className="relative flex-auto p-6">
            <p className="my-4 text-blueGray-500">{message}</p>
          </div>

          {/* Footer */}
          <div className="flex items-center justify-end p-6 border-t border-solid rounded-b border-blueGray-200">
            <button
              className="px-6 py-2 mb-1 mr-1 text-sm font-bold text-red-500 uppercase outline-none background-transparent focus:outline-none"
              type="button"
              onClick={onClose}
            >
              Cancel
            </button>
            <button
              className="px-6 py-3 mb-1 mr-1 text-sm font-bold text-white uppercase bg-red-500 rounded shadow hover:shadow-lg focus:outline-none"
              type="button"
              onClick={onConfirm}
            >
              Confirm Delete
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop */}
      {/* <div className="fixed inset-0 z-40 bg-black opacity-25"></div> */}
    </div>
  );
};

export default ConfirmationModal;
