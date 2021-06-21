import cheerio from 'cheerio'
import { FlatMangaReader } from '../FlatMangaReader'
import { Manhwa18Com } from '../Manhwa18Com/Manhwa18Com'
import { APIWrapper } from "paperback-extensions-common"

describe('Manhwa18Com Tests', function () {

    var wrapper: APIWrapper = new APIWrapper()
    var source: FlatMangaReader = new Manhwa18Com(cheerio)
    var chai = require('chai'), expect = chai.expect, should = chai.should()
    var chaiAsPromised = require('chai-as-promised')
    chai.use(chaiAsPromised)

    /**
     * The Manga ID which this unit test uses to base it's details off of.
     * Try to choose a manga which is updated frequently, so that the historical checking test can
     * return proper results, as it is limited to searching 30 days back due to extremely long processing times otherwise.
     */
    var mangaId = "manga-silent-war"

    it("Retrieve Manga Details", async () => {
        let details = await wrapper.getMangaDetails(source, mangaId)
        expect(details, "No results found with test-defined ID [" + mangaId + "]").to.exist

        // Validate that the fields are filled
        let data = details
        expect(data.id, "Missing ID").to.be.not.empty
        expect(data.image, "Missing Image").to.be.not.empty
        expect(data.status, "Missing Status").to.exist
        expect(data.author, "Missing Author").to.be.not.empty
        expect(data.desc, "Missing Description").to.be.not.empty
        expect(data.titles, "Missing Titles").to.be.not.empty
        expect(data.rating, "Missing Rating").to.exist
    })

    it("Get Chapters", async () => {
        let data = await wrapper.getChapters(source, mangaId)

        expect(data, "No chapters present for: [" + mangaId + "]").to.not.be.empty

        let entry = data[0]
        expect(entry.id, "No ID present").to.not.be.empty
        expect(entry.time, "No date present").to.exist
        expect(entry.name, "No title available").to.not.be.empty
        expect(entry.chapNum, "No chapter number present").to.exist
    })

    it("Get Chapter Details", async () => {

        let chapters = await wrapper.getChapters(source, mangaId)
        let data = await wrapper.getChapterDetails(source, mangaId, chapters[0].id)

        expect(data, "No server response").to.exist
        expect(data, "Empty server response").to.not.be.empty
        expect(data.id, "Missing ID").to.be.not.empty
        expect(data.mangaId, "Missing MangaID").to.be.not.empty
        expect(data.pages, "No pages present").to.be.not.empty
    })

    it("Testing home page results for popular manga titles", async () => {
        let results = await wrapper.getViewMoreItems(source, "popular_manga", {},)

        expect(results, "No results exist").to.exist
        expect(results, "Results is empty").to.be.not.empty

        let data = results![0]
        expect(data.id, "No ID present").to.exist
        expect(data.image, "No image present").to.exist
        expect(data.title.text, "No title present").to.exist
    })

    it("Testing home page results for latest manga titles", async () => {
        let results = await wrapper.getViewMoreItems(source, "latest_updates", {},)

        expect(results, "No results exist").to.exist
        expect(results, "Results is empty").to.be.not.empty

        let data = results![0]
        expect(data.id, "No ID present").to.exist
        expect(data.image, "No image present").to.exist
        expect(data.title.text, "No title present").to.exist
    })

    it("Testing search", async () => {
        let testSearch = createSearchRequest({
            title: 'love'
        })

        let search = await wrapper.searchRequest(source, testSearch, { page: 1 })
        let result = search.results[0]

        expect(result, "No response from server").to.exist
        expect(result.id, "No ID found for search query").to.be.not.empty
        expect(result.image, "No image found for search").to.be.not.empty
        expect(result.title, "No title").to.be.not.null
        expect(result.subtitleText, "No subtitle text").to.be.not.null
    })

    it("Testing Home-Page aquisition", async () => {
        let homePages = await wrapper.getHomePageSections(source)
        expect(homePages, "No response from server").to.exist
        expect(homePages[0], "No popular section available").to.exist
        expect(homePages[1], "No latest manga section available").to.exist
    })

})
