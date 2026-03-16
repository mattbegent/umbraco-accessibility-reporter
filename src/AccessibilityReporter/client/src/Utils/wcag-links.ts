/**
 * Mapping from axe-core WCAG tags (e.g. "wcag111") to W3C Understanding page slugs.
 * URL format: https://www.w3.org/WAI/WCAG22/Understanding/{slug}
 */
const WCAG_TAG_TO_SLUG: Record<string, string> = {
	wcag111: "non-text-content",
	wcag121: "audio-only-and-video-only-prerecorded",
	wcag122: "captions-prerecorded",
	wcag123: "audio-description-or-media-alternative-prerecorded",
	wcag124: "captions-live",
	wcag125: "audio-description-prerecorded",
	wcag126: "sign-language-prerecorded",
	wcag127: "extended-audio-description-prerecorded",
	wcag128: "media-alternative-prerecorded",
	wcag129: "audio-only-live",
	wcag131: "info-and-relationships",
	wcag132: "meaningful-sequence",
	wcag133: "sensory-characteristics",
	wcag134: "orientation",
	wcag135: "identify-input-purpose",
	wcag136: "identify-purpose",
	wcag141: "use-of-color",
	wcag142: "audio-control",
	wcag143: "contrast-minimum",
	wcag144: "resize-text",
	wcag145: "images-of-text",
	wcag146: "contrast-enhanced",
	wcag147: "low-or-no-background-audio",
	wcag148: "visual-presentation",
	wcag149: "images-of-text-no-exception",
	wcag1410: "reflow",
	wcag1411: "non-text-contrast",
	wcag1412: "text-spacing",
	wcag1413: "content-on-hover-or-focus",
	wcag211: "keyboard",
	wcag212: "no-keyboard-trap",
	wcag213: "keyboard-no-exception",
	wcag214: "character-key-shortcuts",
	wcag221: "timing-adjustable",
	wcag222: "pause-stop-hide",
	wcag223: "no-timing",
	wcag224: "interruptions",
	wcag225: "re-authenticating",
	wcag226: "timeouts",
	wcag231: "three-flashes-or-below-threshold",
	wcag232: "three-flashes",
	wcag233: "animation-from-interactions",
	wcag241: "bypass-blocks",
	wcag242: "page-titled",
	wcag243: "focus-order",
	wcag244: "link-purpose-in-context",
	wcag245: "multiple-ways",
	wcag246: "headings-and-labels",
	wcag247: "focus-visible",
	wcag248: "location",
	wcag249: "link-purpose-link-only",
	wcag2410: "section-headings",
	wcag251: "pointer-gestures",
	wcag252: "pointer-cancellation",
	wcag253: "label-in-name",
	wcag254: "motion-actuation",
	wcag255: "target-size",
	wcag256: "concurrent-input-mechanisms",
	wcag311: "language-of-page",
	wcag312: "language-of-parts",
	wcag313: "unusual-words",
	wcag314: "abbreviations",
	wcag315: "reading-level",
	wcag316: "pronunciation",
	wcag321: "on-focus",
	wcag322: "on-input",
	wcag323: "consistent-navigation",
	wcag324: "consistent-identification",
	wcag325: "change-on-request",
	wcag331: "error-identification",
	wcag332: "labels-or-instructions",
	wcag333: "error-suggestion",
	wcag334: "error-prevention-legal-financial-data",
	wcag335: "help",
	wcag336: "error-prevention-all",
	wcag411: "parsing",
	wcag412: "name-role-value",
	wcag413: "status-messages",
};

const WCAG_BASE_URL = "https://www.w3.org/WAI/WCAG22/Understanding";

export interface WcagLink {
	criterion: string;
	url: string;
}

export function getWcagLinks(tags: string[]): WcagLink[] {
	return tags
		.filter(tag => tag in WCAG_TAG_TO_SLUG)
		.map(tag => {
			const match = tag.match(/^wcag(\d)(\d)(\d+)$/);
			if (!match) return null;
			return {
				criterion: `${match[1]}.${match[2]}.${match[3]}`,
				url: `${WCAG_BASE_URL}/${WCAG_TAG_TO_SLUG[tag]}`,
			};
		})
		.filter((item): item is WcagLink => item !== null);
}
