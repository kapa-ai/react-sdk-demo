import React from "react";
import { KapaProvider } from "@kapaai/react-sdk";
import ChatbotApp from "./components/ChatbotApp";
import "./index.css";

function App() {
  return (
    <KapaProvider
      integrationId="c5d4526e-46db-42a0-ab24-2b6d3971e0b7"
      callbacks={{
        askAI: {
          onQuerySubmit: (data) => {
            console.log("Question asked:", data.question);
          },
          onAnswerGenerationCompleted: (data) => {
            console.log("Answer generated:", {
              questionId: data.questionAnswerId,
              question: data.question,
              answer: data.answer,
            });
          },
          onFeedbackSubmit: (data) => {
            console.log("Feedback submitted:", {
              questionId: data.questionAnswerId,
              reaction: data.reaction,
              comment: data.comment,
            });
          },
          onConversationReset: (data) => {
            console.log("Conversation reset");
          },
        },
      }}
    >
      <ChatbotApp />
    </KapaProvider>
  );
}

export default App;
