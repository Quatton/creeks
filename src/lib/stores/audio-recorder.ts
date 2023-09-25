import { writable } from "svelte/store";

export const isRecording = writable(false);
export const isPaused = writable(false);
export const recordingTime = writable(0);
export const mediaRecorder = writable<MediaRecorder | undefined>(undefined);
export const timerInterval = writable<NodeJS.Timer | undefined>(undefined);
export const recordingBlob = writable<Blob | undefined>(undefined);
