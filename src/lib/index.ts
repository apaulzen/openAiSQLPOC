import { PrismaClient } from "@prisma/client";
import { InMemoryChatMessageHistory } from "@langchain/core/chat_history";
import { RunnableWithMessageHistory } from "@langchain/core/runnables";
import { AIMessage, HumanMessage, SystemMessage, trimMessages } from "@langchain/core/messages";
import llm from "../llm";

export const messages: any = [];

export const prisma = new PrismaClient();
export const chatHistory = new InMemoryChatMessageHistory();

const dummyGetSessionHistory = async (sessionId: string) => {
  if (sessionId !== "1") {
    throw new Error("Session not found");
  }
  return chatHistory;
};

const trimmer = trimMessages({
  maxTokens: 1500,
  strategy: "last",
  tokenCounter: llm,
  includeSystem: true,
});

const chain = trimmer.pipe(llm);
export const chainWithHistory = new RunnableWithMessageHistory({
  runnable: chain,
  getMessageHistory: dummyGetSessionHistory,
});
