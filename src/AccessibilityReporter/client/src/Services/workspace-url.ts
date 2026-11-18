import type { UmbControllerHost } from "@umbraco-cms/backoffice/controller-api";
import { UmbDocumentDetailRepository } from "@umbraco-cms/backoffice/document";

// Builds the backoffice URL for a document's Accessibility Reporter workspace view, picking the
// culture that was tested, else the editor's own language, else the first available variant.
export async function generateWorkspaceUrl(host: UmbControllerHost, pageGuid: string, testedCulture?: string, userLanguage?: string): Promise<string> {
	const baseUrl = `/umbraco/section/content/workspace/document/edit/${pageGuid}`;

	try {
		const documentRepository = new UmbDocumentDetailRepository(host);
		const { data: document } = await documentRepository.requestByUnique(pageGuid);

		if (!document) {
			return `${baseUrl}/invariant/view/accessibility-reporter`;
		}

		const availableCultures = (document.variants || [])
			.map(variant => variant.culture)
			.filter((culture): culture is string => Boolean(culture));

		let selectedCulture = 'invariant';

		const testedCultureMatch = testedCulture
			? availableCultures.find(culture => culture.toLowerCase() === testedCulture.toLowerCase())
			: undefined;

		if (testedCultureMatch) {
			selectedCulture = testedCultureMatch;
		} else if (availableCultures.length === 0) {
			selectedCulture = 'invariant';
		} else if (availableCultures.length === 1) {
			selectedCulture = availableCultures[0];
		} else {
			const language = userLanguage || 'en-US'; // Umbraco's default culture

			const exactMatch = availableCultures.find(culture => culture.toLowerCase() === language.toLowerCase());

			if (exactMatch) {
				selectedCulture = exactMatch;
			} else {
				const languageCode = language.split('-')[0].toLowerCase();
				const languageMatch = availableCultures.find(culture => culture.split('-')[0].toLowerCase() === languageCode);
				selectedCulture = languageMatch || availableCultures[0] || 'invariant';
			}
		}

		return `${baseUrl}/${selectedCulture}/view/accessibility-reporter`;

	} catch (error) {
		console.error('Error getting document details:', error);
		return `${baseUrl}/invariant/view/accessibility-reporter`;
	}
}
