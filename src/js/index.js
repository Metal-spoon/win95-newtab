import './lib/jquery.min.js'
import './lib/bootstrap.min.js'
import * as topsitesComponent from './components/topsites-component.js'
import * as wallpaperComponent from './components/wallpaper-component.js'
import * as searchComponent from './components/search-component.js'
import * as clockComponent from './components/clock-component.js'
import * as modalComponent from './components/modal-component.js'
import * as startmenuComponent from './components/startmenu-component.js'

$(function () {
  clockComponent.init()
  topsitesComponent.init()
  searchComponent.init()
  wallpaperComponent.init()
  modalComponent.init()
  startmenuComponent.init()
  $('.startMenu').hide()
  $('.speech-bubble').hide()
})
