"use client";
import { FC, useRef, useState } from "react";
import TextareaAutoSize from "react-textarea-autosize";
import Button from "./ui/Button";
import axios from "axios";
import toast from "react-hot-toast";

interface ChatInputProps {
  chatPartner: User;
  chatId: string;
}

const ChatInput: FC<ChatInputProps> = ({ chatPartner, chatId }) => {
  const textareaRef = useRef<HTMLTextAreaElement | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [input, setInput] = useState<string>("");

  async function sendMessage() {
    if (!input) return;
    setIsLoading(true);
    try {
      //   await new Promise((resolve) => setTimeout(resolve, 1000));
      await axios.post("/api/message/send", { text: input, chatId });
      setInput("");
    } catch (error) {
      toast.error("Something went wrong. Please try again later.");
      console.error("Error sending message", error);
    } finally {
      setIsLoading(false);
    }
  }

  return (
    <div className="border-t border-gray-200 px-4 pt-4 mb-2 sm:mb-0">
      <div className="relative flex-1 overflow-hidden rounded-lg shadow-sm ring-1 ring-inset ring-gray-300 focus-within:ring-2 focus-within:ring-indigo-600">
        <TextareaAutoSize
          ref={textareaRef}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              sendMessage();
            }
          }}
          rows={1}
          value={input}
          onChange={(e) => setInput(e.target.value)}
          placeholder={`Message ${chatPartner.name}`}
          className="block w-full resize-none border-0 bg-transparent text-gray-900 placeholder:text-gray-400 focus:ring-0 sm:py-1.5 sm:text-sm sm:leading-6"
        />

        <div onClick={() => textareaRef.current?.focus()} className="py-2" aria-hidden="true">
          <div className="h-4" />
        </div>

        <div className="absolute right-0 bottom-0 flex justify-between py-2 pl-3 pr-2">
          <div className="flex-shrin-0">
            <Button onClick={sendMessage} type="submit" isLoading={isLoading} variant="default" size="default">
              Post
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ChatInput;
