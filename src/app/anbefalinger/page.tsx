"use client";

import React, { useState, useEffect, useRef, useCallback } from "react";
import styled from "styled-components";
import { motion, AnimatePresence } from "framer-motion";
import Image from "next/image";
import { marked } from "marked";
import { getChatResponse, getCountdown } from "../utils/openRouter";
import { useAuthState } from "react-firebase-hooks/auth";
import { auth } from "../../firebase";
import { useRouter } from "next/navigation";

const ViewWrapper = styled(motion.div)`
  min-height: 95vh;
  width: 100vw;
  display: flex;
  justify-content: center;
  align-items: center;
  background: #fff;
  font-family: "Inter", sans-serif;
`;

const InitialView = styled.div`
  width: 100vw;
  max-width: 600px;
  text-align: center;
  padding: 2rem;
`;

const SignImage = styled(Image)`
  width: 100px;
  height: auto;
  margin-bottom: 1rem;
`;

const Greeting = styled.h1`
  font-size: 1.8rem;
  font-weight: 400;
  color: #000;
  margin-bottom: 1rem;
`;

const InputField = styled.input`
  width: 100%;
  padding: 1rem;
  border: none;
  border-bottom: 2px solid #ccc;
  font-size: 1rem;
  outline: none;
  background: transparent;
  transition: border-color 0.3s;

  &:focus {
    border-color: #000;
  }
`;

const ChatPage = styled.div`
  width: 100vw;
  display: flex;
  justify-content: center;
  padding: 2rem 0;
`;

const ChatMessages = styled.div`
  width: 100%;
  max-width: 600px;
  padding: 2rem;
  display: flex;
  flex-direction: column;
  gap: 1rem;
  overflow-y: auto;
`;

const MessageWrapper = styled.div<{ $isUser: boolean }>`
  max-width: 75%;
  display: flex;
  align-items: center;
  gap: 0.5rem;
  align-self: ${({ $isUser }) => ($isUser ? "flex-end" : "flex-start")};
`;

const Message = styled.div<{ $isUser: boolean }>`
  padding: 0.75rem 1rem;
  border-radius: 8px;
  background: ${({ $isUser }) => ($isUser ? "#000" : "#fff")};
  color: ${({ $isUser }) => ($isUser ? "#fff" : "#333")};
  font-size: 1rem;
  font-weight: 400;

  & ul {
    padding-left: 1.5rem;
  }
  & li {
    margin-bottom: 0.5rem;
  }
`;

const ChatInputContainer = styled.div`
  width: 100%;
  max-width: 600px;
  padding: 1rem;
  display: flex;
  gap: 0.5rem;
  position: fixed;
  bottom: 0;
  left: 50%;
  transform: translateX(-50%);
  background: #fff;
  border-top: 1px solid #ddd;
`;

const ChatInput = styled.input`
  flex: 1;
  padding: 0.75rem;
  border: none;
  border-bottom: 2px solid #ccc;
  font-size: 1rem;
  outline: none;
  background: transparent;
  transition: border-color 0.3s;

  &:focus {
    border-color: #000;
  }
`;

const SendButton = styled.button`
  background: none;
  border: none;
  font-size: 1rem;
  cursor: pointer;
  color: #000;
  transition: opacity 0.3s;

  &:hover {
    opacity: 0.7;
  }
`;

const LoadingIndicator = styled.div`
  width: 20px;
  height: 20px;
  border: 3px solid #ccc;
  border-top: 3px solid #000;
  border-radius: 50%;
  animation: spin 1s linear infinite;

  @keyframes spin {
    0% { transform: rotate(0deg); }
    100% { transform: rotate(360deg); }
  }
`;

const Countdown = styled.div`
  font-size: 0.9rem;
  color: #666;
  text-align: center;
  margin-top: 0.5rem;
`;

interface MessageType {
  text: string;
  isUser: boolean;
}

interface RetryError {
  retryDelay?: number;
}

const Anbefalinger = () => {
  const [user] = useAuthState(auth);
  const router = useRouter();
  const [messages, setMessages] = useState<MessageType[]>([
    { text: "Hei! Hva slags tur vil du på i dag?", isUser: false },
  ]);
  const [input, setInput] = useState("");
  const [isChatStarted, setIsChatStarted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [countdown, setCountdown] = useState(0);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const isSendingRef = useRef(false);

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  useEffect(() => {
    if (!user) {
      router.push("/login?returnTo=/anbefalinger");
    }
  }, [user, router]);

  useEffect(() => {
    const interval = setInterval(() => {
      const seconds = getCountdown();
      setCountdown(seconds);
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  const handleSend = useCallback(async () => {
    if (!input.trim() || isSendingRef.current || !user) return;

    isSendingRef.current = true;
    const userMessage: MessageType = { text: input, isUser: true };
    setMessages((prev) => [...prev, userMessage]);
    setInput("");
    setIsLoading(true);

    const previousMessages = messages.map((msg) => msg.text);

    try {
      console.log("Sending message to AI:", input);
      const aiResponseText = await getChatResponse(input, previousMessages);
      const formattedResponse = marked.parse(aiResponseText) as string;
      const aiResponse: MessageType = { text: formattedResponse, isUser: false };

      setMessages((prev) => [...prev, aiResponse]);
      if (!isChatStarted) {
        setIsChatStarted(true);
      }
    } catch (error) {
      console.error("Error fetching AI response:", error);
      setMessages((prev) => [...prev, { text: "Venter på serveren, dette kan ta et øyeblikk...", isUser: false }]);
      let retries = 5;
      while (retries > 0) {
        try {
          const retryResponse = await getChatResponse(input, previousMessages);
          const formattedRetry = marked.parse(retryResponse) as string;
          setMessages((prev) => [...prev.slice(0, -1), { text: formattedRetry, isUser: false }]);
          break;
        } catch (retryError) {
          console.error("Retry failed:", retryError);
          retries--;
          const retryErrorTyped = retryError as RetryError; // Type assertion
          const delay = retryErrorTyped.retryDelay ? retryErrorTyped.retryDelay * 1000 : 2000 * (5 - retries);
          await new Promise(resolve => setTimeout(resolve, delay));
        }
      }
      if (retries === 0) {
        setMessages((prev) => [...prev.slice(0, -1), { text: "Serveren er fortsatt treg. Prøv igjen om litt!", isUser: false }]);
      }
    } finally {
      setIsLoading(false);
      isSendingRef.current = false;
    }
  }, [input, messages, isChatStarted, user, router]);

  if (!user) {
    return null; // Redirect handled by useEffect
  }

  return (
    <AnimatePresence mode="wait">
      {!isChatStarted ? (
        <ViewWrapper
          key="initial"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 20 }}
          transition={{ duration: 0.4 }}
        >
          <InitialView>
            <SignImage src="/woodSign.png" alt="Wood Sign" width={100} height={50} style={{ width: "100px", height: "auto" }} />
            <Greeting>Hei! Hva slags tur vil du på i dag?</Greeting>
            <InputField
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyPress={(e) => e.key === "Enter" && handleSend()}
              placeholder="Skriv her..."
            />
            {isLoading && <LoadingIndicator />}
          </InitialView>
        </ViewWrapper>
      ) : (
        <ViewWrapper
          key="chat"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -20 }}
          transition={{ duration: 0.4 }}
        >
          <ChatPage>
            <ChatMessages>
              {messages.map((msg, index) => (
                <MessageWrapper key={index} $isUser={msg.isUser}>
                  {!msg.isUser && (
                    <>
                      <SignImage src="/woodSign.png" alt="AI Logo" width={20} height={20} style={{ width: "20px", height: "auto" }} />
                      {isLoading && messages.length - 1 === index && <LoadingIndicator />}
                    </>
                  )}
                  <Message $isUser={msg.isUser} dangerouslySetInnerHTML={{ __html: msg.text }} />
                </MessageWrapper>
              ))}
              {isLoading && messages.length > 0 && (
                <MessageWrapper $isUser={false}>
                  <SignImage src="/woodSign.png" alt="AI Logo" width={20} height={20} style={{ width: "20px", height: "auto" }} />
                  <LoadingIndicator />
                </MessageWrapper>
              )}
              <div ref={messagesEndRef} />
            </ChatMessages>
            <ChatInputContainer>
              <ChatInput
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                onKeyPress={(e) => e.key === "Enter" && handleSend()}
                placeholder="Skriv en melding..."
              />
              <SendButton onClick={handleSend}>➤</SendButton>
              {countdown > 0 && <Countdown>{`Venter ${countdown} sekunder til neste melding...`}</Countdown>}
            </ChatInputContainer>
          </ChatPage>
        </ViewWrapper>
      )}
    </AnimatePresence>
  );
};

export default Anbefalinger;