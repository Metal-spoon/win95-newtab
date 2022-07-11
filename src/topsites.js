export function initializeTopSites () {
  $('.topSiteList').empty()
  const useHistory = JSON.parse(localStorage.getItem('usehistory'))
  if (useHistory) {
    chrome.history.search(
      { text: '', startTime: 0, maxResults: 0 },
      function (sites) {
        const orderedSites = sites
          .sort(function (a, b) {
            return b.visitCount - a.visitCount
          })
          .slice(0, 10)
        orderedSites.forEach((topSite) => {
          $('.topSiteList').append(
            "<a class=topSite href='" +
              topSite.url +
              "'><li class='topsiteContent'><img width=32px height=32px src=chrome://favicon/size/32/" +
              topSite.url +
              '/></br>' +
              '<span>' +
              topSite.title +
              '</span>' +
              '</li></a>'
          )
        })
      }
    )
  } else {
    chrome.topSites.get(function (sites) {
      sites.slice(0, 10).forEach((topSite, index) => {
        console.log(index)
        $('.topSiteList').append(
          "<a class=topSite href='" +
            topSite.url +
            "'><li class=topsiteContent>" +
            '<img id=test' +
            index +
            ' width=32px height=32px src=' +
            '/></br>' +
            '<span>' +
            topSite.title +
            '</span>' +
            '</li></a>'
        )
        $('#test' + index).prop('src', topSite.favicon)
      })
    })
  }
}
