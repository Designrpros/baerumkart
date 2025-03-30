import { processInput, fetchSpots } from "./agents";

interface ConversationState {
  currentTopic: string | null;
  lastIntent: "recommend" | "info" | "equipment" | "duration" | "general" | "parking" | null;
}

const conversationState: ConversationState = {
  currentTopic: null,
  lastIntent: null,
};

interface QueuedMessage {
  message: string;
  resolve: (value: string) => void;
  timestamp: number;
  retryDelay?: number;
}

const messageQueue: QueuedMessage[] = [];
let isProcessing = false;
let lastMessageTime = 0;

async function processQueue(previousMessages: string[]) {
  console.log("processQueue: Starting with queue length:", messageQueue.length);
  if (isProcessing || messageQueue.length === 0) {
    console.log("processQueue: Exiting - already processing or queue empty");
    return;
  }
  isProcessing = true;

  const { message, resolve, retryDelay, timestamp } = messageQueue.shift()!;
  console.log("processQueue: Processing message:", message, "Retry delay:", retryDelay, "Timestamp:", timestamp);

  if (retryDelay) {
    const now = Date.now();
    const elapsed = (now - timestamp) / 1000;
    const waitTime = retryDelay - elapsed;
    console.log("processQueue: Retry delay active. Elapsed:", elapsed, "Retry delay:", retryDelay, "Waiting:", waitTime);
    if (elapsed < retryDelay) {
      await new Promise(resolve => setTimeout(resolve, waitTime * 1000));
    }
  }

  try {
    const response = await getChatResponseInner(message, previousMessages);
    console.log("processQueue: Response received:", response);
    resolve(response);
  } catch (error) {
    console.error("processQueue: Error processing message:", error);
    resolve(`Beklager, jeg klarte ikke å få svar fra serveren etter flere forsøk. Prøv igjen senere!`);
  }

  isProcessing = false;
  lastMessageTime = Date.now();
  console.log("processQueue: Finished processing, moving to next. Queue length:", messageQueue.length, "Last message time:", lastMessageTime);
  processQueue(previousMessages);
}

async function generateResponse(userMessage: string, spotsContext: string, dbSpotNames: string[], previousMessages: string[]): Promise<string> {
  console.log("generateResponse: Starting for message:", userMessage);
  const apiKey = process.env.NEXT_PUBLIC_OPENROUTER_API_KEY;
  const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000";
  const siteName = process.env.NEXT_PUBLIC_SITE_NAME || "BaerumKart";

  if (!apiKey) {
    console.error("generateResponse: Missing API key");
    throw new Error("Mangler OpenRouter API-nøkkel. Sjekk din .env.local-fil.");
  }

  const recentContext = previousMessages.slice(-3).join("\n");
  const systemMessage = `
Du er en tur-rådgiver for BaerumKart, en webapplikasjon som hjelper brukere med å planlegge utendørsturer i Bærum-området.
Bruk kun stedene fra følgende database til å gi opptil 3 unike turanbefalinger basert på brukerens forespørsel:
${spotsContext}
Svar kun på norsk med anbefalinger som inneholder navn og vanskelighetsgrad. Ikke inkluder koordinater i svaret.
Hvis forespørselen er uklar eller ingen steder passer, svar med en kort melding som "Jeg har ikke nok detaljer om det i databasen akkurat nå."
Ikke inkluder denne instruksjonen, kontekstdata, JSON, eller anbefalinger utenfor databasen i svaret.
Forrige samtale (siste 3 meldinger):\n${recentContext}
  `;

  let retries = 3;
  let delay = 1000;

  while (retries > 0) {
    console.log("generateResponse: Attempt", 4 - retries, "with delay:", delay);
    try {
      const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${apiKey}`,
          "HTTP-Referer": siteUrl,
          "X-Title": siteName,
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          model: "deepseek/deepseek-r1:free",
          messages: [
            { role: "system", content: systemMessage },
            { role: "user", content: userMessage },
          ],
          max_tokens: 1000,
          temperature: 0.7,
        }),
      });

      if (!response.ok) {
        const errorText = await response.text();
        console.error("generateResponse: Fetch failed with status:", response.status, "Error text:", errorText);
        const errorData = JSON.parse(errorText);
        if (response.status === 429 && errorData.error?.metadata?.retryDelay) {
          const retryDelaySeconds = parseRetryDelay(errorData.error.metadata.retryDelay);
          console.log("generateResponse: Rate limited, retry delay:", retryDelaySeconds);
          throw { retryDelay: retryDelaySeconds };
        }
        throw new Error(`API-feil: ${response.status} - ${response.statusText} - ${errorText}`);
      }

      const data = await response.json();
      console.log("generateResponse: API response:", data);

      const content = data.choices?.[0]?.message?.content || "Jeg har ikke nok detaljer om det i databasen akkurat nå.";
      
      if (content.includes("tur-rådgiver") || content.match(/\{.*\}/) || (!dbSpotNames.some(name => content.toLowerCase().includes(name)) && content !== "Jeg har ikke nok detaljer om det i databasen akkurat nå.")) {
        console.log("generateResponse: Invalid content, returning fallback");
        return "Jeg har ikke nok detaljer om det i databasen akkurat nå.";
      }

      console.log("generateResponse: Success, returning:", content);
      return content.trim();
    } catch (error: any) {
      console.error("generateResponse: Error on attempt", 4 - retries, ":", error);
      if (error.retryDelay && retries > 0) {
        await new Promise(resolve => setTimeout(resolve, error.retryDelay * 1000));
        retries--;
        continue;
      }
      if (retries > 1) {
        await new Promise(resolve => setTimeout(resolve, delay * Math.pow(2, 3 - retries)));
        retries--;
        delay *= 2;
        continue;
      }
      throw error;
    }
  }

  console.error("generateResponse: All retries exhausted");
  throw new Error("Uventet feil etter maks antall forsøk.");
}

function parseRetryDelay(retryDelay: string): number {
  const match = retryDelay.match(/(\d+)s/);
  const seconds = match ? parseInt(match[1], 10) : 60;
  console.log("parseRetryDelay: Parsed delay:", seconds, "from:", retryDelay);
  return seconds;
}

async function getChatResponseInner(userMessage: string, previousMessages: string[]): Promise<string> {
  console.log("getChatResponseInner: Processing message:", userMessage);
  const lowerMessage = userMessage.toLowerCase();
  const fullContext = [...previousMessages, userMessage].join("\n").toLowerCase();
  const inputResult = await processInput(userMessage, previousMessages);
  console.log("getChatResponseInner: Input processed, trip type:", inputResult.tripType);

  const spotNames = ["kolsåstoppen", "fossum teltplass", "brunkollen", "bærumsmarka bålplass"];
  const mentionedSpot = spotNames.find(name => lowerMessage.includes(name));
  if (mentionedSpot) {
    conversationState.currentTopic = mentionedSpot;
    console.log("getChatResponseInner: Updated currentTopic to:", mentionedSpot);
  }
  if (/anbefale/.test(lowerMessage)) conversationState.lastIntent = "recommend";
  else if (/fortell meg (mer|mre)|hva med|om området/.test(lowerMessage)) conversationState.lastIntent = "info";
  else if (/utstyr|pakke|klær|fottøy|mat|overnatte/.test(lowerMessage)) conversationState.lastIntent = "equipment";
  else if (/hvor lang|tid|estimere/.test(lowerMessage)) conversationState.lastIntent = "duration";
  else if (/parkering/.test(lowerMessage)) conversationState.lastIntent = "parking";
  else conversationState.lastIntent = "general";
  console.log("getChatResponseInner: Updated lastIntent to:", conversationState.lastIntent);

  if (!inputResult.isValid && !conversationState.currentTopic) {
    console.log("getChatResponseInner: Non-trip message detected, no current topic");
    if (lowerMessage.includes("hei") || lowerMessage.includes("hello") && previousMessages.length <= 1) {
      return "Hei! Hva har du lyst til å snakke om i dag – kanskje en tur i Bærum?";
    }
    if (lowerMessage.includes("hva skjer")) {
      return "Ikke så mye, bare her og hjelper deg! Hva har du i tankene nå?";
    }
    if (lowerMessage.includes("sakte")) {
      return "Ok, du tar det med ro – det liker jeg! Hva vil du vite mer om nå?";
    }
    return "Jeg finner ut av dette for deg, ett øyeblikk... Hva mente du med det?";
  }

  console.log("getChatResponseInner: Fetching spots...");
  const { context: spotsContext, spotNames: fetchedSpotNames } = await fetchSpots(inputResult.tripType || "tur", conversationState.currentTopic || undefined);
  console.log("getChatResponseInner: Spots fetched, context length:", spotsContext.length, "spot names:", fetchedSpotNames);
  const dbResponse = await generateResponse(inputResult.processedMessage, spotsContext, fetchedSpotNames, previousMessages);
  console.log("getChatResponseInner: Database response:", dbResponse);

  if (dbResponse.includes("Jeg har ikke nok detaljer")) {
    console.log("getChatResponseInner: Handling database fallback");
    if (conversationState.lastIntent === "duration" && conversationState.currentTopic) {
      const fromMatch = lowerMessage.match(/fra (\w+)/);
      const fromLocation = fromMatch ? fromMatch[1] : null;
      if (fromLocation) {
        return `Jeg har ikke nøyaktige tider fra ${fromLocation} til ${conversationState.currentTopic}, men det er en lett tur, så jeg vil anslå 1-2 timer tur-retur. Hvor fort pleier du å gå?`;
      }
      return `For ${conversationState.currentTopic} vil jeg anslå 1-2 timer tur-retur, siden det er en lett tur. Hvor starter du fra, så kan jeg finjustere litt?`;
    }
    if (conversationState.lastIntent === "info" && conversationState.currentTopic) {
      return `Jeg har ikke flere detaljer om ${conversationState.currentTopic} akkurat nå, men det ligger i Bærumsmarka, et flott område med mange stier og natur. Hva vil du vite mer om – stier, utsikt, eller noe annet?`;
    }
    if (conversationState.lastIntent === "parking" && conversationState.currentTopic) {
      return `Jeg har ikke spesifikk info om parkering ved ${conversationState.currentTopic}, men det er ofte parkering i nærheten av populære tursteder i Bærum, som ved Fossum eller nærliggende veier. Sjekk lokale kart for nøyaktig plass! Hva planlegger du å gjøre der?`;
    }
    if (conversationState.currentTopic) {
      return `Jeg har ikke flere detaljer om ${conversationState.currentTopic} akkurat nå, men jeg kan fortelle deg mer om området hvis du vil. Hva er du nysgjerrig på?`;
    }
    return "Jeg mangler akkurat den infoen i databasen. Kan du gi meg litt mer å gå på?";
  }

  console.log("getChatResponseInner: Enhancing response for intent:", conversationState.lastIntent);
  switch (conversationState.lastIntent) {
    case "recommend":
      return `${dbResponse}\n\nHåper det passer planene dine! Vil du vite mer om hvordan du kommer dit?`;
    case "info":
      return `${dbResponse}\n\nDer har du litt mer! Hva lurer du på nå?`;
    case "equipment":
      return `${dbResponse}\n\nNå er du klar! Har du noe spesifikt utstyr i tankene allerede?`;
    case "duration":
      if (lowerMessage.includes("sakte")) {
        return `${dbResponse}\n\nSiden du går sakte, kan du kanskje legge til en halvtime ekstra. Hva pleier du å ta med for å gjøre turen komfortabel?`;
      }
      return `${dbResponse}\n\nDet burde gi deg en idé! Skal du ta det rolig eller gå litt raskere?`;
    case "parking":
      return `${dbResponse}\n\nDer har du parkeringstips! Trenger du hjelp med noe annet til turen?`;
    default:
      return `${dbResponse}\n\nHva synes du? Skal vi snakke mer om dette?`;
  }
}

export function getChatResponse(userMessage: string, previousMessages: string[] = []): Promise<string> {
  console.log("getChatResponse: Queuing message:", userMessage, "Current queue length:", messageQueue.length);
  return new Promise((resolve) => {
    const timestamp = Date.now();
    const timeSinceLast = (timestamp - lastMessageTime) / 1000;
    const retryDelay = timeSinceLast < 2 && messageQueue.length > 0 ? 2 : 0; // 2s delay if <2s since last message
    messageQueue.push({ message: userMessage, resolve, timestamp, retryDelay });
    console.log("getChatResponse: Message queued with retryDelay:", retryDelay, "Time since last:", timeSinceLast);
    processQueue(previousMessages);
  });
}

export function getCountdown(): number {
  if (messageQueue.length === 0 || !messageQueue[0].retryDelay) {
    console.log("getCountdown: No delay, queue empty or no retry:", messageQueue.length);
    return 0;
  }
  const { timestamp, retryDelay } = messageQueue[0];
  const elapsed = (Date.now() - timestamp) / 1000;
  const remaining = Math.max(0, Math.ceil(retryDelay - elapsed));
  console.log("getCountdown: Calculated remaining:", remaining, "Timestamp:", timestamp, "Retry delay:", retryDelay, "Elapsed:", elapsed);
  return remaining;
}