// config.js
import { createChatBotMessage } from "react-chatbot-kit";

const config = {
  initialMessages: [createChatBotMessage("Bonjour!Comment je peux vous aider?")],
  botName: "ChatBot",
  customStyles: {
    botMessageBox: {
      backgroundColor: "orange",
    },
    chatButton: {
      backgroundColor:"orange"
    },
  },
//   customComponents: {
//     // Replaces the default bot avatar
//     botAvatar: (props) => <div className="custom-bot-avatar">Bot</div>,
//     // Replaces the default bot chat message container
//     botMessage: (props) => (
//       <div className="custom-bot-message">
//         {props.children}
//       </div>
//     ),
//     // Replaces the default user chat message container
//     userMessage: (props) => (
//       <div className="custom-user-message">
//         {props.children}
//       </div>
//     ),
//   },
};

export default config;
