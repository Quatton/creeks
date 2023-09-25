import type { ClassNameValue } from "tailwind-merge";

interface StyleProps {
	/**
	 * Applies passed classes to audio recorder container
	 **/
	AudioRecorderClass?: ClassNameValue;
	/**
	 * Applies passed classes to audio recorder start/save option
	 **/
	AudioRecorderStartSaveClass?: ClassNameValue;
	/**
	 * Applies passed classes to audio recorder timer
	 **/
	AudioRecorderTimerClass?: ClassNameValue;
	/**
	 * Applies passed classes to audio recorder status option
	 **/
	AudioRecorderStatusClass?: ClassNameValue;
	/**
	 * Applies passed classes to audio recorder pause/resume option
	 **/
	AudioRecorderPauseResumeClass?: ClassNameValue;
	/**
	 * Applies passed classes to audio recorder discard option
	 **/
	AudioRecorderDiscardClass?: ClassNameValue;
}

export interface Props {
	/**
	 * This gets called when the save button is clicked.
	 * In case the recording is cancelled, the blob is discarded.
	 **/
	onRecordingComplete?: (blob: Blob) => void;
	/**
	 * This gets called when pushAudio is called.
	 */
	onPushAudio?: (blob: Blob) => void;
	/**
	 * This gets called when the getUserMedia Promise is rejected.
	 * It takes the resultant DOMException as its parameter.
	 **/
	onNotAllowedOrFound?: (exception: DOMException) => unknown;
	// /**
	//  * Allows calling of hook outside this component. The controls returned by the hook can then be passed to the component using this prop.
	//  * This allows for use of hook methods and state outside this component
	//  * @sample_usage https://github.com/samhirtarif/react-audio-recorder#combine-the-useaudiorecorder-hook-and-the-audiorecorder-component
	//  **/
	// recorderControls?: RecorderControls;
	/**
	 * Takes a {@link https://developer.mozilla.org/en-US/docs/Web/API/MediaTrackSettings#instance_properties_of_audio_tracks subset} of
	 * `MediaTrackConstraints` that apply to the audio track
	 *
	 * @Property `deviceId`
	 * @Property `groupId`
	 * @Property `autoGainControl`
	 * @Property `channelCount`
	 * @Property `echoCancellation`
	 * @Property `noiseSuppression`
	 * @Property `sampleRate`
	 * @Property `sampleSize`
	 */
	audioTrackConstraints?: MediaAudioTrackConstraints;
	/**
	 * If set to `true` the file gets downloaded when save recording is pressed
	 **/
	downloadOnSavePress?: boolean;
	/**
	 * File extension for the audio filed that gets downloaded
	 **/
	downloadFileExtension?: "mp3" | "wav" | "webm";
	/**
	 * Displays a waveform visualization for the audio when set to `true`. Defaults to `false`
	 **/
	showVisualizer?: boolean;
	/**
	 * The options passed to the HTML MediaRecorder API.
	 **/
	mediaRecorderOptions?: MediaRecorderOptions;
	/**
	 * Custom classes to changes styles.
	 **/
	classes?: StyleProps;
}

export type MediaAudioTrackConstraints = Pick<
	MediaTrackConstraints,
	| "deviceId"
	| "groupId"
	| "autoGainControl"
	| "channelCount"
	| "echoCancellation"
	| "noiseSuppression"
	| "sampleRate"
	| "sampleSize"
>;
