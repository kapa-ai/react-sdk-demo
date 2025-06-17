import React, { useState, useRef, useEffect } from "react";
import {
  MessageSquare,
  Send,
  ThumbsUp,
  ThumbsDown,
  Copy,
  Trash2,
  MessageSquarePlus,
  ExternalLink,
} from "lucide-react";
import * as marked from "marked";
import { useChat } from "@kapaai/react-sdk";
import FeedbackComment from "./FeedbackComment";

// Main App Component
const ChatbotApp = () => {
  const [inputMessage, setInputMessage] = useState("");
  const [feedbackStates, setFeedbackStates] = useState({});
  const [showCommentId, setShowCommentId] = useState(null);
  const messagesEndRef = useRef(null);
  const {
    conversation,
    submitQuery,
    isGeneratingAnswer,
    isPreparingAnswer,
    resetConversation,
    stopGeneration,
    addFeedback,
    error,
  } = useChat();

  // Configure marked options for better code highlighting
  useEffect(() => {
    marked.setOptions({
      breaks: true,
      gfm: true,
      headerIds: false,
    });
  }, []);

  const handleSubmit = (e) => {
    if (e) e.preventDefault();
    if (inputMessage.trim() && !isGeneratingAnswer && !isPreparingAnswer) {
      submitQuery(inputMessage);
      setInputMessage("");
    }
  };

  const handleClearThread = () => {
    resetConversation();
    setFeedbackStates({});
    setShowCommentId(null);
  };

  const handleCopyText = (text) => {
    navigator.clipboard.writeText(text);

    // Show a temporary copied message
    const target = event.currentTarget;
    // First, find any current "Copied!" text and reset it
    const buttons = document.querySelectorAll(".copy-active");
    buttons.forEach((button) => {
      button.classList.remove("copy-active");
      const textEl = button.querySelector(".copy-text");
      if (textEl) textEl.textContent = "";
    });

    // Now set the current button to show "Copied!"
    target.classList.add("copy-active");
    const textEl = target.querySelector(".copy-text");
    if (textEl) textEl.textContent = "Copied!";

    setTimeout(() => {
      target.classList.remove("copy-active");
      if (textEl) textEl.textContent = "";
    }, 2000);
  };

  const handleFeedback = (qaId, reaction) => {
    addFeedback(qaId, reaction);

    // Update local feedback state
    setFeedbackStates((prev) => ({
      ...prev,
      [qaId]: reaction,
    }));

    // Close comment form if it's open
    if (showCommentId === qaId) {
      setShowCommentId(null);
    }
  };


  // Scroll to bottom when new messages arrive
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [conversation]);

  return (
    <div className="flex p-12 h-screen bg-gray-100">
      <div className="flex flex-col w-full max-w-4xl mx-auto bg-white shadow-lg rounded-lg overflow-hidden">
        {/* Header */}
        <header className="bg-gray-800 text-white p-4 flex justify-between items-center">
          <div className="flex items-center">
            <MessageSquare className="mr-2" size={20} />
            <h1 className="font-bold text-lg">AI Chatbot</h1>
          </div>
          <button
            className="flex items-center bg-gray-700 hover:bg-gray-600 rounded px-3 py-1 text-sm"
            aria-label="New chat"
            onClick={handleClearThread}
          >
            <MessageSquarePlus size={16} className="mr-1" />
            New Chat
          </button>
        </header>

        {/* Chat Container */}
        <div className="flex-1 overflow-y-auto p-4">
          {error && (
            <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
              <p className="font-bold">Error</p>
              <p>{error}</p>
            </div>
          )}

          {conversation.length > 0 && (
            <div className="flex justify-center mb-4">
              <button
                className="bg-gray-200 hover:bg-gray-300 text-gray-600 rounded-full px-4 py-1 text-sm flex items-center"
                aria-label="Clear thread"
                onClick={handleClearThread}
              >
                <Trash2 size={14} className="mr-1" />
                Clear thread
              </button>
            </div>
          )}

          {/* Messages */}
          <div className="space-y-4">
            {conversation.length === 0 ? (
              <div className="text-center text-gray-500 mt-8">
                <p>Ask a question to start a conversation!</p>
              </div>
            ) : (
              conversation.map((qa, index) => (
                <div key={qa.id || `qa-${index}`} className="space-y-4">
                  <div className="flex justify-end">
                    <div className="rounded-lg p-3 max-w-3/4 bg-blue-500 text-white">
                      <p className="whitespace-pre-wrap">{qa.question}</p>
                    </div>
                  </div>

                  <div className="flex justify-start">
                    <div className="rounded-lg p-4 max-w-3/4 w-full bg-gray-100 text-gray-800 overflow-hidden message-container">
                      <div
                        className="prose prose-sm max-w-none overflow-x-auto"
                        dangerouslySetInnerHTML={{
                          __html: qa.answer
                            ? marked.parse(qa.answer)
                            : '<p class="text-gray-500">Generating answer...</p>',
                        }}
                      />

                      {/* Only show feedback controls when answer is completed (not during generation) */}
                      {qa.isFeedbackSubmissionEnabled && (
                        <div className="mt-2 flex items-center text-xs text-gray-600">
                          <div className="flex items-center">
                            <button
                              className={`p-1 rounded ${feedbackStates[qa.id] === "upvote"
                                  ? "bg-green-200"
                                  : "hover:bg-gray-300"
                                }`}
                              aria-label="Upvote"
                              onClick={() =>
                                qa.id && handleFeedback(qa.id, "upvote")
                              }
                            >
                              <ThumbsUp size={14} />
                            </button>
                            <button
                              className={`p-1 rounded ml-1 ${feedbackStates[qa.id] === "downvote"
                                  ? "bg-red-200"
                                  : "hover:bg-gray-300"
                                }`}
                              aria-label="Downvote"
                              onClick={() =>
                                qa.id && handleFeedback(qa.id, "downvote")
                              }
                            >
                              <ThumbsDown size={14} />
                            </button>
                            <button
                              className="p-1 rounded ml-1 hover:bg-gray-300 flex items-center copy-btn"
                              onClick={() => handleCopyText(qa.answer)}
                              aria-label="Copy message"
                            >
                              <Copy size={14} />
                              <span className="copy-text ml-1"></span>
                            </button>
                          </div>
                        </div>
                      )}

                      {/* Show comment form */}
                      {feedbackStates[qa.id] === "downvote" && (
                        <FeedbackComment
                          questionAnswerId={qa.id}
                          onClose={() => setShowCommentId(null)}
                        />
                      )}

                      {/* Sources section */}
                      {qa.sources && qa.sources.length > 0 && (
                        <div className="mt-4 pt-4 border-t border-gray-200">
                          <h4 className="text-xs font-semibold text-gray-600 mb-2">Sources</h4>
                          <div className="space-y-2">
                            {qa.sources.map((source, sourceIndex) => (
                              <a
                                key={sourceIndex}
                                href={source.source_url}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-start gap-2 text-xs text-blue-600 hover:text-blue-800 hover:bg-blue-50 rounded p-2 transition-colors"
                              >
                                <ExternalLink size={14} className="flex-shrink-0 mt-0.5" />
                                <div className="flex-1">
                                  <div className="font-medium">{source.title}</div>
                                  {source.subtitle && source.subtitle !== source.title && (
                                    <div className="text-gray-500">{source.subtitle}</div>
                                  )}
                                </div>
                              </a>
                            ))}
                          </div>
                        </div>
                      )}
                    </div>
                  </div>
                </div>
              ))
            )}
            <div ref={messagesEndRef} />
          </div>
        </div>

        {/* Input Area */}
        <div className="border-t border-gray-200 p-4">
          <form onSubmit={handleSubmit} className="flex items-center">
            <div className="flex-1 bg-gray-100 rounded-lg px-3 py-2">
              <input
                type="text"
                placeholder="Type your message..."
                className="w-full bg-transparent focus:outline-none"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={isGeneratingAnswer || isPreparingAnswer}
              />
            </div>
            {isGeneratingAnswer ? (
              <button
                type="button"
                className="ml-2 bg-red-500 hover:bg-red-600 text-white rounded-full p-2"
                onClick={stopGeneration}
                aria-label="Stop generation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  className="h-4 w-4"
                  viewBox="0 0 20 20"
                  fill="currentColor"
                >
                  <rect x="6" y="6" width="8" height="8" />
                </svg>
              </button>
            ) : (
              <button
                type="submit"
                className="ml-2 bg-blue-500 hover:bg-blue-600 text-white rounded-full p-2"
                disabled={!inputMessage.trim() || isPreparingAnswer}
                aria-label="Send message"
              >
                <Send size={16} />
              </button>
            )}
          </form>
        </div>
      </div>
    </div>
  );
};

export default ChatbotApp;
