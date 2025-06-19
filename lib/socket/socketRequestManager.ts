import socket from "./socketClient";

// const JWE_TOKEN = localStorage.getItem("jwe_secret");

export const generateUUID = () => {
  var dt = new Date().getTime();
  var uuid = "xxxxxxxx-xxxx-4xxx-yxxx-xxxxxxxxxxxx".replace(
    /[xy]/g,
    function (c) {
      var r = (dt + Math.random() * 16) % 16 | 0;
      dt = Math.floor(dt / 16);
      return (c == "x" ? r : (r & 0x3) | 0x8).toString(16);
    }
  );
  return uuid;
};

export const emitSocketRequest = (event: String, payload = {}, id = null) => {
  const requestId = id || generateUUID();

  socket.emit("message", {
    event,
    requestId,
    // Authorization: token,
    Authorization: "JWE_TOKEN",
    // "eyJhbGciOiJkaXIiLCJlbmMiOiJBMjU2R0NNIiwia2lkIjoiOWIxNjA3NmYtM2ZlMy00ZjJmLWFiNjAtNzBkYjg2NDJjN2I3In0..JWqjwsiVKqK_rAFY.TMo5tlqOe37_of9QzxQTOup6VwOvp6J3rOfzAIzk_3_q0pXmnoOgr9pKs1X7O4ZiuAbfbNsb9oQatx3kYnNRcD8Iwl0GovUrbRXK82xJoXvQJA-7F0Vzs8mUg3zKMFEEBToXB0NuUNqBcb2zZzs-S1FSP_cAqV6_.f14E9oeMPS2XNpJ1pJtiiw", // Real JWE token here
    payload,
  });
};
