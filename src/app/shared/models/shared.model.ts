export class Shared {
  getCurrentTime() {
    const currentTime = new Date().toLocaleTimeString([], {
      hour: '2-digit',
      minute: '2-digit',
    });
    return currentTime;
  }
}
