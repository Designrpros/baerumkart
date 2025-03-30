interface WebkitMessageHandlers {
    signIn?: {
      postMessage: (message: { action: string }) => void;
    };
  }
  
  interface Window {
    webkit?: {
      messageHandlers?: WebkitMessageHandlers;
    };
  }