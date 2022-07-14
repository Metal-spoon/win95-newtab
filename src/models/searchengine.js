export class SearchEngine {
  id
  name
  url
  isCustom

  constructor (id, name, url, isCustom) {
    this.id =
      id != null ? id : JSON.parse(localStorage.getItem('searchengines')).length
    this.name = name
    this.url = url
    this.isCustom = isCustom
  }
}
