import { LanguageCode, SourceInfo, TagType } from "paperback-extensions-common";
import { FlatMangaReader } from '../FlatMangaReader'

const MANHWA18_DOMAIN = "https://manhwa18.com"

export const Manhwa18ComInfo: SourceInfo = {
    version: '1.0.1',
    name: 'Manhwa18.com',
    description: 'Extension that pulls manga from Manhwa18.com',
    author: 'Netsky',
    authorWebsite: 'http://github.com/TheNetsky',
    icon: "icon.png",
    hentaiSource: false,
    websiteBaseURL: MANHWA18_DOMAIN,
    sourceTags: [
        {
            text: "Notifications",
            type: TagType.GREEN
        }
    ]
}

export class Manhwa18Com extends FlatMangaReader {
    baseUrl: string = MANHWA18_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH
}
