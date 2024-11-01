import React from "react";

const LoadingSpinner = () => {
  return (
    <div id="loading-spinner" class="fixed inset-0 bg-gray-100 bg-opacity-75 flex items-center justify-center z-50 hidden">
    <div class="animate-spin rounded-full h-32 w-32 border-t-4 border-blue-600"></div>
</div>
  );
};

export default LoadingSpinner;
