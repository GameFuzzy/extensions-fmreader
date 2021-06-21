import {
    Chapter,
    ChapterDetails,
    HomeSection,
    Manga,
    MangaStatus,
    MangaTile,
    SearchRequest,
    Tag,
    TagSection,
} from 'paperback-extensions-common'
import { decodeHTML } from 'entities'
import { FlatMangaReader } from "./FlatMangaReader";

export interface UpdatedManga {
    ids: string[]
    loadMore: boolean
}

export class Parser {

    parseMangaDetails($: CheerioSelector, mangaId: string, source: FlatMangaReader): Manga {

        const infoElement: Cheerio = $('div.row').first()

        const titles = []

        titles.push(decodeHTML($('ul.manga-info > *').first().text().trim())) //Main English title

        const altTitles = $(source.altNameSelector).text().split(',')
            for (const title of altTitles) {
                titles.push(decodeHTML(title.trim()))
            }

        const author = $('li a.btn-info').text().trim().replace('Updating', '') || undefined
        const image = this.getImageSrc($('img.thumbnail'))
        const desc = decodeHTML($('div.detail .content, div.row ~ div.row:has(h3:first-child) p, .summary-content p').text().trim())


        const genres: Tag[] = []

        for (const tag of $('li a.btn-danger').toArray()) {
            const label = $(tag).text().trim()
            const id = $(tag).attr('href')
            if (!label || !id) continue
            genres.push(createTag({ id: id, label: label }))
        }

        const tags: TagSection[] = [createTagSection({
            id: '0',
            label: 'genres',
            tags: genres
        })]

        const statusStr = $('li a.btn-success', infoElement).first()?.text().replace(/ /g, '')
        let status
        switch (statusStr.toUpperCase()) {
            case 'ONGOING':
                status = MangaStatus.ONGOING
                break
            case 'COMPLETED':
                status = MangaStatus.COMPLETED
                break
            default:
                status = MangaStatus.ONGOING
                break
        }

        return createManga({
            id: mangaId,
            titles,
            image: image || 'https://i.imgur.com/GYUxEX8.png',
            rating: 0,
            status,
            author,
            tags,
            desc,
            //hentai: true
            hentai: false //MangaDex down
        })
    }

    parseChapterList($: CheerioSelector, mangaId: string, source: FlatMangaReader): Chapter[] {
        const langCode = source.languageCode
        const chapters: Chapter[] = []
        const title = $('.manga-info h1, .manga-info h3').text().trim()
        let chapNum = 1
        for (const chapter of $('div#list-chapters p, table.table tr, .list-chapters > a').toArray().reverse()) {

            let chapterElem
            if (source.chapterUrlSelector != "") {
                chapterElem = $(source.chapterUrlSelector, chapter)
            }
            else  {
                chapterElem = $(chapter)
            }

            const id = chapterElem.attr('href')?.replace('.html', '') ?? ''
            const name = chapterElem.text().replace(title, '').trim()
            const time = this.parseDate($(source.chapterTimeSelector, chapter).text().trim())
            if (!id) continue
            chapters.push(createChapter({
                id,
                mangaId,
                name,
                langCode,
                chapNum,
                time,
            }))

            chapNum++
        }

        return chapters
    }

    parseChapterDetails($: CheerioSelector, mangaId: string, chapterId: string, source: FlatMangaReader): ChapterDetails {
        let pages: string[]

        if (source.pageListBase64Encoded) {
            pages = $(source.chapterDetailsImageSelector).toArray()
                .map(page => this.decodeBase64ImageSrc($(page)))
        }
        else {
            pages = $(source.chapterDetailsImageSelector).toArray()
                .map(page => this.getImageSrc($(page)))
        }

        return createChapterDetails({
            id: chapterId,
            mangaId: mangaId,
            pages: pages,
            longStrip: true
        })
    }

    generateSearch = (query: SearchRequest): string => {
        let search: string = query.title ?? ''
        return encodeURI(search)
    }

    parseMangaTiles($: CheerioStatic, source: FlatMangaReader): MangaTile[] {
        const collectedIds: string[] = []

        const items: MangaTile[] = []
        for (const manga of $('div.media, .thumb-item-flow').toArray()) {
            const id = $(source.headerSelector, manga).attr('href')?.replace('.html', '')
            const title = $(source.headerSelector, manga).text().trim()
            let image = this.getImageSrc($('img, .thumb-wrapper .img-in-ratio', manga))
            const subtitle = $('a.item-chapter', manga).text().trim()
            if (!id || !title || collectedIds.includes(id)) continue
            items.push(createMangaTile({
                id: id,
                image: image || 'https://i.imgur.com/GYUxEX8.png',
                title: createIconText({text: decodeHTML(title)}),
                subtitleText: createIconText({text: subtitle}),
            }))
            collectedIds.push(id)
        }
        return items
    }

    // TODO
    parseUpdatedManga($: CheerioSelector, time: Date, ids: string[], source: FlatMangaReader): UpdatedManga {
        const updatedManga: string[] = []
        let loadMore = true
        loadMore = false

        return {
            ids: updatedManga,
            loadMore,
        }
    }

    isLastPage = ($: CheerioStatic): boolean => {
        const curPageSelector = 'div.col-lg-9 button.btn-info, .pagination a:contains(»):not(.disabled), .col-md-8 button.btn-info'
        const curPageElemText = $(curPageSelector)?.first()?.text() ?? ''
        if (/\w*\s\d*\s\w*\s\d*/.test(curPageElemText)) {
            const splitText = curPageElemText.split(' ')
            return splitText[1] == splitText[3]
        }
        else return true
    }

    protected getImageAttr(elem: Cheerio) {
        let attr: string
        if (elem.attr('data-original')) {
            attr = 'data-original'
        } else if (elem.attr('data-src')) {
            attr = 'data-src'
        } else if (elem.attr('data-bg')) {
            attr = 'data-bg'
        } else if (elem.attr('data-srcset')) {
            attr = 'data-srcset'
        } else if (elem.attr('data-aload')) {
            attr = 'data-aload'
        } else {
            attr = 'src'
        }
        return attr
    }

    protected getImageSrc(elem: Cheerio): string {
        let image = elem.attr(this.getImageAttr(elem)) ?? ''
        return encodeURI(decodeURI(image.trim()))
    }

    protected decodeBase64ImageSrc(elem: Cheerio): string {
        let attr = this.getImageAttr(elem)
        if (!elem.attr(attr)?.includes('.')) {
            return atob((elem.attr(attr)) ?? '')
        } else {
            return elem.attr(`abs:${attr}`) ?? ''
        }
    }


    protected parseDate = (date: string): Date => {
        date = date.toUpperCase()
        let time: Date
        let number: number = Number((/\d*/.exec(date) ?? [])[0])
        if (date.includes('LESS THAN AN HOUR') || date.includes('JUST NOW')) {
            time = new Date(Date.now())
        } else if (date.includes('YEAR') || date.includes('YEARS')) {
            time = new Date(Date.now() - (number * 31556952000))
        } else if (date.includes('MONTH') || date.includes('MONTHS')) {
            time = new Date(Date.now() - (number * 2592000000))
        } else if (date.includes('WEEK') || date.includes('WEEKS')) {
            time = new Date(Date.now() - (number * 604800000))
        } else if (date.includes('YESTERDAY')) {
            time = new Date(Date.now() - 86400000)
        } else if (date.includes('DAY') || date.includes('DAYS')) {
            time = new Date(Date.now() - (number * 86400000))
        } else if (date.includes('HOUR') || date.includes('HOURS')) {
            time = new Date(Date.now() - (number * 3600000))
        } else if (date.includes('MINUTE') || date.includes('MINUTES')) {
            time = new Date(Date.now() - (number * 60000))
        } else if (date.includes('SECOND') || date.includes('SECONDS')) {
            time = new Date(Date.now() - (number * 1000))
        } else {
            time = new Date(date)
        }
        return time
    }
}
