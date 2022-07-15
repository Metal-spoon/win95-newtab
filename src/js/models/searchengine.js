export class SearchEngine {
  id
  name
  url

  constructor (id, name, url) {
    this.id =
      id != null ? id : JSON.parse(localStorage.getItem('searchengines')).length
    this.name = name
    this.url = url
  }
}
