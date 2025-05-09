import React, { useState } from "react";
import { useChat } from "@kapaai/react-sdk";

const FeedbackComment = ({ questionAnswerId, onClose }) => {
  const { addFeedback } = useChat();
  const [comment, setComment] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState(null);
  const [issues, setIssues] = useState({
    incorrect: false,
    irrelevant: false,
    unaddressed: false,
  });

  const handleSave = async () => {
    setIsSubmitting(true);
    setError(null);

    try {
      await addFeedback(questionAnswerId, "downvote", {
        incorrect: issues.incorrect,
        irrelevant: issues.irrelevant,
        unaddressed: issues.unaddressed,
        issue: comment,
      });

      setSubmitted(true);

      // Close after showing success message
      setTimeout(() => {
        onClose();
      }, 1500);
    } catch (err) {
      setError("Failed to submit feedback. Please try again.");
      setIsSubmitting(false);
    }
  };

  const toggleIssue = (issue) => {
    setIssues((prev) => ({
      ...prev,
      [issue]: !prev[issue],
    }));
  };

  if (submitted) {
    return (
      <div className="mt-4 pt-3 border-t border-gray-200">
        <div className="bg-green-50 border border-green-200 text-green-700 px-4 py-3 rounded mb-4 flex items-center">
          <svg className="w-5 h-5 mr-2" fill="currentColor" viewBox="0 0 20 20">
            <path
              fillRule="evenodd"
              d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z"
              clipRule="evenodd"
            ></path>
          </svg>
          <span>Thank you for your feedback!</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-4 pt-3 border-t border-gray-200">
      {error && (
        <div className="bg-red-50 border border-red-200 text-red-700 px-4 py-3 rounded mb-4">
          {error}
        </div>
      )}

      <div className="text-sm font-medium mb-2">
        What was the issue with this response?
      </div>
      <div className="mb-3 space-y-2">
        <div className="flex flex-wrap gap-2">
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-full ${issues.incorrect
                ? "bg-red-100 border border-red-300 text-red-700"
                : "bg-gray-100 border border-gray-300 text-gray-700"
              }`}
            onClick={() => toggleIssue("incorrect")}
            disabled={isSubmitting}
          >
            Incorrect Information
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-full ${issues.irrelevant
                ? "bg-red-100 border border-red-300 text-red-700"
                : "bg-gray-100 border border-gray-300 text-gray-700"
              }`}
            onClick={() => toggleIssue("irrelevant")}
            disabled={isSubmitting}
          >
            Not Relevant
          </button>
          <button
            type="button"
            className={`px-3 py-1 text-xs rounded-full ${issues.unaddressed
                ? "bg-red-100 border border-red-300 text-red-700"
                : "bg-gray-100 border border-gray-300 text-gray-700"
              }`}
            onClick={() => toggleIssue("unaddressed")}
            disabled={isSubmitting}
          >
            Question Not Addressed
          </button>
        </div>
      </div>
      <textarea
        className="w-full p-3 text-sm border border-gray-300 rounded focus:outline-none focus:ring-2 focus:ring-blue-500 focus:border-transparent"
        rows="3"
        placeholder="Add more details about the issue..."
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        disabled={isSubmitting}
      ></textarea>
      <div className="mt-2 flex justify-end space-x-2">
        <button
          type="button"
          className="px-3 py-1 bg-gray-200 text-gray-700 text-sm rounded hover:bg-gray-300 transition"
          onClick={onClose}
          disabled={isSubmitting}
        >
          Cancel
        </button>
        <button
          type="button"
          className={`px-3 py-1 text-white text-sm rounded transition flex items-center ${isSubmitting ? "bg-blue-400" : "bg-blue-500 hover:bg-blue-600"
            }`}
          onClick={handleSave}
          disabled={isSubmitting}
        >
          {isSubmitting ? (
            <>
              <svg
                className="animate-spin -ml-1 mr-2 h-4 w-4 text-white"
                xmlns="http://www.w3.org/2000/svg"
                fill="none"
                viewBox="0 0 24 24"
              >
                <circle
                  className="opacity-25"
                  cx="12"
                  cy="12"
                  r="10"
                  stroke="currentColor"
                  strokeWidth="4"
                ></circle>
                <path
                  className="opacity-75"
                  fill="currentColor"
                  d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                ></path>
              </svg>
              Submitting...
            </>
          ) : (
            "Submit Feedback"
          )}
        </button>
      </div>
    </div>
  );
};

export default FeedbackComment;
