export const formatTime = (milliseconds: number) => {
  const minutes = Math.floor(milliseconds / 60000);
  const remainingSeconds = Math.floor((milliseconds % 60000) / 1000);
  const remainingMilliseconds =( milliseconds % 1000).toFixed(0);
  return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}:${remainingMilliseconds.toString().padStart(2, '0')}`;
};