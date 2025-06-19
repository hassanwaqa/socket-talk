const eventListeners = new Map();

export const handleIncomingSocketMessage = (response: any) => {
  console.log("response", response);
  const { event, payload, requestId, status, error } = response;
  if (status !== "success") {
    console.error(error || "An unexpected error occurred");
    return;
  }
  if (eventListeners.has(event)) {
    eventListeners.get(event).forEach((cb: any) => cb(payload, requestId));
  }
};

export const subscribeToEvent = (event: any, callback: any) => {
  if (!eventListeners.has(event)) {
    eventListeners.set(event, []);
  }

  eventListeners.get(event).push(callback);

  // Return unsubscribe function
  return () => {
    const updated = eventListeners
      .get(event)
      .filter((cb: any) => cb !== callback);
    eventListeners.set(event, updated);
  };
};
