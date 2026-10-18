import {page} from './page'
import {sectionTypes} from './sections'
import {imageWithAlt, link, navItem} from './shared'
import {consentSettings} from './consentSettings'
import {siteSettings} from './siteSettings'

export const schemaTypes = [siteSettings, consentSettings, page, imageWithAlt, link, navItem, ...sectionTypes]
