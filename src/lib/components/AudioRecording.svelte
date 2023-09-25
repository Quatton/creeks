<script lang="ts">
	import { currentSession } from "$lib/stores/core";
	import type { Props } from "$lib/types/audio-recorder";
	import {
		isRecording,
		recordingBlob,
		recordingTime,
		isPaused,
		mediaRecorder,
		timerInterval
	} from "$lib/stores/audio-recorder";

	import MdiMicrophone from "~icons/mdi/microphone";
	import MdiMicrophoneOff from "~icons/mdi/microphone-off";
	import { get } from "svelte/store";
	export let {
		onRecordingComplete,
		onNotAllowedOrFound,
		audioTrackConstraints,
		downloadOnSavePress = false,
		downloadFileExtension = "webm",
		showVisualizer = false,
		mediaRecorderOptions,
		classes
	}: Props = {};

	// let shouldSave = false;

	// export const stopAudioRecorder: Readable<(save?: boolean) => void> = derived(
	// 	stopRecording,
	// 	($stopRecording) =>
	// 		(save: boolean = true) => {
	// 			$stopRecording();
	// 		}
	// );

	export const pushAudio = (end = false) => {
		if (!get(isRecording)) {
			console.warn("Not recording");
			return;
		}

		stopRecording();

		if (!end) startRecording();
	};

	const _startTimer = () => {
		const interval = setInterval(() => {
			recordingTime.update((time) => time + 1);
		}, 1000);
		timerInterval.set(interval);
	};

	const _stopTimer = () => {
		timerInterval.update((interval) => {
			clearInterval(interval);
			return undefined;
		});
	};

	/**
	 * Calling this method would result in the recording to start. Sets `isRecording` to true
	 */
	export const startRecording = () => {
		if ($timerInterval !== undefined) {
			return;
		}

		navigator.mediaDevices
			.getUserMedia({
				audio: audioTrackConstraints
					? {
							...audioTrackConstraints,
							// @ts-ignore
							suppressLocalAudioPlayback: false
					  }
					: true
			})
			.then((stream) => {
				isRecording.set(true);
				const recorder = new MediaRecorder(stream, mediaRecorderOptions);
				mediaRecorder.set(recorder);
				recorder.start();
				_startTimer();

				recorder.addEventListener("dataavailable", (e) => {
					recordingBlob.set(e.data);
					recorder.stream.getTracks().forEach((track) => track.stop());
					/** Why are we doing this?
					 * Basically, we stop each track because just in case the recorder errors out,
					 * we don't want to lose everything. We want to be able to resume the recording.
					 */
					mediaRecorder.set(undefined);
				});
			})
			.catch((err: DOMException) => {
				console.error(err.name, err.message, err.cause);
				onNotAllowedOrFound?.(err);
			});
	};

	/**
	 * Calling this method results in a recording in progress being stopped and the resulting audio being present in `recordingBlob`. Sets `isRecording` to false
	 */
	export const stopRecording = () => {
		$mediaRecorder?.stop();
		_stopTimer();
		recordingTime.set(0);
		isRecording.set(false);
		isPaused.set(false);
	};

	/**
	 * Calling this method would pause the recording if it is currently running or resume if it is paused. Toggles the value `isPaused`
	 */
	export const togglePauseResume = () => {
		if ($mediaRecorder === undefined) {
			return;
		}

		if ($isPaused) {
			$mediaRecorder.resume();
			_startTimer();
		} else {
			$mediaRecorder.pause();
			_stopTimer();
		}

		isPaused.set(!$isPaused);
	};

	const convertToDownloadFileExtension = async (
		webmBlob: Blob
	): Promise<Blob> => {
		const { FFmpeg } = await import("@ffmpeg/ffmpeg");
		const ffmpeg = new FFmpeg();
		await ffmpeg.load();

		const inputName = "input.webm";
		const outputName = `output.${downloadFileExtension}`;

		await ffmpeg.writeFile(
			inputName,
			new Uint8Array(await webmBlob.arrayBuffer())
		);

		await ffmpeg.exec(["-i", inputName, outputName]);

		const outputData = await ffmpeg.readFile(outputName);
		const outputBlob = new Blob([outputData], {
			type: `audio/${downloadFileExtension}`
		});

		return outputBlob;
	};

	const downloadBlob = async (blob: Blob): Promise<void> => {
		if (!crossOriginIsolated && downloadFileExtension !== "webm") {
			console.warn(
				`This website is not "cross-origin isolated". Audio will be downloaded in webm format, since mp3/wav encoding requires cross origin isolation. Please visit https://web.dev/cross-origin-isolation-guide/ and https://web.dev/coop-coep/ for information on how to make your website "cross-origin isolated"`
			);
		}

		const downloadBlob = crossOriginIsolated
			? await convertToDownloadFileExtension(blob)
			: blob;
		const fileExt = crossOriginIsolated ? downloadFileExtension : "webm";
		const url = URL.createObjectURL(downloadBlob);

		const a = document.createElement("a");
		a.style.display = "none";
		a.href = url;
		a.download = `audio.${fileExt}`;
		document.body.appendChild(a);
		a.click();
		a.remove();
	};

	$: {
		if ($recordingBlob !== undefined) {
			const reader = new FileReader();

			new Promise<typeof reader.result>(async (resolve) => {
				reader.onloadend = () => {
					const base64data = reader.result;
					resolve(base64data);
				};
			})
				.then((base64data) => {
					currentSession.update((session) => {
						if (!session || !base64data) return session;

						session.blocks.push({
							type: "audio",
							content: base64data as string,
							createdAt: new Date()
						});

						return session;
					});
				})
				.catch((err) => {
					console.error(err);
				});

			reader.readAsDataURL($recordingBlob!);
		}
	}
</script>

{#if $isRecording}
	<MdiMicrophone class="w-5 h-5 text-error-500-400-token" />
{:else}
	<MdiMicrophoneOff class="w-5 h-5 text-surface-500-400-token" />
{/if}
