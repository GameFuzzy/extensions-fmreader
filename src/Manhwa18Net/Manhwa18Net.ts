import { LanguageCode, SourceInfo, TagType } from "paperback-extensions-common";
import { FlatMangaReader } from '../FlatMangaReader'

const MANHWA18_DOMAIN = "https://manhwa18.net"

export const Manhwa18NetInfo: SourceInfo = {
    version: '1.0.1',
    name: 'Manhwa18.net',
    description: 'Extension that pulls manga from Manhwa18.net',
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

export class Manhwa18Net extends FlatMangaReader {
    baseUrl: string = MANHWA18_DOMAIN
    languageCode: LanguageCode = LanguageCode.ENGLISH


    //----Manga Details Selectors
    mangaIconDomain: string = MANHWA18_DOMAIN

    //----Chapters Selectors
    //chapterNameSelector: string = ""
    //chapterTimeSelector: string = ""
}
